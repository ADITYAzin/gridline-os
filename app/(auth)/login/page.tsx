import { Metadata } from 'next'
import { LoginForm } from './login-form'

export const metadata: Metadata = {
  title: 'Masuk — Gridline OS',
  description: 'Masuk ke portal operasional teknisi dan manajemen Gridline OS',
}

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-br from-background via-muted/30 to-background">
      <LoginForm />
    </main>
  )
}
