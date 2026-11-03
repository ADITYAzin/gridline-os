import { type EmailOtpType } from '@supabase/supabase-js'
import { NextResponse, type NextRequest } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'

const ALLOWED_REDIRECT_PREFIXES = [
  '/reset-password',
  '/verify-email',
  '/admin',
  '/technician',
  '/owner',
  '/profile',
  '/login',
]

function sanitizeRedirectPath(nextParam: string | null, fallback: string): string {
  if (!nextParam) return fallback
  const trimmed = nextParam.trim()
  if (!trimmed.startsWith('/') || trimmed.startsWith('//') || trimmed.startsWith('/\\')) {
    return fallback
  }
  const isAllowed = ALLOWED_REDIRECT_PREFIXES.some(
    (prefix) => trimmed === prefix || trimmed.startsWith(`${prefix}?`) || trimmed.startsWith(`${prefix}/`)
  )
  return isAllowed ? trimmed : fallback
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const tokenHash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const code = searchParams.get('code')
  const nextParam = searchParams.get('next')

  const defaultNext =
    type === 'recovery'
      ? '/reset-password'
      : type === 'signup' || type === 'email'
      ? '/verify-email?status=success'
      : '/admin'

  const safeNext = sanitizeRedirectPath(nextParam, defaultNext)
  const supabase = await createSupabaseServerClient()

  if (tokenHash && type) {
    const { data, error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash,
    })

    if (!error) {
      if (data.user && data.user.user_metadata?.otp_verified === false) {
        const admin = getSupabaseAdmin()
        await admin.auth.admin.updateUserById(data.user.id, {
          email_confirm: true,
          user_metadata: {
            ...data.user.user_metadata,
            otp_verified: true,
          },
        })
      }
      return NextResponse.redirect(new URL(safeNext, origin))
    }

    if (type === 'recovery') {
      return NextResponse.redirect(new URL('/forgot-password', origin))
    }
    return NextResponse.redirect(new URL('/verify-email?status=expired', origin))
  }

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(new URL(safeNext, origin))
    }
  }

  return NextResponse.redirect(new URL('/verify-email?status=expired', origin))
}
