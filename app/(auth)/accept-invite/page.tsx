import crypto from 'crypto'
import Link from 'next/link'
import { Metadata } from 'next'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { AcceptInviteForm } from './accept-invite-form'
import { AlertTriangle, ArrowLeft } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Aktivasi Undangan — Opilines',
  description: 'Terima undangan tim dan aktifkan akun Opilines Anda',
}

interface PageProps {
  searchParams: Promise<{ token?: string }>
}

export default async function AcceptInvitePage({ searchParams }: PageProps) {
  const { token } = await searchParams

  if (!token) {
    return (
      <div className="w-full max-w-[440px] rounded-[12px] bg-[#FFFFFF] border border-[#E2E8F0] shadow-[0px_1px_2px_0px_rgba(15,23,42,0.05)] p-6 sm:p-8 text-center space-y-4">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-[10px] bg-[#FEF2F2] border border-[#FECACA] text-[#EF4444] shadow-sm">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <div className="space-y-1.5">
          <h1 className="font-heading text-[20px] font-semibold text-[#0F172A] tracking-[-0.015em]">
            Token Undangan Tidak Ditemukan
          </h1>
          <p className="text-[13px] text-[#475569] leading-relaxed">
            Tautan undangan tidak memiliki parameter token yang valid. Silakan periksa kembali tautan yang dikirimkan ke email Anda.
          </p>
        </div>
        <div className="pt-2">
          <Link
            href="/login"
            className="w-full h-10 rounded-[8px] bg-[#007ACC] hover:bg-[#0062A3] active:bg-[#004F82] text-[#FFFFFF] text-[14px] font-medium flex items-center justify-center gap-2 shadow-[0px_1px_2px_0px_rgba(15,23,42,0.05)] transition-colors focus:outline-none focus-visible:ring-4 focus-visible:ring-[#007ACC]/25"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Kembali ke Halaman Masuk</span>
          </Link>
        </div>
      </div>
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
      <div className="w-full max-w-[440px] rounded-[12px] bg-[#FFFFFF] border border-[#E2E8F0] shadow-[0px_1px_2px_0px_rgba(15,23,42,0.05)] p-6 sm:p-8 text-center space-y-4">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-[10px] bg-[#FEF2F2] border border-[#FECACA] text-[#EF4444] shadow-sm">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <div className="space-y-1.5">
          <h1 className="font-heading text-[20px] font-semibold text-[#0F172A] tracking-[-0.015em]">
            Undangan Tidak Berlaku
          </h1>
          <p className="text-[13px] text-[#475569] leading-relaxed">
            {isUsed
              ? 'Tautan undangan ini sudah pernah diaktivasi sebelumnya. Silakan langsung masuk menggunakan akun Anda.'
              : 'Tautan undangan ini telah kedaluwarsa (berlaku 24 jam) atau tidak valid. Hubungi Administrator perusahaan Anda untuk meminta tautan undangan baru.'}
          </p>
        </div>
        <div className="pt-2">
          <Link
            href="/login"
            className="w-full h-10 rounded-[8px] bg-[#007ACC] hover:bg-[#0062A3] active:bg-[#004F82] text-[#FFFFFF] text-[14px] font-medium flex items-center justify-center gap-2 shadow-[0px_1px_2px_0px_rgba(15,23,42,0.05)] transition-colors focus:outline-none focus-visible:ring-4 focus-visible:ring-[#007ACC]/25"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Kembali ke Halaman Masuk</span>
          </Link>
        </div>
      </div>
    )
  }

  const orgRaw = invite.organizations as unknown
  const org = Array.isArray(orgRaw) ? orgRaw[0] : orgRaw
  const orgName = (org as { name?: string } | null)?.name || 'Organisasi'

  return (
    <AcceptInviteForm
      token={token}
      email={invite.email}
      role={invite.role}
      orgName={orgName}
    />
  )
}
