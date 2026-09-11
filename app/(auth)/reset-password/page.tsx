import { Metadata } from 'next'
import { ResetPasswordForm } from './reset-password-form'

export const metadata: Metadata = {
  title: 'Atur Kata Sandi Baru — Gridline OS',
  description: 'Atur ulang kata sandi akun Gridline OS Anda',
}

export default function ResetPasswordPage() {
  return <ResetPasswordForm />
}
