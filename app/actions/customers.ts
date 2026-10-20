'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { requireRole } from '@/lib/auth'
import { getSupabaseAdmin } from '@/lib/supabase/admin'

const customerSchema = z.object({
  name: z.string().min(2, 'Nama pelanggan minimal 2 karakter'),
  phone: z.string().optional(),
  email: z.string().email('Format email tidak valid').optional().or(z.literal('')),
  address: z.string().min(5, 'Alamat lengkap minimal 5 karakter'),
})

export type CustomerActionState = {
  error?: string
  success?: boolean
  fields?: Record<string, string>
  customer?: {
    id: string
    name: string
    address: string
    phone?: string | null
  }
}

export async function createCustomerAction(prevState: CustomerActionState, formData: FormData): Promise<CustomerActionState> {
  const profile = await requireRole('admin')

  const name = formData.get('name') as string
  const phone = formData.get('phone') as string
  const email = formData.get('email') as string
  const address = formData.get('address') as string

  const parsed = customerSchema.safeParse({ name, phone, email, address })

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message || 'Input data tidak valid',
      fields: { name, phone, email, address },
    }
  }

  const admin = getSupabaseAdmin()

  const { data: newCustomer, error } = await admin
    .from('customers')
    .insert({
      org_id: profile.orgId,
      name: parsed.data.name.trim(),
      phone: parsed.data.phone?.trim() || null,
      email: parsed.data.email?.trim() || null,
      address: parsed.data.address.trim(),
    })
    .select('id, name, address, phone')
    .single()

  if (error || !newCustomer) {
    return {
      error: 'Gagal menambahkan pelanggan: ' + (error?.message || 'Gagal menyimpan ke database'),
      fields: { name, phone, email, address },
    }
  }

  revalidatePath('/admin/customers')
  revalidatePath('/admin/jobs/new')
  return {
    success: true,
    customer: {
      id: newCustomer.id,
      name: newCustomer.name,
      address: newCustomer.address,
      phone: newCustomer.phone,
    },
  }
}
