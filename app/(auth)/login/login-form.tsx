'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import { signInAction, type ActionState } from '@/app/actions/auth'
import { ArrowRight, Loader2, Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react'

const initialState: ActionState = {}

export function LoginForm({ resetSuccess = false }: { resetSuccess?: boolean }) {
  const [state, formAction, isPending] = useActionState(signInAction, initialState)
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="w-full max-w-[420px] rounded-[12px] bg-[#FFFFFF] border border-[#E2E8F0] shadow-[0px_1px_2px_0px_rgba(15,23,42,0.05)] p-6 sm:p-7 transition-all hover:border-[#CBD5E1] hover:shadow-[0px_4px_6px_-1px_rgba(15,23,42,0.08),0px_2px_4px_-2px_rgba(15,23,42,0.04)]">
      {/* Header section - Compact */}
      <div className="text-center space-y-1 pb-4 border-b border-[#F1F5F9]">
        <h1 className="font-heading text-[22px] sm:text-[24px] font-semibold text-[#0F172A] tracking-[-0.015em]">
          Masuk ke Akun Anda
        </h1>
        <p className="text-[13.5px] text-[#475569] font-normal leading-[18px]">
          Akses portal operasional teknisi dan dispatch Gridline OS
        </p>
      </div>

      <form action={formAction} className="pt-4 space-y-3.5">
        {/* Reset Password Success Alert */}
        {resetSuccess && (
          <div className="rounded-[8px] bg-[#ECFDF5] border border-[#10B981]/30 p-3 flex items-start gap-2 text-[#047857] text-[12.5px] font-medium leading-snug">
            <CheckCircle2 className="h-4 w-4 text-[#10B981] shrink-0 mt-0.5" />
            <span>Kata sandi berhasil diperbarui! Silakan masuk menggunakan kata sandi baru Anda.</span>
          </div>
        )}

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
            Alamat Email
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

        {/* Password Field */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label
              htmlFor="password"
              className="block text-[12px] font-medium text-[#475569] tracking-[0.01em]"
            >
              Kata Sandi
            </label>
            <Link
              href="/forgot-password"
              className="text-[12px] font-medium text-[#007ACC] hover:text-[#0062A3] transition-colors focus:outline-none focus-visible:underline"
            >
              Lupa kata sandi?
            </Link>
          </div>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#94A3B8]">
              <Lock className="h-4 w-4" />
            </div>
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              placeholder="••••••••"
              disabled={isPending}
              className="w-full h-10 rounded-[8px] border border-[#E2E8F0] bg-[#FFFFFF] pl-9 pr-10 text-[14px] text-[#0F172A] placeholder:text-[#94A3B8] transition-all focus:border-[#007ACC] focus:ring-4 focus:ring-[#007ACC]/15 outline-none disabled:bg-[#F1F5F9] disabled:cursor-not-allowed"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#94A3B8] hover:text-[#475569] transition-colors focus:outline-none"
              aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Primary CTA Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isPending}
            className="w-full h-10 rounded-[8px] bg-[#007ACC] hover:bg-[#0062A3] active:bg-[#004F82] text-[#FFFFFF] text-[14px] font-medium tracking-normal flex items-center justify-center gap-2 shadow-[0px_1px_2px_0px_rgba(15,23,42,0.05)] transition-colors focus:outline-none focus-visible:ring-4 focus-visible:ring-[#007ACC]/25 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-white" />
                <span>Memproses...</span>
              </>
            ) : (
              <>
                <span>Masuk ke Akun</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>

        {/* Card Footer Link */}
        <div className="pt-3 text-center border-t border-[#F1F5F9]">
          <p className="text-[13px] text-[#475569]">
            Belum punya akun organisasi?{' '}
            <Link
              href="/register"
              className="font-semibold text-[#007ACC] hover:text-[#0062A3] hover:underline transition-colors focus:outline-none focus-visible:underline"
            >
              Daftar Baru
            </Link>
          </p>
        </div>
      </form>
    </div>
  )
}
