import { Metadata } from 'next'
import Link from 'next/link'
import { MailCheck, CheckCircle2, Clock, ArrowRight, ArrowLeft } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Verifikasi Email — Opilines',
  description: 'Status verifikasi email akun Opilines',
}

interface VerifyEmailPageProps {
  searchParams: Promise<{
    status?: 'pending' | 'success' | 'expired'
    email?: string
  }>
}

export default async function VerifyEmailPage({ searchParams }: VerifyEmailPageProps) {
  const { status = 'pending', email = '' } = await searchParams

  if (status === 'success') {
    return (
      <div className="w-full max-w-[420px] rounded-[12px] bg-[#FFFFFF] border border-[#E2E8F0] shadow-[0px_1px_2px_0px_rgba(15,23,42,0.05)] p-6 sm:p-7 text-center space-y-4">
        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-[10px] bg-[#ECFDF5] border border-[#A7F3D0] text-[#10B981]">
          <CheckCircle2 className="h-5 w-5" />
        </div>
        <div className="space-y-1">
          <h1 className="font-heading text-[22px] font-semibold text-[#0F172A] tracking-[-0.015em]">
            Email Terverifikasi
          </h1>
          <p className="text-[13.5px] text-[#475569]">
            Akun Anda sudah aktif dan siap digunakan.
          </p>
        </div>
        <div className="pt-2">
          <Link
            href="/login?verified=success"
            className="w-full h-10 rounded-[8px] bg-[#007ACC] hover:bg-[#0062A3] active:bg-[#004F82] text-[#FFFFFF] text-[14px] font-medium flex items-center justify-center gap-2 shadow-[0px_1px_2px_0px_rgba(15,23,42,0.05)] transition-colors"
          >
            <span>Lanjut ke Login</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    )
  }

  if (status === 'expired') {
    return (
      <div className="w-full max-w-[420px] rounded-[12px] bg-[#FFFFFF] border border-[#E2E8F0] shadow-[0px_1px_2px_0px_rgba(15,23,42,0.05)] p-6 sm:p-7 text-center space-y-4">
        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-[10px] bg-[#FEF2F2] border border-[#FECACA] text-[#EF4444]">
          <Clock className="h-5 w-5" />
        </div>
        <div className="space-y-1">
          <h1 className="font-heading text-[22px] font-semibold text-[#0F172A] tracking-[-0.015em]">
            Tautan Kedaluwarsa
          </h1>
          <p className="text-[13.5px] text-[#475569]">
            Batas waktu verifikasi telah berakhir. Minta kode baru untuk melanjutkan.
          </p>
        </div>
        <div className="pt-2 space-y-2.5">
          <Link
            href={`/verify-otp?type=register${email ? `&email=${encodeURIComponent(email)}` : ''}`}
            className="w-full h-10 rounded-[8px] bg-[#007ACC] hover:bg-[#0062A3] active:bg-[#004F82] text-[#FFFFFF] text-[14px] font-medium flex items-center justify-center gap-2 shadow-[0px_1px_2px_0px_rgba(15,23,42,0.05)] transition-colors"
          >
            <span>Verifikasi dengan OTP</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/login"
            className="w-full h-10 rounded-[8px] bg-[#FFFFFF] hover:bg-[#F8FAFC] text-[#475569] border border-[#E2E8F0] text-[13.5px] font-medium flex items-center justify-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Kembali ke Login</span>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-[420px] rounded-[12px] bg-[#FFFFFF] border border-[#E2E8F0] shadow-[0px_1px_2px_0px_rgba(15,23,42,0.05)] p-6 sm:p-7 text-center space-y-4">
      <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-[10px] bg-[#EBF5FC] border border-[#D0E8F8] text-[#007ACC]">
        <MailCheck className="h-5 w-5" />
      </div>
      <div className="space-y-1">
        <h1 className="font-heading text-[22px] font-semibold text-[#0F172A] tracking-[-0.015em]">
          Cek Email Anda
        </h1>
        <p className="text-[13.5px] text-[#475569]">
          Kode verifikasi telah dikirim ke{' '}
          <span className="font-semibold text-[#0F172A] break-all">
            {email || 'email Anda'}
          </span>
        </p>
      </div>
      <div className="pt-2 space-y-2.5">
        <Link
          href={`/verify-otp?type=register${email ? `&email=${encodeURIComponent(email)}` : ''}`}
          className="w-full h-10 rounded-[8px] bg-[#007ACC] hover:bg-[#0062A3] active:bg-[#004F82] text-[#FFFFFF] text-[14px] font-medium flex items-center justify-center gap-2 shadow-[0px_1px_2px_0px_rgba(15,23,42,0.05)] transition-colors"
        >
          <span>Masukkan Kode OTP</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          href="/login"
          className="w-full h-10 rounded-[8px] bg-[#FFFFFF] hover:bg-[#F8FAFC] text-[#475569] border border-[#E2E8F0] text-[13.5px] font-medium flex items-center justify-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Kembali ke Login</span>
        </Link>
      </div>
    </div>
  )
}
