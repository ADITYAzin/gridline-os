'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { requireRole } from '@/lib/auth'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import type { SopItem } from '@/app/actions/organization'

// Postgres accepts any 32-hex-digit UUID separated by hyphens (8-4-4-4-12 format),
// including RFC 4122 v4 UUIDs and predictable demo seed UUIDs (e.g. 00000000-0000-0000-0000-000000000103).
const POSTGRES_UUID_REGEX =
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/

const postgresUuid = (message: string) =>
  z.string().regex(POSTGRES_UUID_REGEX, { message })

const createJobSchema = z.object({
  customerId: postgresUuid('Customer wajib dipilih'),
  assetId: postgresUuid('Aset/mesin tidak valid').optional().or(z.literal('')),
  serviceType: z.string().min(2, 'Jenis layanan minimal 2 karakter'),
  issue: z.string().min(5, 'Deskripsi kendala minimal 5 karakter'),
  instructions: z.string().optional(),
  address: z.string().min(5, 'Alamat servis minimal 5 karakter'),
  priority: z.enum(['low', 'medium', 'high']),
  technicianId: postgresUuid('Teknisi yang dipilih tidak valid').optional().or(z.literal('')),
  scheduleDate: z.string().optional().or(z.literal('')),
  startTime: z.string().optional().or(z.literal('')),
  endTime: z.string().optional().or(z.literal('')),
})

export type JobActionState = {
  error?: string
  success?: boolean
  jobId?: string
  fields?: Record<string, string>
}

const DEFAULT_SOP_FALLBACK: string[] = [
  'Inspeksi awal kondisi fisik dan fungsi peralatan',
  'Pelaksanaan perbaikan / servis sesuai SOP',
  'Pembersihan area kerja dan peralatan pendukung',
  'Uji fungsi operasional akhir',
]

export async function createJobAction(prevState: JobActionState, formData: FormData): Promise<JobActionState> {
  const profile = await requireRole('admin')

  const rawData = {
    customerId: (formData.get('customerId') as string)?.trim(),
    assetId: (formData.get('assetId') as string)?.trim() || undefined,
    serviceType: formData.get('serviceType') as string,
    issue: formData.get('issue') as string,
    instructions: (formData.get('instructions') as string) || undefined,
    address: formData.get('address') as string,
    priority: formData.get('priority') as 'low' | 'medium' | 'high',
    technicianId: (formData.get('technicianId') as string)?.trim() || undefined,
    scheduleDate: (formData.get('scheduleDate') as string) || undefined,
    startTime: (formData.get('startTime') as string) || undefined,
    endTime: (formData.get('endTime') as string) || undefined,
  }

  const fieldValues: Record<string, string> = {
    customerId: (formData.get('customerId') as string) || '',
    assetId: (formData.get('assetId') as string) || '',
    serviceType: (formData.get('serviceType') as string) || '',
    issue: (formData.get('issue') as string) || '',
    instructions: (formData.get('instructions') as string) || '',
    address: (formData.get('address') as string) || '',
    priority: (formData.get('priority') as string) || 'medium',
    technicianId: (formData.get('technicianId') as string) || '',
    scheduleDate: (formData.get('scheduleDate') as string) || '',
    startTime: (formData.get('startTime') as string) || '',
    endTime: (formData.get('endTime') as string) || '',
  }

  const parsed = createJobSchema.safeParse(rawData)
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message || 'Input data job tidak valid',
      fields: fieldValues,
    }
  }

  const admin = getSupabaseAdmin()

  // 1. Generate Atomic Job Number via DB function
  const { data: generatedNumber, error: seqError } = await admin.rpc('generate_next_job_number', {
    p_org_id: profile.orgId,
  })

  if (seqError || !generatedNumber) {
    return {
      error: 'Gagal menghasilkan nomor job unik: ' + (seqError?.message || ''),
      fields: fieldValues,
    }
  }

  const hasAssignment = Boolean(parsed.data.technicianId && parsed.data.scheduleDate && parsed.data.startTime && parsed.data.endTime)
  const initialStatus = hasAssignment ? 'assigned' : 'pending'

  // 2. Insert Job
  const { data: job, error: jobError } = await admin
    .from('jobs')
    .insert({
      org_id: profile.orgId,
      job_number: generatedNumber,
      customer_id: parsed.data.customerId,
      asset_id: parsed.data.assetId || null,
      created_by: profile.id,
      service_type: parsed.data.serviceType.trim(),
      issue: parsed.data.issue.trim(),
      instructions: parsed.data.instructions?.trim() || null,
      address: parsed.data.address.trim(),
      priority: parsed.data.priority,
      status: initialStatus,
      technician_id: hasAssignment ? parsed.data.technicianId! : null,
    })
    .select('id')
    .single()

  if (jobError || !job) {
    return {
      error: 'Gagal membuat job: ' + jobError.message,
      fields: fieldValues,
    }
  }

  // 3. Pre-populate SOP Checklist Items — from company_services config (admin-defined)
  // Fetch the service's SOP config by name match within this org
  const { data: serviceData } = await admin
    .from('company_services')
    .select('sop_mode, sop_items')
    .eq('org_id', profile.orgId)
    .eq('name', parsed.data.serviceType.trim())
    .eq('is_active', true)
    .maybeSingle()

  const sopMode = (serviceData?.sop_mode as 'strict' | 'reference' | 'none' | undefined) ?? 'strict'
  const sopItems = (serviceData?.sop_items as SopItem[] | null) ?? []

  if (sopItems.length > 0) {
    // Admin has configured SOP items: snapshot them into checklist_items
    const checklistRows = sopItems
      .sort((a, b) => a.order - b.order)
      .map((s) => ({
        org_id: profile.orgId,
        job_id: job.id,
        item: s.item,
        is_completed: false,
        is_na: false,
        sop_mode: sopMode,
        requires_photo: s.requires_photo ?? false,
        is_critical: s.is_critical ?? false,
        hint: s.hint || null,
      }))
    await admin.from('checklist_items').insert(checklistRows)
  } else if (sopMode === 'strict' || !serviceData) {
    // No admin SOP configured yet, or service not found in catalog: use legacy fallback
    const fallbackRows = DEFAULT_SOP_FALLBACK.map((item) => ({
      org_id: profile.orgId,
      job_id: job.id,
      item,
      is_completed: false,
      is_na: false,
      sop_mode: 'strict',
      requires_photo: false,
      is_critical: false,
    }))
    await admin.from('checklist_items').insert(fallbackRows)
  }
  // If sopMode is 'reference' or 'none' and no items, no checklist rows are created

  // 4. Handle Schedule if assigned
  if (hasAssignment) {
    const startAt = new Date(`${parsed.data.scheduleDate}T${parsed.data.startTime}:00`).toISOString()
    const endAt = new Date(`${parsed.data.scheduleDate}T${parsed.data.endTime}:00`).toISOString()

    const { error: schedError } = await admin.from('schedules').insert({
      org_id: profile.orgId,
      job_id: job.id,
      technician_id: parsed.data.technicianId!,
      start_at: startAt,
      end_at: endAt,
    })

    if (schedError) {
      // Catch exclusion constraint error
      if (schedError.message.includes('schedules_no_overlap') || schedError.code === '23P01') {
        // Rollback job
        await admin.from('jobs').delete().eq('id', job.id)
        return {
          error: 'Bentrok Jadwal: Teknisi sudah memiliki pekerjaan lain pada rentang waktu ini.',
          fields: fieldValues,
        }
      }
      return {
        error: 'Gagal menjadwalkan: ' + schedError.message,
        fields: fieldValues,
      }
    }
  }

  revalidatePath('/admin/jobs')
  revalidatePath('/admin')
  redirect(`/admin/jobs/${job.id}`)
}

