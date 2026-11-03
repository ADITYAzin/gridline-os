import { Metadata } from 'next'
import { LoginForm } from './login-form'

export const metadata: Metadata = {
  title: 'Masuk — Opilines',
  description: 'Masuk ke portal operasional Opilines',
}

interface LoginPageProps {
  searchParams: Promise<{ reset?: string; verified?: string }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { reset, verified } = await searchParams
  const resetSuccess = reset === 'success'
  const verifiedSuccess = verified === 'success'

  return <LoginForm resetSuccess={resetSuccess} verifiedSuccess={verifiedSuccess} />
}
