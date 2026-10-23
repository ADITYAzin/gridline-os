'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { requireRole, requireUser } from '@/lib/auth'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'

const updateOrgSchema = z.object({
  name: z.string().trim().min(2, 'Nama perusahaan minimal 2 karakter').max(100, 'Nama perusahaan maksimal 100 karakter'),
  address: z.string().trim().optional().or(z.literal('')),
  city: z.string().trim().optional().or(z.literal('')),
  province: z.string().trim().optional().or(z.literal('')),
  postalCode: z.string().trim().optional().or(z.literal('')),
  phone: z.string().trim().optional().or(z.literal('')),
  email: z.string().trim().email('Format email tidak valid').optional().or(z.literal('')),
})

const sopItemSchema = z.object({
  id: z.string().min(1),
  item: z.string().trim().min(1, 'Item SOP tidak boleh kosong').max(300, 'Item SOP maksimal 300 karakter'),
  order: z.number().int().min(1),
  requires_photo: z.boolean().default(false),
  is_critical: z.boolean().default(false),
  hint: z.string().trim().max(500, 'Hint maksimal 500 karakter').optional().or(z.literal('')),
})

const sopFieldsSchema = z.object({
  sopMode: z.enum(['strict', 'reference', 'none']).default('none'),
  sopItems: z.array(sopItemSchema).default([]),
  sopNotes: z.string().trim().max(1000, 'Catatan SOP maksimal 1000 karakter').optional().or(z.literal('')),
  estimatedDurationMinutes: z.coerce.number().int().min(1).max(1440).optional().nullable(),
  riskLevel: z.enum(['low', 'medium', 'high']).default('low'),
})

const createServiceSchema = z.object({
  name: z.string().trim().min(2, 'Nama layanan minimal 2 karakter').max(100, 'Nama layanan maksimal 100 karakter'),
  description: z.string().trim().nullable().optional().or(z.literal('')),
  defaultPrice: z.coerce.number().min(0, 'Harga default tidak boleh negatif').optional().nullable(),
}).merge(sopFieldsSchema)

const updateServiceSchema = z.object({
  id: z.string().uuid('ID Layanan tidak valid'),
  name: z.string().trim().min(2, 'Nama layanan minimal 2 karakter').max(100, 'Nama layanan maksimal 100 karakter'),
  description: z.string().trim().nullable().optional().or(z.literal('')),
  defaultPrice: z.coerce.number().min(0, 'Harga default tidak boleh negatif').optional().nullable(),
  isActive: z.boolean().optional(),
}).merge(sopFieldsSchema)

const onboardingSchema = z.object({
  address: z.string().trim().min(3, 'Alamat perusahaan minimal 3 karakter'),
  city: z.string().trim().min(2, 'Kota/Kabupaten minimal 2 karakter'),
  province: z.string().trim().optional().or(z.literal('')),
  phone: z.string().trim().optional().or(z.literal('')),
  services: z.array(z.string().trim().min(1)).optional(),
})

export type SopItem = {
  id: string
  item: string
  order: number
  requires_photo: boolean
  is_critical: boolean
  hint?: string | null
}

export type OrgActionState = {
  error?: string
  success?: boolean
  message?: string
  fields?: Record<string, string>
  service?: {
    id: string
    name: string
    description?: string | null
    default_price?: number | null
    is_active: boolean
    created_at: string
    sop_mode: 'strict' | 'reference' | 'none'
    sop_items: SopItem[]
    sop_notes?: string | null
    estimated_duration_minutes?: number | null
    risk_level: 'low' | 'medium' | 'high'
  }
}

