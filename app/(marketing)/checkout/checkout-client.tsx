'use client'

import * as React from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
  ShieldCheck,
  Lock,
  CreditCard,
  Building2,
  User,
  Mail,
  Phone,
  Check,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  Loader2,
  Copy,
  QrCode,
  Sparkles,
  AlertCircle,
  Clock,
  FileText,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  PLAN_CATALOG,
  MIDTRANS_PAYMENT_METHODS,
  getPeriodOptions,
  getPeriodOption,
  formatRupiah,
  normalizeTierId,
  normalizeBillingMonths,
  type SubscriptionTierId,
  type BillingMonths,
  type MidtransPaymentMethodId,
} from '@/lib/pricing'

interface CheckoutApiResponse {
  success: boolean
  error?: string
  orderId: string
  snapToken: string | null
  snapRedirectUrl: string | null
  integritySignature: string
  createdAt: string
  expiresAt: string
  summary: {
    tier: SubscriptionTierId
    planName: string
    capacityLabel: string
    months: BillingMonths
    periodTitle: string
    pricePerMonth: number
    normalTotalPrice: number
    discountPercent: number
    discountAmount: number
    grossAmount: number
    currency: string
    paymentMethodId: MidtransPaymentMethodId
    paymentMethodLabel: string
    customerName: string
    companyName: string
    email: string
    phone: string
  }
  paymentInstruction: {
    type: 'va' | 'qris' | 'card'
    bankName: string
    companyCode?: string
    vaNumber?: string
    nmid?: string
    qrPayload?: string
    steps: string[]
  }
}

