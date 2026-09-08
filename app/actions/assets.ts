'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { requireUser, requireRole } from '@/lib/auth'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'

const POSTGRES_UUID_REGEX =
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/

const postgresUuid = (message: string) =>
  z.string().regex(POSTGRES_UUID_REGEX, { message })

const assetStatusEnum = z.enum(['operational', 'needs_service', 'broken', 'decommissioned'])

export type AssetStatus = z.infer<typeof assetStatusEnum>

const createAssetSchema = z.object({
  customerId: postgresUuid('Customer wajib dipilih'),
  assetName: z.string().min(2, 'Nama mesin / unit minimal 2 karakter'),
  brand: z.string().min(1, 'Merk / brand wajib diisi'),
  modelNumber: z.string().optional().or(z.literal('')),
  serialNumber: z.string().optional().or(z.literal('')),
  locationTag: z.string().optional().or(z.literal('')),
  installationDate: z.string().optional().or(z.literal('')),
  warrantyExpiresAt: z.string().optional().or(z.literal('')),
  status: assetStatusEnum.default('operational'),
  notes: z.string().optional().or(z.literal('')),
})

const updateAssetSchema = createAssetSchema.extend({
  assetId: postgresUuid('ID Asset wajib diisi'),
})

export type AssetActionState = {
  error?: string
  success?: boolean
  assetId?: string
  fields?: Record<string, string>
}

export async function createCustomerAssetAction(
  prevState: AssetActionState,
  formData: FormData
): Promise<AssetActionState> {
  const profile = await requireRole('admin')

  const rawData = {
    customerId: (formData.get('customerId') as string)?.trim(),
    assetName: (formData.get('assetName') as string)?.trim(),
    brand: (formData.get('brand') as string)?.trim(),
    modelNumber: (formData.get('modelNumber') as string)?.trim() || '',
    serialNumber: (formData.get('serialNumber') as string)?.trim() || '',
    locationTag: (formData.get('locationTag') as string)?.trim() || '',
    installationDate: (formData.get('installationDate') as string)?.trim() || '',
    warrantyExpiresAt: (formData.get('warrantyExpiresAt') as string)?.trim() || '',
    status: ((formData.get('status') as string)?.trim() || 'operational') as AssetStatus,
    notes: (formData.get('notes') as string)?.trim() || '',
  }

  const parsed = createAssetSchema.safeParse(rawData)
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message || 'Data unit tidak valid',
      fields: Object.fromEntries(
        Object.entries(rawData).map(([k, v]) => [k, String(v ?? '')])
      ),
    }
  }

  const admin = getSupabaseAdmin()

  const { data: asset, error } = await admin
    .from('customer_assets')
    .insert({
      org_id: profile.orgId,
      customer_id: parsed.data.customerId,
      asset_name: parsed.data.assetName,
      brand: parsed.data.brand,
      model_number: parsed.data.modelNumber || null,
      serial_number: parsed.data.serialNumber || null,
      location_tag: parsed.data.locationTag || null,
      installation_date: parsed.data.installationDate ? parsed.data.installationDate : null,
      warranty_expires_at: parsed.data.warrantyExpiresAt ? parsed.data.warrantyExpiresAt : null,
      status: parsed.data.status,
      notes: parsed.data.notes || null,
    })
    .select('id')
    .single()

  if (error || !asset) {
    return {
      error: 'Gagal menambahkan unit aset: ' + (error?.message || ''),
      fields: Object.fromEntries(
        Object.entries(rawData).map(([k, v]) => [k, String(v ?? '')])
      ),
    }
  }

  revalidatePath(`/admin/customers/${parsed.data.customerId}`)
  revalidatePath('/admin/jobs/new')
  return { success: true, assetId: asset.id }
}

export async function updateCustomerAssetAction(
  prevState: AssetActionState,
  formData: FormData
): Promise<AssetActionState> {
  const profile = await requireRole('admin')

  const rawData = {
    assetId: (formData.get('assetId') as string)?.trim(),
    customerId: (formData.get('customerId') as string)?.trim(),
    assetName: (formData.get('assetName') as string)?.trim(),
    brand: (formData.get('brand') as string)?.trim(),
    modelNumber: (formData.get('modelNumber') as string)?.trim() || '',
    serialNumber: (formData.get('serialNumber') as string)?.trim() || '',
    locationTag: (formData.get('locationTag') as string)?.trim() || '',
    installationDate: (formData.get('installationDate') as string)?.trim() || '',
    warrantyExpiresAt: (formData.get('warrantyExpiresAt') as string)?.trim() || '',
    status: ((formData.get('status') as string)?.trim() || 'operational') as AssetStatus,
    notes: (formData.get('notes') as string)?.trim() || '',
  }

  const parsed = updateAssetSchema.safeParse(rawData)
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message || 'Data unit tidak valid',
      fields: Object.fromEntries(
        Object.entries(rawData).map(([k, v]) => [k, String(v ?? '')])
      ),
    }
  }

  const admin = getSupabaseAdmin()

  const { error } = await admin
    .from('customer_assets')
    .update({
      asset_name: parsed.data.assetName,
      brand: parsed.data.brand,
      model_number: parsed.data.modelNumber || null,
      serial_number: parsed.data.serialNumber || null,
      location_tag: parsed.data.locationTag || null,
      installation_date: parsed.data.installationDate ? parsed.data.installationDate : null,
      warranty_expires_at: parsed.data.warrantyExpiresAt ? parsed.data.warrantyExpiresAt : null,
      status: parsed.data.status,
      notes: parsed.data.notes || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', parsed.data.assetId)
    .eq('org_id', profile.orgId)

  if (error) {
    return {
      error: 'Gagal memperbarui unit aset: ' + error.message,
      fields: Object.fromEntries(
        Object.entries(rawData).map(([k, v]) => [k, String(v ?? '')])
      ),
    }
  }

  revalidatePath(`/admin/customers/${parsed.data.customerId}`)
  revalidatePath('/admin/jobs/new')
  return { success: true, assetId: parsed.data.assetId }
}

export async function getCustomerAssets(customerId: string) {
  const profile = await requireUser()
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from('customer_assets')
    .select('*')
    .eq('customer_id', customerId)
    .eq('org_id', profile.orgId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching customer assets:', error)
    return []
  }

  return data ?? []
}
