'use server'

import { revalidatePath } from 'next/cache'
import crypto from 'crypto'
import { z } from 'zod'
import { requireRole } from '@/lib/auth'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { INVITE } from '@/lib/constants'

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

  revalidatePath('/admin/technicians')

  // Construct invite link
  const origin = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const inviteLink = `${origin}/accept-invite?token=${rawToken}`

  return {
    success: true,
    inviteLink,
  }
}
