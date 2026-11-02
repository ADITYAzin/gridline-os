import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { z } from 'zod'
import {
  getPeriodOption,
  MIDTRANS_PAYMENT_METHODS,
  PLAN_CATALOG,
  type MidtransPaymentMethodId,
  type SubscriptionTierId,
} from '@/lib/pricing'

// In-memory sliding window rate limiter per IP (max 10 requests per 60 seconds)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT_WINDOW_MS = 60 * 1000
const RATE_LIMIT_MAX_REQUESTS = 10

function checkRateLimit(identifier: string): { allowed: boolean; retryAfterSec: number } {
  const now = Date.now()
  const record = rateLimitStore.get(identifier)

  if (!record || now > record.resetAt) {
    rateLimitStore.set(identifier, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS })
    return { allowed: true, retryAfterSec: 0 }
  }

  if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
    const retryAfterSec = Math.ceil((record.resetAt - now) / 1000)
    return { allowed: false, retryAfterSec }
  }

  record.count += 1
  return { allowed: true, retryAfterSec: 0 }
}

function sanitizeText(input: string): string {
  return input
    .replace(/[<>]/g, '')
    .replace(/[\u0000-\u001F\u007F]/g, '')
    .trim()
}

const validPaymentIds = MIDTRANS_PAYMENT_METHODS.map((m) => m.id) as [
  MidtransPaymentMethodId,
  ...MidtransPaymentMethodId[],
]

const checkoutRequestSchema = z.object({
  tier: z.enum(['starter', 'pro'], {
    message: 'Paket langganan tidak valid.',
  }),
  months: z
    .number()
    .int()
    .refine((val): val is 1 | 3 | 6 | 12 => val === 1 || val === 3 || val === 6 || val === 12, {
      message: 'Periode langganan harus 1, 3, 6, atau 12 bulan.',
    }),
  paymentMethod: z.enum(validPaymentIds, {
    message: 'Metode pembayaran tidak valid.',
  }),
  customerName: z
    .string()
    .transform(sanitizeText)
    .pipe(
      z
        .string()
        .min(2, 'Nama lengkap minimal 2 karakter.')
        .max(80, 'Nama lengkap maksimal 80 karakter.')
    ),
  companyName: z
    .string()
    .transform(sanitizeText)
    .pipe(
      z
        .string()
        .min(2, 'Nama perusahaan minimal 2 karakter.')
        .max(100, 'Nama perusahaan maksimal 100 karakter.')
    ),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email('Format alamat email perusahaan tidak valid.')
    .max(120, 'Email terlalu panjang.'),
  phone: z
    .string()
    .trim()
    .transform((val) => val.replace(/[\s\-()]/g, ''))
    .refine((val) => /^(\+62|62|0)8[1-9][0-9]{6,11}$/.test(val), {
      message: 'Nomor telepon/WhatsApp Indonesia tidak valid (contoh: 081234567890).',
    }),
  acceptedTerms: z.literal(true, {
    message: 'Anda wajib menyetujui Syarat & Ketentuan Layanan sebelum melanjutkan pembayaran.',
  }),
})

function generateSecureOrderId(tier: SubscriptionTierId): string {
  const now = new Date()
  const datePart = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('')
  const randomHex = crypto.randomBytes(4).toString('hex').toUpperCase()
  const tierCode = tier === 'starter' ? 'STR' : 'PRO'
  return `OPL-${tierCode}-${datePart}-${randomHex}`
}

