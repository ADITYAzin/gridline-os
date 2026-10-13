'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { requireRole } from '@/lib/auth'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'

const updateNameSchema = z.object({
  name: z.string().trim().min(2, 'Nama lengkap minimal 2 karakter').max(100, 'Nama lengkap maksimal 100 karakter'),
})

const changePasswordSchema = z
  .object({
    newPassword: z.string().min(6, 'Kata sandi minimal 6 karakter'),
    confirmPassword: z.string().min(6, 'Konfirmasi kata sandi minimal 6 karakter'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Konfirmasi kata sandi tidak cocok',
    path: ['confirmPassword'],
  })

export type ProfileActionState = {
  error?: string
  success?: boolean
  message?: string
}

export async function updateAdminNameAction(
  prevState: ProfileActionState,
  formData: FormData
): Promise<ProfileActionState> {
  const name = formData.get('name') as string

  const parsed = updateNameSchema.safeParse({ name })
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message || 'Nama tidak valid',
    }
  }

  const profile = await requireRole('admin')
  const supabase = await createSupabaseServerClient()

  // Update in profiles table
  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      name: parsed.data.name,
      updated_at: new Date().toISOString(),
    })
    .eq('id', profile.id)

  if (profileError) {
    return {
      error: 'Gagal memperbarui nama. Silakan coba lagi.',
    }
  }

  // Also update Supabase auth user metadata so session metadata stays in sync
  try {
    const admin = getSupabaseAdmin()
    await admin.auth.admin.updateUserById(profile.id, {
      user_metadata: { name: parsed.data.name },
    })
  } catch (err) {
    console.error('Failed to sync user metadata:', err)
  }

  revalidatePath('/admin', 'layout')
  revalidatePath('/admin/profile')

  return {
    success: true,
    message: 'Nama berhasil diperbarui.',
  }
}

export async function updateAdminPasswordAction(
  prevState: ProfileActionState,
  formData: FormData
): Promise<ProfileActionState> {
  const newPassword = formData.get('newPassword') as string
  const confirmPassword = formData.get('confirmPassword') as string

  const parsed = changePasswordSchema.safeParse({ newPassword, confirmPassword })
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message || 'Format kata sandi belum sesuai.',
    }
  }

  await requireRole('admin')
  const supabase = await createSupabaseServerClient()

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.newPassword,
  })

  if (error) {
    return {
      error: 'Gagal mengubah kata sandi. Pastikan format sudah benar atau coba lagi nanti.',
    }
  }

  return {
    success: true,
    message: 'Kata sandi berhasil diperbarui.',
  }
}
