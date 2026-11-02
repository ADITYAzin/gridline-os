'use client'

import * as React from 'react'
import Link from 'next/link'
import {
  Check,
  X,
  HelpCircle,
  ArrowRight,
  MessageSquare,
  Zap,
  ShieldCheck,
  CreditCard,
  FileText,
  Lock,
} from 'lucide-react'
import {
  PLAN_CATALOG,
  getPeriodOption,
  formatRupiah,
  formatNumberID,
  type BillingMonths,
} from '@/lib/pricing'

const BILLING_PERIODS: { months: BillingMonths; label: string; badge?: string }[] = [
  { months: 1, label: '1 Bulan' },
  { months: 3, label: '3 Bulan', badge: '-5%' },
  { months: 6, label: '6 Bulan', badge: '-10%' },
  { months: 12, label: '12 Bulan', badge: 'Hemat 20%' },
]

export function PricingClient() {
  const [selectedMonths, setSelectedMonths] = React.useState<BillingMonths>(12)

  const starterPeriod = React.useMemo(
    () => getPeriodOption('starter', selectedMonths),
    [selectedMonths]
  )
  const proPeriod = React.useMemo(
    () => getPeriodOption('pro', selectedMonths),
    [selectedMonths]
  )

  return (
    <div className="space-y-16 py-12 md:py-16">
      {/* 1. Header & Interactive Billing Cycle Selector */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#D0E8F8] bg-[#EBF5FC] px-3.5 py-1.5 text-[12px] font-semibold text-[#007ACC]">
            <Zap className="h-3.5 w-3.5" />
            <span>HARGA RESMI DALAM RUPIAH (IDR) • TRANSPARAN</span>
          </div>

          <h1 className="font-heading text-[30px] sm:text-[42px] font-bold text-[#0F172A] tracking-[-0.02em] leading-tight">
            Investasi Terukur yang{' '}
            <span className="text-[#007ACC]">Tumbuh Bersama Armada</span> Anda
          </h1>

          <p className="text-[14.5px] sm:text-[16px] text-[#475569] leading-relaxed">
            Seluruh paket sudah mencakup aplikasi mobile teknisi tanpa batasan jumlah tiket servis. Pilih siklus berlangganan dan aktifkan instan via Midtrans.
          </p>

          {/* Period Selector Pills (Synchronized with Admin Subscription Settings) */}
          <div className="pt-3 flex justify-center">
            <div className="inline-flex flex-wrap items-center justify-center gap-1 rounded-[12px] border border-[#E2E8F0] bg-[#FFFFFF] p-1.5 shadow-xs">
              {BILLING_PERIODS.map((p) => {
                const isActive = selectedMonths === p.months
                return (
                  <button
                    key={p.months}
                    type="button"
                    onClick={() => setSelectedMonths(p.months)}
                    className={`px-3.5 py-2 rounded-[8px] text-[13px] font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-[#007ACC] text-white shadow-xs'
                        : 'text-[#475569] hover:text-[#0F172A] hover:bg-[#F8FAFC]'
                    }`}
                  >
                    <span>{p.label}</span>
                    {p.badge && (
                      <span
                        className={`text-[10.5px] font-bold px-1.5 py-0.5 rounded-full ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-emerald-500/10 text-emerald-700'
                        }`}
                      >
                        {p.badge}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 2. Pricing Cards (Starter, Professional, Enterprise) */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-7 items-stretch">
          {/* Plan 1: Starter */}
          <div className="rounded-[16px] border border-[#E2E8F0] bg-[#FFFFFF] p-7 sm:p-8 space-y-6 flex flex-col justify-between shadow-xs hover:border-[#CBD5E1] transition-all">
            <div className="space-y-5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-heading text-[19px] font-bold text-[#0F172A]">
                    {PLAN_CATALOG.starter.name}
                  </h3>
                  <p className="text-[13px] text-[#64748B] mt-1">
                    {PLAN_CATALOG.starter.tagline}
                  </p>
                </div>
                <span className="shrink-0 text-[11px] font-semibold text-[#475569] bg-[#F8FAFC] border border-[#E2E8F0] px-2.5 py-1 rounded-full">
                  {PLAN_CATALOG.starter.badge}
                </span>
              </div>

              {/* Dynamic IDR Price Box */}
              <div className="rounded-[12px] bg-[#F8FAFC] border border-[#E2E8F0]/80 p-4 space-y-1.5">
                <div className="flex items-baseline gap-1">
                  <span className="text-[14px] font-bold text-[#475569]">Rp</span>
                  <span className="font-heading text-[34px] font-bold text-[#0F172A] tracking-tight">
                    {formatNumberID(starterPeriod.pricePerMonth)}
                  </span>
                  <span className="text-[13px] text-[#64748B]">/ bulan</span>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-1 text-[12px]">
                  <span className="text-[#475569]">
                    Total {starterPeriod.title}:{' '}
                    <strong className="text-[#0F172A]">
                      {formatRupiah(starterPeriod.totalPrice)}
                    </strong>
                  </span>
                  {starterPeriod.discountAmount > 0 ? (
                    <span className="text-emerald-700 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded">
                      Hemat {formatRupiah(starterPeriod.discountAmount)}
                    </span>
                  ) : (
                    <span className="text-[#94A3B8]">Tagihan bulanan fleksibel</span>
                  )}
                </div>
              </div>

              <div className="space-y-3 pt-1">
                <span className="text-[11.5px] font-bold uppercase tracking-wider text-[#0F172A] block">
                  Fitur yang Didapatkan:
                </span>
                <ul className="space-y-2.5 text-[13px]">
                  <li className="flex items-center gap-2.5 text-[#334155]">
                    <Check className="h-4 w-4 text-[#10B981] shrink-0" />
                    <span>
                      Akses <strong>5 Teknisi Lapangan</strong> + <strong>1 Akun Admin</strong>
                    </span>
                  </li>
                  <li className="flex items-center gap-2.5 text-[#334155]">
                    <Check className="h-4 w-4 text-[#10B981] shrink-0" />
                    <span>Manajemen tiket kerja tanpa batas</span>
                  </li>
                  <li className="flex items-center gap-2.5 text-[#334155]">
                    <Check className="h-4 w-4 text-[#10B981] shrink-0" />
                    <span>
                      Presensi teknisi (<strong>GPS &amp; Foto Selfie</strong>)
                    </span>
                  </li>
                  <li className="flex items-center gap-2.5 text-[#334155]">
                    <Check className="h-4 w-4 text-[#10B981] shrink-0" />
                    <span>SOP operasional standar bawaan</span>
                  </li>
                  <li className="flex items-center gap-2.5 text-[#334155]">
                    <Check className="h-4 w-4 text-[#10B981] shrink-0" />
                    <span>
                      Dokumentasi kerja <strong>5 foto per tiket</strong>
                    </span>
                  </li>
                  <li className="flex items-center gap-2.5 text-[#334155]">
                    <Check className="h-4 w-4 text-[#10B981] shrink-0" />
                    <span>
                      <strong>BAP digital</strong> &amp; tanda tangan digital pelanggan
                    </span>
                  </li>
                  <li className="flex items-center gap-2.5 text-[#334155]">
                    <Check className="h-4 w-4 text-[#10B981] shrink-0" />
                    <span>Riwayat servis pelanggan &amp; monitoring SLA</span>
                  </li>

                  <li className="pt-2 border-t border-[#F1F5F9]">
                    <span className="text-[10.5px] font-semibold text-[#94A3B8] uppercase tracking-wider block">
                      Belum Termasuk di Starter:
                    </span>
                  </li>
                  <li className="flex items-center gap-2.5 text-[#94A3B8]">
                    <X className="h-4 w-4 text-[#CBD5E1] shrink-0" />
                    <span>Peta pemantauan lokasi teknisi (Live Map)</span>
                  </li>
                  <li className="flex items-center gap-2.5 text-[#94A3B8]">
                    <X className="h-4 w-4 text-[#CBD5E1] shrink-0" />
                    <span>Manajemen cuti &amp; perizinan presensi</span>
                  </li>
                  <li className="flex items-center gap-2.5 text-[#94A3B8]">
                    <X className="h-4 w-4 text-[#CBD5E1] shrink-0" />
                    <span>Custom SOP Builder &amp; riwayat unit aset</span>
                  </li>
                  <li className="flex items-center gap-2.5 text-[#94A3B8]">
                    <X className="h-4 w-4 text-[#CBD5E1] shrink-0" />
                    <span>Pesan kabar WhatsApp &amp; komisi otomatis</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="pt-5 space-y-2.5 border-t border-[#F1F5F9]">
              <Link
                href={`/checkout?plan=starter&months=${selectedMonths}`}
                className="w-full h-11 rounded-[8px] border-2 border-[#007ACC] bg-[#FFFFFF] hover:bg-[#EBF5FC] text-[#007ACC] font-semibold text-[13.5px] flex items-center justify-center gap-2 transition-colors"
              >
                <span>Pilih Starter &amp; Checkout</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/register?plan=starter"
                className="w-full py-1.5 text-center text-[12px] font-medium text-[#64748B] hover:text-[#0F172A] block transition-colors"
              >
                Atau mulai uji coba gratis 14 hari &rarr;
              </Link>
            </div>
          </div>

          {/* Plan 2: Professional (Featured) */}
          <div className="rounded-[16px] border-2 border-[#007ACC] bg-[#FFFFFF] p-7 sm:p-8 space-y-6 flex flex-col justify-between shadow-[0_8px_30px_rgb(0,122,204,0.08)] relative">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
              <span className="bg-[#007ACC] text-white text-[11px] font-bold uppercase tracking-wider px-3.5 py-1 rounded-full shadow-xs whitespace-nowrap">
                Paling Direkomendasikan
              </span>
            </div>

            <div className="space-y-5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-heading text-[19px] font-bold text-[#0F172A]">
                    {PLAN_CATALOG.pro.name}
                  </h3>
                  <p className="text-[13px] text-[#64748B] mt-1">
                    {PLAN_CATALOG.pro.tagline}
                  </p>
                </div>
                <span className="shrink-0 text-[11px] font-bold text-[#007ACC] bg-[#EBF5FC] border border-[#D0E8F8] px-2.5 py-1 rounded-full">
                  Populer
                </span>
              </div>

              {/* Dynamic IDR Price Box */}
              <div className="rounded-[12px] bg-[#EBF5FC]/50 border border-[#D0E8F8] p-4 space-y-1.5">
                <div className="flex items-baseline gap-1">
                  <span className="text-[14px] font-bold text-[#007ACC]">Rp</span>
                  <span className="font-heading text-[34px] font-bold text-[#007ACC] tracking-tight">
                    {formatNumberID(proPeriod.pricePerMonth)}
                  </span>
                  <span className="text-[13px] text-[#475569]">/ bulan</span>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-1 text-[12px]">
                  <span className="text-[#334155]">
                    Total {proPeriod.title}:{' '}
                    <strong className="text-[#0F172A]">
                      {formatRupiah(proPeriod.totalPrice)}
                    </strong>
                  </span>
                  {proPeriod.discountAmount > 0 ? (
                    <span className="text-emerald-700 font-semibold bg-emerald-500/15 px-2 py-0.5 rounded">
                      Hemat {formatRupiah(proPeriod.discountAmount)}
                    </span>
                  ) : (
                    <span className="text-[#64748B]">Tagihan bulanan fleksibel</span>
                  )}
                </div>
              </div>

              <div className="space-y-3 pt-1">
                <span className="text-[11.5px] font-bold uppercase tracking-wider text-[#0F172A] block">
                  Seluruh Fitur Paket Professional:
                </span>
                <ul className="space-y-2.5 text-[13px] text-[#334155]">
                  <li className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 text-[#007ACC] shrink-0" />
                    <span>
                      Akses <strong>12 Teknisi</strong>, <strong>1 Admin</strong>, &amp;{' '}
                      <strong>1 Owner</strong>
                    </span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 text-[#007ACC] shrink-0" />
                    <span>Manajemen tiket kerja tanpa batas</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 text-[#007ACC] shrink-0" />
                    <span>
                      Presensi GPS &amp; Selfie + <strong>Manajemen Izin/Cuti</strong>
                    </span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 text-[#007ACC] shrink-0" />
                    <span>
                      <strong>Peta pemantauan lokasi teknisi</strong> (Live Map)
                    </span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 text-[#007ACC] shrink-0" />
                    <span>
                      <strong>Custom SOP Builder</strong> (Bebas buat alur kerja)
                    </span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 text-[#007ACC] shrink-0" />
                    <span>
                      Dokumentasi kerja hingga <strong>10 foto per tiket</strong>
                    </span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 text-[#007ACC] shrink-0" />
                    <span>
                      <strong>BAP digital</strong> &amp; tanda tangan digital pelanggan
                    </span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 text-[#007ACC] shrink-0" />
                    <span>
                      Riwayat servis <strong>unit aset (No. Seri / Mesin)</strong>
                    </span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 text-[#007ACC] shrink-0" />
                    <span>Monitoring SLA &amp; performa tim teknisi</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 text-[#007ACC] shrink-0" />
                    <span>
                      <strong>Pesan kabar pelanggan via WhatsApp</strong> 1-Klik
                    </span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 text-[#007ACC] shrink-0" />
                    <span>
                      <strong>Manajemen komisi teknisi</strong> otomatis
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="pt-5 space-y-2.5 border-t border-[#F1F5F9]">
              <Link
                href={`/checkout?plan=pro&months=${selectedMonths}`}
                className="w-full h-11 rounded-[8px] bg-[#007ACC] hover:bg-[#0062A3] text-white font-semibold text-[13.5px] flex items-center justify-center gap-2 shadow-[0_2px_8px_0_rgba(0,122,204,0.25)] transition-all"
              >
                <span>Pilih Professional &amp; Checkout</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/register?plan=pro"
                className="w-full py-1.5 text-center text-[12px] font-medium text-[#007ACC] hover:underline block transition-colors"
              >
                Atau mulai uji coba gratis 14 hari &rarr;
              </Link>
            </div>
          </div>

          {/* Plan 3: Enterprise */}
          <div className="rounded-[16px] border border-[#E2E8F0] bg-[#FFFFFF] p-7 sm:p-8 space-y-6 flex flex-col justify-between shadow-xs hover:border-[#CBD5E1] transition-all">
            <div className="space-y-5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-heading text-[19px] font-bold text-[#0F172A]">
                    Enterprise
                  </h3>
                  <p className="text-[13px] text-[#64748B] mt-1">
                    Untuk kontraktor besar dengan armada lebih dari 12 teknisi.
                  </p>
                </div>
                <span className="shrink-0 text-[11px] font-semibold text-[#475569] bg-[#F8FAFC] border border-[#E2E8F0] px-2.5 py-1 rounded-full">
                  Skala Besar
                </span>
              </div>

              <div className="rounded-[12px] bg-[#F8FAFC] border border-[#E2E8F0]/80 p-4 space-y-1.5">
                <div className="flex items-baseline gap-1.5">
                  <span className="font-heading text-[30px] font-bold text-[#0F172A]">
                    Kustom
                  </span>
                  <span className="text-[12.5px] text-[#64748B]">/ kuota khusus</span>
                </div>
                <span className="text-[12px] text-[#64748B] block">
                  Penyesuaian kuota teknisi, SLA &amp; kontrak tahunan B2B
                </span>
              </div>

              <div className="space-y-3 pt-1">
                <span className="text-[11.5px] font-bold uppercase tracking-wider text-[#0F172A] block">
                  Fitur Paket Enterprise:
                </span>
                <ul className="space-y-2.5 text-[13px] text-[#334155]">
                  <li className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 text-[#10B981] shrink-0" />
                    <span>Akses kustom teknisi, admin, dan multi-owner</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 text-[#10B981] shrink-0" />
                    <span>Seluruh fitur lengkap Paket Professional</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 text-[#10B981] shrink-0" />
                    <span>Dokumentasi kerja tanpa batasan jumlah foto</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 text-[#10B981] shrink-0" />
                    <span>Peta pemantauan teknisi &amp; Custom SOP Builder</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 text-[#10B981] shrink-0" />
                    <span>Riwayat servis unit aset &amp; kalkulasi komisi</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 text-[#10B981] shrink-0" />
                    <span>Dedicated account manager &amp; onboarding tim</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="pt-5 space-y-2.5 border-t border-[#F1F5F9]">
              <Link
                href="/demo"
                className="w-full h-11 rounded-[8px] border border-[#CBD5E1] bg-[#FFFFFF] hover:bg-[#F8FAFC] text-[#0F172A] font-semibold text-[13.5px] flex items-center justify-center gap-2 transition-colors"
              >
                <MessageSquare className="h-4 w-4 text-[#007ACC]" />
                <span>Hubungi Sales Enterprise</span>
              </Link>
              <span className="w-full py-1.5 text-center text-[12px] text-[#94A3B8] block">
                Tersedia penawaran resmi &amp; faktur pajak perusahaan
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Midtrans Payment Gateway & Security Compliance Bar */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-[14px] border border-[#E2E8F0] bg-[#FFFFFF] p-5 sm:p-6 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-[12px] font-bold text-[#007ACC] uppercase tracking-wider">
              <Lock className="h-3.5 w-3.5" />
              <span>Transaksi Aman &amp; Terverifikasi Otomatis (Midtrans)</span>
            </div>
            <p className="text-[13px] text-[#475569]">
              Pembayaran diproses dalam mata uang <strong>Rupiah (IDR)</strong> dengan enkripsi TLS 256-bit &amp; sertifikasi PCI-DSS Level 1.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1 text-[12px]">
              <Link
                href="/terms"
                className="inline-flex items-center gap-1 font-semibold text-[#007ACC] hover:underline"
              >
                <FileText className="h-3.5 w-3.5" />
                <span>Syarat &amp; Ketentuan Layanan</span>
              </Link>
              <span className="text-[#CBD5E1]">•</span>
              <Link
                href="/terms#refund"
                className="inline-flex items-center gap-1 font-semibold text-[#007ACC] hover:underline"
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Kebijakan Pembatalan &amp; Refund</span>
              </Link>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {[
              'BCA VA',
              'Mandiri VA',
              'BNI VA',
              'BRI VA',
              'QRIS',
              'GoPay',
              'Visa / Mastercard / JCB',
            ].map((channel) => (
              <span
                key={channel}
                className="inline-flex items-center gap-1.5 rounded-[8px] border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-1.5 text-[11.5px] font-semibold text-[#334155]"
              >
                <CreditCard className="h-3 w-3 text-[#007ACC]" />
                <span>{channel}</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Plan Comparison Table */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-2 mb-8">
          <h2 className="font-heading text-[22px] sm:text-[28px] font-bold text-[#0F172A] tracking-tight">
            Perbandingan Fitur Lengkap
          </h2>
          <p className="text-[13.5px] sm:text-[14.5px] text-[#475569]">
            Detail kapasitas dan modul operasional untuk setiap paket langganan.
          </p>
        </div>

        <div className="overflow-x-auto rounded-[16px] border border-[#E2E8F0] bg-white shadow-xs">
          <table className="w-full text-left border-collapse text-[13px]">
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                <th className="p-4 sm:p-5 font-semibold text-[#0F172A] w-2/5">Fitur &amp; Modul</th>
                <th className="p-4 sm:p-5 font-semibold text-[#0F172A] text-center w-1/5">
                  <div>Starter</div>
                  <div className="text-[11px] font-normal text-[#64748B] mt-0.5">
                    {formatRupiah(starterPeriod.pricePerMonth)}/bln
                  </div>
                </th>
                <th className="p-4 sm:p-5 font-bold text-[#007ACC] text-center w-1/5 bg-[#007ACC]/5 border-x border-[#007ACC]/20">
                  <div>Professional</div>
                  <div className="text-[11px] font-semibold text-[#007ACC] mt-0.5">
                    {formatRupiah(proPeriod.pricePerMonth)}/bln
                  </div>
                </th>
                <th className="p-4 sm:p-5 font-semibold text-[#0F172A] text-center w-1/5">
                  <div>Enterprise</div>
                  <div className="text-[11px] font-normal text-[#64748B] mt-0.5">Kustom</div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9] text-[#334155]">
              <tr>
                <td className="px-4 sm:px-5 py-3.5 font-medium text-[#0F172A]">Akses pengguna</td>
                <td className="px-4 sm:px-5 py-3.5 text-center font-medium">5 teknisi &amp; 1 admin</td>
                <td className="px-4 sm:px-5 py-3.5 text-center font-bold text-[#007ACC] bg-[#007ACC]/5 border-x border-[#007ACC]/20">
                  12 teknisi, 1 admin &amp; 1 owner
                </td>
                <td className="px-4 sm:px-5 py-3.5 text-center font-medium">Kustom</td>
              </tr>
              <tr>
                <td className="px-4 sm:px-5 py-3.5 font-medium text-[#0F172A]">
                  Manajemen tiket kerja &amp; Monitoring SLA
                </td>
                <td className="px-4 sm:px-5 py-3.5 text-center">
                  <Check className="h-4 w-4 text-[#10B981] mx-auto" />
                </td>
                <td className="px-4 sm:px-5 py-3.5 text-center bg-[#007ACC]/5 border-x border-[#007ACC]/20">
                  <Check className="h-4 w-4 text-[#007ACC] mx-auto stroke-[3]" />
                </td>
                <td className="px-4 sm:px-5 py-3.5 text-center">
                  <Check className="h-4 w-4 text-[#10B981] mx-auto" />
                </td>
              </tr>
              <tr>
                <td className="px-4 sm:px-5 py-3.5 font-medium text-[#0F172A]">
                  Presensi kehadiran (Selfie + GPS)
                </td>
                <td className="px-4 sm:px-5 py-3.5 text-center">
                  <Check className="h-4 w-4 text-[#10B981] mx-auto" />
                </td>
                <td className="px-4 sm:px-5 py-3.5 text-center bg-[#007ACC]/5 border-x border-[#007ACC]/20">
                  <Check className="h-4 w-4 text-[#007ACC] mx-auto stroke-[3]" />
                </td>
                <td className="px-4 sm:px-5 py-3.5 text-center">
                  <Check className="h-4 w-4 text-[#10B981] mx-auto" />
                </td>
              </tr>
              <tr>
                <td className="px-4 sm:px-5 py-3.5 font-medium text-[#0F172A]">
                  Manajemen cuti &amp; perizinan presensi
                </td>
                <td className="px-4 sm:px-5 py-3.5 text-center">
                  <X className="h-4 w-4 text-[#CBD5E1] mx-auto" />
                </td>
                <td className="px-4 sm:px-5 py-3.5 text-center font-bold text-[#007ACC] bg-[#007ACC]/5 border-x border-[#007ACC]/20">
                  <Check className="h-4 w-4 text-[#007ACC] mx-auto stroke-[3]" />
                </td>
                <td className="px-4 sm:px-5 py-3.5 text-center">
                  <Check className="h-4 w-4 text-[#10B981] mx-auto" />
                </td>
              </tr>
              <tr>
                <td className="px-4 sm:px-5 py-3.5 font-medium text-[#0F172A]">
                  Peta pemantauan lokasi teknisi (Live Map)
                </td>
                <td className="px-4 sm:px-5 py-3.5 text-center">
                  <X className="h-4 w-4 text-[#CBD5E1] mx-auto" />
                </td>
                <td className="px-4 sm:px-5 py-3.5 text-center font-bold text-[#007ACC] bg-[#007ACC]/5 border-x border-[#007ACC]/20">
                  <Check className="h-4 w-4 text-[#007ACC] mx-auto stroke-[3]" />
                </td>
                <td className="px-4 sm:px-5 py-3.5 text-center">
                  <Check className="h-4 w-4 text-[#10B981] mx-auto" />
                </td>
              </tr>
              <tr>
                <td className="px-4 sm:px-5 py-3.5 font-medium text-[#0F172A]">
                  Custom SOP Builder
                </td>
                <td className="px-4 sm:px-5 py-3.5 text-center">
                  <X className="h-4 w-4 text-[#CBD5E1] mx-auto" />
                </td>
                <td className="px-4 sm:px-5 py-3.5 text-center font-bold text-[#007ACC] bg-[#007ACC]/5 border-x border-[#007ACC]/20">
                  <Check className="h-4 w-4 text-[#007ACC] mx-auto stroke-[3]" />
                </td>
                <td className="px-4 sm:px-5 py-3.5 text-center">
                  <Check className="h-4 w-4 text-[#10B981] mx-auto" />
                </td>
              </tr>
              <tr>
                <td className="px-4 sm:px-5 py-3.5 font-medium text-[#0F172A]">
                  Dokumentasi kerja (Foto per tiket)
                </td>
                <td className="px-4 sm:px-5 py-3.5 text-center font-medium">5 Foto per tiket</td>
                <td className="px-4 sm:px-5 py-3.5 text-center font-bold text-[#007ACC] bg-[#007ACC]/5 border-x border-[#007ACC]/20">
                  10 Foto per tiket
                </td>
                <td className="px-4 sm:px-5 py-3.5 text-center font-medium">Tanpa batas foto</td>
              </tr>
              <tr>
                <td className="px-4 sm:px-5 py-3.5 font-medium text-[#0F172A]">
                  BAP digital &amp; tanda tangan pelanggan
                </td>
                <td className="px-4 sm:px-5 py-3.5 text-center">
                  <Check className="h-4 w-4 text-[#10B981] mx-auto" />
                </td>
                <td className="px-4 sm:px-5 py-3.5 text-center bg-[#007ACC]/5 border-x border-[#007ACC]/20">
                  <Check className="h-4 w-4 text-[#007ACC] mx-auto stroke-[3]" />
                </td>
                <td className="px-4 sm:px-5 py-3.5 text-center">
                  <Check className="h-4 w-4 text-[#10B981] mx-auto" />
                </td>
              </tr>
              <tr>
                <td className="px-4 sm:px-5 py-3.5 font-medium text-[#0F172A]">
                  Riwayat servis unit aset pelanggan (No. Seri/Mesin)
                </td>
                <td className="px-4 sm:px-5 py-3.5 text-center">
                  <X className="h-4 w-4 text-[#CBD5E1] mx-auto" />
                </td>
                <td className="px-4 sm:px-5 py-3.5 text-center font-bold text-[#007ACC] bg-[#007ACC]/5 border-x border-[#007ACC]/20">
                  <Check className="h-4 w-4 text-[#007ACC] mx-auto stroke-[3]" />
                </td>
                <td className="px-4 sm:px-5 py-3.5 text-center">
                  <Check className="h-4 w-4 text-[#10B981] mx-auto" />
                </td>
              </tr>
              <tr>
                <td className="px-4 sm:px-5 py-3.5 font-medium text-[#0F172A]">
                  Pesan kabar WhatsApp &amp; Komisi Teknisi Otomatis
                </td>
                <td className="px-4 sm:px-5 py-3.5 text-center">
                  <X className="h-4 w-4 text-[#CBD5E1] mx-auto" />
                </td>
                <td className="px-4 sm:px-5 py-3.5 text-center font-bold text-[#007ACC] bg-[#007ACC]/5 border-x border-[#007ACC]/20">
                  <Check className="h-4 w-4 text-[#007ACC] mx-auto stroke-[3]" />
                </td>
                <td className="px-4 sm:px-5 py-3.5 text-center">
                  <Check className="h-4 w-4 text-[#10B981] mx-auto" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 5. Concise FAQ */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-2 mb-8">
          <h2 className="font-heading text-[22px] sm:text-[28px] font-bold text-[#0F172A]">
            Pertanyaan Seputar Tagihan &amp; Langganan
          </h2>
          <p className="text-[13.5px] text-[#475569]">
            Informasi praktis mengenai pembayaran IDR, perubahan paket, dan kebijakan layanan.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              q: 'Metode pembayaran apa saja yang didukung?',
              a: 'Seluruh transaksi diproses dalam Rupiah (IDR) melalui Midtrans. Kami menerima Virtual Account (BCA, Mandiri, BNI, BRI), QRIS, GoPay, dan Kartu Kredit/Debit (Visa, Mastercard, JCB).',
            },
            {
              q: 'Apakah harga di atas sama dengan di dashboard Admin?',
              a: 'Ya, 100% sama. Baik saat Anda berlangganan baru di halaman ini maupun saat memperpanjang/upscale paket di menu Pengaturan > Paket & Langganan pada dashboard Admin.',
            },
            {
              q: 'Apakah saya bisa upgrade paket di tengah masa aktif?',
              a: 'Tentu. Anda dapat meng-upgrade paket dari Starter ke Professional kapan saja melalui dashboard Admin tanpa kehilangan riwayat tiket atau data pelanggan.',
            },
            {
              q: 'Bagaimana kebijakan pembatalan dan pengembalian dana?',
              a: 'Anda dapat membatalkan perpanjangan kapan saja sebelum jatuh tempo. Kami juga menyediakan jaminan refund 7 hari sesuai Syarat & Ketentuan Layanan resmi kami.',
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="rounded-[12px] border border-[#E2E8F0] bg-[#FFFFFF] p-5 space-y-2 shadow-2xs"
            >
              <h3 className="font-heading text-[14px] font-semibold text-[#0F172A] flex items-start gap-2">
                <HelpCircle className="h-4 w-4 text-[#007ACC] shrink-0 mt-0.5" />
                <span>{item.q}</span>
              </h3>
              <p className="text-[13px] text-[#475569] leading-relaxed pl-6">{item.a}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
