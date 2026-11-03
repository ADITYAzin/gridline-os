'use server'

import { revalidatePath } from 'next/cache'
import crypto from 'crypto'
import { z } from 'zod'
import { requireRole } from '@/lib/auth'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { INVITE } from '@/lib/constants'
import { sendTransactionalEmail } from '@/lib/email/client'
import { generateInviteEmailHtml } from '@/lib/email/templates/invite-email'

const inviteSchema = z.object({
  email: z.string().email('Email tidak valid'),
  role: z.enum(['technician', 'owner'], {
    message: 'Peran harus teknisi atau owner',
  }),
})

export type InviteActionState = {
  error?: string
  success?: boolean
  inviteLink?: string
  emailSent?: boolean
  simulated?: boolean
}

export async function createInviteAction(prevState: InviteActionState, formData: FormData): Promise<InviteActionState> {
  const profile = await requireRole('admin')

  const email = formData.get('email') as string
  const role = formData.get('role') as 'technician' | 'owner'

  const parsed = inviteSchema.safeParse({ email, role })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || 'Input tidak valid' }
  }

  const admin = getSupabaseAdmin()
  const normalizedEmail = parsed.data.email.toLowerCase().trim()

  // Check if profile with email already exists in database
  const { data: existingUser } = await admin
    .from('profiles')
    .select('id, org_id')
    .ilike('email', normalizedEmail)
    .limit(1)
    .maybeSingle()

  if (existingUser) {
    if (existingUser.org_id === profile.orgId) {
      return { error: 'Pengguna dengan email ini sudah terdaftar di organisasi Anda.' }
    }
    return { error: 'Email ini sudah terdaftar pada akun lain di sistem.' }
  }

  // Check if there is already an active unused invite for this email in the org
  const { data: activeInvite } = await admin
    .from('invite_tokens')
    .select('id')
    .eq('org_id', profile.orgId)
    .ilike('email', normalizedEmail)
    .is('used_at', null)
    .gt('expires_at', new Date().toISOString())
    .limit(1)
    .maybeSingle()

  if (activeInvite) {
    return {
      error: 'Undangan aktif untuk email ini sudah ada. Gunakan fitur Kirim Ulang pada daftar undangan.',
    }
  }

  // Fetch organization name for email branding
  const { data: org } = await admin
    .from('organizations')
    .select('name')
    .eq('id', profile.orgId)
    .single()

  // Generate secure random token
  const rawToken = crypto.randomBytes(32).toString('hex')
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex')

  const expiresAt = new Date(Date.now() + INVITE.expiresInHours * 3600 * 1000).toISOString()

  const { error: inviteError } = await admin.from('invite_tokens').insert({
    org_id: profile.orgId,
    invited_by: profile.id,
    email: parsed.data.email.toLowerCase().trim(),
    role: parsed.data.role,
    token_hash: tokenHash,
    expires_at: expiresAt,
  })

  if (inviteError) {
    return { error: 'Gagal membuat undangan: ' + inviteError.message }
  }

  // Construct invite link
  const origin = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const inviteLink = `${origin}/accept-invite?token=${rawToken}`

  // Send automated transactional invite email
  const emailHtml = generateInviteEmailHtml({
    inviterName: profile.name,
    organizationName: org?.name || 'Opilines',
    role: parsed.data.role,
    inviteLink,
    expiresInHours: INVITE.expiresInHours,
  })

  const emailResult = await sendTransactionalEmail({
    to: parsed.data.email.toLowerCase().trim(),
    subject: `Undangan Bergabung ke Tim ${org?.name || 'Opilines'}`,
    html: emailHtml,
  })

  revalidatePath('/admin/technicians')

  return {
    success: true,
    inviteLink,
    emailSent: emailResult.success,
    simulated: emailResult.simulated,
  }
}

