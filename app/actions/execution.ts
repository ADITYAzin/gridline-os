'use server'

import { revalidatePath } from 'next/cache'
import { requireRole, requireUser } from '@/lib/auth'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { STORAGE, PHOTO } from '@/lib/constants'

export async function checkInAction(
  jobId: string,
  latitude?: number,
  longitude?: number,
  formData?: FormData,
) {
  const profile = await requireRole('technician')
  const admin = getSupabaseAdmin()

  // 1. Verify job is assigned to this technician within the same organization and not locked
  const { data: job } = await admin
    .from('jobs')
    .select('id, org_id, status, technician_id')
    .eq('id', jobId)
    .eq('org_id', profile.orgId)
    .eq('technician_id', profile.id)
    .maybeSingle()

  if (!job) {
    return { error: 'Job tidak ditemukan atau Anda tidak ditugaskan pada pekerjaan ini.' }
  }

  if (job.status === 'completed' || job.status === 'cancelled') {
    return { error: 'Pekerjaan ini sudah selesai atau dibatalkan dan tidak dapat diubah lagi.' }
  }

  const now = new Date().toISOString()
  let photoPath: string | null = null

  // 2. Handle attendance selfie/presence photo upload if provided
  const photoFile = formData?.get('photo') as File | null
  if (photoFile && photoFile.size > 0) {
    if (photoFile.size > PHOTO.maxBytes) {
      return { error: 'Ukuran foto kehadiran maksimal 5MB.' }
    }
    const fileExt = photoFile.name.split('.').pop() || 'jpg'
    photoPath = `${profile.orgId}/${jobId}/attendance/checkin_${Date.now()}.${fileExt}`
    const fileBuffer = Buffer.from(await photoFile.arrayBuffer())

    const { error: uploadError } = await admin.storage
      .from(STORAGE.jobFilesBucket)
      .upload(photoPath, fileBuffer, {
        contentType: photoFile.type || 'image/jpeg',
        upsert: true,
      })

    if (uploadError) {
      return { error: 'Gagal mengunggah foto kehadiran: ' + uploadError.message }
    }
  }

  // 3. Upsert attendance & update job status in parallel
  const [attResult] = await Promise.all([
    admin.from('job_attendance').upsert(
      {
        org_id: profile.orgId,
        job_id: jobId,
        technician_id: profile.id,
        check_in_at: now,
        check_in_latitude: latitude || null,
        check_in_longitude: longitude || null,
        ...(photoPath ? { check_in_photo_url: photoPath } : {}),
      },
      { onConflict: 'job_id' },
    ),
    admin
      .from('jobs')
      .update({ status: 'on_progress', updated_at: now })
      .eq('id', jobId)
      .eq('org_id', profile.orgId),
  ])

  if (attResult.error) {
    return { error: 'Gagal mencatat check-in: ' + attResult.error.message }
  }

  revalidatePath(`/technician/jobs/${jobId}`)
  revalidatePath(`/admin/jobs/${jobId}`)
  revalidatePath('/admin/map')
  revalidatePath('/admin/technicians')
  revalidatePath('/admin/dispatch')
  return { success: true }
}

// Helper: Ensure job belongs to technician/org, is not locked (completed/cancelled), and technician has checked in
async function verifyTechnicianCheckedIn(
  admin: ReturnType<typeof getSupabaseAdmin>,
  jobId: string,
  orgId: string,
  technicianId: string,
) {
  const [{ data: job }, { data: att }] = await Promise.all([
    admin
      .from('jobs')
      .select('id, status, technician_id')
      .eq('id', jobId)
      .eq('org_id', orgId)
      .eq('technician_id', technicianId)
      .maybeSingle(),
    admin
      .from('job_attendance')
      .select('check_in_at')
      .eq('job_id', jobId)
      .eq('org_id', orgId)
      .maybeSingle(),
  ])

  if (!job) {
    return {
      error: 'Pekerjaan tidak ditemukan atau Anda tidak ditugaskan pada tiket ini.',
    }
  }

  if (job.status === 'completed' || job.status === 'cancelled') {
    return {
      error: 'Tiket pekerjaan sudah dikunci (selesai/dibatalkan) demi menjaga keaslian data pelanggan.',
    }
  }

  if (!att?.check_in_at) {
    return {
      error:
        'Anda wajib melakukan Check-in kedatangan di lokasi terlebih dahulu sebelum memulai proses pekerjaan ini.',
    }
  }
  return { success: true }
}

