'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { requireUser } from '@/lib/auth'
import { getSupabaseAdmin } from '@/lib/supabase/admin'

const updateCommissionSettingsSchema = z.object({
  commission_enabled: z.boolean(),
  commission_type: z.enum(['service_based', 'flat']),
  default_commission_rate: z.coerce.number().min(0, 'Tarif dasar komisi tidak boleh negatif'),
  on_time_bonus_enabled: z.boolean(),
  on_time_bonus_rate: z.coerce.number().min(0, 'Bonus ketepatan waktu tidak boleh negatif'),
  serviceRates: z
    .array(
      z.object({
        id: z.string().uuid(),
        commission_rate: z.coerce.number().min(0).nullable().optional(),
      })
    )
    .optional(),
})

export type UpdateCommissionSettingsInput = z.infer<typeof updateCommissionSettingsSchema>

export async function updateCommissionSettings(input: UpdateCommissionSettingsInput) {
  const profile = await requireUser()
  if (profile.role !== 'admin' && profile.role !== 'owner') {
    return { error: 'Hanya Admin atau Owner yang memiliki akses mengubah pengaturan komisi.' }
  }

  const parsed = updateCommissionSettingsSchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || 'Data pengaturan komisi tidak valid.' }
  }

  const {
    commission_enabled,
    commission_type,
    default_commission_rate,
    on_time_bonus_enabled,
    on_time_bonus_rate,
    serviceRates,
  } = parsed.data

  const admin = getSupabaseAdmin()

  // 1. Update organization settings
  const { error: orgError } = await admin
    .from('organizations')
    .update({
      commission_enabled,
      commission_type,
      default_commission_rate,
      on_time_bonus_enabled,
      on_time_bonus_rate,
    })
    .eq('id', profile.orgId)

  if (orgError) {
    console.error('Failed to update organization commission settings:', orgError)
    // Check if error is due to missing columns before migration
    if (orgError.message?.includes('column') && orgError.message?.includes('does not exist')) {
      return {
        error:
          'Kolom skema komisi belum diterapkan di database. Silakan jalankan migration SQL pada Supabase terlebih dahulu.',
      }
    }
    return { error: `Gagal memperbarui pengaturan komisi: ${orgError.message}` }
  }

  // 2. Update service rates if provided and in service_based mode
  if (serviceRates && serviceRates.length > 0 && commission_type === 'service_based') {
    for (const item of serviceRates) {
      const { error: srvError } = await admin
        .from('company_services')
        .update({
          commission_rate: item.commission_rate,
        })
        .eq('id', item.id)
        .eq('org_id', profile.orgId)

      if (srvError) {
        console.error(`Failed to update service ${item.id} commission:`, srvError)
      }
    }
  }

  revalidatePath('/admin/technicians')
  revalidatePath('/technician/commissions')
  revalidatePath('/technician')

  return { success: true }
}
