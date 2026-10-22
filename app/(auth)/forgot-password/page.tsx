import { Metadata } from 'next'
import { ForgotPasswordForm } from './forgot-password-form'

export const metadata: Metadata = {
  title: 'Lupa Password — Opilines',
  description: 'Permintaan reset kata sandi akun Opilines',
}

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />
}
