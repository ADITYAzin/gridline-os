'use server'

import { revalidatePath } from 'next/cache'
import { requireRole, requireUser } from '@/lib/auth'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { STORAGE, PHOTO } from '@/lib/constants'

export async function checkInAction(jobId: string, latitude?: number, longitude?: number) {
  const profile = await requireRole('technician')
  const admin = getSupabaseAdmin()

  // 1. Verify job is assigned to this technician
  const { data: job } = await admin
    .from('jobs')
    .select('id, org_id, status, technician_id')
    .eq('id', jobId)
    .eq('technician_id', profile.id)
    .single()

  if (!job) {
    return { error: 'Job tidak ditemukan atau Anda tidak ditugaskan pada pekerjaan ini.' }
  }

  const now = new Date().toISOString()

  // 2. Upsert attendance & update job status in parallel
  const [attResult] = await Promise.all([
    admin.from('job_attendance').upsert(
      {
        org_id: profile.orgId,
        job_id: jobId,
        technician_id: profile.id,
        check_in_at: now,
        check_in_latitude: latitude || null,
        check_in_longitude: longitude || null,
      },
      { onConflict: 'job_id' },
    ),
    admin
      .from('jobs')
      .update({ status: 'on_progress' })
      .eq('id', jobId),
  ])

  if (attResult.error) {
    return { error: 'Gagal mencatat check-in: ' + attResult.error.message }
  }

  revalidatePath(`/technician/jobs/${jobId}`)
  return { success: true }
}

export async function checkOutAction(jobId: string, latitude?: number, longitude?: number) {
  const profile = await requireRole('technician')
  const admin = getSupabaseAdmin()

  const now = new Date().toISOString()

  const { error } = await admin
    .from('job_attendance')
    .update({
      check_out_at: now,
      check_out_latitude: latitude || null,
      check_out_longitude: longitude || null,
    })
    .eq('job_id', jobId)
    .eq('technician_id', profile.id)

  if (error) {
    return { error: 'Gagal mencatat check-out: ' + error.message }
  }

  revalidatePath(`/technician/jobs/${jobId}`)
  return { success: true }
}

export async function toggleChecklistItemAction(itemId: string, isCompleted: boolean) {
  const profile = await requireRole('technician')
  const admin = getSupabaseAdmin()

  const now = isCompleted ? new Date().toISOString() : null

  const { error } = await admin
    .from('checklist_items')
    .update({
      is_completed: isCompleted,
      completed_at: now,
      // Reset N/A if technician now checks the item
      ...(isCompleted ? { is_na: false, na_reason: null } : {}),
    })
    .eq('id', itemId)
    .eq('org_id', profile.orgId)

  if (error) {
    return { error: 'Gagal memperbarui checklist: ' + error.message }
  }

  return { success: true }
}

export async function markChecklistNaAction(
  itemId: string,
  naReason: string,
): Promise<{ error?: string; success?: boolean }> {
  const profile = await requireRole('technician')

  if (!naReason || naReason.trim().length < 3) {
    return { error: 'Alasan N/A wajib diisi (minimal 3 karakter).' }
  }

  const admin = getSupabaseAdmin()

  // Verify the item is not critical — critical items cannot be marked N/A
  const { data: item } = await admin
    .from('checklist_items')
    .select('is_critical')
    .eq('id', itemId)
    .eq('org_id', profile.orgId)
    .single()

  if (!item) {
    return { error: 'Item checklist tidak ditemukan.' }
  }

  if (item.is_critical) {
    return { error: 'Item keselamatan kritis tidak dapat ditandai N/A. Hubungi admin jika ada kendala.' }
  }

  const { error } = await admin
    .from('checklist_items')
    .update({
      is_na: true,
      na_reason: naReason.trim(),
      is_completed: false,
      completed_at: null,
    })
    .eq('id', itemId)
    .eq('org_id', profile.orgId)

  if (error) {
    return { error: 'Gagal menandai item N/A: ' + error.message }
  }

  return { success: true }
}

