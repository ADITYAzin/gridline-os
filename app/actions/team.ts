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

  // Check if profile with email already exists in org
  const { data: existingUser } = await admin
    .from('profiles')
    .select('id')
    .eq('org_id', profile.orgId)
    .eq('email', parsed.data.email.toLowerCase().trim())
    .maybeSingle()

  if (existingUser) {
    return { error: 'Pengguna dengan email ini sudah terdaftar di organisasi Anda.' }
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
    .select('id, email, role, consumed_at')
    .eq('id', inviteId)
    .eq('org_id', profile.orgId)
    .single()

  if (fetchError || !invite) {
    return { success: false, error: 'Undangan tidak ditemukan.' }
  }

  if (invite.consumed_at) {
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
      .eq('email', email)
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


