import crypto from 'crypto'
import Link from 'next/link'
import { Metadata } from 'next'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { AcceptInviteForm } from './accept-invite-form'
import { Card, CardDescription, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Aktivasi Undangan — Gridline OS',
  description: 'Terima undangan tim dan aktifkan akun Gridline OS Anda',
}

interface PageProps {
  searchParams: Promise<{ token?: string }>
}

export default async function AcceptInvitePage({ searchParams }: PageProps) {
  const { token } = await searchParams

  if (!token) {
    return (
      <main className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-br from-background via-muted/30 to-background">
        <Card className="w-full max-w-md text-center p-6 space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <CardTitle>Token Undangan Tidak Ditemukan</CardTitle>
          <CardDescription>
            Tautan undangan tidak memiliki token valid. Silakan periksa kembali tautan yang dikirimkan di email Anda.
          </CardDescription>
          <Button asChild className="w-full">
            <Link href="/login">Kembali ke Halaman Login</Link>
          </Button>
        </Card>
      </main>
    )
  }

  const tokenHash = crypto.createHash('sha256').update(token).digest('hex')
  const admin = getSupabaseAdmin()

  const { data: invite } = await admin
    .from('invite_tokens')
    .select('id, email, role, expires_at, used_at, organizations(name)')
    .eq('token_hash', tokenHash)
    .single()

  const isExpired = invite ? new Date(invite.expires_at) < new Date() : false
  const isUsed = invite ? Boolean(invite.used_at) : false
  const isValid = invite && !isExpired && !isUsed

  if (!isValid) {
    return (
      <main className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-br from-background via-muted/30 to-background">
        <Card className="w-full max-w-md text-center p-6 space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <CardTitle>Undangan Tidak Berlaku</CardTitle>
          <CardDescription>
            {isUsed
              ? 'Tautan undangan ini sudah pernah digunakan sebelumnya. Silakan login ke akun Anda.'
              : 'Tautan undangan ini sudah kedaluwarsa (berlaku 24 jam) atau tidak valid. Hubungi Administrator perusahaan Anda untuk meminta undangan baru.'}
          </CardDescription>
          <Button asChild className="w-full">
            <Link href="/login">Ke Halaman Login</Link>
          </Button>
        </Card>
      </main>
    )
  }

  const orgRaw = invite.organizations as unknown
  const org = Array.isArray(orgRaw) ? orgRaw[0] : orgRaw
  const orgName = (org as { name?: string } | null)?.name || 'Organisasi'

  return (
    <main className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-br from-background via-muted/30 to-background">
      <AcceptInviteForm
        token={token}
        email={invite.email}
        role={invite.role}
        orgName={orgName}
      />
    </main>
  )
}