export async function updateOrganizationDetailsAction(
  prevState: OrgActionState,
  formData: FormData
): Promise<OrgActionState> {
  const profile = await requireUser()
  if (profile.role !== 'admin' && profile.role !== 'owner') {
    return { error: 'Hanya Admin atau Owner yang dapat mengubah data perusahaan.' }
  }

  const name = formData.get('name') as string
  const address = formData.get('address') as string
  const city = formData.get('city') as string
  const province = formData.get('province') as string
  const postalCode = formData.get('postalCode') as string
  const phone = formData.get('phone') as string
  const email = formData.get('email') as string

  const parsed = updateOrgSchema.safeParse({
    name,
    address,
    city,
    province,
    postalCode,
    phone,
    email,
  })

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message || 'Input data tidak valid',
      fields: { name, address, city, province, postalCode, phone, email },
    }
  }

  const admin = getSupabaseAdmin()

  const { error } = await admin
    .from('organizations')
    .update({
      name: parsed.data.name,
      address: parsed.data.address || null,
      city: parsed.data.city || null,
      province: parsed.data.province || null,
      postal_code: parsed.data.postalCode || null,
      phone: parsed.data.phone || null,
      email: parsed.data.email || null,
    })
    .eq('id', profile.orgId)

  if (error) {
    return {
      error: 'Gagal memperbarui informasi perusahaan: ' + error.message,
      fields: { name, address, city, province, postalCode, phone, email },
    }
  }

  revalidatePath('/admin', 'layout')
  revalidatePath('/admin/profile')

  return {
    success: true,
    message: 'Informasi perusahaan berhasil disimpan.',
  }
}

export async function getCompanyServicesAction() {
  const profile = await requireUser()
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from('company_services')
    .select('id, name, description, default_price, is_active, created_at, sop_mode, sop_items, sop_notes, estimated_duration_minutes, risk_level')
    .eq('org_id', profile.orgId)
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching company services:', error)
    return []
  }

  return data || []
}

export async function createCompanyServiceAction(
  prevState: OrgActionState,
  formData: FormData
): Promise<OrgActionState> {
  const profile = await requireUser()
  if (profile.role !== 'admin' && profile.role !== 'owner') {
    return { error: 'Hanya Admin atau Owner yang dapat mengelola layanan perusahaan.' }
  }

  const name = ((formData.get('name') as string | null) || '').trim()
  const rawDesc = formData.get('description') as string | null
  const description = rawDesc !== null ? rawDesc.trim() : null
  const rawPrice = formData.get('defaultPrice') as string | null
  const defaultPrice = rawPrice ? Number(rawPrice) : 0

  // Parse SOP fields
  const sopMode = (formData.get('sopMode') as string) || 'none'
  const sopNotesRaw = formData.get('sopNotes') as string | null
  const sopNotes = sopNotesRaw ? sopNotesRaw.trim() : null
  const rawDuration = formData.get('estimatedDurationMinutes') as string | null
  const estimatedDurationMinutes = rawDuration ? Number(rawDuration) : null
  const riskLevel = (formData.get('riskLevel') as string) || 'low'
  const rawSopItems = formData.get('sopItems') as string | null
  let sopItems: SopItem[] = []
  try {
    sopItems = rawSopItems ? JSON.parse(rawSopItems) : []
  } catch {
    return { error: 'Format item SOP tidak valid.' }
  }

  const parsed = createServiceSchema.safeParse({
    name,
    description: description || null,
    defaultPrice,
    sopMode,
    sopItems,
    sopNotes,
    estimatedDurationMinutes,
    riskLevel,
  })

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message || 'Input layanan tidak valid',
      fields: { name, description: description || '', defaultPrice: String(defaultPrice) },
    }
  }

  const admin = getSupabaseAdmin()

  const { data: newService, error } = await admin
    .from('company_services')
    .insert({
      org_id: profile.orgId,
      name: parsed.data.name,
      description: parsed.data.description || null,
      default_price: parsed.data.defaultPrice ?? 0,
      is_active: true,
      sop_mode: parsed.data.sopMode,
      sop_items: parsed.data.sopItems,
      sop_notes: parsed.data.sopNotes || null,
      estimated_duration_minutes: parsed.data.estimatedDurationMinutes ?? null,
      risk_level: parsed.data.riskLevel,
    })
    .select('id, name, description, default_price, is_active, created_at, sop_mode, sop_items, sop_notes, estimated_duration_minutes, risk_level')
    .single()

  if (error) {
    if (error.code === '23505') {
      return {
        error: 'Layanan dengan nama ini sudah ada di daftar perusahaan Anda.',
        fields: { name, description: description || '', defaultPrice: String(defaultPrice) },
      }
    }
    return {
      error: 'Gagal menambahkan layanan: ' + error.message,
      fields: { name, description: description || '', defaultPrice: String(defaultPrice) },
    }
  }

  revalidatePath('/admin/profile')
  revalidatePath('/admin/jobs/new')

  return {
    success: true,
    message: 'Layanan baru berhasil ditambahkan.',
    service: {
      ...newService,
      sop_mode: newService.sop_mode as 'strict' | 'reference' | 'none',
      sop_items: (newService.sop_items as SopItem[]) ?? [],
      risk_level: (newService.risk_level as 'low' | 'medium' | 'high') ?? 'low',
    },
  }
}

