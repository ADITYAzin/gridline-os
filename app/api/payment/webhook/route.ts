import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { z } from 'zod'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { normalizeTierId } from '@/lib/pricing'

const midtransNotificationSchema = z.object({
  order_id: z.string().min(5).max(80),
  status_code: z.string().regex(/^[0-9]{3}$/),
  gross_amount: z.string().regex(/^[0-9]+(\.[0-9]{2})?$/),
  signature_key: z.string().length(128),
  transaction_status: z.enum([
    'capture',
    'settlement',
    'pending',
    'deny',
    'cancel',
    'expire',
    'failure',
    'refund',
    'partial_refund',
  ]),
  fraud_status: z.enum(['accept', 'challenge', 'deny']).optional(),
  payment_type: z.string().optional(),
  custom_field1: z.string().uuid().optional(), // optional org_id
  custom_field2: z.enum(['starter', 'pro']).optional(), // optional tier
})

/**
 * Midtrans Webhook Notification Handler
 * Memverifikasi SHA-512 signature_key resmi Midtrans dengan constant-time comparison
 * untuk mencegah pemalsuan status pembayaran (webhook spoofing).
 */
export async function POST(request: NextRequest) {
  const serverKey = process.env.MIDTRANS_SERVER_KEY
  if (!serverKey) {
    return NextResponse.json(
      { error: 'MIDTRANS_SERVER_KEY belum dikonfigurasi pada server.' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } }
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'Payload JSON tidak valid.' },
      { status: 400, headers: { 'Cache-Control': 'no-store' } }
    )
  }

  const parsed = midtransNotificationSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Format notifikasi Midtrans tidak valid.' },
      { status: 400, headers: { 'Cache-Control': 'no-store' } }
    )
  }

  const {
    order_id,
    status_code,
    gross_amount,
    signature_key,
    transaction_status,
    fraud_status,
    custom_field1,
    custom_field2,
  } = parsed.data

  // Compute expected SHA-512(order_id + status_code + gross_amount + ServerKey)
  const expectedHash = crypto
    .createHash('sha512')
    .update(`${order_id}${status_code}${gross_amount}${serverKey}`)
    .digest('hex')

  const receivedBuf = Buffer.from(signature_key.toLowerCase(), 'utf8')
  const expectedBuf = Buffer.from(expectedHash.toLowerCase(), 'utf8')

  if (
    receivedBuf.length !== expectedBuf.length ||
    !crypto.timingSafeEqual(receivedBuf, expectedBuf)
  ) {
    return NextResponse.json(
      { error: 'Verifikasi tanda tangan kriptografi (signature_key) gagal.' },
      { status: 401, headers: { 'Cache-Control': 'no-store' } }
    )
  }

  const isPaid =
    transaction_status === 'settlement' ||
    (transaction_status === 'capture' && (!fraud_status || fraud_status === 'accept'))

  if (isPaid && custom_field1) {
    try {
      const admin = getSupabaseAdmin()
      const tier = normalizeTierId(custom_field2 || (order_id.includes('-STR-') ? 'starter' : 'pro'))
      await admin
        .from('organizations')
        .update({ subscription_tier: tier })
        .eq('id', custom_field1)
    } catch (err) {
      console.error('Failed to update organization subscription via Midtrans webhook:', err)
      return NextResponse.json(
        { error: 'Gagal memperbarui status langganan organisasi.' },
        { status: 500, headers: { 'Cache-Control': 'no-store' } }
      )
    }
  }

  return NextResponse.json(
    { status: 'ok', order_id, paid: isPaid },
    { status: 200, headers: { 'Cache-Control': 'no-store' } }
  )
}
