'use server'

import { redirect } from 'next/navigation'
import crypto from 'crypto'
import { z } from 'zod'

import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { roleHome, type Role } from '@/lib/rbac'
import { sendTransactionalEmail } from '@/lib/email/client'
import { generateResetPasswordEmailHtml } from '@/lib/email/templates/reset-password-email'
import { generateVerifyOtpEmailHtml } from '@/lib/email/templates/verify-otp-email'

const OTP_SEND_COOLDOWN_MS = 55_000
const OTP_VERIFY_WINDOW_MS = 5 * 60_000
const OTP_MAX_VERIFY_ATTEMPTS = 5

const otpSendTimestamps = new Map<string, number>()
const otpVerifyAttempts = new Map<string, { count: number; resetAt: number }>()

function isSendRateLimited(email: string): boolean {
  const now = Date.now()
  const lastSent = otpSendTimestamps.get(email)
  if (lastSent && now - lastSent < OTP_SEND_COOLDOWN_MS) {
    return true
  }
  otpSendTimestamps.set(email, now)
  return false
}

function checkVerifyRateLimit(email: string): boolean {
  const now = Date.now()
  const entry = otpVerifyAttempts.get(email)
  if (!entry || now > entry.resetAt) {
    otpVerifyAttempts.set(email, { count: 1, resetAt: now + OTP_VERIFY_WINDOW_MS })
    return false
  }
  entry.count += 1
  return entry.count > OTP_MAX_VERIFY_ATTEMPTS
}

function clearVerifyRateLimit(email: string): void {
  otpVerifyAttempts.delete(email)
}

const signInSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
})

const signUpSchema = z.object({
  companyName: z.string().min(2, 'Nama perusahaan minimal 2 karakter'),
  name: z.string().min(2, 'Nama lengkap minimal 2 karakter'),
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
})

const acceptInviteSchema = z.object({
  token: z.string().min(1, 'Token undangan wajib ada'),
  name: z.string().min(2, 'Nama lengkap minimal 2 karakter'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
})

const requestResetSchema = z.object({
  email: z.string().email('Format email tidak valid'),
})

const verifyOtpSchema = z.object({
  email: z.string().email('Format email tidak valid'),
  code: z.string().regex(/^\d{6}$/, 'Kode OTP harus 6 digit angka'),
  type: z.enum(['reset', 'register', 'login']).default('reset'),
})

const updatePasswordSchema = z
  .object({
    password: z.string().min(6, 'Minimal 6 karakter'),
    confirmPassword: z.string().min(6, 'Minimal 6 karakter'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Password tidak cocok',
    path: ['confirmPassword'],
  })

export type ActionState = {
  error?: string
  success?: boolean
  message?: string
  fields?: Record<string, string>
}

async function findRegisteredProfileByEmail(normalizedEmail: string) {
  const admin = getSupabaseAdmin()
  const { data } = await admin
    .from('profiles')
    .select('id, name, email, role, org_id')
    .ilike('email', normalizedEmail)
    .limit(1)
    .maybeSingle()

  return data
}

export async function signInAction(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const email = ((formData.get('email') as string) || '').trim().toLowerCase()
  const password = formData.get('password') as string

  const parsed = signInSchema.safeParse({ email, password })
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message || 'Input tidak valid',
      fields: { email },
    }
  }

  const normalizedEmail = parsed.data.email.toLowerCase()
  const existingProfile = await findRegisteredProfileByEmail(normalizedEmail)

  if (!existingProfile) {
    return {
      error: 'Email belum terdaftar di sistem kami. Periksa kembali penulisan email Anda.',
      fields: { email: normalizedEmail },
    }
  }

  const supabase = await createSupabaseServerClient()

  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: existingProfile.email || normalizedEmail,
    password: parsed.data.password,
  })

  if (authError || !authData.user) {
    return {
      error: 'Password yang Anda masukkan salah.',
      fields: { email: normalizedEmail },
    }
  }

  const targetRole = (existingProfile.role as Role) || 'admin'
  redirect(roleHome[targetRole])
}

