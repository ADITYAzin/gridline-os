'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { requireRole } from '@/lib/auth'
import { getSupabaseAdmin } from '@/lib/supabase/admin'

// Postgres accepts any 32-hex-digit UUID separated by hyphens (8-4-4-4-12 format),
// including RFC 4122 v4 UUIDs and predictable demo seed UUIDs (e.g. 00000000-0000-0000-0000-000000000103).
const POSTGRES_UUID_REGEX =
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/

const postgresUuid = (message: string) =>
  z.string().regex(POSTGRES_UUID_REGEX, { message })

const createJobSchema = z.object({
  customerId: postgresUuid('Customer wajib dipilih'),
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
}

const DEFAULT_SOP_TEMPLATES: Record<string, string[]> = {
  ac: [
    'Pemeriksaan filter udara dan evaporator',
    'Pengukuran tekanan tekanan freon / refrigeran',
    'Pembersihan unit outdoor kondensor dan blower',
    'Pengujian suhu hembusan dingin',
    'Pemeriksaan kelancaran pipa drainase air',
  ],
  cctv: [
    'Pemasangan kabel UTP & konektor kamera',
    'Konfigurasi IP kamera dan NVR',
    'Penyesuaian sudut pandang (viewing angle)',
    'Uji kualitas rekaman siang dan malam (Infrared)',
  ],
  electrical: [
    'Pemeriksaan tegangan & arus listrik (Voltage/Ampere)',
    'Inspeksi kekencangan baut terminal kabel',
    'Pengujian MCB / proteksi arus bocor (ELCB)',
    'Uji beban operasional sistem listrik',
  ],
  default: [
    'Inspeksi awal kondisi fisik dan fungsi peralatan',
    'Pelaksanaan perbaikan / servis sesuai SOP',
    'Pembersihan area kerja dan peralatan pendukung',
    'Uji fungsi operasional akhir',
  ],
}

function getSopChecklist(serviceType: string): string[] {
  const lower = serviceType.toLowerCase()
  if (lower.includes('ac') || lower.includes('hvac') || lower.includes('pendingin')) {
    return DEFAULT_SOP_TEMPLATES.ac
  }
  if (lower.includes('cctv') || lower.includes('kamera') || lower.includes('nvr')) {
    return DEFAULT_SOP_TEMPLATES.cctv
  }
  if (lower.includes('listrik') || lower.includes('electrical') || lower.includes('panel')) {
    return DEFAULT_SOP_TEMPLATES.electrical
  }
  return DEFAULT_SOP_TEMPLATES.default
}

export async function createJobAction(prevState: JobActionState, formData: FormData): Promise<JobActionState> {
  const profile = await requireRole('admin')

  const rawData = {
    customerId: (formData.get('customerId') as string)?.trim(),
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

  const parsed = createJobSchema.safeParse(rawData)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || 'Input data job tidak valid' }
  }

  const admin = getSupabaseAdmin()

  // 1. Generate Atomic Job Number via DB function
  const { data: generatedNumber, error: seqError } = await admin.rpc('generate_next_job_number', {
    p_org_id: profile.orgId,
  })

  if (seqError || !generatedNumber) {
    return { error: 'Gagal menghasilkan nomor job unik: ' + (seqError?.message || '') }
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
    return { error: 'Gagal membuat job: ' + jobError.message }
  }

  // 3. Pre-populate SOP Checklist Items
  const checklist = getSopChecklist(parsed.data.serviceType)
  const checklistRows = checklist.map((item) => ({
    org_id: profile.orgId,
    job_id: job.id,
    item,
    is_completed: false,
  }))

  await admin.from('checklist_items').insert(checklistRows)

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
        return { error: 'Bentrok Jadwal: Teknisi sudah memiliki pekerjaan lain pada rentang waktu ini.' }
      }
      return { error: 'Gagal menjadwalkan: ' + schedError.message }
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
  return { success: true }
}