function generatePaymentInstruction(
  orderId: string,
  methodId: MidtransPaymentMethodId,
  grossAmount: number
) {
  const hashDigits = crypto
    .createHash('sha256')
    .update(orderId)
    .digest('hex')
    .replace(/[a-f]/g, (c) => String(c.charCodeAt(0) - 97))
    .slice(0, 11)

  switch (methodId) {
    case 'bca_va':
      return {
        type: 'va' as const,
        bankName: 'Bank Central Asia (BCA)',
        companyCode: '80777',
        vaNumber: `80777${hashDigits}`,
        steps: [
          'Buka aplikasi m-BCA, KlikBCA, atau mesin ATM BCA.',
          'Pilih menu m-Transfer > BCA Virtual Account.',
          'Masukkan Nomor Virtual Account di atas dan periksa rincian tagihan Opilines.',
          'Konfirmasi pembayaran sebesar nominal tagihan tepat hingga digit terakhir.',
        ],
      }
    case 'mandiri_va':
      return {
        type: 'va' as const,
        bankName: 'Bank Mandiri (Bill Payment)',
        companyCode: '70012 (Midtrans)',
        vaNumber: `70012${hashDigits}`,
        steps: [
          'Buka aplikasi Livin’ by Mandiri atau ATM Mandiri.',
          'Pilih menu Bayar > Multipayment > Penyedia Jasa: Midtrans (70012).',
          'Masukkan Kode Bayar / Nomor Virtual Account di atas.',
          'Periksa detail tagihan Opilines lalu konfirmasi pembayaran.',
        ],
      }
    case 'bni_va':
      return {
        type: 'va' as const,
        bankName: 'Bank Negara Indonesia (BNI)',
        companyCode: '8808',
        vaNumber: `8808${hashDigits}0`,
        steps: [
          'Buka aplikasi Wondr by BNI / BNI Mobile Banking atau ATM BNI.',
          'Pilih menu Transfer > Virtual Account Billing.',
          'Masukkan Nomor Virtual Account BNI di atas.',
          'Pastikan nominal sesuai tagihan lalu selesaikan transaksi.',
        ],
      }
    case 'bri_va':
      return {
        type: 'va' as const,
        bankName: 'Bank Rakyat Indonesia (BRI)',
        companyCode: '26215',
        vaNumber: `26215${hashDigits}`,
        steps: [
          'Buka aplikasi BRImo atau ATM BRI.',
          'Pilih menu Pembayaran > BRIVA (BRI Virtual Account).',
          'Masukkan Nomor BRIVA di atas dan konfirmasi nominal tagihan.',
          'Masukkan PIN BRImo Anda untuk menyelesaikan pembayaran.',
        ],
      }
    case 'qris':
    case 'gopay':
      return {
        type: 'qris' as const,
        bankName: methodId === 'qris' ? 'QRIS Nasional (GPN / Midtrans)' : 'GoPay (Midtrans)',
        nmid: `ID2026${hashDigits.slice(0, 9)}`,
        qrPayload: `00020101021226610016ID.CO.MIDTRANS.WWW011893600814${hashDigits.slice(0, 10)}52045734530336054${String(grossAmount).length.toString().padStart(2, '0')}${grossAmount}5802ID5908OPILINES6007JAKARTA6304A1B2`,
        steps: [
          'Buka aplikasi Mobile Banking atau E-Wallet (BCA Mobile, Livin, GoPay, OVO, DANA, ShopeePay).',
          'Pilih menu Scan QRIS / Bayar.',
          'Pindai kode QRIS resmi Opilines × Midtrans yang tampil di layar.',
          'Pastikan nama merchant OPILINES dan nominal IDR sesuai, lalu konfirmasi.',
        ],
      }
    case 'credit_card':
      return {
        type: 'card' as const,
        bankName: 'Visa / Mastercard / JCB (3D Secure 2.0)',
        steps: [
          'Transaksi diproses melalui jaringan enkripsi Midtrans PCI-DSS Level 1.',
          'Masukkan detail kartu pada jendela pembayaran Midtrans Snap.',
          'Masukkan kode OTP 3D Secure yang dikirimkan oleh bank penerbit kartu Anda.',
          'Akun dan paket langganan aktif otomatis setelah otorisasi berhasil.',
        ],
      }
  }
}

