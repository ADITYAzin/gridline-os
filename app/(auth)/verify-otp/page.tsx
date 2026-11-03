import { Metadata } from 'next'
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

  return <VerifyOtpForm email={email} type={validType} />
}
