'use server'

import { redirect } from 'next/navigation'
import { headers, cookies } from 'next/headers'
import crypto from 'crypto'
import { z } from 'zod'
import { type EmailOtpType } from '@supabase/supabase-js'

import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { roleHome, type Role } from '@/lib/rbac'
import { sendTransactionalEmail } from '@/lib/email/client'
import { generateResetPasswordEmailHtml } from '@/lib/email/templates/reset-password-email'
import { generateVerifyOtpEmailHtml } from '@/lib/email/templates/verify-otp-email'

const OTP_SEND_COOLDOWN_MS = 55_000
const OTP_VERIFY_WINDOW_MS = 5 * 60_000
const OTP_MAX_VERIFY_ATTEMPTS = 5
const OTP_EXPIRY_MS = 60 * 60_000
const RECOVERY_COOKIE_NAME = 'gl_recovery_ctx'

const otpSendTimestamps = new Map<string, number>()
const otpVerifyAttempts = new Map<string, { count: number; resetAt: number }>()

function isSendRateLimited(email: string): boolean {
  const now = Date.now()
  const lastSent = otpSendTimestamps.get(email)
  if (lastSent && now - lastSent < OTP_SEND_COOLDOWN_MS) {
    return true
  }
  return false
}

function markOtpSent(email: string): void {
  otpSendTimestamps.set(email, Date.now())
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

function toSixDigitOtp(rawOtp?: string | null): string {
  const digits = (rawOtp || '').replace(/\D/g, '')
  if (digits.length >= 6) {
    return digits.slice(0, 6)
  }
  return crypto.randomInt(100000, 1000000).toString()
}

function hashOtpCode(email: string, code: string, type: string): string {
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY || 'opilines-otp-secret'
  return crypto
    .createHmac('sha256', secret)
    .update(`${email.toLowerCase().trim()}:${type}:${code.trim()}`)
    .digest('hex')
}

function createSignedRecoveryToken(userId: string): string {
  const expiresAt = Date.now() + 15 * 60_000
  const payload = `${userId}.${expiresAt}`
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY || 'opilines-recovery-secret'
  const sig = crypto.createHmac('sha256', secret).update(payload).digest('hex')
  return `${payload}.${sig}`
}

function verifySignedRecoveryToken(token: string | undefined): string | null {
  if (!token) return null
  const parts = token.split('.')
  if (parts.length !== 3) return null
  const [userId, expiresStr, sig] = parts
  const expiresAt = Number(expiresStr)
  if (!userId || !Number.isFinite(expiresAt) || Date.now() > expiresAt) {
    return null
  }
  const payload = `${userId}.${expiresStr}`
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY || 'opilines-recovery-secret'
  const expectedSig = crypto.createHmac('sha256', secret).update(payload).digest('hex')
  if (sig.length !== expectedSig.length) return null
  const valid = crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig))
  return valid ? userId : null
}

