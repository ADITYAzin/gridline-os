'use client'

import * as React from 'react'
import {
  Calendar,
  CalendarCheck,
  Check,
  Clock,
  Download,
  Receipt,
  Users,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  ChevronDown,
  Sparkles,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

export interface SubscriptionTabProps {
  currentTier: string
  expiryDate: Date
  daysLeft: number
  isExpiringSoon: boolean
  isExpired: boolean
  onOpenExtendDialog: (targetTier?: string) => void
}

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

const BILLING_INVOICES = [
  {
    id: 'INV-2026-1025',
    date: '25 Okt 2026',
    description: 'Gridline Pro (12 Bulan)',
    amount: 7188000,
    status: 'Lunas',
    method: 'BCA VA',
  },
  {
    id: 'INV-2025-1025',
    date: '25 Okt 2025',
    description: 'Gridline Pro (12 Bulan)',
    amount: 7188000,
    status: 'Lunas',
    method: 'Mandiri VA',
  },
]

export function SubscriptionTab({
  currentTier,
  expiryDate,
  daysLeft,
  isExpiringSoon,
  isExpired,
  onOpenExtendDialog,
}: SubscriptionTabProps) {
  const [isUpscaleOpen, setIsUpscaleOpen] = React.useState<boolean>(true)

  const isTrial = currentTier.toLowerCase() === 'trial'

  const handleDownloadInvoice = (invoiceId: string) => {
    toast.success(`Faktur ${invoiceId} berhasil diunduh.`)
  }

  const percentRemaining = Math.max(0, Math.min(100, Math.round((daysLeft / 30) * 100)))

  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* 1. HERO BLUE PRIMARY BOX (GRIDLINE TRIAL / PLAN CONTAINER) */}
      {/* ========================================================================= */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-[#0062A3] via-[#007ACC] to-[#0088E0] p-5 sm:p-6 text-white shadow-md border border-[#0062A3]/20">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white font-heading">
                Gridline {isTrial ? 'TRIAL' : currentTier === 'pro' ? 'Professional' : currentTier.toUpperCase()}
              </h2>
              {isTrial ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-400/25 border border-amber-300/40 text-[10px] font-semibold text-amber-100">
                  <Sparkles className="h-3 w-3 text-amber-300" />
                  Masa Uji Coba Gratis
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-[10px] font-medium text-emerald-100">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {isExpired ? 'Berakhir' : 'Aktif'}
                </span>
              )}
            </div>

            <p className="text-white/85 text-xs max-w-lg leading-relaxed">
              {isTrial
                ? 'Masa uji coba 14 hari aktif. Upscale ke paket berbayar agar akses armada teknisi tidak terhenti.'
                : 'Armada teknisi dan dispatch tiket siap digunakan untuk seluruh operasional Anda.'}
            </p>

            {/* Concise Stats Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black/15 border border-white/10 text-white/90">
                <Calendar className="h-3.5 w-3.5 text-cyan-200" />
                <span>Jatuh Tempo:</span>
                <strong className="text-white">{formatDate(expiryDate)}</strong>
              </div>

              <div
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border ${
                  isExpiringSoon || isExpired
                    ? 'bg-amber-400/25 border-amber-300/40 text-amber-100 font-semibold'
                    : 'bg-black/15 border-white/10 text-white/90'
                }`}
              >
                <Clock className="h-3.5 w-3.5 text-amber-300" />
                <span>Sisa Waktu:</span>
                <strong>{isExpired ? 'Kadaluarsa' : `${daysLeft} Hari`}</strong>
              </div>

              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black/15 border border-white/10 text-white/90">
                <Users className="h-3.5 w-3.5 text-cyan-200" />
                <span>Kapasitas:</span>
                <strong>10 Teknisi</strong>
              </div>
            </div>
          </div>

          {/* Primary Action Button */}
          <div className="flex flex-col sm:items-end justify-center gap-1.5 shrink-0">
            <Button
              type="button"
              onClick={() => onOpenExtendDialog(isTrial ? 'pro' : currentTier)}
              className="h-10 px-5 rounded-lg bg-white hover:bg-slate-50 text-[#007ACC] font-bold text-xs shadow-sm hover:shadow transition-all cursor-pointer gap-2 border border-white/80"
            >
              {isTrial ? (
                <>
                  <Sparkles className="h-4 w-4 text-[#007ACC]" />
                  <span>Upscale Paket Sekarang</span>
                  <ArrowRight className="h-3.5 w-3.5 text-[#007ACC]" />
                </>
              ) : (
                <>
                  <CalendarCheck className="h-4 w-4 text-[#007ACC]" />
                  <span>Perpanjang Langganan</span>
                  <ArrowRight className="h-3.5 w-3.5 text-[#007ACC]" />
                </>
              )}
            </Button>
            <span className="text-[11px] text-white/70 text-left sm:text-right">
              {isTrial ? 'Pilih paket yang sesuai untuk armada Anda' : 'Hemat hingga 20% untuk paket tahunan'}
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. DROPDOWN STYLE: JUDUL DISAMPING JUDUL ADA ICON KEMUDIAN LINE */}
      {/* ========================================================================= */}
      <div className="space-y-3">
        {/* Accordion / Dropdown Toggle Header */}
        <button
          type="button"
          onClick={() => setIsUpscaleOpen(!isUpscaleOpen)}
          className="w-full flex items-center gap-2.5 group text-left cursor-pointer select-none py-1"
        >
          <span className="text-xs font-bold text-foreground group-hover:text-[#007ACC] transition-colors whitespace-nowrap font-heading">
            Pilihan Paket Lainnya untuk Upscale
          </span>

          <ChevronDown
            className={`h-4 w-4 text-muted-foreground group-hover:text-[#007ACC] transition-transform duration-200 shrink-0 ${
              isUpscaleOpen ? 'rotate-180 text-[#007ACC]' : ''
            }`}
          />

          <div className="flex-1 h-px bg-border/80 group-hover:bg-[#007ACC]/30 transition-colors" />
        </button>

        {/* Dropdown Content: Upscale Options */}
        {isUpscaleOpen && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 animate-in fade-in-50 duration-200 pt-0.5">
            {/* 1. Starter */}
            <div className="p-4 rounded-xl border border-border/70 bg-card space-y-3 flex flex-col justify-between hover:border-border transition-all">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-heading font-bold text-sm text-foreground">Starter</h4>
                  <Badge variant="outline" className="text-[10px] text-muted-foreground">
                    Skala Kecil
                  </Badge>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-base font-bold text-foreground">Rp 249.000</span>
                  <span className="text-[11px] text-muted-foreground">/ bulan</span>
                </div>

                <p className="text-[11px] text-muted-foreground">
                  Cocok untuk bengkel servis atau usaha jasa pemula.
                </p>

                <ul className="space-y-1.5 text-muted-foreground text-[11px] pt-2 border-t border-border/50">
                  <li className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    <span>Hingga 3 Teknisi Lapangan</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    <span>1 Akun Admin / Dispatcher</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    <span>Tiket Servis Tanpa Batas</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    <span>BAP Digital & Tanda Tangan</span>
                  </li>
                </ul>
              </div>

              <div className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onOpenExtendDialog('starter')}
                  className="w-full h-8 text-xs font-semibold cursor-pointer border-[#007ACC]/30 text-[#007ACC] hover:bg-[#EBF5FC]"
                >
                  Pilih Starter
                </Button>
              </div>
            </div>

            {/* 2. Professional (Featured Upscale Recommendation) */}
            <div className="p-4 rounded-xl border-2 border-[#007ACC] bg-[#EBF5FC]/30 space-y-3 flex flex-col justify-between relative shadow-xs">
              

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-heading font-bold text-sm text-[#007ACC]">Professional</h4>
                  <Badge variant="default" className="text-[10px] bg-[#007ACC]">
                    Populer
                  </Badge>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-base font-bold text-foreground">Rp 599.000</span>
                  <span className="text-[11px] text-muted-foreground">/ bulan</span>
                </div>

                <p className="text-[11px] text-muted-foreground">
                  Pilihan standar tim 4–10 teknisi berkembang.
                </p>

                <ul className="space-y-1.5 text-foreground text-[11px] pt-2 border-t border-[#007ACC]/20 font-medium">
                  <li className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-[#007ACC] shrink-0 font-bold" />
                    <span>Hingga 10 Teknisi Lapangan</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-[#007ACC] shrink-0 font-bold" />
                    <span>3 Akun Admin / Dispatcher</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-[#007ACC] shrink-0 font-bold" />
                    <span>Notifikasi WhatsApp 1-Klik</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-[#007ACC] shrink-0 font-bold" />
                    <span>Database Riwayat Mesin & SLA</span>
                  </li>
                </ul>
              </div>

              <div className="pt-2">
                <Button
                  type="button"
                  size="sm"
                  onClick={() => onOpenExtendDialog('pro')}
                  className="w-full h-8 text-xs font-semibold bg-[#007ACC] hover:bg-[#0062A3] text-white cursor-pointer shadow-xs gap-1.5"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Upgrade ke Professional
                </Button>
              </div>
            </div>

            {/* 3. Enterprise */}
            <div className="p-4 rounded-xl border border-border/70 bg-card space-y-3 flex flex-col justify-between hover:border-border transition-all">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-heading font-bold text-sm text-foreground">Enterprise</h4>
                  <Badge variant="outline" className="text-[10px] text-muted-foreground">
                    Skala Besar
                  </Badge>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-base font-bold text-foreground">Kustom</span>
                  <span className="text-[11px] text-muted-foreground">/ kuota khusus</span>
                </div>

                <p className="text-[11px] text-muted-foreground">
                  Kontraktor dan armada lebih dari 10 teknisi.
                </p>

                <ul className="space-y-1.5 text-muted-foreground text-[11px] pt-2 border-t border-border/50">
                  <li className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    <span>Kuota Teknisi & Admin Unlimited</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    <span>Kustom Kop Surat & Logo BAP</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    <span>Dedicated Account Manager 24/7</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    <span>Integrasi API Database Internal</span>
                  </li>
                </ul>
              </div>

              <div className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => toast.info('Silakan hubungi WhatsApp support kami untuk paket Enterprise kustom.')}
                  className="w-full h-8 text-xs font-medium cursor-pointer"
                >
                  Hubungi Sales Enterprise
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 3. STATUS MASA AKTIF & KUOTA (2-COLUMN GRID) */}
      {/* ========================================================================= */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Card: Masa Aktif */}
        <Card className="shadow-xs border-border bg-card">
          <CardHeader className="pb-3 border-b border-border/50">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Clock className="h-4 w-4 text-[#007ACC]" />
                Siklus Masa Aktif
              </CardTitle>
              <Badge
                variant={isExpiringSoon || isExpired ? 'outline' : 'secondary'}
                className={`text-[10px] font-semibold ${
                  isExpired
                    ? 'border-destructive/40 bg-destructive/10 text-destructive'
                    : isExpiringSoon
                    ? 'border-amber-400/50 bg-amber-500/15 text-amber-700 dark:text-amber-300'
                    : 'text-emerald-600 bg-emerald-500/10'
                }`}
              >
                {isExpired ? 'Kadaluarsa' : isExpiringSoon ? 'Segera Berakhir' : isTrial ? 'Masa Trial' : 'Normal'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-3.5 space-y-3 text-xs">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Sisa Durasi Paket:</span>
                <span className="font-semibold text-foreground">
                  {daysLeft} hari tersisa
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isExpired
                      ? 'bg-destructive w-0'
                      : isExpiringSoon
                      ? 'bg-amber-500'
                      : 'bg-[#007ACC]'
                  }`}
                  style={{ width: `${percentRemaining}%` }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 text-muted-foreground">
              <span>Tanggal Jatuh Tempo:</span>
              <strong className="text-foreground">{formatDate(expiryDate)}</strong>
            </div>

            {isExpiringSoon && (
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-amber-500/10 border border-amber-400/30 text-amber-800 dark:text-amber-200 text-[11px]">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                <span>Perpanjang sebelum {formatDate(expiryDate)} agar akses teknisi tidak terblokir.</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Card: Kuota & Kapasitas */}
        <Card className="shadow-xs border-border bg-card">
          <CardHeader className="pb-3 border-b border-border/50">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-[#007ACC]" />
              Penggunaan Kuota
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-3.5 space-y-3 text-xs">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-muted-foreground">Teknisi Lapangan:</span>
                <span className="font-semibold text-foreground">4 / 10 Aktif</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                <div className="h-full rounded-full bg-[#007ACC] w-[40%]" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-muted-foreground">Penyimpanan SOP:</span>
                <span className="font-semibold text-foreground">6.8 / 10 GB</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                <div className="h-full rounded-full bg-[#007ACC] w-[68%]" />
              </div>
            </div>

            <div className="pt-1 border-t border-border/50 flex items-center justify-between text-muted-foreground">
              <span>Tiket Kerja & WhatsApp:</span>
              <span className="font-semibold text-emerald-600 flex items-center gap-1">
                <Check className="h-3 w-3" />
                Tanpa Batas
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ========================================================================= */}
      {/* 4. RIWAYAT PEMBAYARAN & FAKTUR */}
      {/* ========================================================================= */}
      <Card className="shadow-xs border-border bg-card">
        <CardHeader className="pb-3 border-b border-border/50">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Receipt className="h-4 w-4 text-[#007ACC]" />
              Riwayat Faktur
            </CardTitle>
            <span className="text-[11px] text-muted-foreground">
              {BILLING_INVOICES.length} transaksi
            </span>
          </div>
        </CardHeader>
        <CardContent className="pt-2 text-xs">
          <div className="divide-y divide-border/50">
            {BILLING_INVOICES.map((inv) => (
              <div
                key={inv.id}
                className="py-2.5 flex items-center justify-between gap-3 hover:bg-muted/20 px-1 rounded transition-colors"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-foreground">
                      {inv.id}
                    </span>
                    <Badge variant="secondary" className="text-[9px] px-1.5 py-0 font-medium text-emerald-600 bg-emerald-500/10">
                      {inv.status}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    {inv.description} • {inv.date} ({inv.method})
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-foreground">
                    {formatRupiah(inv.amount)}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDownloadInvoice(inv.id)}
                    className="h-7 px-2 text-xs gap-1 cursor-pointer text-[#007ACC] hover:text-[#0062A3]"
                  >
                    <Download className="h-3 w-3" />
                    <span>PDF</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
