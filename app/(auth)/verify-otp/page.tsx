import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { VerifyOtpForm } from './verify-otp-form'

export const metadata: Metadata = {
  title: 'Verifikasi OTP — Opilines',
  description: 'Verifikasi kode keamanan 6 digit Opilines',
}

interface VerifyOtpPageProps {
  searchParams: Promise<{
    email?: string
    type?: 'reset' | 'register' | 'login'
  }>
}

export default async function VerifyOtpPage({ searchParams }: VerifyOtpPageProps) {
  const { email = '', type = 'reset' } = await searchParams
  const validType = ['reset', 'register', 'login'].includes(type) ? type : 'reset'
  const normalizedEmail = email.trim().toLowerCase()

  if (!normalizedEmail) {
    redirect(validType === 'reset' ? '/forgot-password' : '/login')
  }

  const admin = getSupabaseAdmin()
  const { data: profile } = await admin
    .from('profiles')
    .select('email')
    .ilike('email', normalizedEmail)
    .limit(1)
    .maybeSingle()

  if (!profile) {
    redirect(validType === 'reset' ? '/forgot-password' : '/login')
  }

  return <VerifyOtpForm email={profile.email || normalizedEmail} type={validType} />
}
