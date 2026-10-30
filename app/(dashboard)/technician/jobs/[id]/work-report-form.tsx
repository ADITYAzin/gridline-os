'use client'

import { useState, useTransition } from 'react'
import { submitWorkReportAction } from '@/app/actions/execution'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { FileText, CheckCircle2, Loader2, Send, Lock } from 'lucide-react'
import { toast } from 'sonner'

interface WorkReportFormProps {
  jobId: string
  existingReport: {
    result: string
    notes: string | null
    submitted_at: string
  } | null
  disabled: boolean
  hasCheckIn?: boolean
}

export function WorkReportForm({
  jobId,
  existingReport,
  disabled,
  hasCheckIn = true,
}: WorkReportFormProps) {
  const [result, setResult] = useState(existingReport?.result || '')
  const [notes, setNotes] = useState(existingReport?.notes || '')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isPending, startTransition] = useTransition()

  const isLocked = disabled || !hasCheckIn

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!result.trim() || result.trim().length < 5) {
      setError('Ringkasan hasil pengerjaan wajib diisi (minimal 5 karakter).')
      return
    }

    setError(null)
    startTransition(async () => {
      const res = await submitWorkReportAction(jobId, result, notes)
      if (res?.error) {
        setError(res.error)
        toast.error(res.error)
      } else {
        setSuccess(true)
        toast.success('Laporan kerja berhasil disimpan. Silakan lakukan Check-out di bawah.')
      }
    })
  }

  return (
    <Card className="shadow-xs rounded-[12px] bg-white border-[#E2E8F0]">
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xs text-[#475569] uppercase tracking-wider font-semibold flex items-center gap-2">
            <FileText className="h-4 w-4 text-[#007ACC]" /> Laporan Hasil Pekerjaan (Wajib)
          </CardTitle>
          {existingReport ? (
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" /> Terkirim
            </span>
          ) : !hasCheckIn ? (
            <span className="text-[10px] font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded flex items-center gap-1">
              <Lock className="h-2.5 w-2.5" /> Terkunci
            </span>
          ) : (
            <span className="text-[10px] font-bold text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded">
              Wajib Diisi
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-2 space-y-3">
        {!hasCheckIn && (
          <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-2.5 text-xs text-amber-900 dark:text-amber-200 flex items-center gap-2">
            <Lock className="h-4 w-4 shrink-0 text-amber-600" />
            <span>Lakukan Check-in kedatangan di lokasi terlebih dahulu sebelum mengisi laporan pekerjaan.</span>
          </div>
        )}

        {error && (
          <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-2.5 text-xs text-destructive font-medium">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-2.5 text-xs text-emerald-700 font-medium flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>Laporan kerja tersimpan! Lanjutkan ke tahap Check-out Lapangan di bawah.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="res" className="text-xs font-medium text-[#475569]">
              Hasil Pekerjaan & Tindakan Teknis *
            </Label>
            <Textarea
              id="res"
              rows={3}
              value={result}
              onChange={(e) => setResult(e.target.value)}
              placeholder="Tuliskan tindakan teknis dan hasil pengerjaan di lapangan secara rinci"
              disabled={isLocked || isPending}
              className="rounded-[8px] border-[#E2E8F0] text-sm focus-visible:ring-[#007ACC]"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="nt" className="text-xs font-medium text-[#475569]">
              Catatan Tambahan / Rekomendasi (Opsional)
            </Label>
            <Textarea
              id="nt"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Tuliskan rekomendasi perawatan atau catatan teknisi"
              disabled={isLocked || isPending}
              className="rounded-[8px] border-[#E2E8F0] text-sm focus-visible:ring-[#007ACC]"
            />
          </div>

          {!disabled && hasCheckIn && (
            <Button
              type="submit"
              className="w-full h-11 gap-2 text-xs font-semibold text-white rounded-[8px] shadow-xs touch-press cursor-pointer bg-[#007ACC] hover:bg-[#0062A3] active:bg-[#004F82]"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Menyimpan Laporan...
                </>
              ) : existingReport ? (
                <>
                  <Send className="h-3.5 w-3.5" /> Perbarui Laporan Kerja
                </>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5" /> Simpan Laporan Hasil Kerja
                </>
              )}
            </Button>
          )}
        </form>
      </CardContent>
    </Card>
  )
}
