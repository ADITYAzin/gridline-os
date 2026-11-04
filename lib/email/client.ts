import 'server-only'
import { Resend } from 'resend'

interface SendEmailParams {
  to: string | string[]
  subject: string
  html: string
  text?: string
  replyTo?: string
}

interface SendEmailResult {
  success: boolean
  id?: string
  simulated?: boolean
  error?: string
}

const DEFAULT_FROM_EMAIL = 'Opilines <noreply@auth.opilines.com>'

function sanitizeEnvValue(raw: string | undefined): string {
  if (!raw) return ''
  return raw.trim().replace(/^["']+|["']+$/g, '').trim()
}

function getResendClient(): { resend: Resend | null; fromEmail: string } {
  const apiKey = sanitizeEnvValue(process.env.RESEND_API_KEY)
  const rawFrom = sanitizeEnvValue(process.env.EMAIL_FROM)
  const fromEmail = rawFrom
    ? rawFrom.includes('<')
      ? rawFrom
      : `Opilines <${rawFrom}>`
    : DEFAULT_FROM_EMAIL

  if (!apiKey || apiKey === 're_your_api_key_here') {
    return { resend: null, fromEmail }
  }

  return {
    resend: new Resend(apiKey),
    fromEmail,
  }
}

/**
 * Sends a transactional email using Resend SDK.
 * If RESEND_API_KEY is not configured in development, logs the email to console (Dev Sandbox mode).
 */
export async function sendTransactionalEmail({
  to,
  subject,
  html,
  text,
  replyTo,
}: SendEmailParams): Promise<SendEmailResult> {
  const { resend, fromEmail } = getResendClient()
  const recipients = Array.isArray(to) ? to : [to]

  // Fallback / Sandbox Mode if API Key is not set yet
  if (!resend) {
    if (process.env.NODE_ENV === 'production') {
      console.error(
        '[Email Service Error] RESEND_API_KEY is missing in production environment. Email was not sent.'
      )
      return {
        success: false,
        simulated: true,
        error: 'Konfigurasi RESEND_API_KEY belum terpasang di server hosting.',
      }
    }

    console.log('\n=================== 📨 [DEV SIMULATION] EMAIL OUTBOX ===================')
    console.log(`From:    ${fromEmail}`)
    console.log(`To:      ${recipients.join(', ')}`)
    console.log(`Subject: ${subject}`)
    console.log('-------------------------------------------------------------------------')
    if (text) console.log(`Text Body:\n${text}\n`)
    console.log('HTML Preview (Truncated):', html.substring(0, 180) + '...')
    console.log('=========================================================================\n')

    return {
      success: true,
      simulated: true,
      id: `sim_${Date.now()}`,
    }
  }

  try {
    const plainText =
      text ||
      html
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()

    let { data, error } = await resend.emails.send({
      from: fromEmail,
      to: recipients,
      subject,
      html,
      text: plainText,
      replyTo,
    })

    // Retry with verified default sender if custom EMAIL_FROM fails due to unverified domain or invalid format
    if (error && fromEmail !== DEFAULT_FROM_EMAIL) {
      console.warn(
        `[Email Service Retry] Sender "${fromEmail}" failed (${error.message}). Retrying with default verified sender "${DEFAULT_FROM_EMAIL}"...`
      )
      const retryResult = await resend.emails.send({
        from: DEFAULT_FROM_EMAIL,
        to: recipients,
        subject,
        html,
        text: plainText,
        replyTo,
      })
      data = retryResult.data
      error = retryResult.error
    }

    if (error) {
      console.error('[Email Service Error]', error)
      return {
        success: false,
        error: error.message,
      }
    }

    return {
      success: true,
      id: data?.id,
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown email sending error'
    console.error('[Email Service Exception]', message)
    return {
      success: false,
      error: message,
    }
  }
}