export async function resetChecklistItemAction(
  itemId: string,
): Promise<{ error?: string; success?: boolean }> {
  const profile = await requireRole('technician')
  const admin = getSupabaseAdmin()

  const { error } = await admin
    .from('checklist_items')
    .update({
      is_completed: false,
      is_na: false,
      na_reason: null,
      completed_at: null,
    })
    .eq('id', itemId)
    .eq('org_id', profile.orgId)

  if (error) {
    return { error: 'Gagal mereset item checklist: ' + error.message }
  }

  return { success: true }
}

export async function uploadJobPhotoAction(jobId: string, type: 'before' | 'after', formData: FormData) {
  const profile = await requireRole('technician')
  const file = formData.get('file') as File | null

  if (!file) {
    return { error: 'File foto tidak ditemukan.' }
  }

  if (file.size > PHOTO.maxBytes) {
    return { error: 'Ukuran foto maksimal 5MB.' }
  }

  const admin = getSupabaseAdmin()

  // 1. Check current photo count (Decision #8)
  const { count } = await admin
    .from('job_photos')
    .select('*', { count: 'exact', head: true })
    .eq('job_id', jobId)
    .eq('type', type)

  if ((count || 0) >= PHOTO.maxPerTypePerJob) {
    return { error: `Maksimal ${PHOTO.maxPerTypePerJob} foto ${type} diperbolehkan.` }
  }

  // 2. Upload file to Supabase storage: {org_id}/{job_id}/{type}/{timestamp}.ext
  const fileExt = file.name.split('.').pop() || 'jpg'
  const filePath = `${profile.orgId}/${jobId}/${type}/${Date.now()}.${fileExt}`
  const fileBuffer = Buffer.from(await file.arrayBuffer())

  const { error: uploadError } = await admin.storage
    .from(STORAGE.jobFilesBucket)
    .upload(filePath, fileBuffer, {
      contentType: file.type || 'image/jpeg',
      upsert: true,
    })

  if (uploadError) {
    return { error: 'Gagal mengunggah foto ke storage: ' + uploadError.message }
  }

  // 3. Save photo reference to database
  const { error: dbError } = await admin.from('job_photos').insert({
    org_id: profile.orgId,
    job_id: jobId,
    type,
    file_url: filePath,
    uploaded_by: profile.id,
    captured_at: new Date().toISOString(),
  })

  if (dbError) {
    return { error: 'Gagal menyimpan data foto: ' + dbError.message }
  }

  revalidatePath(`/technician/jobs/${jobId}`)
  return { success: true }
}

export async function submitSignatureAction(jobId: string, customerName: string, signatureBase64: string) {
  const profile = await requireRole('technician')

  if (!customerName || customerName.trim().length < 2) {
    return { error: 'Nama penandatangan wajib diisi.' }
  }

  if (!signatureBase64 || !signatureBase64.includes('base64,')) {
    return { error: 'Goresan tanda tangan tidak valid.' }
  }

  const admin = getSupabaseAdmin()

  // Extract base64 and upload to storage
  const base64Data = signatureBase64.split(';base64,').pop()!
  const buffer = Buffer.from(base64Data, 'base64')
  const filePath = `${profile.orgId}/${jobId}/signature/${Date.now()}.png`

  const { error: uploadError } = await admin.storage
    .from(STORAGE.jobFilesBucket)
    .upload(filePath, buffer, {
      contentType: 'image/png',
      upsert: true,
    })

  if (uploadError) {
    return { error: 'Gagal menyimpan file tanda tangan: ' + uploadError.message }
  }

  // Upsert signature row
  const { error: dbError } = await admin.from('signatures').upsert(
    {
      org_id: profile.orgId,
      job_id: jobId,
      customer_name: customerName.trim(),
      signature_url: filePath,
      signed_at: new Date().toISOString(),
    },
    { onConflict: 'job_id' },
  )

  if (dbError) {
    return { error: 'Gagal mencatat tanda tangan: ' + dbError.message }
  }

  revalidatePath(`/technician/jobs/${jobId}`)
  return { success: true }
}