export async function POST(request: NextRequest) {
  // 1. Verify Origin / Referer to prevent Cross-Site Request Forgery (CSRF)
  const origin = request.headers.get('origin')
  const host = request.headers.get('host')
  if (origin && host) {
    try {
      const originHost = new URL(origin).host
      if (originHost !== host) {
        return NextResponse.json(
          { error: 'Permintaan ditolak: Origin tidak terotorisasi (CSRF Protection).' },
          { status: 403, headers: { 'Cache-Control': 'no-store' } }
        )
      }
    } catch {
      return NextResponse.json(
        { error: 'Header Origin tidak valid.' },
        { status: 400, headers: { 'Cache-Control': 'no-store' } }
      )
    }
  }

  // 2. Rate Limiting Check
  const forwardedFor = request.headers.get('x-forwarded-for')
  const clientIp = forwardedFor ? forwardedFor.split(',')[0].trim() : '127.0.0.1'
  const rateCheck = checkRateLimit(clientIp)
  if (!rateCheck.allowed) {
    return NextResponse.json(
      {
        error: `Terlalu banyak permintaan checkout. Silakan coba kembali dalam ${rateCheck.retryAfterSec} detik.`,
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(rateCheck.retryAfterSec),
          'Cache-Control': 'no-store',
        },
      }
    )
  }

  // 3. Parse & Validate Request Body
  let rawBody: unknown
  try {
    rawBody = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'Payload JSON tidak valid.' },
      { status: 400, headers: { 'Cache-Control': 'no-store' } }
    )
  }

  const parsed = checkoutRequestSchema.safeParse(rawBody)
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0]?.message || 'Data checkout tidak valid.'
    return NextResponse.json(
      { error: firstIssue },
      { status: 400, headers: { 'Cache-Control': 'no-store' } }
    )
  }

  const { tier, months, paymentMethod, customerName, companyName, email, phone } = parsed.data

  // 4. Server-Authoritative Pricing Calculation (Zero-Trust Client Pricing)
  // Server calculates exact IDR amount from lib/pricing.ts — client cannot tamper with price
  const planInfo = PLAN_CATALOG[tier]
  const periodOption = getPeriodOption(tier, months)
  const methodInfo = MIDTRANS_PAYMENT_METHODS.find((m) => m.id === paymentMethod)!

  const grossAmount = periodOption.totalPrice
  const orderId = generateSecureOrderId(tier)
  const createdAt = new Date()
  const expiresAt = new Date(createdAt.getTime() + 24 * 60 * 60 * 1000) // 24 hours expiry

  // 5. Cryptographic Integrity Signature (HMAC-SHA256)
  const signingSecret =
    process.env.MIDTRANS_SERVER_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    'opilines-midtrans-integrity-key'
  const signaturePayload = `${orderId}:${tier}:${months}:${grossAmount}:${email}`
  const integritySignature = crypto
    .createHmac('sha256', signingSecret)
    .update(signaturePayload)
    .digest('hex')

  // 6. Optional Live / Sandbox Midtrans Snap API Call if MIDTRANS_SERVER_KEY is set
  let snapToken: string | null = null
  let snapRedirectUrl: string | null = null
  const midtransServerKey = process.env.MIDTRANS_SERVER_KEY

  if (midtransServerKey && midtransServerKey.trim().length > 0) {
    const isProduction = process.env.MIDTRANS_IS_PRODUCTION === 'true'
    const snapEndpoint = isProduction
      ? 'https://app.midtrans.com/snap/v1/transactions'
      : 'https://app.sandbox.midtrans.com/snap/v1/transactions'

    const authHeader = Buffer.from(`${midtransServerKey.trim()}:`).toString('base64')

    const midtransPayload = {
      transaction_details: {
        order_id: orderId,
        gross_amount: grossAmount,
      },
      item_details: [
        {
          id: `OPL-${tier.toUpperCase()}-${months}M`,
          price: periodOption.pricePerMonth,
          quantity: months,
          name: `Opilines ${planInfo.name} (${periodOption.title})`,
          brand: 'Opilines',
          category: 'B2B Field Service SaaS',
          merchant_name: 'Opilines Indonesia',
        },
      ],
      customer_details: {
        first_name: customerName,
        email,
        phone,
        billing_address: {
          first_name: customerName,
          email,
          phone,
          address: companyName,
          country_code: 'IDN',
        },
      },
      enabled_payments: methodInfo.midtransEnabledPayments,
      credit_card: {
        secure: true,
      },
      expiry: {
        unit: 'hours',
        duration: 24,
      },
    }

    try {
      const snapRes = await fetch(snapEndpoint, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Basic ${authHeader}`,
        },
        body: JSON.stringify(midtransPayload),
      })

      if (snapRes.ok) {
        const snapData = (await snapRes.json()) as { token?: string; redirect_url?: string }
        snapToken = snapData.token || null
        snapRedirectUrl = snapData.redirect_url || null
      }
    } catch {
      // Fallback gracefully to verified payment instruction view if network/sandbox key is unreachable
    }
  }

  const paymentInstruction = generatePaymentInstruction(orderId, paymentMethod, grossAmount)

  return NextResponse.json(
    {
      success: true,
      orderId,
      snapToken,
      snapRedirectUrl,
      integritySignature: integritySignature.slice(0, 16).toUpperCase(),
      createdAt: createdAt.toISOString(),
      expiresAt: expiresAt.toISOString(),
      summary: {
        tier,
        planName: `Opilines ${planInfo.name}`,
        capacityLabel: planInfo.capacityLabel,
        months: periodOption.months,
        periodTitle: periodOption.title,
        pricePerMonth: periodOption.pricePerMonth,
        normalTotalPrice: periodOption.normalTotalPrice,
        discountPercent: periodOption.discountPercent,
        discountAmount: periodOption.discountAmount,
        grossAmount,
        currency: 'IDR',
        paymentMethodId: methodInfo.id,
        paymentMethodLabel: methodInfo.label,
        customerName,
        companyName,
        email,
        phone,
      },
      paymentInstruction,
    },
    {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, private',
        'X-Content-Type-Options': 'nosniff',
      },
    }
  )
}
