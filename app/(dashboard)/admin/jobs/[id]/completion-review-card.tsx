'use client'

import { useState, useTransition } from 'react'
import { completeJobAction } from '@/app/actions/execution'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
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
      <Card className="shadow-sm border-emerald-500/30 bg-emerald-500/5">
        <CardContent className="p-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-white shrink-0">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-emerald-800 dark:text-emerald-300">Pekerjaan Selesai (Completed)</h4>
            <p className="text-xs text-muted-foreground">
              Seluruh SOP, bukti foto, tanda tangan, dan laporan kerja telah diverifikasi.
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

  return (
    <Card className="shadow-sm border-border/80">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-primary" />
          Verifikasi Penyelesaian (Decision #4 Gate)
        </CardTitle>
        <CardDescription className="text-xs">
          Job hanya dapat diselesaikan jika seluruh 5 syarat pemenuhan PRD telah valid.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {error && (
          <div className="rounded bg-destructive/10 border border-destructive/20 p-2.5 text-xs text-destructive flex items-start gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span>1. Semua SOP Checklist Dicentang</span>
            {isChecklistComplete ? (
              <span className="text-emerald-600 font-bold flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" /> Lengkap
              </span>
            ) : (
              <span className="text-destructive font-semibold">Belum Selesai</span>
            )}
          </div>

          <div className="flex items-center justify-between">
            <span>2. Minimal 1 Foto Sebelum (Before)</span>
            {hasBeforePhoto ? (
              <span className="text-emerald-600 font-bold flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" /> Lengkap
              </span>
            ) : (
              <span className="text-destructive font-semibold">Belum Ada</span>
            )}
          </div>

          <div className="flex items-center justify-between">
            <span>3. Minimal 1 Foto Sesudah (After)</span>
            {hasAfterPhoto ? (
              <span className="text-emerald-600 font-bold flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" /> Lengkap
              </span>
            ) : (
              <span className="text-destructive font-semibold">Belum Ada</span>
            )}
          </div>

          <div className="flex items-center justify-between">
            <span>4. Tanda Tangan Pelanggan</span>
            {hasSignature ? (
              <span className="text-emerald-600 font-bold flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" /> Lengkap
              </span>
            ) : (
              <span className="text-destructive font-semibold">Belum Ada</span>
            )}
          </div>

          <div className="flex items-center justify-between">
            <span>5. Laporan Kerja Disubmit</span>
            {hasReport ? (
              <span className="text-emerald-600 font-bold flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" /> Lengkap
              </span>
            ) : (
              <span className="text-destructive font-semibold">Belum Ada</span>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-1">
        <Button
          onClick={handleComplete}
          disabled={!isAllRequirementsMet || isPending}
          className={`w-full font-bold shadow-md ${
            isAllRequirementsMet
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
              : 'opacity-50 cursor-not-allowed'
          }`}
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Memvalidasi di Database...
            </>
          ) : (
            <>
              <CheckCircle2 className="mr-1.5 h-4 w-4" />
              Verifikasi & Selesaikan Job (Complete)
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
