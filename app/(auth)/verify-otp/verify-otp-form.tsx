'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { verifyOtpAction, resendOtpAction, type ActionState } from '@/app/actions/auth'
import { ShieldCheck, ArrowLeft, Loader2, AlertCircle, CheckCircle2, RotateCw } from 'lucide-react'

const OTP_LENGTH = 6
const initialState: ActionState = {}

interface VerifyOtpFormProps {
  email: string
  type: 'reset' | 'register' | 'login'
}

export function VerifyOtpForm({ email, type }: VerifyOtpFormProps) {
  const [state, formAction, isPending] = useActionState(verifyOtpAction, initialState)
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''))
  const [cooldown, setCooldown] = useState(59)
  const [isResending, setIsResending] = useState(false)
  const [resentSuccess, setResentSuccess] = useState(false)
  const [resendError, setResendError] = useState('')
  const inputRefs = useRef<Array<HTMLInputElement | null>>([])

  const codeValue = digits.join('')
  const isComplete = codeValue.length === OTP_LENGTH && /^\d{6}$/.test(codeValue)

  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [cooldown])

  const handleChange = (index: number, raw: string) => {
    const val = raw.replace(/\D/g, '')
    if (!val) {
      const next = [...digits]
      next[index] = ''
      setDigits(next)
      return
    }

    // Handle multi-digit input (e.g. mobile autocomplete)
    if (val.length > 1) {
      const chars = val.slice(0, OTP_LENGTH).split('')
      const next = [...digits]
      chars.forEach((char, idx) => {
        if (index + idx < OTP_LENGTH) {
          next[index + idx] = char
        }
      })
      setDigits(next)
      const focusIdx = Math.min(index + chars.length, OTP_LENGTH - 1)
      inputRefs.current[focusIdx]?.focus()
      return
    }

    const next = [...digits]
    next[index] = val
    setDigits(next)

    if (index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (digits[index]) {
        const next = [...digits]
        next[index] = ''
        setDigits(next)
      } else if (index > 0) {
        const next = [...digits]
        next[index - 1] = ''
        setDigits(next)
        inputRefs.current[index - 1]?.focus()
      }
      e.preventDefault()
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus()
      e.preventDefault()
    } else if (e.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus()
      e.preventDefault()
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH)
    if (!pasted) return

    const next = Array(OTP_LENGTH).fill('')
    pasted.split('').forEach((char, i) => {
      next[i] = char
    })
    setDigits(next)

    const focusIdx = Math.min(pasted.length, OTP_LENGTH - 1)
    inputRefs.current[focusIdx]?.focus()
  }

  const handleResend = async () => {
    if (cooldown > 0 || isResending) return
    setIsResending(true)
    setResentSuccess(false)
    setResendError('')
    const res = await resendOtpAction(email, type)
    setIsResending(false)
    if (!res.success) {
      setResendError(res.error || 'Gagal mengirim ulang kode.')
      return
    }
    setResentSuccess(true)
    setCooldown(59)
    setDigits(Array(OTP_LENGTH).fill(''))
    inputRefs.current[0]?.focus()
  }

  const backHref = type === 'reset' ? '/forgot-password' : '/login'
  const backLabel = type === 'reset' ? 'Ganti email' : 'Kembali ke Login'
  const errorMessage = state?.error || resendError

  return (
    <div className="w-full max-w-[420px] rounded-[12px] bg-[#FFFFFF] border border-[#E2E8F0] shadow-[0px_1px_2px_0px_rgba(15,23,42,0.05)] p-6 sm:p-7 transition-all hover:border-[#CBD5E1] hover:shadow-[0px_4px_6px_-1px_rgba(15,23,42,0.08),0px_2px_4px_-2px_rgba(15,23,42,0.04)]">
      {/* Header */}
      <div className="text-center space-y-1.5 pb-4 border-b border-[#F1F5F9]">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-[8px] bg-[#EBF5FC] border border-[#D0E8F8] text-[#007ACC] shadow-sm mb-2">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <h1 className="font-heading text-[22px] sm:text-[24px] font-semibold text-[#0F172A] tracking-[-0.015em]">
          Verifikasi OTP
        </h1>
        <p className="text-[13px] text-[#475569]">
          Kode 6 digit dikirim ke{' '}
          <span className="font-semibold text-[#0F172A] break-all">
            {email || 'email Anda'}
          </span>
        </p>
      </div>

      <form action={formAction} className="pt-5 space-y-4">
        <input type="hidden" name="email" value={email} />
        <input type="hidden" name="code" value={codeValue} />
        <input type="hidden" name="type" value={type} />

        {/* Error Alert */}
        {errorMessage && (
          <div className="rounded-[8px] bg-[#FEF2F2] border border-[#EF4444]/30 p-3 flex items-center gap-2 text-[#B91C1C] text-[12.5px] font-medium">
            <AlertCircle className="h-4 w-4 text-[#EF4444] shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Resend Feedback */}
        {resentSuccess && !errorMessage && (
          <div className="rounded-[8px] bg-[#ECFDF5] border border-[#10B981]/30 p-2.5 flex items-center gap-2 text-[#047857] text-[12.5px] font-medium">
            <CheckCircle2 className="h-4 w-4 text-[#10B981] shrink-0" />
            <span>Kode baru berhasil dikirim.</span>
          </div>
        )}

        {/* 6-Digit OTP Slots */}
        <div className="flex items-center justify-between gap-2 sm:gap-2.5" onPaste={handlePaste}>
          {digits.map((digit, index) => (
            <input
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el
              }}
              type="text"
              inputMode="numeric"
              autoComplete={index === 0 ? 'one-time-code' : 'off'}
              maxLength={1}
              value={digit}
              disabled={isPending}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onFocus={(e) => e.target.select()}
              aria-label={`Digit ${index + 1}`}
              className={`w-full h-12 sm:h-13 rounded-[8px] border text-center font-heading text-[20px] font-semibold text-[#0F172A] transition-all outline-none disabled:bg-[#F1F5F9] disabled:cursor-not-allowed ${
                digit
                  ? 'border-[#007ACC] bg-[#F8FAFC] shadow-[0px_1px_2px_0px_rgba(0,122,204,0.08)]'
                  : 'border-[#E2E8F0] bg-[#FFFFFF]'
              } focus:border-[#007ACC] focus:bg-[#FFFFFF] focus:ring-4 focus:ring-[#007ACC]/15`}
            />
          ))}
        </div>

        {/* Resend & Timer Row */}
        <div className="flex items-center justify-between text-[12.5px] pt-0.5">
          <span className="text-[#64748B]">Tidak menerima kode?</span>
          {cooldown > 0 ? (
            <span className="font-medium text-[#94A3B8] tabular-nums">
              Kirim ulang dalam 0:{cooldown.toString().padStart(2, '0')}
            </span>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              disabled={isResending}
              className="inline-flex items-center gap-1.5 font-semibold text-[#007ACC] hover:text-[#0062A3] transition-colors cursor-pointer disabled:opacity-50"
            >
              <RotateCw className={`h-3.5 w-3.5 ${isResending ? 'animate-spin' : ''}`} />
              <span>Kirim ulang</span>
            </button>
          )}
        </div>

        {/* Submit Button */}
        <div className="pt-1">
          <button
            type="submit"
            disabled={isPending || !isComplete}
            className="w-full h-10 rounded-[8px] bg-[#007ACC] hover:bg-[#0062A3] active:bg-[#004F82] text-[#FFFFFF] text-[14px] font-medium flex items-center justify-center gap-2 shadow-[0px_1px_2px_0px_rgba(15,23,42,0.05)] transition-colors focus:outline-none focus-visible:ring-4 focus-visible:ring-[#007ACC]/25 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-white" />
                <span>Memverifikasi...</span>
              </>
            ) : (
              <span>Verifikasi</span>
            )}
          </button>
        </div>

        {/* Footer Back Link */}
        <div className="pt-3 text-center border-t border-[#F1F5F9]">
          <Link
            href={backHref}
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#475569] hover:text-[#0F172A] transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>{backLabel}</span>
          </Link>
        </div>
      </form>
    </div>
  )
}
