'use server'

import { redirect } from 'next/navigation'
import crypto from 'crypto'
import { z } from 'zod'

import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { roleHome, type Role } from '@/lib/rbac'
import { sendTransactionalEmail } from '@/lib/email/client'
import { generateResetPasswordEmailHtml } from '@/lib/email/templates/reset-password-email'

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
  email: z.string().email('Email tidak valid'),
})

const updatePasswordSchema = z
  .object({
    password: z.string().min(6, 'Password minimal 6 karakter'),
    confirmPassword: z.string().min(6, 'Konfirmasi password minimal 6 karakter'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Konfirmasi password tidak cocok',
    path: ['confirmPassword'],
  })

export type ActionState = {
  error?: string
  success?: boolean
  message?: string
  fields?: Record<string, string>
}

export async function signInAction(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const parsed = signInSchema.safeParse({ email, password })
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message || 'Input tidak valid',
      fields: { email },
    }
  }

  const supabase = await createSupabaseServerClient()

  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  })

  if (authError || !authData.user) {
    return {
      error: 'Email atau password salah',
      fields: { email },
    }
  }

  // Fetch role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', authData.user.id)
    .single()

  const targetRole = (profile?.role as Role) || 'admin'
  redirect(roleHome[targetRole])
}

export async function signUpAction(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const companyName = formData.get('companyName') as string
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const parsed = signUpSchema.safeParse({ companyName, name, email, password })
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message || 'Input tidak valid',
      fields: { companyName, name, email },
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
      fields: { companyName, name, email },
    }
  }

  // 2. Create Auth User
  const { data: userData, error: userError } = await admin.auth.admin.createUser({
    email: parsed.data.email,
    password: parsed.data.password,
    email_confirm: true,
    user_metadata: { name: parsed.data.name },
  })

  if (userError || !userData.user) {
    // Rollback org creation
    await admin.from('organizations').delete().eq('id', org.id)
    return {
      error: userError?.message || 'Gagal mendaftarkan akun pengguna.',
      fields: { companyName, name, email },
    }
  }

  // 3. Create Admin Profile
  const { error: profileError } = await admin
    .from('profiles')
    .insert({
      id: userData.user.id,
      org_id: org.id,
      name: parsed.data.name.trim(),
      email: parsed.data.email.toLowerCase().trim(),
      role: 'admin',
    })

  if (profileError) {
    await admin.auth.admin.deleteUser(userData.user.id)
    await admin.from('organizations').delete().eq('id', org.id)
    return {
      error: 'Gagal membuat profil admin: ' + profileError.message,
      fields: { companyName, name, email },
    }
  }

  // 4. Sign in session cookies on client side
  const supabase = await createSupabaseServerClient()
  await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  })

  redirect('/admin')
}

export async function acceptInviteAction(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const token = formData.get('token') as string
  const name = formData.get('name') as string
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

  // 2. Create Auth User
  const { data: userData, error: userError } = await admin.auth.admin.createUser({
    email: invite.email,
    password: parsed.data.password,
    email_confirm: true,
    user_metadata: { name: parsed.data.name },
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
      email: invite.email,
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
    email: invite.email,
    password: parsed.data.password,
  })

  redirect(roleHome[invite.role as Role])
}

export async function signOutAction() {
  const supabase = await createSupabaseServerClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function requestPasswordResetAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const email = formData.get('email') as string
  const parsed = requestResetSchema.safeParse({ email })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || 'Email tidak valid', fields: { email } }
  }

  const admin = getSupabaseAdmin()
  const origin = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  // Generate recovery link via Supabase Auth Admin
  const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
    type: 'recovery',
    email: parsed.data.email.toLowerCase().trim(),
    options: {
      redirectTo: `${origin}/reset-password`,
    },
  })

  // To prevent user enumeration attacks, if user does not exist, return success
  if (linkError || !linkData.properties?.action_link) {
    return {
      success: true,
      message: 'Jika email Anda terdaftar, tautan reset kata sandi telah dikirimkan ke kotak masuk Anda.',
    }
  }

  // Get user profile name if exists
  const { data: profile } = await admin
    .from('profiles')
    .select('name')
    .eq('email', parsed.data.email.toLowerCase().trim())
    .maybeSingle()

  const html = generateResetPasswordEmailHtml({
    userName: profile?.name,
    resetLink: linkData.properties.action_link,
    expiresInMinutes: 60,
  })

  await sendTransactionalEmail({
    to: parsed.data.email.toLowerCase().trim(),
    subject: 'Instruksi Reset Password - Gridline OS',
    html,
  })

  return {
    success: true,
    message: 'Jika email Anda terdaftar, tautan reset kata sandi telah dikirimkan ke kotak masuk Anda.',
  }
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
    return { error: 'Gagal memperbarui kata sandi: ' + error.message }
  }

  redirect('/login?reset=success')
}