async function getAppOrigin(): Promise<string> {
  const envUrl = (process.env.NEXT_PUBLIC_APP_URL || '')
    .trim()
    .replace(/^["']+|["']+$/g, '')
    .replace(/\/+$/, '')

  try {
    const reqHeaders = await headers()
    const host = (reqHeaders.get('x-forwarded-host') || reqHeaders.get('host') || '').trim()
    const proto = (reqHeaders.get('x-forwarded-proto') || '').split(',')[0]?.trim()

    if (host && !host.startsWith('localhost') && !host.startsWith('127.0.0.1')) {
      if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
        return envUrl
      }
      return `${proto || 'https'}://${host}`
    }
  } catch {
    // Ignore headers() errors outside request context
  }

  if (envUrl && !envUrl.includes('localhost')) {
    return envUrl
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  return envUrl || 'http://localhost:3000'
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
  const targetEmail = existingProfile.email || normalizedEmail

  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: targetEmail,
    password: parsed.data.password,
  })

  if (authError || !authData.user) {
    return {
      error: 'Password yang Anda masukkan salah.',
      fields: { email: normalizedEmail },
    }
  }

  // Ensure newly registered accounts have completed email OTP verification before entering dashboard
  if (authData.user.user_metadata?.otp_verified === false) {
    await supabase.auth.signOut()
    let sent = true
    if (!isSendRateLimited(normalizedEmail)) {
      sent = await dispatchAuthOtpEmail(targetEmail, existingProfile.name, 'register')
      if (sent) {
        markOtpSent(normalizedEmail)
      }
    }
    redirect(
      `/verify-otp?type=register&email=${encodeURIComponent(targetEmail)}${sent ? '' : '&sent=0'}`
    )
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
  const admin = getSupabaseAdmin()

  // 0. Check if email is already registered in database before creating anything
  const existingProfile = await findRegisteredProfileByEmail(normalizedEmail)
  if (existingProfile) {
    const { data: existingAuth } = await admin.auth.admin.getUserById(existingProfile.id)

    // If user previously registered with this email but hasn't verified OTP yet, allow resuming verification
    if (existingAuth?.user?.user_metadata?.otp_verified === false) {
      await admin.auth.admin.updateUserById(existingProfile.id, {
        password: parsed.data.password,
        user_metadata: {
          ...existingAuth.user.user_metadata,
          name: parsed.data.name.trim(),
          otp_verified: false,
        },
      })
      await admin
        .from('profiles')
        .update({ name: parsed.data.name.trim() })
        .eq('id', existingProfile.id)
      await admin
        .from('organizations')
        .update({ name: parsed.data.companyName.trim() })
        .eq('id', existingProfile.org_id)

      let sent = true
      if (!isSendRateLimited(normalizedEmail)) {
        sent = await dispatchAuthOtpEmail(normalizedEmail, parsed.data.name.trim(), 'register')
        if (sent) {
          markOtpSent(normalizedEmail)
        }
      }

      redirect(
        `/verify-otp?type=register&email=${encodeURIComponent(normalizedEmail)}${sent ? '' : '&sent=0'}`
      )
    }

    return {
      error: 'Email sudah terdaftar di sistem kami. Silakan masuk atau gunakan email lain.',
      fields: { companyName, name, email: normalizedEmail },
    }
  }

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

  // 2. Create Auth User & Generate Signup OTP Token
  const origin = await getAppOrigin()
  const { data: linkData, error: userError } = await admin.auth.admin.generateLink({
    type: 'signup',
    email: normalizedEmail,
    password: parsed.data.password,
    options: {
      data: {
        name: parsed.data.name.trim(),
        otp_verified: false,
      },
      redirectTo: `${origin}/verify-email?status=success`,
    },
  })

  if (userError || !linkData?.user) {
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
      id: linkData.user.id,
      org_id: org.id,
      name: parsed.data.name.trim(),
      email: normalizedEmail,
      role: 'admin',
    })

  if (profileError) {
    await admin.auth.admin.deleteUser(linkData.user.id)
    await admin.from('organizations').delete().eq('id', org.id)
    return {
      error: 'Gagal membuat profil admin: ' + profileError.message,
      fields: { companyName, name, email: normalizedEmail },
    }
  }

  // 4. Normalize 6-digit OTP, persist verification metadata, and send OTP email via Resend
  const hashedToken = linkData.properties?.hashed_token
  const otpCode = toSixDigitOtp(linkData.properties?.email_otp)
  const verifyLink = hashedToken
    ? `${origin}/auth/callback?token_hash=${encodeURIComponent(hashedToken)}&type=signup&next=${encodeURIComponent('/verify-email?status=success')}`
    : linkData.properties?.action_link

  await admin.auth.admin.updateUserById(linkData.user.id, {
    user_metadata: {
      ...linkData.user.user_metadata,
      name: parsed.data.name.trim(),
      otp_verified: false,
      otp_code_hash: hashOtpCode(normalizedEmail, otpCode, 'register'),
      otp_token_hash: hashedToken || null,
      otp_token_type: 'signup',
      otp_expires_at: Date.now() + OTP_EXPIRY_MS,
    },
  })

  const html = generateVerifyOtpEmailHtml({
    userName: parsed.data.name.trim(),
    otpCode,
    verifyLink,
    expiresInMinutes: 60,
  })

  const emailResult = await sendTransactionalEmail({
    to: normalizedEmail,
    subject: 'Kode Verifikasi OTP Pendaftaran - Opilines',
    html,
  })

  if (emailResult.success) {
    markOtpSent(normalizedEmail)
  }

  // 5. Redirect to OTP verification page to confirm email ownership
  redirect(
    `/verify-otp?type=register&email=${encodeURIComponent(normalizedEmail)}${emailResult.success ? '' : '&sent=0'}`
  )
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
  const origin = await getAppOrigin()

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
    const otpCode = toSixDigitOtp(linkData.properties.email_otp)
    const callbackLink = hashedToken
      ? `${origin}/auth/callback?token_hash=${encodeURIComponent(hashedToken)}&type=recovery&next=/reset-password`
      : linkData.properties.action_link

    if (linkData.user?.id) {
      await admin.auth.admin.updateUserById(linkData.user.id, {
        user_metadata: {
          ...linkData.user.user_metadata,
          otp_code_hash: hashOtpCode(normalizedEmail, otpCode, 'reset'),
          otp_token_hash: hashedToken || null,
          otp_token_type: 'recovery',
          otp_expires_at: Date.now() + OTP_EXPIRY_MS,
        },
      })
    }

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

  if (linkError || !linkData?.properties) {
    return false
  }

  const hashedToken = linkData.properties.hashed_token
  const otpCode = toSixDigitOtp(linkData.properties.email_otp)
  const nextPath = type === 'register' ? '/verify-email?status=success' : '/admin'
  const verifyLink = hashedToken
    ? `${origin}/auth/callback?token_hash=${encodeURIComponent(hashedToken)}&type=magiclink&next=${encodeURIComponent(nextPath)}`
    : linkData.properties.action_link

  if (linkData.user?.id) {
    await admin.auth.admin.updateUserById(linkData.user.id, {
      user_metadata: {
        ...linkData.user.user_metadata,
        otp_code_hash: hashOtpCode(normalizedEmail, otpCode, type),
        otp_token_hash: hashedToken || null,
        otp_token_type: 'magiclink',
        otp_expires_at: Date.now() + OTP_EXPIRY_MS,
      },
    })
  }

  const html = generateVerifyOtpEmailHtml({
    userName,
    otpCode,
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

  markOtpSent(normalizedEmail)
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
  const admin = getSupabaseAdmin()
  const primaryOtpType: EmailOtpType =
    type === 'reset' ? 'recovery' : type === 'register' ? 'signup' : 'email'

  // 1. Check 6-digit normalized OTP stored in user_metadata (bridges Supabase 8-digit OTPs to 6-digit UI)
  const { data: existingAuth } = await admin.auth.admin.getUserById(existingProfile.id)
  const userMeta = existingAuth?.user?.user_metadata || {}
  const expectedHash = hashOtpCode(targetEmail, parsed.data.code, type)
  const fallbackHash = hashOtpCode(parsed.data.email, parsed.data.code, type)
  const storedHash = typeof userMeta.otp_code_hash === 'string' ? userMeta.otp_code_hash : ''
  const storedExpiresAt = Number(userMeta.otp_expires_at || 0)
  const storedTokenHash =
    typeof userMeta.otp_token_hash === 'string' ? userMeta.otp_token_hash : ''
  const storedTokenType = (userMeta.otp_token_type as EmailOtpType) || primaryOtpType

  let verified = false

  if (
    storedHash &&
    (storedHash === expectedHash || storedHash === fallbackHash) &&
    storedExpiresAt > Date.now()
  ) {
    verified = true
    if (storedTokenHash) {
      await supabase.auth.verifyOtp({
        type: storedTokenType,
        token_hash: storedTokenHash,
      })
    }
  }

  // 2. Fallback to direct Supabase 6-digit verifyOtp if not already verified via metadata bridge
  if (!verified) {
    let { error } = await supabase.auth.verifyOtp({
      email: targetEmail,
      token: parsed.data.code,
      type: primaryOtpType,
    })

    if (error && type !== 'reset') {
      const fallbackResult = await supabase.auth.verifyOtp({
        email: targetEmail,
        token: parsed.data.code,
        type: 'magiclink',
      })
      error = fallbackResult.error
    }

    if (!error) {
      verified = true
    }
  }

  if (!verified) {
    return {
      error: 'Kode OTP salah atau sudah kedaluwarsa',
      fields: { email: targetEmail, code: '', type },
    }
  }

  clearVerifyRateLimit(targetEmail)

  await admin.auth.admin.updateUserById(existingProfile.id, {
    email_confirm: true,
    user_metadata: {
      ...userMeta,
      name: existingProfile.name,
      otp_verified: true,
      otp_code_hash: null,
      otp_token_hash: null,
      otp_token_type: null,
      otp_expires_at: null,
    },
  })

  if (type === 'reset') {
    const cookieStore = await cookies()
    cookieStore.set(RECOVERY_COOKIE_NAME, createSignedRecoveryToken(existingProfile.id), {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 15 * 60,
    })
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

  markOtpSent(normalizedEmail)
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
  const cookieStore = await cookies()
  const recoveryToken = cookieStore.get(RECOVERY_COOKIE_NAME)?.value
  const recoveryUserId = verifySignedRecoveryToken(recoveryToken)

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  })

  if (error) {
    if (recoveryUserId) {
      const admin = getSupabaseAdmin()
      const { error: adminError } = await admin.auth.admin.updateUserById(recoveryUserId, {
        password: parsed.data.password,
        email_confirm: true,
      })
      if (adminError) {
        return { error: 'Sesi pemulihan tidak ditemukan atau sudah kedaluwarsa' }
      }
    } else {
      return { error: 'Sesi pemulihan tidak ditemukan atau sudah kedaluwarsa' }
    }
  }

  cookieStore.delete(RECOVERY_COOKIE_NAME)
  // Sign out recovery session so user authenticates cleanly with new credentials
  await supabase.auth.signOut()

  redirect('/login?reset=success')
}

