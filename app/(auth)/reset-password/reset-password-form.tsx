'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import { updatePasswordAction, type ActionState } from '@/app/actions/auth'
import { Lock, Eye, EyeOff, Loader2, Check, AlertCircle } from 'lucide-react'

const initialState: ActionState = {}

export function ResetPasswordForm() {
  const [state, formAction, isPending] = useActionState(updatePasswordAction, initialState)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  return (
    <div className="w-full max-w-[420px] rounded-[12px] bg-[#FFFFFF] border border-[#E2E8F0] shadow-[0px_1px_2px_0px_rgba(15,23,42,0.05)] p-6 sm:p-7 transition-all hover:border-[#CBD5E1] hover:shadow-[0px_4px_6px_-1px_rgba(15,23,42,0.08),0px_2px_4px_-2px_rgba(15,23,42,0.04)]">
      {/* Header section - Compact */}
      <div className="text-center space-y-1 pb-4 border-b border-[#F1F5F9]">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-[8px] bg-[#EBF5FC] border border-[#D0E8F8] text-[#007ACC] shadow-sm mb-2">
          <Lock className="h-5 w-5" />
        </div>
        <h1 className="font-heading text-[22px] sm:text-[24px] font-semibold text-[#0F172A] tracking-[-0.015em]">
          Atur Kata Sandi Baru
        </h1>
        <p className="text-[13.5px] text-[#475569] font-normal leading-[18px]">
          Masukkan kata sandi baru untuk akun Gridline OS Anda
        </p>
      </div>

      <form action={formAction} className="pt-4 space-y-3.5">
        {/* Error Alert */}
        {state?.error && (
          <div className="rounded-[8px] bg-[#FEF2F2] border border-[#EF4444]/30 p-3 flex items-start gap-2 text-[#B91C1C] text-[12.5px] font-medium leading-snug">
            <AlertCircle className="h-4 w-4 text-[#EF4444] shrink-0 mt-0.5" />
            <span>{state.error}</span>
          </div>
        )}

        {/* New Password */}
        <div className="space-y-1">
          <label
            htmlFor="password"
            className="block text-[12px] font-medium text-[#475569] tracking-[0.01em]"
          >
            Kata Sandi Baru
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#94A3B8]">
              <Lock className="h-4 w-4" />
            </div>
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              required
              placeholder="Minimal 6 karakter"
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

        {/* Confirm Password */}
        <div className="space-y-1">
          <label
            htmlFor="confirmPassword"
            className="block text-[12px] font-medium text-[#475569] tracking-[0.01em]"
          >
            Konfirmasi Kata Sandi Baru
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#94A3B8]">
              <Lock className="h-4 w-4" />
            </div>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              autoComplete="new-password"
              required
              placeholder="Ulangi kata sandi baru"
              disabled={isPending}
              className="w-full h-10 rounded-[8px] border border-[#E2E8F0] bg-[#FFFFFF] pl-9 pr-10 text-[14px] text-[#0F172A] placeholder:text-[#94A3B8] transition-all focus:border-[#007ACC] focus:ring-4 focus:ring-[#007ACC]/15 outline-none disabled:bg-[#F1F5F9] disabled:cursor-not-allowed"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              tabIndex={-1}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#94A3B8] hover:text-[#475569] transition-colors focus:outline-none"
              aria-label={showConfirmPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
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
                <span>Menyimpan Sandi Baru...</span>
              </>
            ) : (
              <>
                <Check className="h-4 w-4" />
                <span>Simpan Kata Sandi & Masuk</span>
              </>
            )}
          </button>
        </div>

        {/* Footer Link */}
        <div className="pt-3 text-center border-t border-[#F1F5F9]">
          <p className="text-[13px] text-[#475569]">
            Batal mengubah?{' '}
            <Link
              href="/login"
              className="font-semibold text-[#007ACC] hover:text-[#0062A3] hover:underline transition-colors focus:outline-none focus-visible:underline"
            >
              Kembali ke Login
            </Link>
          </p>
        </div>
      </form>
    </div>
  )
}