export async function signUpAction(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const companyName = ((formData.get('companyName') as string) || '').trim()
  const name = ((formData.get('name') as string) || '').trim()
  const email = ((formData.get('email') as string) || '').trim().toLowerCase()
  const password = formData.get('password') as string

  const parsed = signUpSchema.safeParse({ companyName, name, email, password })
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message || 'Input tidak valid',
      fields: { companyName, name, email },
    }
  }

  const normalizedEmail = parsed.data.email.toLowerCase().trim()

  // 0. Check if email is already registered in database before creating anything
  const existingProfile = await findRegisteredProfileByEmail(normalizedEmail)
  if (existingProfile) {
    return {
      error: 'Email sudah terdaftar di sistem kami. Silakan masuk atau gunakan email lain.',
      fields: { companyName, name, email: normalizedEmail },
    }
  }

  const admin = getSupabaseAdmin()

  // 1. Create Organization
  const { data: org, error: orgError } = await admin
    .from('organizations')
    .insert({
      name: parsed.data.companyName.trim(),
      subscription_tier: 'trial',
    })
    .select('id')
    .single()

  if (orgError || !org) {
    return {
      error: 'Gagal membuat organisasi. Silakan coba lagi.',
      fields: { companyName, name, email: normalizedEmail },
    }
  }

  // 2. Create Auth User
  const { data: userData, error: userError } = await admin.auth.admin.createUser({
    email: normalizedEmail,
    password: parsed.data.password,
    email_confirm: true,
    user_metadata: { name: parsed.data.name.trim() },
  })

  if (userError || !userData.user) {
    // Rollback org creation
    await admin.from('organizations').delete().eq('id', org.id)
    return {
      error: userError?.message || 'Gagal mendaftarkan akun pengguna.',
      fields: { companyName, name, email: normalizedEmail },
    }
  }

  // 3. Create Admin Profile
  const { error: profileError } = await admin
    .from('profiles')
    .insert({
      id: userData.user.id,
      org_id: org.id,
      name: parsed.data.name.trim(),
      email: normalizedEmail,
      role: 'admin',
    })

  if (profileError) {
    await admin.auth.admin.deleteUser(userData.user.id)
    await admin.from('organizations').delete().eq('id', org.id)
    return {
      error: 'Gagal membuat profil admin: ' + profileError.message,
      fields: { companyName, name, email: normalizedEmail },
    }
  }

  // 4. Sign in session cookies on client side
  const supabase = await createSupabaseServerClient()
  await supabase.auth.signInWithPassword({
    email: normalizedEmail,
    password: parsed.data.password,
  })

  redirect('/admin')
}

export async function acceptInviteAction(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const token = formData.get('token') as string
  const name = ((formData.get('name') as string) || '').trim()
  const password = formData.get('password') as string

  const parsed = acceptInviteSchema.safeParse({ token, name, password })
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message || 'Input tidak valid',
      fields: { name },
    }
  }

  const tokenHash = crypto.createHash('sha256').update(parsed.data.token).digest('hex')
  const admin = getSupabaseAdmin()

  // 1. Find valid invite token
  const { data: invite, error: inviteError } = await admin
    .from('invite_tokens')
    .select('id, org_id, email, role, expires_at, used_at')
    .eq('token_hash', tokenHash)
    .single()

  if (inviteError || !invite) {
    return { error: 'Undangan tidak valid atau sudah kadaluwarsa.' }
  }

  if (invite.used_at) {
    return { error: 'Undangan ini sudah pernah digunakan sebelumnya.' }
  }

  if (new Date(invite.expires_at) < new Date()) {
    return { error: 'Undangan sudah kadaluwarsa (berlaku 24 jam).' }
  }

  const normalizedInviteEmail = invite.email.toLowerCase().trim()
  const existingProfile = await findRegisteredProfileByEmail(normalizedInviteEmail)
  if (existingProfile) {
    return {
      error: 'Email pada undangan ini sudah terdaftar sebagai akun aktif. Silakan langsung masuk.',
      fields: { name },
    }
  }

  // 2. Create Auth User
  const { data: userData, error: userError } = await admin.auth.admin.createUser({
    email: normalizedInviteEmail,
    password: parsed.data.password,
    email_confirm: true,
    user_metadata: { name: parsed.data.name.trim() },
  })

  if (userError || !userData.user) {
    return { error: userError?.message || 'Gagal membuat akun.' }
  }

  // 3. Create Profile with Role & Org from Invite
  const { error: profileError } = await admin
    .from('profiles')
    .insert({
      id: userData.user.id,
      org_id: invite.org_id,
      name: parsed.data.name.trim(),
      email: normalizedInviteEmail,
      role: invite.role,
    })

  if (profileError) {
    await admin.auth.admin.deleteUser(userData.user.id)
    return { error: 'Gagal membuat profil: ' + profileError.message }
  }

  // 4. Mark invite as used
  await admin
    .from('invite_tokens')
    .update({ used_at: new Date().toISOString() })
    .eq('id', invite.id)

  // 5. Establish session
  const supabase = await createSupabaseServerClient()
  await supabase.auth.signInWithPassword({
    email: normalizedInviteEmail,
    password: parsed.data.password,
  })

  redirect(roleHome[invite.role as Role])
}

