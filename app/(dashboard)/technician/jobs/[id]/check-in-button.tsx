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
  const [error, setError] = useState<string | null>(null)

  const isCheckedIn = Boolean(attendance?.check_in_at)
  const isCheckedOut = Boolean(attendance?.check_out_at)

  const handleAction = (type: 'in' | 'out') => {
    setError(null)

    const executeWithCoords = (lat?: number, lng?: number) => {
      startTransition(async () => {
        const res = type === 'in' ? await checkInAction(jobId, lat, lng) : await checkOutAction(jobId, lat, lng)
        if (res.error) {
          setError(res.error)
        }
      })
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          executeWithCoords(pos.coords.latitude, pos.coords.longitude)
        },
        () => {
          executeWithCoords()
        },
        { timeout: 5000 },
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
          disabled={isPending}
          className="w-full h-11 gap-2 font-bold shadow-md bg-blue-600 hover:bg-blue-700 text-white"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Mencatat Lokasi GPS...
            </>
          ) : (
            <>
              <Navigation className="h-4 w-4" /> Check-in di Lokasi Servis
            </>
          )}
        </Button>
      ) : (
        <div className="flex items-center justify-between gap-3 p-3 bg-muted/60 rounded-lg border">
          <div className="flex items-center gap-2 text-xs">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            <span>
              Check-in:{' '}
              <strong className="font-mono">
                {new Date(attendance!.check_in_at!).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
              </strong>
            </span>
          </div>
          <Button
            onClick={() => handleAction('out')}
            variant="outline"
            size="sm"
            disabled={isPending}
            className="h-8 text-xs font-semibold gap-1"
          >
            {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <MapPin className="h-3.5 w-3.5" />}
            Check-out
          </Button>
        </div>
      )}
    </div>
  )
}