export async function submitWorkReportAction(
  jobId: string,
  result: string,
  notes?: string,
  completeJobIfReady: boolean = true,
) {
  const profile = await requireRole('technician')

  if (!result || result.trim().length < 5) {
    return { error: 'Hasil pekerjaan wajib diisi (minimal 5 karakter).' }
  }

  const admin = getSupabaseAdmin()

  // 1. Verify job is assigned to this technician
  const { data: job } = await admin
    .from('jobs')
    .select('id, org_id, status, technician_id')
    .eq('id', jobId)
    .eq('org_id', profile.orgId)
    .eq('technician_id', profile.id)
    .maybeSingle()

  if (!job) {
    return { error: 'Pekerjaan tidak ditemukan atau Anda tidak ditugaskan pada pekerjaan ini.' }
  }

  const now = new Date().toISOString()

  // 2. Upsert work report
  const { error: reportError } = await admin.from('work_reports').upsert(
    {
      org_id: profile.orgId,
      job_id: jobId,
      result: result.trim(),
      notes: notes?.trim() || null,
      submitted_by: profile.id,
      submitted_at: now,
    },
    { onConflict: 'job_id' },
  )

  if (reportError) {
    return { error: 'Gagal mengirim laporan: ' + reportError.message }
  }

  // 3. Attempt to transition status to 'completed' if completeJobIfReady is true
  let completed = false
  if (completeJobIfReady && job.status !== 'completed') {
    const { error: completeError } = await admin
      .from('jobs')
      .update({
        status: 'completed',
        completed_at: now,
      })
      .eq('id', jobId)
      .eq('org_id', profile.orgId)

    if (!completeError) {
      completed = true
      // Auto-record check-out if not done yet
      await admin
        .from('job_attendance')
        .update({ check_out_at: now })
        .eq('job_id', jobId)
        .is('check_out_at', null)
    }
  }

  // Revalidate both technician and admin view paths for instant synchronization
  revalidatePath(`/technician/jobs/${jobId}`)
  revalidatePath('/technician')
  revalidatePath('/technician/commissions')
  revalidatePath(`/admin/jobs/${jobId}`)
  revalidatePath('/admin/jobs')
  revalidatePath('/admin')
  revalidatePath('/admin/dispatch')

  return { success: true, completed }
}

export async function completeJobAction(jobId: string) {
  const profile = await requireUser()
  const admin = getSupabaseAdmin()

  // 1. Verify access & ownership
  if (profile.role === 'technician') {
    const { data: job } = await admin
      .from('jobs')
      .select('id, org_id, technician_id')
      .eq('id', jobId)
      .eq('org_id', profile.orgId)
      .eq('technician_id', profile.id)
      .maybeSingle()

    if (!job) {
      return { error: 'Anda tidak memiliki hak untuk menyelesaikan pekerjaan ini.' }
    }
  } else if (profile.role !== 'admin' && (profile.role as string) !== 'owner') {
    return { error: 'Hak akses tidak memadai.' }
  }

  // 2. Attempt to transition job into 'completed'
  // Trigger trg_validate_job_lifecycle_transition will automatically validate all 5 conditions!
  const now = new Date().toISOString()
  const { error } = await admin
    .from('jobs')
    .update({
      status: 'completed',
      completed_at: now,
    })
    .eq('id', jobId)
    .eq('org_id', profile.orgId)

  if (error) {
    return { error: error.message }
  }

  // 3. Auto-record check-out if technician hasn't checked out yet
  await admin
    .from('job_attendance')
    .update({ check_out_at: now })
    .eq('job_id', jobId)
    .is('check_out_at', null)

  // 4. Invalidate both technician and admin view paths
  revalidatePath(`/technician/jobs/${jobId}`)
  revalidatePath('/technician')
  revalidatePath('/technician/commissions')
  revalidatePath(`/admin/jobs/${jobId}`)
  revalidatePath('/admin/jobs')
  revalidatePath('/admin')
  revalidatePath('/admin/dispatch')

  return { success: true }
}