export async function assignJobAction(
  jobId: string,
  technicianId: string,
  scheduleDate: string,
  startTime: string,
  endTime: string,
): Promise<{ error?: string; success?: boolean }> {
  const profile = await requireRole('admin')
  const admin = getSupabaseAdmin()

  const startAt = new Date(`${scheduleDate}T${startTime}:00`).toISOString()
  const endAt = new Date(`${scheduleDate}T${endTime}:00`).toISOString()

  if (new Date(endAt) <= new Date(startAt)) {
    return { error: 'Waktu selesai harus lebih besar dari waktu mulai' }
  }

  // Upsert schedule
  const { error: schedError } = await admin.from('schedules').upsert(
    {
      org_id: profile.orgId,
      job_id: jobId,
      technician_id: technicianId,
      start_at: startAt,
      end_at: endAt,
    },
    { onConflict: 'job_id' },
  )

  if (schedError) {
    if (schedError.message.includes('schedules_no_overlap') || schedError.code === '23P01') {
      return { error: 'Bentrok Jadwal: Teknisi sudah memiliki pekerjaan lain pada jam ini.' }
    }
    return { error: 'Gagal mengatur jadwal: ' + schedError.message }
  }

  // Update job status to assigned if currently pending
  const { data: currentJob } = await admin.from('jobs').select('status').eq('id', jobId).single()
  const newStatus = currentJob?.status === 'pending' ? 'assigned' : currentJob?.status

  await admin
    .from('jobs')
    .update({
      technician_id: technicianId,
      status: newStatus,
    })
    .eq('id', jobId)
    .eq('org_id', profile.orgId)

  revalidatePath(`/admin/jobs/${jobId}`)
  revalidatePath('/admin/jobs')
  revalidatePath('/admin/dispatch')
  return { success: true }
}

export async function cancelJobAction(jobId: string, reason: string): Promise<{ error?: string; success?: boolean }> {
  const profile = await requireRole('admin')

  if (!reason || reason.trim().length < 3) {
    return { error: 'Alasan pembatalan wajib diisi (minimal 3 karakter).' }
  }

  const admin = getSupabaseAdmin()

  const { error } = await admin
    .from('jobs')
    .update({
      status: 'cancelled',
      cancelled_by: profile.id,
      cancelled_at: new Date().toISOString(),
      cancellation_reason: reason.trim(),
    })
    .eq('id', jobId)
    .eq('org_id', profile.orgId)
    .in('status', ['pending', 'assigned', 'on_progress'])

  if (error) {
    return { error: 'Gagal membatalkan job: ' + error.message }
  }

  revalidatePath(`/admin/jobs/${jobId}`)
  revalidatePath('/admin/jobs')
  revalidatePath('/admin/dispatch')
  return { success: true }
}