export function CheckoutClient() {
  const searchParams = useSearchParams()

  const initialPlan = normalizeTierId(searchParams.get('plan'))
  const initialMonths = normalizeBillingMonths(searchParams.get('months'))

  const [tierOverride, setTierOverride] = React.useState<SubscriptionTierId | null>(null)
  const [monthsOverride, setMonthsOverride] = React.useState<BillingMonths | null>(null)
  const selectedTier = tierOverride ?? initialPlan
  const selectedMonths = monthsOverride ?? initialMonths
  const setSelectedTier = setTierOverride
  const setSelectedMonths = setMonthsOverride
  const [paymentMethod, setPaymentMethod] = React.useState<MidtransPaymentMethodId>('bca_va')

  const [customerName, setCustomerName] = React.useState('')
  const [companyName, setCompanyName] = React.useState('')
  const [email, setEmail] = React.useState('')
  const [phone, setPhone] = React.useState('')
  const [acceptedTerms, setAcceptedTerms] = React.useState(false)

  const [errorMsg, setErrorMsg] = React.useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [checkoutResult, setCheckoutResult] = React.useState<CheckoutApiResponse | null>(null)
  const [copiedField, setCopiedField] = React.useState<string | null>(null)

  const plan = PLAN_CATALOG[selectedTier]
  const periodOptions = React.useMemo(() => getPeriodOptions(selectedTier), [selectedTier])
  const activePeriod = React.useMemo(
    () => getPeriodOption(selectedTier, selectedMonths),
    [selectedTier, selectedMonths]
  )
  const selectedMethodObj = React.useMemo(
    () => MIDTRANS_PAYMENT_METHODS.find((m) => m.id === paymentMethod) || MIDTRANS_PAYMENT_METHODS[0],
    [paymentMethod]
  )

  const handleCopy = (value: string, label: string) => {
    navigator.clipboard.writeText(value)
    setCopiedField(label)
    toast.success(`${label} berhasil disalin`)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const handleSubmitCheckout = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrorMsg(null)

    if (!acceptedTerms) {
      const msg = 'Harap centang persetujuan Syarat & Ketentuan Layanan sebelum melanjutkan pembayaran.'
      setErrorMsg(msg)
      toast.error(msg)
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/payment/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tier: selectedTier,
          months: selectedMonths,
          paymentMethod,
          customerName,
          companyName,
          email,
          phone,
          acceptedTerms,
        }),
      })

      const data = (await res.json()) as CheckoutApiResponse
      if (!res.ok || !data.success) {
        const errText = data.error || 'Gagal membuat sesi pembayaran Midtrans.'
        setErrorMsg(errText)
        toast.error(errText)
        return
      }

      setCheckoutResult(data)
      toast.success(`Order ${data.orderId} berhasil dibuat melalui Midtrans.`)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch {
      const errText = 'Terjadi gangguan jaringan saat menghubungi server pembayaran.'
      setErrorMsg(errText)
      toast.error(errText)
    } finally {
      setIsSubmitting(false)
    }
  }

  // ============================================================================
  // VIEW 2: PAYMENT INSTRUCTION / MIDTRANS SNAP ORDER CREATED
  // ============================================================================
  if (checkoutResult) {
    const { summary, paymentInstruction, orderId, integritySignature, expiresAt } = checkoutResult
    const expiryFormatted = new Date(expiresAt).toLocaleString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

    return (
      <div className="py-10 md:py-14">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 space-y-6">
          {/* Top Bar */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setCheckoutResult(null)}
              className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#475569] hover:text-[#0F172A] cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Ubah Metode atau Rincian Pesanan</span>
            </button>

            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-[11.5px] font-semibold text-emerald-700">
              <Lock className="h-3 w-3" />
              <span>Midtrans Secure Order</span>
            </span>
          </div>

          {/* Main Payment Card */}
          <div className="rounded-[16px] border border-[#E2E8F0] bg-[#FFFFFF] overflow-hidden shadow-xs">
            {/* Blue Header */}
            <div className="bg-gradient-to-r from-[#0062A3] via-[#007ACC] to-[#0088E0] p-6 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider bg-white/15 px-2.5 py-0.5 rounded-full">
                    Menunggu Pembayaran
                  </span>
                  <span className="font-mono text-[12px] text-white/90">{orderId}</span>
                </div>
                <h1 className="font-heading text-[20px] sm:text-[22px] font-bold">
                  {summary.planName} — {summary.periodTitle}
                </h1>
                <p className="text-[12.5px] text-white/85">
                  Pemesan: {summary.customerName} ({summary.companyName})
                </p>
              </div>

              <div className="sm:text-right bg-black/15 border border-white/15 rounded-[10px] px-4 py-2.5">
                <span className="text-[11px] text-white/80 block">Total Tagihan (IDR)</span>
                <span className="font-heading text-[22px] font-bold text-white">
                  {formatRupiah(summary.grossAmount)}
                </span>
              </div>
            </div>

            <div className="p-6 sm:p-7 space-y-6">
              {/* Expiry Alert */}
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-[10px] bg-amber-50/90 border border-amber-200/80 px-4 py-3 text-[12.5px] text-amber-900">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-amber-600 shrink-0" />
                  <span>Selesaikan pembayaran sebelum batas waktu:</span>
                </div>
                <strong className="font-semibold">{expiryFormatted} WIB</strong>
              </div>

              {/* Payment Channel Details */}
              <div className="rounded-[12px] border border-[#E2E8F0] bg-[#F8FAFC] p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B] block">
                      Saluran Pembayaran Midtrans
                    </span>
                    <h2 className="font-heading text-[16px] font-bold text-[#0F172A]">
                      {paymentInstruction.bankName}
                    </h2>
                  </div>
                  <span className="text-[11.5px] font-semibold text-[#007ACC] bg-[#EBF5FC] border border-[#D0E8F8] px-2.5 py-1 rounded-md">
                    {summary.paymentMethodLabel}
                  </span>
                </div>

                {paymentInstruction.type === 'va' && paymentInstruction.vaNumber && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="rounded-[10px] bg-white border border-[#E2E8F0] p-3.5 flex items-center justify-between">
                      <div>
                        <span className="text-[11px] text-[#64748B] block">
                          Nomor Virtual Account
                        </span>
                        <span className="font-mono text-[17px] font-bold text-[#0F172A] tracking-wide">
                          {paymentInstruction.vaNumber}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          handleCopy(paymentInstruction.vaNumber!, 'Nomor Virtual Account')
                        }
                        className="h-8 px-3 rounded-[6px] border border-[#CBD5E1] bg-[#F8FAFC] hover:bg-[#EBF5FC] hover:border-[#007ACC] text-[12px] font-medium text-[#0F172A] flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        {copiedField === 'Nomor Virtual Account' ? (
                          <Check className="h-3.5 w-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="h-3.5 w-3.5 text-[#007ACC]" />
                        )}
                        <span>Salin</span>
                      </button>
                    </div>

                    <div className="rounded-[10px] bg-white border border-[#E2E8F0] p-3.5 flex items-center justify-between">
                      <div>
                        <span className="text-[11px] text-[#64748B] block">
                          Nominal Pembayaran (IDR)
                        </span>
                        <span className="font-heading text-[17px] font-bold text-[#007ACC]">
                          {formatRupiah(summary.grossAmount)}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          handleCopy(String(summary.grossAmount), 'Nominal Pembayaran')
                        }
                        className="h-8 px-3 rounded-[6px] border border-[#CBD5E1] bg-[#F8FAFC] hover:bg-[#EBF5FC] hover:border-[#007ACC] text-[12px] font-medium text-[#0F172A] flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        {copiedField === 'Nominal Pembayaran' ? (
                          <Check className="h-3.5 w-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="h-3.5 w-3.5 text-[#007ACC]" />
                        )}
                        <span>Salin</span>
                      </button>
                    </div>
                  </div>
                )}

                {paymentInstruction.type === 'qris' && (
                  <div className="flex flex-col sm:flex-row items-center gap-5 bg-white border border-[#E2E8F0] rounded-[10px] p-4">
                    <div className="h-36 w-36 rounded-[10px] border-2 border-[#0F172A] bg-[#F8FAFC] flex flex-col items-center justify-center p-3 shrink-0">
                      <QrCode className="h-24 w-24 text-[#0F172A]" />
                      <span className="text-[9px] font-mono font-bold text-[#475569] mt-1">
                        QRIS GPN • MIDTRANS
                      </span>
                    </div>
                    <div className="space-y-1.5 text-center sm:text-left">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#007ACC]">
                        Merchant Resmi: OPILINES INDONESIA
                      </span>
                      <p className="text-[13px] font-semibold text-[#0F172A]">
                        NMID: {paymentInstruction.nmid}
                      </p>
                      <p className="text-[12.5px] text-[#64748B]">
                        Pindai kode QR di samping menggunakan aplikasi m-Banking (BCA, Mandiri, BNI, BRI) atau E-Wallet (GoPay, OVO, DANA, ShopeePay).
                      </p>
                    </div>
                  </div>
                )}

                {paymentInstruction.type === 'card' && checkoutResult.snapRedirectUrl && (
                  <div className="p-4 rounded-[10px] bg-white border border-[#E2E8F0] flex items-center justify-between gap-4">
                    <p className="text-[13px] text-[#334155]">
                      Lanjutkan otorisasi kartu 3D Secure 2.0 melalui halaman aman Midtrans Snap.
                    </p>
                    <a
                      href={checkoutResult.snapRedirectUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-9 px-4 rounded-[8px] bg-[#007ACC] hover:bg-[#0062A3] text-white text-[12.5px] font-semibold inline-flex items-center gap-1.5 shrink-0"
                    >
                      <span>Buka Midtrans 3DS</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </a>
                  </div>
                )}

                {/* Steps */}
                <div className="space-y-2 pt-1">
                  <span className="text-[12px] font-semibold text-[#0F172A] block">
                    Panduan Penyelesaian Pembayaran:
                  </span>
                  <ol className="space-y-1.5 text-[12.5px] text-[#475569] list-decimal list-inside">
                    {paymentInstruction.steps.map((step, i) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ol>
                </div>
              </div>

              {/* Order Breakdown */}
              <div className="rounded-[12px] border border-[#E2E8F0] p-4 space-y-2 text-[12.5px]">
                <div className="flex items-center justify-between text-[#64748B]">
                  <span>Paket & Kapasitas</span>
                  <span className="font-medium text-[#0F172A]">
                    {summary.planName} ({summary.capacityLabel})
                  </span>
                </div>
                <div className="flex items-center justify-between text-[#64748B]">
                  <span>Siklus Berlangganan</span>
                  <span className="font-medium text-[#0F172A]">
                    {summary.periodTitle} ({formatRupiah(summary.pricePerMonth)} / bulan)
                  </span>
                </div>
                {summary.discountAmount > 0 && (
                  <div className="flex items-center justify-between text-emerald-600 font-medium">
                    <span>Hemat Periode ({summary.discountPercent}%)</span>
                    <span>-{formatRupiah(summary.discountAmount)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-[#64748B]">
                  <span>Email Penerima Faktur & Aktivasi</span>
                  <span className="font-medium text-[#0F172A]">{summary.email}</span>
                </div>
                <div className="pt-2 border-t border-[#F1F5F9] flex items-center justify-between">
                  <span className="font-semibold text-[#0F172A]">Total Dibayarkan (IDR)</span>
                  <span className="font-heading text-[16px] font-bold text-[#007ACC]">
                    {formatRupiah(summary.grossAmount)}
                  </span>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-[#F1F5F9]">
                <span className="text-[11px] font-mono text-[#94A3B8]">
                  SHA256 Checksum: {integritySignature}
                </span>
                <div className="flex items-center gap-2.5 w-full sm:w-auto">
                  <Link
                    href="/pricing"
                    className="flex-1 sm:flex-initial h-9 px-4 rounded-[8px] border border-[#CBD5E1] bg-white hover:bg-[#F8FAFC] text-[#334155] text-[12.5px] font-medium flex items-center justify-center"
                  >
                    Kembali ke Harga
                  </Link>
                  <Link
                    href={`/register?plan=${summary.tier}`}
                    className="flex-1 sm:flex-initial h-9 px-4 rounded-[8px] bg-[#007ACC] hover:bg-[#0062A3] text-white text-[12.5px] font-semibold flex items-center justify-center gap-1.5"
                  >
                    <span>Lanjut ke Aktivasi Akun</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ============================================================================
  // VIEW 1: CHECKOUT FORM & ORDER SUMMARY
  // ============================================================================
  return (
    <div className="py-10 md:py-14">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top Navigation & Security Kicker */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-5">
          <div className="space-y-1">
            <Link
              href="/pricing"
              className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-[#007ACC] hover:text-[#0062A3] mb-1"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Kembali ke Daftar Paket Harga</span>
            </Link>
            <h1 className="font-heading text-[24px] sm:text-[30px] font-bold text-[#0F172A] tracking-tight">
              Checkout Berlangganan Opilines
            </h1>
            <p className="text-[13.5px] text-[#64748B]">
              Pilih durasi paket dan selesaikan pembayaran resmi dalam mata uang Rupiah (IDR).
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-[10px] border border-[#D0E8F8] bg-[#EBF5FC]/70 px-3.5 py-2 text-[12px] text-[#0F172A]">
            <ShieldCheck className="h-4 w-4 text-[#007ACC] shrink-0" />
            <div>
              <span className="font-semibold block leading-tight">Midtrans Secure Checkout</span>
              <span className="text-[11px] text-[#475569]">Enkripsi TLS 256-Bit & PCI-DSS Level 1</span>
            </div>
          </div>
        </div>

        {/* Main 2-Column Checkout Form */}
        <form onSubmit={handleSubmitCheckout} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Steps 1, 2, 3 */}
          <div className="lg:col-span-7 space-y-6">
            {errorMsg && (
              <div className="rounded-[10px] border border-red-200 bg-red-50 p-3.5 flex items-start gap-2.5 text-[13px] text-red-700 font-medium">
                <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* STEP 1: Pilih Paket & Siklus Tagihan (Sama persis dengan Pengaturan Admin > Tab Langganan) */}
            <div className="rounded-[14px] border border-[#E2E8F0] bg-[#FFFFFF] p-5 sm:p-6 space-y-5 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="h-6 w-6 rounded-full bg-[#007ACC] text-white text-[12px] font-bold flex items-center justify-center">
                    1
                  </span>
                  <h2 className="font-heading text-[16px] font-bold text-[#0F172A]">
                    Pilih Paket & Periode Langganan
                  </h2>
                </div>
                <span className="text-[11.5px] font-medium text-[#64748B]">Mata Uang: IDR (Rp)</span>
              </div>

              {/* Tier Toggle (Starter vs Professional) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(['starter', 'pro'] as const).map((tierKey) => {
                  const item = PLAN_CATALOG[tierKey]
                  const isSelected = selectedTier === tierKey
                  const itemPeriod = getPeriodOption(tierKey, selectedMonths)
                  return (
                    <button
                      key={tierKey}
                      type="button"
                      onClick={() => setSelectedTier(tierKey)}
                      className={`text-left p-4 rounded-[12px] border-2 transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                        isSelected
                          ? 'border-[#007ACC] bg-[#EBF5FC]/35 shadow-xs'
                          : 'border-[#E2E8F0] bg-white hover:border-[#CBD5E1]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-heading text-[15px] font-bold text-[#0F172A]">
                          Paket {item.name}
                        </span>
                        {item.isPopular ? (
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-[#007ACC] text-white px-2 py-0.5 rounded-full">
                            Populer
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold text-[#64748B] border border-[#E2E8F0] px-2 py-0.5 rounded-full">
                            {item.badge}
                          </span>
                        )}
                      </div>

                      <p className="text-[12px] text-[#475569]">{item.capacityLabel}</p>

                      <div className="pt-2 border-t border-[#E2E8F0]/80 flex items-baseline justify-between">
                        <span className="font-heading text-[15px] font-bold text-[#007ACC]">
                          {formatRupiah(itemPeriod.pricePerMonth)}
                          <span className="text-[11px] font-normal text-[#64748B]">/bln</span>
                        </span>
                        <span
                          className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                            isSelected
                              ? 'border-[#007ACC] bg-[#007ACC] text-white'
                              : 'border-[#CBD5E1]'
                          }`}
                        >
                          {isSelected && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>

              {/* Period Selector (1, 3, 6, 12 Bulan - Identik dengan ExtendSubscriptionDialog Admin) */}
              <div className="space-y-2">
                <label className="text-[12.5px] font-semibold text-[#0F172A] block">
                  Durasi Berlangganan:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {periodOptions.map((opt) => {
                    const isSelected = selectedMonths === opt.months
                    return (
                      <button
                        key={opt.months}
                        type="button"
                        onClick={() => setSelectedMonths(opt.months)}
                        className={`relative p-3 rounded-[10px] border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'border-[#007ACC] bg-[#EBF5FC]/40 shadow-xs'
                            : 'border-[#E2E8F0] bg-white hover:border-[#CBD5E1]'
                        }`}
                      >
                        {opt.isPopular && (
                          <span className="absolute -top-2 right-2 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-[#007ACC] text-white">
                            Rekomendasi
                          </span>
                        )}
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-bold text-[12.5px] text-[#0F172A]">
                            {opt.title}
                          </span>
                          {opt.badge && (
                            <span className="text-[9.5px] font-semibold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-700">
                              {opt.badge}
                            </span>
                          )}
                        </div>
                        <div className="pt-2 mt-2 border-t border-[#E2E8F0]/70">
                          <span className="text-[10.5px] text-[#64748B] block">
                            {formatRupiah(opt.pricePerMonth)}/bln
                          </span>
                          <span className="text-[12px] font-bold text-[#007ACC] block">
                            {formatRupiah(opt.totalPrice)}
                          </span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* STEP 2: Informasi Pemesan & Perusahaan */}
            <div className="rounded-[14px] border border-[#E2E8F0] bg-[#FFFFFF] p-5 sm:p-6 space-y-4 shadow-xs">
              <div className="flex items-center gap-2.5">
                <span className="h-6 w-6 rounded-full bg-[#007ACC] text-white text-[12px] font-bold flex items-center justify-center">
                  2
                </span>
                <div>
                  <h2 className="font-heading text-[16px] font-bold text-[#0F172A]">
                    Data Pemesan & Organisasi
                  </h2>
                  <p className="text-[12px] text-[#64748B]">
                    Digunakan untuk penerbitan faktur resmi (invoice) dan aktivasi lisensi organisasi.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div className="space-y-1.5">
                  <label
                    htmlFor="checkout-name"
                    className="block text-[12px] font-medium text-[#334155]"
                  >
                    Nama Lengkap Penanggung Jawab *
                  </label>
                  <div className="relative">
                    <User className="h-4 w-4 text-[#94A3B8] absolute left-3 top-3 pointer-events-none" />
                    <input
                      id="checkout-name"
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Budi Santoso"
                      className="w-full h-10 rounded-[8px] border border-[#E2E8F0] bg-white pl-9 pr-3 text-[13.5px] text-[#0F172A] placeholder:text-[#94A3B8] focus:border-[#007ACC] focus:ring-3 focus:ring-[#007ACC]/15 outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="checkout-company"
                    className="block text-[12px] font-medium text-[#334155]"
                  >
                    Nama Perusahaan / Usaha *
                  </label>
                  <div className="relative">
                    <Building2 className="h-4 w-4 text-[#94A3B8] absolute left-3 top-3 pointer-events-none" />
                    <input
                      id="checkout-company"
                      type="text"
                      required
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="PT Teknik Mandiri Sejahtera"
                      className="w-full h-10 rounded-[8px] border border-[#E2E8F0] bg-white pl-9 pr-3 text-[13.5px] text-[#0F172A] placeholder:text-[#94A3B8] focus:border-[#007ACC] focus:ring-3 focus:ring-[#007ACC]/15 outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="checkout-email"
                    className="block text-[12px] font-medium text-[#334155]"
                  >
                    Email Resmi (Untuk Faktur & Akun) *
                  </label>
                  <div className="relative">
                    <Mail className="h-4 w-4 text-[#94A3B8] absolute left-3 top-3 pointer-events-none" />
                    <input
                      id="checkout-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="finance@teknikmandiri.co.id"
                      className="w-full h-10 rounded-[8px] border border-[#E2E8F0] bg-white pl-9 pr-3 text-[13.5px] text-[#0F172A] placeholder:text-[#94A3B8] focus:border-[#007ACC] focus:ring-3 focus:ring-[#007ACC]/15 outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="checkout-phone"
                    className="block text-[12px] font-medium text-[#334155]"
                  >
                    Nomor WhatsApp / Telepon Aktif *
                  </label>
                  <div className="relative">
                    <Phone className="h-4 w-4 text-[#94A3B8] absolute left-3 top-3 pointer-events-none" />
                    <input
                      id="checkout-phone"
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="081234567890"
                      className="w-full h-10 rounded-[8px] border border-[#E2E8F0] bg-white pl-9 pr-3 text-[13.5px] text-[#0F172A] placeholder:text-[#94A3B8] focus:border-[#007ACC] focus:ring-3 focus:ring-[#007ACC]/15 outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* STEP 3: Metode Pembayaran Midtrans */}
            <div className="rounded-[14px] border border-[#E2E8F0] bg-[#FFFFFF] p-5 sm:p-6 space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="h-6 w-6 rounded-full bg-[#007ACC] text-white text-[12px] font-bold flex items-center justify-center">
                    3
                  </span>
                  <div>
                    <h2 className="font-heading text-[16px] font-bold text-[#0F172A]">
                      Metode Pembayaran (Midtrans)
                    </h2>
                    <p className="text-[12px] text-[#64748B]">
                      Verifikasi otomatis tanpa perlu unggah bukti transfer manual.
                    </p>
                  </div>
                </div>
                <CreditCard className="h-5 w-5 text-[#007ACC]" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                {MIDTRANS_PAYMENT_METHODS.map((m) => {
                  const isSelected = paymentMethod === m.id
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaymentMethod(m.id)}
                      className={`p-3.5 rounded-[10px] border-2 text-left transition-all cursor-pointer flex items-start justify-between gap-2 ${
                        isSelected
                          ? 'border-[#007ACC] bg-[#EBF5FC]/35 shadow-xs'
                          : 'border-[#E2E8F0] bg-white hover:border-[#CBD5E1]'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <span className="text-[13px] font-bold text-[#0F172A] block">
                          {m.label}
                        </span>
                        <span className="text-[11px] text-[#64748B] block leading-snug">
                          {m.description}
                        </span>
                      </div>
                      <span
                        className={`h-4 w-4 rounded-full border shrink-0 mt-0.5 flex items-center justify-center ${
                          isSelected
                            ? 'border-[#007ACC] bg-[#007ACC] text-white'
                            : 'border-[#CBD5E1]'
                        }`}
                      >
                        {isSelected && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Sticky Order Summary & Terms Confirmation */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-4">
            <div className="rounded-[16px] border border-[#E2E8F0] bg-[#FFFFFF] p-6 space-y-5 shadow-sm">
              <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-4">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#007ACC] block">
                    Ringkasan Tagihan
                  </span>
                  <h3 className="font-heading text-[18px] font-bold text-[#0F172A]">
                    Opilines {plan.name}
                  </h3>
                </div>
                <span className="rounded-full bg-[#EBF5FC] border border-[#D0E8F8] px-3 py-1 text-[11.5px] font-semibold text-[#007ACC]">
                  {activePeriod.title}
                </span>
              </div>

              {/* Key Features Included */}
              <div className="space-y-2">
                <span className="text-[11.5px] font-semibold text-[#475569] block">
                  Cakupan Lisensi Paket:
                </span>
                <ul className="space-y-1.5 text-[12.5px] text-[#334155]">
                  {plan.includedFeatures.slice(0, 5).map((feat, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-[#10B981] shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Price Calculation Breakdown (IDR) */}
              <div className="rounded-[12px] bg-[#F8FAFC] border border-[#E2E8F0] p-4 space-y-2.5 text-[13px]">
                <div className="flex items-center justify-between text-[#475569]">
                  <span>
                    Harga Normal ({activePeriod.months} bln × {formatRupiah(plan.monthlyRate)})
                  </span>
                  <span className="font-medium text-[#0F172A]">
                    {formatRupiah(activePeriod.normalTotalPrice)}
                  </span>
                </div>

                {activePeriod.discountAmount > 0 && (
                  <div className="flex items-center justify-between text-emerald-600 font-medium">
                    <span className="flex items-center gap-1">
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>Diskon Periode ({activePeriod.discountPercent}%)</span>
                    </span>
                    <span>-{formatRupiah(activePeriod.discountAmount)}</span>
                  </div>
                )}

                <div className="flex items-center justify-between text-[#475569] text-[12px]">
                  <span>Tarif Efektif per Bulan</span>
                  <span className="font-semibold text-[#0F172A]">
                    {formatRupiah(activePeriod.pricePerMonth)} / bulan
                  </span>
                </div>

                <div className="flex items-center justify-between text-[#475569] text-[12px]">
                  <span>Metode Pembayaran</span>
                  <span className="font-semibold text-[#007ACC]">
                    {selectedMethodObj.shortLabel}
                  </span>
                </div>

                <div className="pt-3 border-t border-[#E2E8F0] flex items-baseline justify-between">
                  <div>
                    <span className="font-heading text-[14px] font-bold text-[#0F172A] block">
                      Total Pembayaran
                    </span>
                    <span className="text-[11px] text-[#64748B]">Mata Uang Rupiah (IDR)</span>
                  </div>
                  <span className="font-heading text-[22px] font-bold text-[#007ACC]">
                    {formatRupiah(activePeriod.totalPrice)}
                  </span>
                </div>
              </div>

              {/* Mandatory Terms & Conditions Checkbox */}
              <label
                htmlFor="accept-terms"
                className="flex items-start gap-2.5 p-3 rounded-[10px] border border-[#E2E8F0] bg-[#F8FAFC]/60 cursor-pointer select-none text-[12px] text-[#475569] leading-relaxed hover:border-[#CBD5E1]"
              >
                <input
                  id="accept-terms"
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-[#CBD5E1] text-[#007ACC] focus:ring-[#007ACC] cursor-pointer"
                />
                <span>
                  Saya menyatakan data di atas benar dan menyetujui{' '}
                  <Link
                    href="/terms"
                    target="_blank"
                    className="font-semibold text-[#007ACC] hover:underline"
                  >
                    Syarat &amp; Ketentuan Layanan
                  </Link>{' '}
                  serta{' '}
                  <Link
                    href="/terms#refund"
                    target="_blank"
                    className="font-semibold text-[#007ACC] hover:underline"
                  >
                    Kebijakan Pembatalan &amp; Refund
                  </Link>{' '}
                  Opilines.
                </span>
              </label>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 rounded-[10px] bg-[#007ACC] hover:bg-[#0062A3] active:bg-[#004F82] text-white font-semibold text-[14px] flex items-center justify-center gap-2 shadow-[0_2px_8px_0_rgba(0,122,204,0.25)] transition-all cursor-pointer disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Memproses Transaksi Aman...</span>
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4" />
                    <span>Bayar Sekarang — {formatRupiah(activePeriod.totalPrice)}</span>
                  </>
                )}
              </button>

              {/* Security & Compliance Footer inside Summary */}
              <div className="pt-2 border-t border-[#F1F5F9] flex items-center justify-between text-[11px] text-[#64748B]">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-[#10B981]" />
                  <span>Garansi Uang Kembali 7 Hari</span>
                </span>
                <Link
                  href="/terms"
                  className="inline-flex items-center gap-1 hover:text-[#007ACC] transition-colors"
                >
                  <FileText className="h-3 w-3" />
                  <span>Syarat &amp; Ketentuan</span>
                </Link>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
