import { Metadata } from 'next'
import { ResetPasswordForm } from './reset-password-form'

export const metadata: Metadata = {
  title: 'Atur Kata Sandi Baru — Opilines',
  description: 'Atur ulang kata sandi akun Opilines Anda',
}

export default function ResetPasswordPage() {
  return <ResetPasswordForm />
}
