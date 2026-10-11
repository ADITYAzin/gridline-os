'use client'

import { useState, useTransition } from 'react'
import { checkInAction, checkOutAction } from '@/app/actions/execution'
import { Button } from '@/components/ui/button'
import { MapPin, CheckCircle2, Loader2, Navigation } from 'lucide-react'

interface CheckInButtonProps {
  jobId: string
  attendance: {
    check_in_at: string | null
    check_out_at: string | null
  } | null
}

export function CheckInButton({ jobId, attendance }: CheckInButtonProps) {
  const [isPending, startTransition] = useTransition()
  const [isLocating, setIsLocating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isCheckedIn = Boolean(attendance?.check_in_at)
  const isCheckedOut = Boolean(attendance?.check_out_at)
  const isBusy = isPending || isLocating

  const handleAction = (type: 'in' | 'out') => {
    setError(null)
    setIsLocating(true)

    const executeWithCoords = (lat?: number, lng?: number) => {
      setIsLocating(false)
      startTransition(async () => {
        const res = type === 'in' ? await checkInAction(jobId, lat, lng) : await checkOutAction(jobId, lat, lng)
        if (res.error) {
          setError(res.error)
        }
      })
    }

    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          executeWithCoords(pos.coords.latitude, pos.coords.longitude)
        },
        () => {
          // If GPS fails or times out, proceed immediately so user is never blocked
          executeWithCoords()
        },
        { timeout: 3000, enableHighAccuracy: false, maximumAge: 60000 },
      )
    } else {
      executeWithCoords()
    }
  }

  if (isCheckedOut) {
    return (
      <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs text-emerald-700 dark:text-emerald-300 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          <span className="font-semibold">Check-out Selesai</span>
        </div>
        <span className="text-[11px] text-muted-foreground">
          {new Date(attendance!.check_out_at!).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {error && (
        <div className="rounded bg-destructive/10 border border-destructive/20 p-2 text-xs text-destructive">
          {error}
        </div>
      )}

      {!isCheckedIn ? (
        <Button
          onClick={() => handleAction('in')}
          disabled={isBusy}
          className="w-full h-12 gap-2 font-bold shadow-xs bg-[#007ACC] hover:bg-[#0062A3] active:bg-[#004F82] text-white rounded-[8px] touch-press cursor-pointer"
        >
          {isLocating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Mendapatkan Lokasi GPS...
            </>
          ) : isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Mencatat Check-in...
            </>
          ) : (
            <>
              <Navigation className="h-4 w-4" /> Check-in di Lokasi Servis (GPS)
            </>
          )}
        </Button>
      ) : (
        <div className="flex items-center justify-between gap-3 p-3 bg-[#F0F9FF] rounded-[8px] border border-[#BAE6FD]">
          <div className="flex items-center gap-2 text-xs">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span className="text-[#0369A1]">
              Check-in:{' '}
              <strong className="font-mono text-[#0F172A]">
                {new Date(attendance!.check_in_at!).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
              </strong>
            </span>
          </div>
          <Button
            onClick={() => handleAction('out')}
            variant="outline"
            size="sm"
            disabled={isBusy}
            className="h-9 text-xs font-semibold gap-1.5 border-[#007ACC]/30 text-[#007ACC] hover:bg-white active:bg-[#EBF5FC] rounded-[8px] touch-press cursor-pointer"
          >
            {isLocating ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> GPS...
              </>
            ) : isPending ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Menyimpan...
              </>
            ) : (
              <>
                <MapPin className="h-3.5 w-3.5" /> Check-out Selesai
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  )
}
