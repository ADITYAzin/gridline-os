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