export async function signOutAction() {
  const supabase = await createSupabaseServerClient()
  await supabase.auth.signOut()
  redirect('/login')
}

async function dispatchAuthOtpEmail(
  normalizedEmail: string,
  userName: string | undefined,
  type: 'reset' | 'register' | 'login'
): Promise<boolean> {
  const admin = getSupabaseAdmin()
  const origin = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  if (type === 'reset') {
    const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
      type: 'recovery',
      email: normalizedEmail,
      options: {
        redirectTo: `${origin}/reset-password`,
      },
    })

    if (linkError || !linkData?.properties) {
      return false
    }

    const hashedToken = linkData.properties.hashed_token
    const otpCode = linkData.properties.email_otp
    const callbackLink = hashedToken
      ? `${origin}/auth/callback?token_hash=${encodeURIComponent(hashedToken)}&type=recovery&next=/reset-password`
      : linkData.properties.action_link

    const html = generateResetPasswordEmailHtml({
      userName,
      resetLink: callbackLink,
      otpCode,
      expiresInMinutes: 60,
    })

    const result = await sendTransactionalEmail({
      to: normalizedEmail,
      subject: 'Kode OTP & Tautan Reset Password - Opilines',
      html,
    })
    return result.success
  }

  // For register / login OTP verification
  const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
    type: 'magiclink',
    email: normalizedEmail,
    options: {
      redirectTo: `${origin}/verify-email?status=success`,
    },
  })

  if (linkError || !linkData?.properties?.email_otp) {
    return false
  }

  const hashedToken = linkData.properties.hashed_token
  const nextPath = type === 'register' ? '/verify-email?status=success' : '/admin'
  const verifyLink = hashedToken
    ? `${origin}/auth/callback?token_hash=${encodeURIComponent(hashedToken)}&type=magiclink&next=${encodeURIComponent(nextPath)}`
    : linkData.properties.action_link

  const html = generateVerifyOtpEmailHtml({
    userName,
    otpCode: linkData.properties.email_otp,
    verifyLink,
    expiresInMinutes: 60,
  })

  const result = await sendTransactionalEmail({
    to: normalizedEmail,
    subject: 'Kode Verifikasi OTP - Opilines',
    html,
  })
  return result.success
}

export async function requestPasswordResetAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const email = (formData.get('email') as string)?.trim() || ''
  const parsed = requestResetSchema.safeParse({ email })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || 'Email tidak valid', fields: { email } }
  }

  const normalizedEmail = parsed.data.email.toLowerCase()

  // Verify email exists in our database to prevent typos/wrong input
  const existingProfile = await findRegisteredProfileByEmail(normalizedEmail)
  if (!existingProfile) {
    return {
      error: 'Email tidak terdaftar di sistem kami. Periksa kembali penulisan email Anda.',
      fields: { email: normalizedEmail },
    }
  }

  if (isSendRateLimited(normalizedEmail)) {
    return {
      success: true,
      message: 'Kode verifikasi sudah dikirim baru-baru ini. Silakan cek kotak masuk Anda.',
      fields: { email: existingProfile.email || normalizedEmail },
    }
  }

  const targetEmail = existingProfile.email || normalizedEmail
  const sent = await dispatchAuthOtpEmail(targetEmail, existingProfile.name, 'reset')
  if (!sent) {
    otpSendTimestamps.delete(normalizedEmail)
    return {
      error: 'Gagal mengirim kode verifikasi. Silakan coba beberapa saat lagi.',
      fields: { email: normalizedEmail },
    }
  }

  return {
    success: true,
    message: 'Kode verifikasi dan tautan pemulihan telah dikirim.',
    fields: { email: targetEmail },
  }
}

