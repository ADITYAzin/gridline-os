'use client'

import { useState, useTransition } from 'react'
import { completeJobAction } from '@/app/actions/execution'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2, AlertCircle, Loader2, ShieldCheck } from 'lucide-react'

interface CompletionReviewCardProps {
  jobId: string
  status: string
  isChecklistComplete: boolean
  hasBeforePhoto: boolean
  hasAfterPhoto: boolean
  hasSignature: boolean
  hasReport: boolean
}

export function CompletionReviewCard({
  jobId,
  status,
  isChecklistComplete,
  hasBeforePhoto,
  hasAfterPhoto,
  hasSignature,
  hasReport,
}: CompletionReviewCardProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const isAllRequirementsMet =
    isChecklistComplete && hasBeforePhoto && hasAfterPhoto && hasSignature && hasReport

  const isCompleted = status === 'completed'
  const isCancelled = status === 'cancelled'

  if (isCancelled) {
    return null
  }

  if (isCompleted) {
    return (
      <Card className="shadow-xs border-emerald-500/20 bg-emerald-500/5">
        <CardContent className="p-4 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500 text-white shrink-0">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-semibold text-sm text-foreground">Pekerjaan Selesai</h4>
            <p className="text-xs text-muted-foreground">
              Semua bukti dan verifikasi telah lengkap.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const handleComplete = () => {
    setError(null)
    startTransition(async () => {
      const res = await completeJobAction(jobId)
      if (res.error) {
        setError(res.error)
      }
    })
  }

  const checklistItems = [
    { label: 'Checklist SOP', isMet: isChecklistComplete },
    { label: 'Foto Sebelum', isMet: hasBeforePhoto },
    { label: 'Foto Sesudah', isMet: hasAfterPhoto },
    { label: 'Tanda Tangan Pelanggan', isMet: hasSignature },
    { label: 'Laporan Pekerjaan', isMet: hasReport },
  ]

  return (
    <Card className="shadow-xs">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-primary" />
          Syarat Penyelesaian
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {error && (
          <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-2.5 text-xs text-destructive flex items-start gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-2 text-xs">
          {checklistItems.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between">
              <span className="text-muted-foreground">{item.label}</span>
              {item.isMet ? (
                <span className="text-emerald-600 font-medium flex items-center gap-1 text-[11px]">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Lengkap
                </span>
              ) : (
                <span className="text-amber-600 font-medium text-[11px]">Belum Ada</span>
              )}
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="pt-1">
        <Button
          onClick={handleComplete}
          disabled={!isAllRequirementsMet || isPending}
          className={`w-full font-medium shadow-xs text-xs h-9 ${
            isAllRequirementsMet
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer'
              : 'opacity-50 cursor-not-allowed'
          }`}
        >
          {isPending ? (
            <>
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              Memproses...
            </>
          ) : (
            <>
              <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
              Selesaikan Pekerjaan
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