export async function resendInviteAction(inviteId: string): Promise<{ success: boolean; error?: string; simulated?: boolean }> {
  const profile = await requireRole('admin')
  const admin = getSupabaseAdmin()

  // Get existing invite
  const { data: invite, error: fetchError } = await admin
    .from('invite_tokens')
    .select('id, email, role, used_at')
    .eq('id', inviteId)
    .eq('org_id', profile.orgId)
    .single()

  if (fetchError || !invite) {
    return { success: false, error: 'Undangan tidak ditemukan.' }
  }

  if (invite.used_at) {
    return { success: false, error: 'Undangan ini telah digunakan oleh pengguna.' }
  }

  // Fetch organization name
  const { data: org } = await admin
    .from('organizations')
    .select('name')
    .eq('id', profile.orgId)
    .single()

  // Generate new token & new 24h expiration
  const rawToken = crypto.randomBytes(32).toString('hex')
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex')
  const expiresAt = new Date(Date.now() + INVITE.expiresInHours * 3600 * 1000).toISOString()

  const { error: updateError } = await admin
    .from('invite_tokens')
    .update({
      token_hash: tokenHash,
      expires_at: expiresAt,
    })
    .eq('id', invite.id)

  if (updateError) {
    return { success: false, error: 'Gagal memperbarui token undangan.' }
  }

  const origin = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const inviteLink = `${origin}/accept-invite?token=${rawToken}`

  const emailHtml = generateInviteEmailHtml({
    inviterName: profile.name,
    organizationName: org?.name || 'Opilines',
    role: invite.role,
    inviteLink,
    expiresInHours: INVITE.expiresInHours,
  })

  const emailResult = await sendTransactionalEmail({
    to: invite.email,
    subject: `[Kirim Ulang] Undangan Bergabung ke Tim ${org?.name || 'Opilines'}`,
    html: emailHtml,
  })

  revalidatePath('/admin/technicians')

  return {
    success: emailResult.success,
    simulated: emailResult.simulated,
    error: emailResult.error,
  }
}

export type ImportTechnicianItem = {
  name: string
  role?: string | null
  phone?: string | null
  email?: string | null
  dateRegistered?: string | null
}

export type ImportTechniciansResult = {
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
  const direct = new Date(raw)
  if (!isNaN(direct.getTime()) && direct.getFullYear() > 1990 && direct.getFullYear() < 2100) {
    return direct.toISOString()
  }

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
  }

  return new Date().toISOString()
}

export async function importTechniciansAction(
  rows: ImportTechnicianItem[]
): Promise<ImportTechniciansResult> {
  const profile = await requireRole('admin')

  if (!rows || rows.length === 0) {
    return {
      success: false,
      error: 'Tidak ada baris data teknisi yang dikirim untuk diimpor.',
    }
  }

  const admin = getSupabaseAdmin()
  const validationErrors: string[] = []
  let importedCount = 0

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i]
    const name = r.name?.trim()

    if (!name) {
      validationErrors.push(`Baris ${i + 1}: Nama teknisi tidak boleh kosong`)
      continue
    }

    // Normalize role
    let role: 'technician' | 'owner' = 'technician'
    const roleLower = (r.role || '').toLowerCase()
    if (roleLower.includes('owner') || roleLower.includes('pemilik') || roleLower.includes('manager')) {
      role = 'owner'
    }

    // Resolve email
    let email = r.email?.trim().toLowerCase()
    const phone = r.phone?.trim() || null

    if (!email) {
      const cleanSlug = name.toLowerCase().replace(/[^a-z0-9]/g, '') || 'teknisi'
      const cleanPhone = (phone || '').replace(/[^0-9]/g, '').slice(-4) || `${Math.floor(1000 + Math.random() * 9000)}`
      email = `${cleanSlug}.${cleanPhone}@tim.gridline.id`
    }

    // Check if user with this email already exists in profiles
    const { data: existingProfile } = await admin
      .from('profiles')
      .select('id')
      .ilike('email', email)
      .limit(1)
      .maybeSingle()

    if (existingProfile) {
      validationErrors.push(`Baris ${i + 1} (${name}): Email ${email} sudah terdaftar di sistem`)
      continue
    }

    const defaultPassword = 'Teknisi2026!'
    const createdAt = parseRegisteredDate(r.dateRegistered)

    // 1. Create Auth User
    const { data: authData, error: authError } = await admin.auth.admin.createUser({
      email,
      password: defaultPassword,
      email_confirm: true,
      user_metadata: { name },
    })

    if (authError || !authData.user) {
      validationErrors.push(`Baris ${i + 1} (${name}): Gagal mendaftarkan akun auth (${authError?.message || 'Error auth'})`)
      continue
    }

    // 2. Insert into profiles with org_id and role
    const { error: profileError } = await admin
      .from('profiles')
      .insert({
        id: authData.user.id,
        org_id: profile.orgId,
        name,
        email,
        phone,
        role,
        created_at: createdAt,
      })

    if (profileError) {
      await admin.auth.admin.deleteUser(authData.user.id)
      validationErrors.push(`Baris ${i + 1} (${name}): Gagal menyimpan profil teknisi (${profileError.message})`)
      continue
    }

    importedCount++
  }

  revalidatePath('/admin/technicians')

  if (importedCount === 0) {
    return {
      success: false,
      error: 'Semua baris data teknisi gagal diproses. Periksa pesan validasi.',
      errors: validationErrors,
    }
  }

  return {
    success: true,
    totalCount: rows.length,
    importedCount,
    failedCount: rows.length - importedCount,
    errors: validationErrors,
  }
}