export async function checkOutAction(jobId: string, latitude?: number, longitude?: number) {
  const profile = await requireRole('technician')
  const admin = getSupabaseAdmin()

  // 1. Verify Job ownership, active status, and Check-in in parallel
  const [{ data: job }, { data: att }] = await Promise.all([
    admin
      .from('jobs')
      .select('id, status')
      .eq('id', jobId)
      .eq('org_id', profile.orgId)
      .eq('technician_id', profile.id)
      .maybeSingle(),
    admin
      .from('job_attendance')
      .select('check_in_at, check_out_at')
      .eq('job_id', jobId)
      .eq('org_id', profile.orgId)
      .eq('technician_id', profile.id)
      .maybeSingle(),
  ])

  if (!job) {
    return { error: 'Pekerjaan tidak ditemukan atau Anda tidak ditugaskan pada tiket ini.' }
  }

  if (job.status === 'completed' || job.status === 'cancelled') {
    return { error: 'Pekerjaan ini sudah selesai atau dibatalkan.' }
  }

  if (!att?.check_in_at) {
    return { error: 'Tidak dapat melakukan Check-out karena Anda belum melakukan Check-in di lokasi.' }
  }

  // 2. Anti-skip verification: Verify all prerequisite work is complete in parallel before allowing check-out
  const [
    { data: pendingSop },
    { data: photos },
    { count: sigCount },
    { data: report },
  ] = await Promise.all([
    admin
      .from('checklist_items')
      .select('id')
      .eq('job_id', jobId)
      .eq('org_id', profile.orgId)
      .eq('sop_mode', 'strict')
      .eq('is_completed', false)
      .or('is_na.eq.false,is_critical.eq.true'),
    admin
      .from('job_photos')
      .select('type')
      .eq('job_id', jobId)
      .eq('org_id', profile.orgId),
    admin
      .from('signatures')
      .select('*', { count: 'exact', head: true })
      .eq('job_id', jobId)
      .eq('org_id', profile.orgId),
    admin
      .from('work_reports')
      .select('result')
      .eq('job_id', jobId)
      .eq('org_id', profile.orgId)
      .maybeSingle(),
  ])

  if (pendingSop && pendingSop.length > 0) {
    return { error: 'Gagal Check-out: Seluruh langkah SOP wajib diselesaikan terlebih dahulu.' }
  }

  const hasBefore = (photos || []).some((p) => p.type === 'before')
  const hasAfter = (photos || []).some((p) => p.type === 'after')
  if (!hasBefore || !hasAfter) {
    return { error: 'Gagal Check-out: Minimal 1 foto Before dan 1 foto After wajib diunggah.' }
  }

  if (!sigCount || sigCount < 1) {
    return { error: 'Gagal Check-out: Tanda tangan pelanggan wajib diperoleh terlebih dahulu.' }
  }

  if (!report || !report.result || report.result.trim().length < 5) {
    return { error: 'Gagal Check-out: Laporan hasil pekerjaan teknisi wajib diisi terlebih dahulu.' }
  }

  // 3. Record Check-out attendance
  const now = new Date().toISOString()
  const { error: attError } = await admin
    .from('job_attendance')
    .update({
      check_out_at: now,
      check_out_latitude: latitude || null,
      check_out_longitude: longitude || null,
    })
    .eq('job_id', jobId)
    .eq('org_id', profile.orgId)
    .eq('technician_id', profile.id)

  if (attError) {
    return { error: 'Gagal mencatat check-out: ' + attError.message }
  }

  // 4. Transition job to 'completed'
  // Trigger trg_validate_job_lifecycle_transition will validate all conditions and succeed!
  const { error: jobError } = await admin
    .from('jobs')
    .update({
      status: 'completed',
      completed_at: now,
      updated_at: now,
    })
    .eq('id', jobId)
    .eq('org_id', profile.orgId)

  if (jobError) {
    return { error: 'Check-out tercatat, namun gagal menutup tiket: ' + jobError.message }
  }

  revalidatePath(`/technician/jobs/${jobId}`)
  revalidatePath(`/technician/jobs/${jobId}/bap`)
  revalidatePath('/technician')
  revalidatePath('/technician/commissions')
  revalidatePath(`/admin/jobs/${jobId}`)
  revalidatePath(`/admin/jobs`)
  revalidatePath('/admin')
  revalidatePath('/admin/dispatch')
  revalidatePath('/admin/technicians')
  revalidatePath('/admin/map')

  return { success: true, completed: true }
}

