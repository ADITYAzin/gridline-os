import { Metadata } from 'next'
import { RegisterForm } from './register-form'

export const metadata: Metadata = {
  title: 'Daftar Organisasi Baru — Gridline OS',
  description: 'Daftarkan perusahaan Anda dan dapatkan akses operating system teknisi lapangan',
}

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-br from-background via-muted/30 to-background">
      <RegisterForm />
    </main>
  )
}