export type DeleteTechnicianResult = {
  success: boolean
  error?: string
}

export async function deleteTechnicianAction(
  technicianId: string,
  confirmationName: string
): Promise<DeleteTechnicianResult> {
  const profile = await requireRole('admin')

  if (!technicianId || typeof technicianId !== 'string') {
    return { success: false, error: 'ID teknisi tidak valid.' }
  }

  // Prevent admin from deleting themselves
  if (technicianId === profile.id) {
    return { success: false, error: 'Anda tidak dapat menghapus akun Anda sendiri.' }
  }

  const admin = getSupabaseAdmin()

  // 1. Fetch technician profile to verify existence, role, and organization
  const { data: targetTech, error: fetchError } = await admin
    .from('profiles')
    .select('id, name, email, role, org_id')
    .eq('id', technicianId)
    .eq('org_id', profile.orgId)
    .maybeSingle()

  if (fetchError || !targetTech) {
    return { success: false, error: 'Data teknisi tidak ditemukan dalam organisasi Anda.' }
  }

  if (targetTech.role !== 'technician') {
    return { success: false, error: 'Hanya pengguna dengan peran teknisi yang dapat dihapus melalui fitur ini.' }
  }

  // 2. Validate confirmation name matches (case-insensitive trimmed)
  if (!confirmationName || targetTech.name.trim().toLowerCase() !== confirmationName.trim().toLowerCase()) {
    return {
      success: false,
      error: `Nama konfirmasi tidak sesuai. Harap ketik "${targetTech.name}".`,
    }
  }

  try {
    // 3. Clean up related records in proper sequence to respect foreign keys
    // 3.1 Job attendance records
    await admin.from('job_attendance').delete().eq('technician_id', technicianId)

    // 3.2 Schedule assignments
    await admin.from('schedules').delete().eq('technician_id', technicianId)

    // 3.3 Active assigned / in-progress jobs -> unassign technician & reset status to pending
    await admin
      .from('jobs')
      .update({ technician_id: null, status: 'pending' })
      .eq('technician_id', technicianId)
      .in('status', ['assigned', 'in_progress'])

    // 3.4 Other jobs (completed, cancelled) -> nullify technician_id so FK constraint isn't violated
    await admin
      .from('jobs')
      .update({ technician_id: null })
      .eq('technician_id', technicianId)

    // 3.5 If jobs were created by this technician, reassign created_by to current admin
    await admin
      .from('jobs')
      .update({ created_by: profile.id })
      .eq('created_by', technicianId)

    // 3.6 If jobs were cancelled by this technician, nullify cancelled_by
    await admin
      .from('jobs')
      .update({ cancelled_by: null })
      .eq('cancelled_by', technicianId)

    // 3.7 Leads, photos, signatures
    await admin.from('leads').update({ technician_id: null }).eq('technician_id', technicianId)
    await admin.from('job_photos').update({ uploaded_by: null }).eq('uploaded_by', technicianId)
    await admin.from('signatures').update({ submitted_by: null }).eq('submitted_by', technicianId)

    // 3.8 Invite tokens
    await admin.from('invite_tokens').delete().eq('org_id', profile.orgId).eq('email', targetTech.email)
    await admin.from('invite_tokens').delete().eq('invited_by', technicianId)

    // 3.9 Delete from profiles
    const { error: profileDeleteError } = await admin
      .from('profiles')
      .delete()
      .eq('id', technicianId)
      .eq('org_id', profile.orgId)

    if (profileDeleteError) {
      return {
        success: false,
        error: 'Gagal menghapus profil teknisi: ' + profileDeleteError.message,
      }
    }

    // 3.10 Delete Supabase auth user if it exists
    try {
      await admin.auth.admin.deleteUser(technicianId)
    } catch (authDeleteError) {
      const err = authDeleteError as Error | undefined
      console.warn('Peringatan: Gagal menghapus akun auth:', err?.message)
    }

    // 4. Revalidate cache
    revalidatePath('/admin/technicians')
    revalidatePath('/admin/dispatch')
    revalidatePath('/admin/jobs')
    revalidatePath('/admin/map')

    return { success: true }
  } catch (caughtErr) {
    const err = caughtErr as Error | undefined
    console.error('Error deleting technician:', err)
    return {
      success: false,
      error: err?.message || 'Terjadi kesalahan sistem saat menghapus teknisi.',
    }
  }
}