export async function verifyOtpAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const email = ((formData.get('email') as string) || '').trim().toLowerCase()
  const code = ((formData.get('code') as string) || '').trim()
  const type = ((formData.get('type') as string) || 'reset') as 'reset' | 'register' | 'login'

  const parsed = verifyOtpSchema.safeParse({ email, code, type })
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message || 'Kode OTP harus 6 digit',
      fields: { email, code, type },
    }
  }

  const existingProfile = await findRegisteredProfileByEmail(parsed.data.email)
  if (!existingProfile) {
    return {
      error: 'Email tidak terdaftar di sistem kami. Periksa kembali email Anda.',
      fields: { email: parsed.data.email, code: '', type },
    }
  }

  const targetEmail = existingProfile.email || parsed.data.email

  if (checkVerifyRateLimit(targetEmail)) {
    return {
      error: 'Terlalu banyak percobaan gagal. Tunggu 5 menit atau kirim ulang kode baru.',
      fields: { email: targetEmail, code: '', type },
    }
  }

  const supabase = await createSupabaseServerClient()
  const primaryOtpType = type === 'reset' ? 'recovery' : type === 'register' ? 'signup' : 'email'

  let { error } = await supabase.auth.verifyOtp({
    email: targetEmail,
    token: parsed.data.code,
    type: primaryOtpType,
  })

  // Fallback for magiclink / email OTP when resending verification for an existing auth user
  if (error && type !== 'reset') {
    const fallbackResult = await supabase.auth.verifyOtp({
      email: targetEmail,
      token: parsed.data.code,
      type: 'magiclink',
    })
    error = fallbackResult.error
  }

  if (error) {
    return {
      error: 'Kode OTP salah atau sudah kedaluwarsa',
      fields: { email: targetEmail, code: '', type },
    }
  }

  clearVerifyRateLimit(targetEmail)

  if (type === 'reset') {
    redirect(`/reset-password?email=${encodeURIComponent(targetEmail)}`)
  }

  if (type === 'register') {
    await supabase.auth.signOut()
    redirect('/login?verified=success')
  }

  const targetRole = (existingProfile.role as Role) || 'admin'
  redirect(roleHome[targetRole])
}

export async function resendOtpAction(email: string, type: 'reset' | 'register' | 'login' = 'reset') {
  const parsed = requestResetSchema.safeParse({ email: email?.trim() })
  if (!parsed.success) {
    return { success: false, error: 'Format email tidak valid.' }
  }

  const normalizedEmail = parsed.data.email.toLowerCase()
  const existingProfile = await findRegisteredProfileByEmail(normalizedEmail)
  if (!existingProfile) {
    return {
      success: false,
      error: 'Email tidak terdaftar di sistem kami. Periksa kembali penulisan email Anda.',
    }
  }

  if (isSendRateLimited(normalizedEmail)) {
    return { success: false, error: 'Tunggu beberapa saat sebelum meminta kode baru.' }
  }

  const targetEmail = existingProfile.email || normalizedEmail
  const sent = await dispatchAuthOtpEmail(targetEmail, existingProfile.name, type)
  if (!sent) {
    otpSendTimestamps.delete(normalizedEmail)
    return { success: false, error: 'Gagal mengirim ulang kode OTP. Silakan coba lagi.' }
  }

  clearVerifyRateLimit(targetEmail)
  return { success: true }
}

export async function updatePasswordAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string

  const parsed = updatePasswordSchema.safeParse({ password, confirmPassword })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || 'Input tidak valid' }
  }

  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  })

  if (error) {
    return { error: 'Sesi pemulihan tidak ditemukan atau sudah kedaluwarsa' }
  }

  // Sign out recovery session so user authenticates cleanly with new credentials
  await supabase.auth.signOut()

  redirect('/login?reset=success')
}

