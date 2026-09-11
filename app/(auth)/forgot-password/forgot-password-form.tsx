'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { requestPasswordResetAction, type ActionState } from '@/app/actions/auth'
import { KeyRound, ArrowLeft, Loader2, CheckCircle2, Mail, AlertCircle } from 'lucide-react'

const initialState: ActionState = {}

export function ForgotPasswordForm() {
  const [state, formAction, isPending] = useActionState(requestPasswordResetAction, initialState)

  return (
    <div className="w-full max-w-[420px] rounded-[12px] bg-[#FFFFFF] border border-[#E2E8F0] shadow-[0px_1px_2px_0px_rgba(15,23,42,0.05)] p-6 sm:p-7 transition-all hover:border-[#CBD5E1] hover:shadow-[0px_4px_6px_-1px_rgba(15,23,42,0.08),0px_2px_4px_-2px_rgba(15,23,42,0.04)]">
      {/* Header section - Compact */}
      <div className="text-center space-y-1 pb-4 border-b border-[#F1F5F9]">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-[8px] bg-[#EBF5FC] border border-[#D0E8F8] text-[#007ACC] shadow-sm mb-2">
          <KeyRound className="h-5 w-5" />
        </div>
        <h1 className="font-heading text-[22px] sm:text-[24px] font-semibold text-[#0F172A] tracking-[-0.015em]">
          Lupa Kata Sandi?
        </h1>
        <p className="text-[13.5px] text-[#475569] font-normal leading-[18px]">
          Masukkan alamat email Anda untuk menerima instruksi pemulihan resmi
        </p>
      </div>

      {state.success ? (
        <div className="pt-4 space-y-4 text-center">
          <div className="rounded-[8px] bg-[#ECFDF5] border border-[#10B981]/30 p-3.5 space-y-1.5 text-left">
            <div className="flex items-center gap-2 text-[#047857] font-semibold text-[13px]">
              <CheckCircle2 className="h-4 w-4 text-[#10B981] shrink-0" />
              <span>Instruksi Berhasil Dikirim</span>
            </div>
            <p className="text-[12px] text-[#475569] leading-relaxed">
              {state.message ||
                'Jika email Anda terdaftar dalam sistem Gridline OS, tautan pemulihan kata sandi telah dikirimkan ke kotak masuk Anda.'}
            </p>
          </div>

          <div className="pt-1">
            <Link
              href="/login"
              className="w-full h-10 rounded-[8px] bg-[#FFFFFF] hover:bg-[#F8FAFC] text-[#0F172A] border border-[#CBD5E1] hover:border-[#94A3B8] text-[14px] font-medium flex items-center justify-center gap-2 transition-colors focus:outline-none focus-visible:ring-4 focus-visible:ring-[#007ACC]/25"
            >
              <ArrowLeft className="h-4 w-4 text-[#475569]" />
              <span>Kembali ke Halaman Masuk</span>
            </Link>
          </div>
        </div>
      ) : (
        <form action={formAction} className="pt-4 space-y-3.5">
          {/* Error Alert */}
          {state?.error && (
            <div className="rounded-[8px] bg-[#FEF2F2] border border-[#EF4444]/30 p-3 flex items-start gap-2 text-[#B91C1C] text-[12.5px] font-medium leading-snug">
              <AlertCircle className="h-4 w-4 text-[#EF4444] shrink-0 mt-0.5" />
              <span>{state.error}</span>
            </div>
          )}

          {/* Email Field */}
          <div className="space-y-1">
            <label
              htmlFor="email"
              className="block text-[12px] font-medium text-[#475569] tracking-[0.01em]"
            >
              Alamat Email Terdaftar
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#94A3B8]">
                <Mail className="h-4 w-4" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="nama@perusahaan.com"
                defaultValue={state?.fields?.email}
                disabled={isPending}
                className="w-full h-10 rounded-[8px] border border-[#E2E8F0] bg-[#FFFFFF] pl-9 pr-3 text-[14px] text-[#0F172A] placeholder:text-[#94A3B8] transition-all focus:border-[#007ACC] focus:ring-4 focus:ring-[#007ACC]/15 outline-none disabled:bg-[#F1F5F9] disabled:cursor-not-allowed"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isPending}
              className="w-full h-10 rounded-[8px] bg-[#007ACC] hover:bg-[#0062A3] active:bg-[#004F82] text-[#FFFFFF] text-[14px] font-medium tracking-normal flex items-center justify-center gap-2 shadow-[0px_1px_2px_0px_rgba(15,23,42,0.05)] transition-colors focus:outline-none focus-visible:ring-4 focus-visible:ring-[#007ACC]/25 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                  <span>Mengirimkan Tautan...</span>
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4" />
                  <span>Kirim Tautan Reset</span>
                </>
              )}
            </button>
          </div>

          {/* Footer Link */}
          <div className="pt-3 text-center border-t border-[#F1F5F9]">
            <p className="text-[13px] text-[#475569]">
              Ingat kata sandi Anda?{' '}
              <Link
                href="/login"
                className="font-semibold text-[#007ACC] hover:text-[#0062A3] hover:underline transition-colors focus:outline-none focus-visible:underline"
              >
                Masuk di sini
              </Link>
            </p>
          </div>
        </form>
      )}
    </div>
  )
}