const updateTechnicianSchema = z.object({
  id: z.string().uuid('ID teknisi tidak valid'),
  name: z.string().min(2, 'Nama teknisi minimal 2 karakter'),
  phone: z.string().optional().nullable(),
  email: z.string().email('Format email tidak valid'),
})

export type UpdateTechnicianInput = {
  id: string
  name: string
  phone?: string | null
  email: string
}

export type UpdateTechnicianResult = {
  success: boolean
  error?: string
}

export async function updateTechnicianAction(
  payload: UpdateTechnicianInput
): Promise<UpdateTechnicianResult> {
  const profile = await requireRole('admin')

  const parsed = updateTechnicianSchema.safeParse(payload)
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || 'Input data tidak valid',
    }
  }

  const admin = getSupabaseAdmin()

  // 1. Fetch technician profile to verify existence, role, and organization isolation
  const { data: targetTech, error: fetchError } = await admin
    .from('profiles')
    .select('id, name, email, role, org_id')
    .eq('id', parsed.data.id)
    .eq('org_id', profile.orgId)
    .maybeSingle()

  if (fetchError || !targetTech) {
    return { success: false, error: 'Data teknisi tidak ditemukan dalam organisasi Anda.' }
  }

  if (targetTech.role !== 'technician') {
    return { success: false, error: 'Hanya pengguna dengan peran teknisi yang dapat diedit melalui fitur ini.' }
  }

  const newEmail = parsed.data.email.toLowerCase().trim()
  const newName = parsed.data.name.trim()
  const newPhone = parsed.data.phone?.trim() || null

  // 2. If email changed, check if email is already registered by another user
  if (newEmail !== targetTech.email.toLowerCase().trim()) {
    const { data: existingUser } = await admin
      .from('profiles')
      .select('id')
      .ilike('email', newEmail)
      .neq('id', targetTech.id)
      .limit(1)
      .maybeSingle()

    if (existingUser) {
      return { success: false, error: 'Email ini sudah terdaftar untuk pengguna lain.' }
    }
  }

  try {
    // 3. Update profiles table securely with org isolation
    const { error: profileUpdateError } = await admin
      .from('profiles')
      .update({
        name: newName,
        email: newEmail,
        phone: newPhone,
      })
      .eq('id', targetTech.id)
      .eq('org_id', profile.orgId)

    if (profileUpdateError) {
      return {
        success: false,
        error: 'Gagal memperbarui profil teknisi: ' + profileUpdateError.message,
      }
    }

    // 4. Update Supabase Auth user metadata & email
    try {
      await admin.auth.admin.updateUserById(targetTech.id, {
        email: newEmail,
        user_metadata: { name: newName },
      })
    } catch (authErr) {
      console.warn('Peringatan: Gagal memperbarui data auth pengguna:', authErr)
    }

    // 5. Revalidate cache
    revalidatePath('/admin/technicians')
    revalidatePath('/admin/dispatch')
    revalidatePath('/admin/jobs')
    revalidatePath('/admin/map')

    return { success: true }
  } catch (caughtErr) {
    const err = caughtErr as Error | undefined
    console.error('Error updating technician:', err)
    return {
      success: false,
      error: err?.message || 'Terjadi kesalahan sistem saat memperbarui data teknisi.',
    }
  }
}




