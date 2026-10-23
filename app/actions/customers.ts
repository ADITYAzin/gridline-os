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

export type ImportCustomerItem = {
  name: string
  phone?: string | null
  email?: string | null
  address: string
  dateRegistered?: string | null
}

export type ImportCustomersResult = {
  success: boolean
  error?: string
  totalCount?: number
  importedCount?: number
  failedCount?: number
  errors?: string[]
}

function parseRegisteredDate(dateStr?: string | null): string {
  if (!dateStr || !dateStr.trim()) {
    return new Date().toISOString()
  }

  const raw = dateStr.trim()

  // 1. Direct ISO parse
  const direct = new Date(raw)
  if (!isNaN(direct.getTime()) && direct.getFullYear() > 1990 && direct.getFullYear() < 2100) {
    return direct.toISOString()
  }

  // 2. Try common formats (DD/MM/YYYY, YYYY-MM-DD, DD-MM-YYYY)
  const parts = raw.split(/[/.-]/)
  if (parts.length === 3) {
    const p0 = parseInt(parts[0], 10)
    const p1 = parseInt(parts[1], 10)
    const p2 = parseInt(parts[2], 10)

    // YYYY-MM-DD
    if (p0 >= 1990 && p0 <= 2099 && p1 >= 1 && p1 <= 12 && p2 >= 1 && p2 <= 31) {
      const d = new Date(Date.UTC(p0, p1 - 1, p2))
      if (!isNaN(d.getTime())) return d.toISOString()
    }

    // DD-MM-YYYY
    if (p2 >= 1990 && p2 <= 2099 && p1 >= 1 && p1 <= 12 && p0 >= 1 && p0 <= 31) {
      const d = new Date(Date.UTC(p2, p1 - 1, p0))
      if (!isNaN(d.getTime())) return d.toISOString()
    }

    // MM-DD-YYYY
    if (p2 >= 1990 && p2 <= 2099 && p0 >= 1 && p0 <= 12 && p1 >= 1 && p1 <= 31) {
      const d = new Date(Date.UTC(p2, p0 - 1, p1))
      if (!isNaN(d.getTime())) return d.toISOString()
    }
  }

  return new Date().toISOString()
}

export async function importCustomersAction(
  rows: ImportCustomerItem[]
): Promise<ImportCustomersResult> {
  const profile = await requireRole('admin')

  if (!rows || rows.length === 0) {
    return {
      success: false,
      error: 'Tidak ada baris data pelanggan yang dikirim untuk diimpor.',
    }
  }

  const admin = getSupabaseAdmin()
  const toInsert: Array<{
    id: string
    org_id: string
    name: string
    phone: string | null
    email: string | null
    address: string
    created_at: string
    updated_at: string
  }> = []

  const validationErrors: string[] = []

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i]
    const name = r.name?.trim()
    const address = r.address?.trim()

    if (!name) {
      validationErrors.push(`Baris ${i + 1}: Nama perusahaan / pelanggan tidak boleh kosong`)
      continue
    }

    if (!address) {
      validationErrors.push(`Baris ${i + 1} (${name}): Alamat servis tidak boleh kosong`)
      continue
    }

    // Auto-generate UUID ID as requested
    const autoId = crypto.randomUUID()
    const createdAt = parseRegisteredDate(r.dateRegistered)

    toInsert.push({
      id: autoId,
      org_id: profile.orgId,
      name,
      phone: r.phone?.trim() || null,
      email: r.email?.trim() || null,
      address,
      created_at: createdAt,
      updated_at: new Date().toISOString(),
    })
  }

  if (toInsert.length === 0) {
    return {
      success: false,
      error: 'Semua baris data gagal divalidasi. Pastikan nama dan alamat terisi.',
      errors: validationErrors,
    }
  }

  const { error: insertError } = await admin
    .from('customers')
    .insert(toInsert)

  if (insertError) {
    return {
      success: false,
      error: 'Gagal melakukan migrasi ke database: ' + insertError.message,
      errors: validationErrors,
    }
  }

  revalidatePath('/admin/customers')
  revalidatePath('/admin/jobs/new')

  return {
    success: true,
    totalCount: rows.length,
    importedCount: toInsert.length,
    failedCount: rows.length - toInsert.length,
    errors: validationErrors,
  }
}

