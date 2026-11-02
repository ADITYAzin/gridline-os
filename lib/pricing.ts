export type SubscriptionTierId = 'starter' | 'pro'
export type BillingMonths = 1 | 3 | 6 | 12

export interface ExtensionPeriodOption {
  months: BillingMonths
  title: string
  shortLabel: string
  billingSubtext: string
  pricePerMonth: number
  normalTotalPrice: number
  totalPrice: number
  discountPercent: number
  discountAmount: number
  badge?: string
  isPopular?: boolean
}

export interface PlanCatalogItem {
  id: SubscriptionTierId
  name: string
  badge: string
  tagline: string
  capacityLabel: string
  technicianQuota: number
  adminQuota: number
  ownerQuota: number
  photoLimitPerJob: number
  monthlyRate: number
  annualRate: number
  isPopular?: boolean
  includedFeatures: string[]
  excludedFeatures?: string[]
}

/**
 * Single Source of Truth untuk harga paket langganan Opilines / Gridline OS (IDR).
 * Digunakan secara konsisten di:
 * - Halaman Pricing Utama (/pricing)
 * - Halaman Checkout Midtrans (/checkout)
 * - Pengaturan Admin > Tab Paket & Langganan (SubscriptionTab & ExtendSubscriptionDialog)
 * - Server API Validasi Pembayaran Midtrans (/api/payment/checkout)
 */
export const TIER_PRICING: Record<SubscriptionTierId, { monthly: number; annual: number }> = {
  starter: { monthly: 299000, annual: 249000 },
  pro: { monthly: 699000, annual: 599000 },
}

export const PLAN_CATALOG: Record<SubscriptionTierId, PlanCatalogItem> = {
  starter: {
    id: 'starter',
    name: 'Starter',
    badge: 'Skala Kecil',
    tagline: 'Untuk bengkel servis atau usaha jasa teknis pemula.',
    capacityLabel: '5 Teknisi & 1 Admin',
    technicianQuota: 5,
    adminQuota: 1,
    ownerQuota: 0,
    photoLimitPerJob: 5,
    monthlyRate: TIER_PRICING.starter.monthly,
    annualRate: TIER_PRICING.starter.annual,
    includedFeatures: [
      'Akses 5 Teknisi Lapangan dan 1 Akun Admin',
      'Manajemen tiket kerja (Work Order) tanpa batas',
      'Presensi kehadiran teknisi berbasis GPS & Foto Selfie',
      'Checklist SOP operasional standar bawaan',
      'Dokumentasi bukti kerja (hingga 5 Foto per tiket)',
      'BAP digital & tanda tangan digital pelanggan',
      'Riwayat servis kontak pelanggan & monitoring SLA',
    ],
    excludedFeatures: [
      'Peta pemantauan lokasi teknisi (Live Map)',
      'Manajemen cuti & perizinan presensi',
      'Custom SOP Builder (Buat checklist bebas)',
      'Riwayat servis unit aset pelanggan (No. Seri / Mesin)',
      'Pesan kabar pelanggan via WhatsApp (1-Klik)',
      'Manajemen & kalkulasi komisi teknisi otomatis',
    ],
  },
  pro: {
    id: 'pro',
    name: 'Professional',
    badge: 'Paling Direkomendasikan',
    tagline: 'Pilihan utama perusahaan jasa dengan tim armada hingga 12 teknisi.',
    capacityLabel: '12 Teknisi, 1 Admin & 1 Owner',
    technicianQuota: 12,
    adminQuota: 1,
    ownerQuota: 1,
    photoLimitPerJob: 10,
    monthlyRate: TIER_PRICING.pro.monthly,
    annualRate: TIER_PRICING.pro.annual,
    isPopular: true,
    includedFeatures: [
      'Akses 12 Teknisi Lapangan, 1 Admin, & 1 Owner',
      'Manajemen tiket kerja (Work Order) tanpa batas',
      'Presensi kehadiran (Selfie + GPS) & perizinan cuti',
      'Peta pemantauan lokasi teknisi real-time (Live Map)',
      'Custom SOP Builder (Bebas buat checklist per servis)',
      'Dokumentasi bukti kerja hingga 10 Foto per tiket',
      'BAP digital & tanda tangan digital pelanggan',
      'Riwayat servis unit aset pelanggan (No. Seri / Mesin)',
      'Monitoring SLA & performa tim teknisi',
      'Pesan kabar WhatsApp ke pelanggan (1-Klik)',
      'Manajemen komisi teknisi & kalkulasi otomatis',
    ],
  },
}

export function normalizeTierId(tier?: string | null): SubscriptionTierId {
  if (!tier) return 'pro'
  const cleaned = tier.toLowerCase().trim()
  if (cleaned === 'starter') return 'starter'
  return 'pro'
}

export function normalizeBillingMonths(months?: number | string | null): BillingMonths {
  const num = Number(months)
  if (num === 1 || num === 3 || num === 6 || num === 12) {
    return num
  }
  return 12
}

