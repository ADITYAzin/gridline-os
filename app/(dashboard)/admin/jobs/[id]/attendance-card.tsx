'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  MapPin,
  Clock,
  ExternalLink,
  Camera,
  CheckCircle2,
  AlertCircle,
  LogIn,
  LogOut,
  Maximize2,
  Timer,
} from 'lucide-react'

interface AttendanceCardProps {
  attendance: {
    check_in_at: string | null
    check_out_at: string | null
    check_in_latitude: number | null
    check_in_longitude: number | null
    check_out_latitude: number | null
    check_out_longitude: number | null
    check_in_photo_url: string | null
  } | null
  technicianName?: string | null
  jobStatus: string
  photoSignedUrl: string | null
}

function formatDuration(startAt: string, endAt: string) {
  try {
    const diffMs = new Date(endAt).getTime() - new Date(startAt).getTime()
    if (diffMs <= 0) return '0 menit'
    const totalMinutes = Math.floor(diffMs / (1000 * 60))
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60
    if (hours > 0) {
      return `${hours} jam ${minutes > 0 ? `${minutes} menit` : ''}`
    }
    return `${minutes} menit`
  } catch {
    return '-'
  }
}

export function AttendanceCard({
  attendance,
  technicianName,
  jobStatus,
  photoSignedUrl,
}: AttendanceCardProps) {
  const [photoModalOpen, setPhotoModalOpen] = useState(false)

  const isCheckedIn = Boolean(attendance?.check_in_at)
  const isCheckedOut = Boolean(attendance?.check_out_at)

  const checkInDate = attendance?.check_in_at
    ? new Date(attendance.check_in_at).toLocaleString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }) + ' WIB'
    : null

  const checkOutDate = attendance?.check_out_at
    ? new Date(attendance.check_out_at).toLocaleString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }) + ' WIB'
    : null

  const onSiteDuration =
    attendance?.check_in_at && attendance?.check_out_at
      ? formatDuration(attendance.check_in_at, attendance.check_out_at)
      : null

  return (
    <Card className="shadow-xs border-border/80 overflow-hidden">
      <CardHeader className="pb-3 border-b bg-muted/20">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base flex items-center gap-2">
            <MapPin className="h-4 w-4 text-[#007ACC]" />
            Presensi & Kehadiran Teknisi
          </CardTitle>

          {isCheckedOut ? (
            <Badge className="bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-200">
              Check-out Selesai
            </Badge>
          ) : isCheckedIn ? (
            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Hadir di Lokasi
            </Badge>
          ) : (
            <Badge variant="outline" className="text-amber-700 border-amber-300 bg-amber-50">
              Belum Check-in
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Kolom Kiri: Check-in Kedatangan */}
          <div className="rounded-xl border border-border p-4 bg-card space-y-3">
            <div className="flex items-center justify-between border-b pb-2">
              <div className="flex items-center gap-1.5 font-semibold text-xs text-[#0F172A] dark:text-white">
                <LogIn className="h-4 w-4 text-emerald-600" />
                <span>Check-in Kedatangan</span>
              </div>
              {isCheckedIn ? (
                <span className="text-[11px] font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-200">
                  Tercatat
                </span>
              ) : (
                <span className="text-[11px] text-muted-foreground italic">Menunggu</span>
              )}
            </div>

            {isCheckedIn ? (
              <div className="space-y-2.5 text-xs">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-muted-foreground">Waktu:</span>
                  <span className="font-semibold text-foreground text-right">{checkInDate}</span>
                </div>

                <div className="flex items-start justify-between gap-2">
                  <span className="text-muted-foreground">Lokasi GPS:</span>
                  {attendance?.check_in_latitude && attendance?.check_in_longitude ? (
                    <a
                      href={`https://www.google.com/maps?q=${attendance.check_in_latitude},${attendance.check_in_longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-[#007ACC] hover:underline flex items-center gap-1 text-[11.5px]"
                    >
                      <span>
                        {Number(attendance.check_in_latitude).toFixed(5)},{' '}
                        {Number(attendance.check_in_longitude).toFixed(5)}
                      </span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : (
                    <span className="text-muted-foreground italic">Tanpa Koordinat GPS</span>
                  )}
                </div>

                {/* Bukti Foto Selfie Check-in */}
                <div className="pt-2 border-t border-border/60">
                  <span className="text-[11px] font-semibold text-muted-foreground block mb-2">
                    Bukti Foto Kehadiran:
                  </span>
                  {photoSignedUrl ? (
                    <div className="flex items-center gap-3">
                      <div
                        onClick={() => setPhotoModalOpen(true)}
                        className="relative group h-16 w-16 rounded-lg overflow-hidden border border-border shadow-xs bg-slate-950 cursor-pointer shrink-0"
                      >
                        <img
                          src={photoSignedUrl}
                          alt="Foto Check-in"
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                          <Maximize2 className="h-3.5 w-3.5" />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setPhotoModalOpen(true)}
                          className="h-7 text-xs gap-1.5 cursor-pointer"
                        >
                          <Camera className="h-3.5 w-3.5 text-[#007ACC]" />
                          Perbesar Foto
                        </Button>
                        <span className="text-[10px] text-muted-foreground block">
                          Selfie teknisi saat tiba di lokasi
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-2 rounded-lg bg-muted/40 border border-dashed border-border text-[11px] text-muted-foreground">
                      Presensi dicatat melalui validasi GPS (tanpa foto selfie).
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" />
                <span>Teknisi belum menekan tombol check-in kedatangan.</span>
              </div>
            )}
          </div>

          {/* Kolom Kanan: Check-out Kepulangan */}
          <div className="rounded-xl border border-border p-4 bg-card space-y-3">
            <div className="flex items-center justify-between border-b pb-2">
              <div className="flex items-center gap-1.5 font-semibold text-xs text-[#0F172A] dark:text-white">
                <LogOut className="h-4 w-4 text-blue-600" />
                <span>Check-out Kepulangan</span>
              </div>
              {isCheckedOut ? (
                <span className="text-[11px] font-medium text-slate-700 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full border border-slate-300">
                  Tercatat
                </span>
              ) : isCheckedIn ? (
                <span className="text-[11px] font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-200">
                  Sedang Dikerjakan
                </span>
              ) : (
                <span className="text-[11px] text-muted-foreground italic">-</span>
              )}
            </div>

            {isCheckedOut ? (
              <div className="space-y-2.5 text-xs">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-muted-foreground">Waktu:</span>
                  <span className="font-semibold text-foreground text-right">{checkOutDate}</span>
                </div>

                <div className="flex items-start justify-between gap-2">
                  <span className="text-muted-foreground">Lokasi GPS:</span>
                  {attendance?.check_out_latitude && attendance?.check_out_longitude ? (
                    <a
                      href={`https://www.google.com/maps?q=${attendance.check_out_latitude},${attendance.check_out_longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-[#007ACC] hover:underline flex items-center gap-1 text-[11.5px]"
                    >
                      <span>
                        {Number(attendance.check_out_latitude).toFixed(5)},{' '}
                        {Number(attendance.check_out_longitude).toFixed(5)}
                      </span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : (
                    <span className="text-muted-foreground italic">GPS Kepulangan Tercatat</span>
                  )}
                </div>

                {onSiteDuration && (
                  <div className="pt-2 border-t border-border/60 flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Timer className="h-3.5 w-3.5 text-muted-foreground" />
                      Total Durasi di Lokasi:
                    </span>
                    <span className="font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-[11.5px]">
                      {onSiteDuration}
                    </span>
                  </div>
                )}
              </div>
            ) : isCheckedIn ? (
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-900 dark:text-emerald-200 text-xs flex items-center gap-2">
                <Clock className="h-4 w-4 shrink-0 text-emerald-600 animate-spin" />
                <span>Teknisi sedang bertugas di lokasi. Check-out dilakukan setelah SOP selesai.</span>
              </div>
            ) : (
              <div className="p-3 rounded-lg bg-muted/40 border border-border text-muted-foreground text-xs">
                Menunggu teknisi check-in kedatangan terlebih dahulu.
              </div>
            )}
          </div>
        </div>
      </CardContent>

      {/* Modal Dialog Zoom Foto Presensi */}
      {photoSignedUrl && (
        <Dialog open={photoModalOpen} onOpenChange={setPhotoModalOpen}>
          <DialogContent className="sm:max-w-md p-5 rounded-2xl bg-card border border-border shadow-xl">
            <DialogHeader className="pb-3 border-b">
              <DialogTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
                <Camera className="h-4 w-4 text-[#007ACC]" />
                Foto Presensi Check-in Teknisi
              </DialogTitle>
            </DialogHeader>

            <div className="mt-3 space-y-3">
              <div className="aspect-4/3 rounded-xl overflow-hidden bg-slate-950 border border-border shadow-inner flex items-center justify-center">
                <img
                  src={photoSignedUrl}
                  alt="Bukti Kehadiran"
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="p-3 rounded-xl bg-muted/40 border border-border text-xs flex items-center justify-between">
                <div>
                  <span className="text-muted-foreground block text-[11px]">Teknisi:</span>
                  <span className="font-semibold text-foreground">{technicianName || 'Teknisi'}</span>
                </div>
                <div className="text-right">
                  <span className="text-muted-foreground block text-[11px]">Waktu Presensi:</span>
                  <span className="font-semibold text-emerald-600 font-mono">
                    {checkInDate || 'Tercatat'}
                  </span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={() => setPhotoModalOpen(false)}
                className="w-full h-9 text-xs font-medium cursor-pointer"
              >
                Tutup
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  )
}
