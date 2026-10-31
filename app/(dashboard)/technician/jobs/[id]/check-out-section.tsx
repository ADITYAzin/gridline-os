'use client'

import { useState, useTransition } from 'react'
import { checkOutAction } from '@/app/actions/execution'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  CheckCircle2,
  Loader2,
  MapPin,
  LogOut,
  AlertCircle,
  Lock,
} from 'lucide-react'
import { toast } from 'sonner'
import { JobCompletedModal } from '@/components/technician/job-completed-view'

interface CheckOutSectionProps {
  jobId: string
  attendance: {
    check_in_at: string | null
    check_out_at: string | null
  } | null
  disabled?: boolean
  isReadyForCheckout?: boolean
  jobNumber?: string
  serviceType?: string
  commissionAmount?: number | null
}

export function CheckOutSection({
  jobId,
  attendance,
  disabled = false,
  isReadyForCheckout = false,
  jobNumber = '',
  serviceType = '',
  commissionAmount = null,
}: CheckOutSectionProps) {
  const [isPending, startTransition] = useTransition()
  const [isLocating, setIsLocating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showCompletedModal, setShowCompletedModal] = useState(false)

  const isCheckedIn = Boolean(attendance?.check_in_at)
  const isCheckedOut = Boolean(attendance?.check_out_at)
  const isBusy = isPending || isLocating

  const handleCheckOut = () => {
    if (!isReadyForCheckout) {
      setError('Selesaikan seluruh langkah SOP, foto bukti, tanda tangan, dan laporan kerja terlebih dahulu.')
      return
    }

    setError(null)
    setIsLocating(true)

    const executeWithCoords = (lat?: number, lng?: number) => {
      setIsLocating(false)
      startTransition(async () => {
        const res = await checkOutAction(jobId, lat, lng)
        if (res?.error) {
          setError(res.error)
          toast.error(res.error)
        } else {
          toast.success('Check-out berhasil! Tiket pekerjaan telah selesai.')
          setShowCompletedModal(true)
        }
      })
    }

    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          executeWithCoords(pos.coords.latitude, pos.coords.longitude)
        },
        () => {
          // If GPS fails or times out, proceed immediately so technician is not blocked
          executeWithCoords()
        },
        { timeout: 4000, enableHighAccuracy: false, maximumAge: 60000 },
      )
    } else {
      executeWithCoords()
    }
  }

  // Jika belum check-in di lokasi
  if (!isCheckedIn) {
    return (
      <Card className="shadow-xs rounded-[12px] bg-muted/30 border-[#E2E8F0] overflow-hidden opacity-85">
        <CardContent className="p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#475569] font-bold flex items-center gap-2">
              <LogOut className="h-4 w-4 text-muted-foreground" />
              Check-out Lapangan
            </span>
            <span className="text-xs bg-muted text-[#64748B] font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Lock className="h-3 w-3" /> Terkunci
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#64748B] font-medium leading-normal">
            Check-in kedatangan terlebih dahulu untuk membuka Check-out.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className="shadow-xs rounded-[12px] bg-white border-[#E2E8F0] overflow-hidden">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#0F172A] font-bold flex items-center gap-2">
              <LogOut className="h-4 w-4 text-[#007ACC]" />
              Check-out Lapangan
            </span>
            {isCheckedOut ? (
              <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Selesai
              </span>
            ) : isReadyForCheckout ? (
              <span className="text-xs bg-emerald-500/10 text-emerald-700 font-bold px-2.5 py-0.5 rounded-full animate-pulse">
                Siap Check-out
              </span>
            ) : (
              <span className="text-xs bg-amber-500/10 text-amber-800 font-semibold px-2.5 py-0.5 rounded-full">
                Menunggu Syarat
              </span>
            )}
          </div>

          {error && (
            <div className="rounded-[8px] bg-destructive/10 border border-destructive/20 p-2.5 text-xs text-destructive flex items-center gap-1.5">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {isCheckedOut ? (
            <div className="rounded-[8px] bg-emerald-50 border border-emerald-200 p-3 text-sm text-emerald-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span className="font-bold">Check-out Selesai</span>
              </div>
              <span className="font-mono text-emerald-900 font-bold">
                {new Date(attendance!.check_out_at!).toLocaleTimeString('id-ID', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}{' '}
                WIB
              </span>
            </div>
          ) : (
            <div className="space-y-2.5">
              {!isReadyForCheckout ? (
                <div className="rounded-[8px] bg-amber-500/10 border border-amber-500/20 p-2.5 text-xs sm:text-sm text-amber-900 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" />
                  <span className="font-medium leading-normal">
                    Lengkapi SOP, Foto, Ttd & Laporan di atas untuk Check-out.
                  </span>
                </div>
              ) : (
                <p className="text-xs sm:text-sm text-emerald-800 font-semibold leading-normal">
                  Semua syarat lengkap. Siap Check-out.
                </p>
              )}

              <Button
                type="button"
                onClick={handleCheckOut}
                disabled={disabled || isBusy || !isReadyForCheckout}
                className={`w-full h-12 text-sm font-bold gap-2 rounded-[8px] touch-press cursor-pointer ${
                  isReadyForCheckout
                    ? 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-xs'
                    : 'bg-muted text-muted-foreground hover:bg-muted cursor-not-allowed opacity-60'
                }`}
              >
                {isLocating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Mengambil Titik GPS Kepulangan...
                  </>
                ) : isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Menyimpan Check-out...
                  </>
                ) : (
                  <>
                    <MapPin className="h-4 w-4" /> Check-out & Selesaikan Pekerjaan
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <JobCompletedModal
        open={showCompletedModal}
        onOpenChange={setShowCompletedModal}
        jobNumber={jobNumber}
        serviceType={serviceType}
        jobId={jobId}
        commissionAmount={commissionAmount}
      />
    </>
  )
}