export async function updateCompanyServiceAction(
  prevState: OrgActionState,
  formData: FormData
): Promise<OrgActionState> {
  const profile = await requireUser()
  if (profile.role !== 'admin' && profile.role !== 'owner') {
    return { error: 'Hanya Admin atau Owner yang dapat mengelola layanan perusahaan.' }
  }

  const id = formData.get('id') as string
  const name = ((formData.get('name') as string | null) || '').trim()
  const rawDesc = formData.get('description') as string | null
  const description = rawDesc !== null ? rawDesc.trim() : null
  const rawPrice = formData.get('defaultPrice') as string | null
  const defaultPrice = rawPrice ? Number(rawPrice) : 0
  const isActive = formData.get('isActive') !== null ? formData.get('isActive') === 'true' : undefined

  // Parse SOP fields
  const sopMode = (formData.get('sopMode') as string) || 'none'
  const sopNotesRaw = formData.get('sopNotes') as string | null
  const sopNotes = sopNotesRaw ? sopNotesRaw.trim() : null
  const rawDuration = formData.get('estimatedDurationMinutes') as string | null
  const estimatedDurationMinutes = rawDuration ? Number(rawDuration) : null
  const riskLevel = (formData.get('riskLevel') as string) || 'low'
  const rawSopItems = formData.get('sopItems') as string | null
  let sopItems: SopItem[] = []
  try {
    sopItems = rawSopItems ? JSON.parse(rawSopItems) : []
  } catch {
    return { error: 'Format item SOP tidak valid.' }
  }

  const parsed = updateServiceSchema.safeParse({
    id,
    name,
    description: description || null,
    defaultPrice,
    isActive,
    sopMode,
    sopItems,
    sopNotes,
    estimatedDurationMinutes,
    riskLevel,
  })

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message || 'Input layanan tidak valid',
    }
  }

  const admin = getSupabaseAdmin()

  const updatePayload: Record<string, unknown> = {
    name: parsed.data.name,
    description: parsed.data.description || null,
    default_price: parsed.data.defaultPrice ?? 0,
    sop_mode: parsed.data.sopMode,
    sop_items: parsed.data.sopItems,
    sop_notes: parsed.data.sopNotes || null,
    estimated_duration_minutes: parsed.data.estimatedDurationMinutes ?? null,
    risk_level: parsed.data.riskLevel,
    updated_at: new Date().toISOString(),
  }

  if (typeof parsed.data.isActive === 'boolean') {
    updatePayload.is_active = parsed.data.isActive
  }

  const { error } = await admin
    .from('company_services')
    .update(updatePayload)
    .eq('id', parsed.data.id)
    .eq('org_id', profile.orgId)

  if (error) {
    if (error.code === '23505') {
      return {
        error: 'Nama layanan sudah digunakan oleh layanan lain.',
      }
    }
    return {
      error: 'Gagal memperbarui layanan: ' + error.message,
    }
  }

  revalidatePath('/admin/profile')
  revalidatePath('/admin/jobs/new')

  return {
    success: true,
    message: 'Layanan berhasil diperbarui.',
  }
}

