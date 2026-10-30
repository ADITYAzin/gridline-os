'use client'

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  CheckCircle2,
  FileCheck2,
  ArrowRight,
  Printer,
  Sparkles,
  Trophy,
  Coins,
  CalendarCheck,
} from 'lucide-react'
import { formatRupiah } from '@/lib/commission'

interface JobCompletedBannerProps {
  jobNumber: string
  serviceType: string
  completedAt: string | null
  jobId: string
  commissionAmount?: number | null
}

export function JobCompletedBanner({
  jobNumber,
  serviceType,
  completedAt,
  jobId,
  commissionAmount,
}: JobCompletedBannerProps) {
  const formattedDate = completedAt
    ? new Date(completedAt).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }) + ' WIB'
    : 'Tuntas'

  return (
    <Card className="rounded-[12px] bg-gradient-to-r from-emerald-600 via-emerald-600 to-teal-700 text-white shadow-md border-0 overflow-hidden relative">
      {/* Background Decorative Sparkle */}
      <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 opacity-10 pointer-events-none">
        <Sparkles className="h-44 w-44 text-white" />
      </div>

      <CardContent className="p-4 sm:p-5 space-y-3.5 relative z-10">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/20 text-white backdrop-blur-xs shadow-inner">
              <CheckCircle2 className="h-6 w-6 text-emerald-100" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider bg-white/25 px-2 py-0.5 rounded-full text-emerald-100">
                  Tiket Selesai
                </span>
                <span className="font-mono text-xs text-emerald-200 font-semibold">{jobNumber}</span>
              </div>
              <h2 className="text-sm sm:text-base font-bold text-white leading-tight mt-0.5">
                Pekerjaan Berhasil Dituntaskan
              </h2>
            </div>
          </div>

          {commissionAmount != null && commissionAmount > 0 && (
            <div className="text-right shrink-0 bg-white/15 px-2.5 py-1 rounded-lg backdrop-blur-xs border border-white/20">
              <span className="text-[9.5px] text-emerald-200 block font-medium">Insentif Tiket:</span>
              <span className="font-mono font-extrabold text-amber-300 text-xs sm:text-sm">
                +{formatRupiah(commissionAmount)}
              </span>
            </div>
          )}
        </div>

        <p className="text-xs text-emerald-100 leading-relaxed">
          Seluruh 5 syarat pekerjaan (Check-in, SOP Checklist, Foto Bukti, Tanda Tangan, dan Laporan) telah lengkap dan tervalidasi pada <strong className="text-white">{formattedDate}</strong>.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-white/20">
          <Button
            asChild
            size="sm"
            className="h-8.5 px-3 text-xs font-semibold bg-white text-emerald-800 hover:bg-emerald-50 active:bg-emerald-100 rounded-[8px] shadow-xs gap-1.5 touch-press"
          >
            <Link href={`/technician/jobs/${jobId}/bap`} target="_blank">
              <Printer className="h-3.5 w-3.5 text-emerald-700" />
              <span>Buka Dokumen BAP</span>
            </Link>
          </Button>

          <Button
            asChild
            variant="ghost"
            size="sm"
            className="h-8.5 px-3 text-xs font-semibold text-white hover:bg-white/15 rounded-[8px] gap-1.5 touch-press"
          >
            <Link href="/technician">
              <span>Kembali ke Tugas Saya</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

interface JobCompletedModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  jobNumber: string
  serviceType: string
  jobId: string
  commissionAmount?: number | null
}

export function JobCompletedModal({
  open,
  onOpenChange,
  jobNumber,
  serviceType,
  jobId,
  commissionAmount,
}: JobCompletedModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-5 sm:p-6 rounded-2xl border border-slate-200 bg-white shadow-xl">
        <div className="flex flex-col items-center text-center">
          {/* Elegant Icon Badge */}
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 ring-8 ring-emerald-50/60 shadow-xs mb-3">
            <Trophy className="h-7 w-7 text-emerald-600" />
          </div>

          {/* Pill Badge */}
          <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200/80 px-2.5 py-0.5 rounded-full text-[11px] font-semibold mb-2">
            <Sparkles className="h-3 w-3 text-emerald-600" />
            <span>Semua Persyaratan Lengkap</span>
          </div>

          {/* Title & Description */}
          <DialogTitle className="text-base sm:text-lg font-bold text-[#0F172A] tracking-tight">
            Pekerjaan Berhasil Diselesaikan!
          </DialogTitle>
          <p className="text-xs text-[#64748B] mt-1 max-w-xs leading-relaxed">
            Tiket <span className="font-mono font-bold text-[#0F172A]">{jobNumber}</span> ({serviceType}) telah resmi ditutup dan lolos seluruh verifikasi SOP.
          </p>

          {/* Ringkasan Status Card */}
          <div className="w-full mt-4 p-3.5 rounded-xl bg-slate-50/80 border border-slate-200 text-xs space-y-2 text-left">
            <div className="flex items-center justify-between">
              <span className="text-[#64748B] flex items-center gap-2">
                <CalendarCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                <span>Waktu Penyelesaian:</span>
              </span>
              <span className="font-semibold text-[#0F172A]">Baru saja</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[#64748B] flex items-center gap-2">
                <FileCheck2 className="h-3.5 w-3.5 text-[#007ACC] shrink-0" />
                <span>Dokumen Berita Acara:</span>
              </span>
              <span className="font-semibold text-emerald-700 bg-emerald-100/70 border border-emerald-200 px-2 py-0.2 rounded text-[10.5px]">
                BAP Diterbitkan
              </span>
            </div>

            {commissionAmount != null && commissionAmount > 0 && (
              <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                <span className="text-[#64748B] flex items-center gap-2 font-medium">
                  <Coins className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                  <span>Hak Insentif Tiket:</span>
                </span>
                <span className="font-mono font-bold text-emerald-700 text-xs">
                  +{formatRupiah(commissionAmount)}
                </span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="w-full mt-5 space-y-2">
            <Button
              asChild
              className="w-full h-10.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-[8px] gap-2 shadow-xs cursor-pointer touch-press"
            >
              <Link href={`/technician/jobs/${jobId}/bap`} target="_blank">
                <Printer className="h-4 w-4" />
                <span>Lihat Dokumen Berita Acara (BAP)</span>
              </Link>
            </Button>

            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="w-full h-9 text-xs font-medium text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100 rounded-[8px] cursor-pointer"
            >
              Tutup & Lanjutkan
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