export function getPeriodOptions(tier: string): ExtensionPeriodOption[] {
  const normalizedTier = normalizeTierId(tier)
  const rates = TIER_PRICING[normalizedTier]

  const oneMo = rates.monthly
  const threeMoRate = Math.round(rates.monthly * 0.95)
  const sixMoRate = Math.round(rates.monthly * 0.9)
  const twelveMoRate = rates.annual

  return [
    {
      months: 1,
      title: '1 Bulan',
      shortLabel: 'Bulanan',
      billingSubtext: 'Ditagih per bulan',
      pricePerMonth: oneMo,
      normalTotalPrice: oneMo,
      totalPrice: oneMo,
      discountPercent: 0,
      discountAmount: 0,
    },
    {
      months: 3,
      title: '3 Bulan',
      shortLabel: '3 Bulan',
      billingSubtext: 'Ditagih per 3 bulan',
      pricePerMonth: threeMoRate,
      normalTotalPrice: rates.monthly * 3,
      totalPrice: threeMoRate * 3,
      discountPercent: 5,
      discountAmount: rates.monthly * 3 - threeMoRate * 3,
      badge: 'Hemat 5%',
    },
    {
      months: 6,
      title: '6 Bulan',
      shortLabel: '6 Bulan',
      billingSubtext: 'Ditagih per 6 bulan',
      pricePerMonth: sixMoRate,
      normalTotalPrice: rates.monthly * 6,
      totalPrice: sixMoRate * 6,
      discountPercent: 10,
      discountAmount: rates.monthly * 6 - sixMoRate * 6,
      badge: 'Hemat 10%',
    },
    {
      months: 12,
      title: '12 Bulan',
      shortLabel: 'Tahunan',
      billingSubtext: 'Ditagih tahunan (12 bulan)',
      pricePerMonth: twelveMoRate,
      normalTotalPrice: rates.monthly * 12,
      totalPrice: twelveMoRate * 12,
      discountPercent: 20,
      discountAmount: rates.monthly * 12 - twelveMoRate * 12,
      badge: 'Hemat 20%',
      isPopular: true,
    },
  ]
}

export function getPeriodOption(tier: string, months: number): ExtensionPeriodOption {
  const options = getPeriodOptions(tier)
  const validMonths = normalizeBillingMonths(months)
  return options.find((opt) => opt.months === validMonths) || options[3]
}

/**
 * Format angka ke mata uang resmi Republik Indonesia (IDR), contoh: "Rp 249.000"
 */
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Format angka ke format ribuan Indonesia tanpa simbol Rp, contoh: "249.000"
 */
export function formatNumberID(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    maximumFractionDigits: 0,
  }).format(amount)
}

export type MidtransPaymentMethodId =
  | 'bca_va'
  | 'mandiri_va'
  | 'bni_va'
  | 'bri_va'
  | 'qris'
  | 'gopay'
  | 'credit_card'

export interface PaymentMethodOption {
  id: MidtransPaymentMethodId
  label: string
  shortLabel: string
  category: 'Virtual Account (Transfer Bank)' | 'QRIS & E-Wallet' | 'Kartu Kredit / Debit'
  description: string
  midtransEnabledPayments: string[]
}

export const MIDTRANS_PAYMENT_METHODS: PaymentMethodOption[] = [
  {
    id: 'bca_va',
    label: 'BCA Virtual Account',
    shortLabel: 'BCA VA',
    category: 'Virtual Account (Transfer Bank)',
    description: 'Verifikasi otomatis via m-BCA, KlikBCA, atau ATM BCA',
    midtransEnabledPayments: ['bca_va'],
  },
  {
    id: 'mandiri_va',
    label: 'Mandiri Virtual Account',
    shortLabel: 'Mandiri VA',
    category: 'Virtual Account (Transfer Bank)',
    description: 'Verifikasi otomatis via Livin’ by Mandiri, MCM, atau ATM',
    midtransEnabledPayments: ['echannel'],
  },
  {
    id: 'bni_va',
    label: 'BNI Virtual Account',
    shortLabel: 'BNI VA',
    category: 'Virtual Account (Transfer Bank)',
    description: 'Verifikasi otomatis via Wondr / BNI Mobile Banking & ATM',
    midtransEnabledPayments: ['bni_va'],
  },
  {
    id: 'bri_va',
    label: 'BRI Virtual Account',
    shortLabel: 'BRI VA',
    category: 'Virtual Account (Transfer Bank)',
    description: 'Verifikasi otomatis via BRImo, Internet Banking, atau ATM',
    midtransEnabledPayments: ['bri_va'],
  },
  {
    id: 'qris',
    label: 'QRIS (Semua Aplikasi)',
    shortLabel: 'QRIS',
    category: 'QRIS & E-Wallet',
    description: 'Scan QR dari BCA Mobile, Livin, GoPay, OVO, DANA, ShopeePay',
    midtransEnabledPayments: ['other_qris', 'gopay'],
  },
  {
    id: 'gopay',
    label: 'GoPay / GoPay Later',
    shortLabel: 'GoPay',
    category: 'QRIS & E-Wallet',
    description: 'Pembayaran instan terhubung langsung ke aplikasi Gojek',
    midtransEnabledPayments: ['gopay'],
  },
  {
    id: 'credit_card',
    label: 'Kartu Kredit / Debit Online',
    shortLabel: 'Kartu Kredit',
    category: 'Kartu Kredit / Debit',
    description: 'Visa, Mastercard, JCB dengan proteksi 3D Secure 2.0',
    midtransEnabledPayments: ['credit_card'],
  },
]