export async function toggleChecklistItemAction(itemId: string, isCompleted: boolean) {
  const profile = await requireRole('technician')
  const admin = getSupabaseAdmin()

  // 1. Fetch item and job_id
  const { data: currentItem } = await admin
    .from('checklist_items')
    .select('id, job_id, requires_photo')
    .eq('id', itemId)
    .eq('org_id', profile.orgId)
    .single()

  if (!currentItem) {
    return { error: 'Item checklist tidak ditemukan.' }
  }

  // 2. Anti-skip: Check-in is required before touching checklist
  const checkInCheck = await verifyTechnicianCheckedIn(admin, currentItem.job_id, profile.orgId, profile.id)
  if (checkInCheck.error) {
    return { error: checkInCheck.error }
  }

  // 3. Verify photo requirement if marking complete
  if (isCompleted && currentItem.requires_photo) {
    const { count } = await admin
      .from('job_photos')
      .select('*', { count: 'exact', head: true })
      .eq('checklist_item_id', itemId)

    if (!count || count === 0) {
      return {
        error: 'Langkah ini memerlukan foto bukti fisik. Silakan potret bukti foto pada langkah ini.',
      }
    }
  }

  const now = isCompleted ? new Date().toISOString() : null

  const { data: updatedItem, error } = await admin
    .from('checklist_items')
    .update({
      is_completed: isCompleted,
      completed_at: now,
      // Reset N/A if technician now checks the item
      ...(isCompleted ? { is_na: false, na_reason: null } : {}),
    })
    .eq('id', itemId)
    .eq('org_id', profile.orgId)
    .select('job_id')
    .single()

  if (error) {
    return { error: 'Gagal memperbarui checklist: ' + error.message }
  }

  if (updatedItem?.job_id) {
    await admin.from('jobs').update({ updated_at: new Date().toISOString() }).eq('id', updatedItem.job_id)
    revalidatePath(`/technician/jobs/${updatedItem.job_id}`)
    revalidatePath(`/admin/jobs/${updatedItem.job_id}`)
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
    .select('is_critical, job_id')
    .eq('id', itemId)
    .eq('org_id', profile.orgId)
    .single()

  if (!item) {
    return { error: 'Item checklist tidak ditemukan.' }
  }

  // Anti-skip: Check-in is required before touching checklist
  const checkInCheck = await verifyTechnicianCheckedIn(admin, item.job_id, profile.orgId, profile.id)
  if (checkInCheck.error) {
    return { error: checkInCheck.error }
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

  if (item.job_id) {
    await admin.from('jobs').update({ updated_at: new Date().toISOString() }).eq('id', item.job_id)
    revalidatePath(`/admin/jobs/${item.job_id}`)
  }

  return { success: true }
}

export async function resetChecklistItemAction(
  itemId: string,
): Promise<{ error?: string; success?: boolean }> {
  const profile = await requireRole('technician')
  const admin = getSupabaseAdmin()

  const { data: currentItem } = await admin
    .from('checklist_items')
    .select('job_id')
    .eq('id', itemId)
    .eq('org_id', profile.orgId)
    .single()

  if (!currentItem) {
    return { error: 'Item checklist tidak ditemukan.' }
  }

  // Anti-skip: Check-in is required
  const checkInCheck = await verifyTechnicianCheckedIn(admin, currentItem.job_id, profile.orgId, profile.id)
  if (checkInCheck.error) {
    return { error: checkInCheck.error }
  }

  const { data: updatedItem, error } = await admin
    .from('checklist_items')
    .update({
      is_completed: false,
      is_na: false,
      na_reason: null,
      completed_at: null,
    })
    .eq('id', itemId)
    .eq('org_id', profile.orgId)
    .select('job_id')
    .single()

  if (error) {
    return { error: 'Gagal mereset item checklist: ' + error.message }
  }

  if (updatedItem?.job_id) {
    await admin.from('jobs').update({ updated_at: new Date().toISOString() }).eq('id', updatedItem.job_id)
    revalidatePath(`/admin/jobs/${updatedItem.job_id}`)
  }

  return { success: true }
}

export async function uploadJobPhotoAction(jobId: string, type: 'before' | 'after', formData: FormData) {
  const profile = await requireRole('technician')
  const file = formData.get('file') as File | null
  const checklistItemId = (formData.get('checklistItemId') as string | null) || null
  const caption = (formData.get('caption') as string | null) || null

  if (!file) {
    return { error: 'File foto tidak ditemukan.' }
  }

  if (file.size > PHOTO.maxBytes) {
    return { error: 'Ukuran foto maksimal 5MB.' }
  }

  const admin = getSupabaseAdmin()

  // Anti-skip: Check-in is required before uploading photos
  const checkInCheck = await verifyTechnicianCheckedIn(admin, jobId, profile.orgId, profile.id)
  if (checkInCheck.error) {
    return { error: checkInCheck.error }
  }

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

  const now = new Date().toISOString()

  // 3. Save photo reference to database with optional checklist_item_id & caption
  const { error: dbError } = await admin.from('job_photos').insert({
    org_id: profile.orgId,
    job_id: jobId,
    type,
    file_url: filePath,
    uploaded_by: profile.id,
    captured_at: now,
    checklist_item_id: checklistItemId,
    caption: caption,
  })

  if (dbError) {
    return { error: 'Gagal menyimpan data foto: ' + dbError.message }
  }

  // 4. If attached to a checklist item, automatically mark it completed (1-Tap Action!)
  if (checklistItemId) {
    await admin
      .from('checklist_items')
      .update({
        is_completed: true,
        completed_at: now,
        is_na: false,
        na_reason: null,
        updated_at: now,
      })
      .eq('id', checklistItemId)
      .eq('job_id', jobId)
      .eq('org_id', profile.orgId)
  }

  await admin.from('jobs').update({ updated_at: now }).eq('id', jobId).eq('org_id', profile.orgId)

  revalidatePath(`/technician/jobs/${jobId}`)
  revalidatePath(`/technician/jobs/${jobId}/bap`)
  revalidatePath(`/admin/jobs/${jobId}`)
  revalidatePath(`/admin/jobs/${jobId}/bap`)
  return { success: true }
}

export async function deleteJobPhotoAction(jobId: string, photoId: string) {
  const profile = await requireRole('technician')
  const admin = getSupabaseAdmin()

  // 1. Verify job is assigned to technician and not completed/cancelled
  const { data: job } = await admin
    .from('jobs')
    .select('id, org_id, status, technician_id')
    .eq('id', jobId)
    .eq('technician_id', profile.id)
    .single()

  if (!job) {
    return { error: 'Pekerjaan tidak ditemukan atau Anda tidak ditugaskan pada pekerjaan ini.' }
  }

  if (job.status === 'completed' || job.status === 'cancelled') {
    return { error: 'Foto tidak dapat dihapus karena status tiket pekerjaan sudah selesai atau dibatalkan.' }
  }

  // 2. Fetch photo record to get file path and checklist relation
  const { data: photo } = await admin
    .from('job_photos')
    .select('id, file_url, checklist_item_id')
    .eq('id', photoId)
    .eq('job_id', jobId)
    .eq('org_id', profile.orgId)
    .single()

  if (!photo) {
    return { error: 'Data foto tidak ditemukan.' }
  }

  // 3. Remove physical file from storage bucket
  if (photo.file_url) {
    const { error: storageError } = await admin.storage
      .from(STORAGE.jobFilesBucket)
      .remove([photo.file_url])

    if (storageError) {
      console.warn('Gagal menghapus file dari storage bucket, melanjutkan penghapusan database:', storageError)
    }
  }

  // 4. Delete photo row from database
  const { error: dbError } = await admin
    .from('job_photos')
    .delete()
    .eq('id', photoId)
    .eq('job_id', jobId)
    .eq('org_id', profile.orgId)

  if (dbError) {
    return { error: 'Gagal menghapus catatan foto: ' + dbError.message }
  }

  const now = new Date().toISOString()

  // 5. If photo was linked to a checklist item, check if any remaining photos exist
  if (photo.checklist_item_id) {
    const { count } = await admin
      .from('job_photos')
      .select('*', { count: 'exact', head: true })
      .eq('checklist_item_id', photo.checklist_item_id)
      .neq('id', photoId)

    if (!count || count === 0) {
      await admin
        .from('checklist_items')
        .update({
          is_completed: false,
          completed_at: null,
          updated_at: now,
        })
        .eq('id', photo.checklist_item_id)
    }
  }

  await admin.from('jobs').update({ updated_at: now }).eq('id', jobId).eq('org_id', profile.orgId)

  revalidatePath(`/technician/jobs/${jobId}`)
  revalidatePath(`/technician/jobs/${jobId}/bap`)
  revalidatePath(`/admin/jobs/${jobId}`)
  revalidatePath(`/admin/jobs/${jobId}/bap`)
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

  // Anti-skip: Check-in is required before asking for customer signature
  const checkInCheck = await verifyTechnicianCheckedIn(admin, jobId, profile.orgId, profile.id)
  if (checkInCheck.error) {
    return { error: checkInCheck.error }
  }

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

  const now = new Date().toISOString()

  // Upsert signature row
  const { error: dbError } = await admin.from('signatures').upsert(
    {
      org_id: profile.orgId,
      job_id: jobId,
      customer_name: customerName.trim(),
      signature_url: filePath,
      signed_at: now,
    },
    { onConflict: 'job_id' },
  )

  if (dbError) {
    return { error: 'Gagal mencatat tanda tangan: ' + dbError.message }
  }

  await admin.from('jobs').update({ updated_at: now }).eq('id', jobId).eq('org_id', profile.orgId)

  revalidatePath(`/technician/jobs/${jobId}`)
  revalidatePath(`/admin/jobs/${jobId}`)
  return { success: true }
}

export async function submitWorkReportAction(
  jobId: string,
  result: string,
  notes?: string,
) {
  const profile = await requireRole('technician')

  if (!result || result.trim().length < 5) {
    return { error: 'Hasil pekerjaan wajib diisi (minimal 5 karakter).' }
  }

  const admin = getSupabaseAdmin()

  // 1. Verify job ownership, active status, and check-in before submitting work report
  const checkInCheck = await verifyTechnicianCheckedIn(admin, jobId, profile.orgId, profile.id)
  if (checkInCheck.error) {
    return { error: checkInCheck.error }
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

  await admin.from('jobs').update({ updated_at: now }).eq('id', jobId).eq('org_id', profile.orgId)

  // Revalidate both technician and admin view paths for instant synchronization
  revalidatePath(`/technician/jobs/${jobId}`)
  revalidatePath('/technician')
  revalidatePath('/technician/commissions')
  revalidatePath(`/admin/jobs/${jobId}`)
  revalidatePath('/admin/jobs')
  revalidatePath('/admin')
  revalidatePath('/admin/dispatch')
  revalidatePath('/admin/technicians')
  revalidatePath('/admin/map')

  return { success: true }
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

  // 2. If Admin/Owner is completing on behalf of technician, verify check-in and ensure check-out
  const now = new Date().toISOString()
  if (profile.role === 'admin' || (profile.role as string) === 'owner') {
    const { data: att } = await admin
      .from('job_attendance')
      .select('check_in_at, check_out_at')
      .eq('job_id', jobId)
      .eq('org_id', profile.orgId)
      .maybeSingle()

    if (!att?.check_in_at) {
      return { error: 'Gagal menyelesaikan: Teknisi belum melakukan Check-in di lokasi.' }
    }

    if (!att.check_out_at) {
      await admin
        .from('job_attendance')
        .update({ check_out_at: now })
        .eq('job_id', jobId)
        .eq('org_id', profile.orgId)
    }
  }

  // 3. Attempt to transition job into 'completed'
  // Trigger trg_validate_job_lifecycle_transition will automatically validate all 7 conditions!
  const { error } = await admin
    .from('jobs')
    .update({
      status: 'completed',
      completed_at: now,
      updated_at: now,
    })
    .eq('id', jobId)
    .eq('org_id', profile.orgId)

  if (error) {
    return { error: error.message }
  }

  // 4. Invalidate both technician and admin view paths
  revalidatePath(`/technician/jobs/${jobId}`)
  revalidatePath(`/technician/jobs/${jobId}/bap`)
  revalidatePath('/technician')
  revalidatePath('/technician/commissions')
  revalidatePath(`/admin/jobs/${jobId}`)
  revalidatePath('/admin/jobs')
  revalidatePath('/admin')
  revalidatePath('/admin/dispatch')
  revalidatePath('/admin/technicians')
  revalidatePath('/admin/map')

  return { success: true }
}
