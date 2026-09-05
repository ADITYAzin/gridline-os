'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { requireRole } from '@/lib/auth'
import { createSupabaseServerClient } from '@/lib/supabase/server'

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

  const supabase = await createSupabaseServerClient()

  const { error } = await supabase.from('customers').insert({
    org_id: profile.orgId,
    name: parsed.data.name.trim(),
    phone: parsed.data.phone?.trim() || null,
    email: parsed.data.email?.trim() || null,
    address: parsed.data.address.trim(),
  })

  if (error) {
    return {
      error: 'Gagal menambahkan pelanggan: ' + error.message,
      fields: { name, phone, email, address },
    }
  }

  revalidatePath('/admin/customers')
  revalidatePath('/admin/jobs/new')
  return { success: true }
}
