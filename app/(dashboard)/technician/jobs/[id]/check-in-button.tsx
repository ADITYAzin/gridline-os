'use client'

import { useState, useTransition, useRef } from 'react'
import { checkInAction } from '@/app/actions/execution'
import { compressImage } from '@/lib/image-compress'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Camera,
  CheckCircle2,
  Loader2,
  Navigation,
  MapPin,
  Maximize2,
  Sparkles,
} from 'lucide-react'

interface CheckInButtonProps {
  jobId: string
  attendance: {
    check_in_at: string | null
    check_out_at: string | null
    check_in_photo_url?: string | null
    display_photo_url?: string | null
  } | null
}

export function CheckInButton({ jobId, attendance }: CheckInButtonProps) {
  const [isPending, startTransition] = useTransition()
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isCheckedIn = Boolean(attendance?.check_in_at)
  const isBusy = isPending || isProcessing

  // Trigger camera file input
  const handleTriggerCapture = () => {
    setError(null)
    fileInputRef.current?.click()
  }

  // Handle selected camera/file photo & acquire GPS coords concurrently
  const handlePhotoSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawFile = e.target.files?.[0]
    if (!rawFile) return

    setError(null)
    setIsProcessing(true)

    try {
      // 1. Kick off GPS acquisition concurrently with image compression (Eliminate Waterfall!)
      const gpsPromise = new Promise<{ lat?: number; lng?: number }>((resolve) => {
        if (typeof window !== 'undefined' && 'geolocation' in navigator) {
          navigator.geolocation.getCurrentPosition(
            (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
            () => resolve({}),
            { timeout: 4000, enableHighAccuracy: false, maximumAge: 60000 },
          )
        } else {
          resolve({})
        }
      })

      // 2. Compress image client-side & retrieve GPS coordinates in parallel
      const [compressedFile, coords] = await Promise.all([
        compressImage(rawFile, 1200, 0.8),
        gpsPromise,
      ])

      setIsProcessing(false)

      startTransition(async () => {
        const formData = new FormData()
        formData.append('photo', compressedFile)

        const res = await checkInAction(jobId, coords.lat, coords.lng, formData)
        if (res?.error) {
          setError(res.error)
        }
      })
    } catch {
      setIsProcessing(false)
      setError('Gagal memproses foto kehadiran. Silakan coba lagi.')
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <div className="space-y-2">
      {/* Hidden camera input with capture="user" (front selfie camera prioritized on mobile) */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        capture="user"
        className="hidden"
        onChange={handlePhotoSelected}
      />

      {error && (
        <div className="rounded-[8px] bg-destructive/10 border border-destructive/20 p-2.5 text-xs text-destructive flex items-start gap-2">
          <span className="font-semibold">Perhatian:</span>
          <span>{error}</span>
        </div>
      )}

      {!isCheckedIn ? (
        <div className="rounded-xl bg-gradient-to-r from-[#EBF5FC] to-white border border-[#BAE6FD] p-3.5 shadow-2xs space-y-2.5">
          <div className="flex items-center justify-between text-xs sm:text-sm text-[#0369A1]">
            <span className="font-bold flex items-center gap-1.5">
              <Navigation className="h-4 w-4 text-[#007ACC]" />
              Presensi Kehadiran di Lokasi
            </span>
            <span className="text-xs bg-[#007ACC]/15 text-[#007ACC] px-2 py-0.5 rounded-full font-bold">
              GPS + Foto
            </span>
          </div>

          <Button
            type="button"
            onClick={handleTriggerCapture}
            disabled={isBusy}
            className="w-full h-12 gap-2 text-sm font-bold shadow-xs bg-[#007ACC] hover:bg-[#0062A3] active:bg-[#004F82] text-white rounded-lg touch-press cursor-pointer"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4.5 w-4.5 animate-spin" /> Memproses Foto & Lokasi GPS...
              </>
            ) : isPending ? (
              <>
                <Loader2 className="h-4.5 w-4.5 animate-spin" /> Mencatat Kehadiran...
              </>
            ) : (
              <>
                <Camera className="h-4.5 w-4.5" /> Ambil Foto & Check-in di Lokasi
              </>
            )}
          </Button>
        </div>
      ) : (
        /* Status Card Saat Sudah Check-in (Top Area - Tanpa Tombol Checkout) */
        <div className="p-3 bg-emerald-50/80 rounded-xl border border-emerald-300 shadow-2xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold text-emerald-950">Hadir di Lokasi</span>
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <p className="text-xs text-[#334155] font-medium truncate">
                Pukul{' '}
                <strong className="font-mono text-[#0F172A] font-bold">
                  {new Date(attendance!.check_in_at!).toLocaleTimeString('id-ID', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}{' '}
                  WIB
                </strong>
              </p>
            </div>
          </div>

          {/* Pratinjau Foto Kehadiran (Jika ada) */}
          {attendance?.display_photo_url ? (
            <div className="shrink-0 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPreviewOpen(true)}
                className="relative group h-10 w-10 rounded-[8px] overflow-hidden border border-emerald-300 shadow-2xs cursor-pointer focus:outline-hidden"
                title="Lihat Foto Kehadiran"
              >
                <img
                  src={attendance.display_photo_url}
                  alt="Foto Kehadiran"
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                  <Maximize2 className="h-3 w-3" />
                </div>
              </button>
            </div>
          ) : (
            <span className="text-[10px] text-emerald-700 font-medium bg-emerald-100 px-2 py-0.5 rounded-full">
              GPS Tercatat
            </span>
          )}
        </div>
      )}

      {/* Modal Dialog Pratinjau Foto Kehadiran */}
      {attendance?.display_photo_url && (
        <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
          <DialogContent className="sm:max-w-md p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-xl">
            <DialogHeader className="pb-3 border-b">
              <DialogTitle className="text-sm font-bold flex items-center gap-2 text-[#0F172A]">
                <Camera className="h-4 w-4 text-[#007ACC]" />
                Bukti Foto Presensi Teknisi
              </DialogTitle>
            </DialogHeader>

            <div className="mt-3.5 space-y-3">
              <div className="aspect-4/3 rounded-xl overflow-hidden bg-slate-950 border border-slate-200 shadow-inner flex items-center justify-center">
                <img
                  src={attendance.display_photo_url}
                  alt="Foto Kehadiran"
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-[#64748B]">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span>
                    Waktu Check-in:{' '}
                    <strong className="text-[#0F172A] font-mono">
                      {new Date(attendance.check_in_at!).toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}{' '}
                      WIB
                    </strong>
                  </span>
                </div>
                <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                  Tercatat
                </span>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={() => setPreviewOpen(false)}
                className="w-full h-9 text-xs font-medium text-[#475569] rounded-[8px]"
              >
                Tutup Pratinjau
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
