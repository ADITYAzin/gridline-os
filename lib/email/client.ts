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

function getResendClient(): { resend: Resend | null; fromEmail: string } {
  const apiKey = process.env.RESEND_API_KEY
  const fromEmail = process.env.EMAIL_FROM || 'Gridline OS <noreply@sublims.id>'

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
 * If RESEND_API_KEY is not configured, logs the email to console for developer preview (Dev Sandbox mode).
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

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: recipients,
      subject,
      html,
      text: plainText,
      replyTo,
    })

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