export async function toggleServiceActiveAction(id: string, currentStatus: boolean): Promise<OrgActionState> {
  const profile = await requireUser()
  if (profile.role !== 'admin' && profile.role !== 'owner') {
    return { error: 'Hanya Admin atau Owner yang dapat mengelola layanan perusahaan.' }
  }
  const admin = getSupabaseAdmin()

  const { error } = await admin
    .from('company_services')
    .update({
      is_active: !currentStatus,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('org_id', profile.orgId)

  if (error) {
    return {
      error: 'Gagal mengubah status layanan: ' + error.message,
    }
  }

  revalidatePath('/admin/profile')
  revalidatePath('/admin/jobs/new')

  return {
    success: true,
    message: `Layanan berhasil di${!currentStatus ? 'aktifkan' : 'nonaktifkan'}.`,
  }
}

export async function deleteCompanyServiceAction(id: string): Promise<OrgActionState> {
  const profile = await requireUser()
  if (profile.role !== 'admin' && profile.role !== 'owner') {
    return { error: 'Hanya Admin atau Owner yang dapat mengelola layanan perusahaan.' }
  }
  const admin = getSupabaseAdmin()

  const { error } = await admin
    .from('company_services')
    .delete()
    .eq('id', id)
    .eq('org_id', profile.orgId)

  if (error) {
    return {
      error: 'Gagal menghapus layanan: ' + error.message,
    }
  }

  revalidatePath('/admin/profile')
  revalidatePath('/admin/jobs/new')

  return {
    success: true,
    message: 'Layanan berhasil dihapus dari daftar perusahaan.',
  }
}

export async function completeOnboardingAction(payload: {
  address: string
  city: string
  province?: string
  phone?: string
  services: string[]
}): Promise<OrgActionState> {
  const profile = await requireUser()
  if (profile.role !== 'admin' && profile.role !== 'owner') {
    return { error: 'Hanya Admin atau Owner yang dapat melengkapi informasi perusahaan.' }
  }

  const parsed = onboardingSchema.safeParse(payload)
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message || 'Data onboarding belum lengkap',
    }
  }

  const admin = getSupabaseAdmin()

  // 1. Update organization location & mark onboarded
  const { error: orgError } = await admin
    .from('organizations')
    .update({
      address: parsed.data.address.trim(),
      city: parsed.data.city.trim(),
      province: parsed.data.province?.trim() || null,
      phone: parsed.data.phone?.trim() || null,
      is_onboarded: true,
    })
    .eq('id', profile.orgId)

  if (orgError) {
    return {
      error: 'Gagal menyimpan data perusahaan: ' + orgError.message,
    }
  }

  // 2. Insert services if selected
  if (parsed.data.services && parsed.data.services.length > 0) {
    const serviceRows = parsed.data.services
      .filter((s) => s.trim().length > 0)
      .map((name) => ({
        org_id: profile.orgId,
        name: name.trim(),
        is_active: true,
      }))

    if (serviceRows.length > 0) {
      await admin
        .from('company_services')
        .upsert(serviceRows, { onConflict: 'org_id, name', ignoreDuplicates: true })
    }
  }

  revalidatePath('/admin', 'layout')
  revalidatePath('/admin')
  revalidatePath('/admin/profile')
  revalidatePath('/admin/jobs/new')

  return {
    success: true,
    message: 'Data perusahaan dan layanan awal berhasil disimpan.',
  }
}

export async function dismissOnboardingAction(): Promise<OrgActionState> {
  const profile = await requireUser()
  if (profile.role !== 'admin' && profile.role !== 'owner') {
    return { error: 'Akses ditolak.' }
  }
  const admin = getSupabaseAdmin()

  const { error } = await admin
    .from('organizations')
    .update({
      is_onboarded: true,
    })
    .eq('id', profile.orgId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin', 'layout')
  revalidatePath('/admin')

  return { success: true }
}

export async function extendSubscriptionAction(
  months: number,
  tier: string = 'pro'
): Promise<OrgActionState> {
  const profile = await requireUser()
  if (profile.role !== 'admin' && profile.role !== 'owner') {
    return { error: 'Hanya Admin atau Owner yang dapat memperpanjang paket langganan.' }
  }

  const admin = getSupabaseAdmin()

  const { error } = await admin
    .from('organizations')
    .update({
      subscription_tier: tier,
    })
    .eq('id', profile.orgId)

  if (error) {
    return { error: 'Gagal memperbarui langganan: ' + error.message }
  }

  revalidatePath('/admin/profile')
  revalidatePath('/owner/profile')

  return {
    success: true,
    message: `Langganan berhasil diperpanjang selama ${months} bulan!`,
  }
}

