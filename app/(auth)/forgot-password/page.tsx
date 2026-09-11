import { Metadata } from 'next'
import { ForgotPasswordForm } from './forgot-password-form'

export const metadata: Metadata = {
  title: 'Lupa Password — Gridline OS',
  description: 'Permintaan reset kata sandi akun Gridline OS',
}

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />
}
