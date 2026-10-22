import { Metadata } from 'next'
import { LoginForm } from './login-form'

export const metadata: Metadata = {
  title: 'Masuk — Opilines',
  description: 'Masuk ke portal operasional teknisi dan manajemen Opilines',
}

interface LoginPageProps {
  searchParams: Promise<{ reset?: string }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { reset } = await searchParams
  const resetSuccess = reset === 'success'

  return <LoginForm resetSuccess={resetSuccess} />
}

