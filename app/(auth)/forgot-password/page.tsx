import { Metadata } from 'next'
import { ForgotPasswordForm } from './forgot-password-form'

export const metadata: Metadata = {
  title: 'Lupa Password — Gridline OS',
  description: 'Permintaan reset kata sandi akun Gridline OS',
}

export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-br from-background via-muted/30 to-background">
      <ForgotPasswordForm />
    </main>
  )
}
