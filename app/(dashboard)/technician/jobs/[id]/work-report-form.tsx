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
    <Card className="shadow-xs rounded-xl bg-white border-[#E2E8F0]">
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
            <FileText className="h-4.5 w-4.5 text-[#007ACC]" /> Laporan Pekerjaan
          </CardTitle>
          {existingReport ? (
            <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Terkirim
            </span>
          ) : !hasCheckIn ? (
            <span className="text-xs font-semibold text-[#64748B] bg-slate-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Lock className="h-3 w-3" /> Terkunci
            </span>
          ) : (
            <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full">
              Wajib Diisi
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-2 space-y-3">
        {!hasCheckIn && (
          <div className="rounded-lg bg-amber-500/10 border border-amber-500/30 p-2.5 text-xs sm:text-sm text-amber-950 font-semibold flex items-center gap-2">
            <Lock className="h-4 w-4 shrink-0 text-amber-600" />
            <span>Check-in di lokasi terlebih dahulu untuk mengisi laporan.</span>
          </div>
        )}

        {error && (
          <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-2.5 text-xs sm:text-sm text-destructive font-bold">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-lg bg-emerald-50 border border-emerald-300 p-2.5 text-xs sm:text-sm text-emerald-800 font-bold flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>Laporan kerja tersimpan. Siap untuk Check-out di bawah.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="res" className="text-sm font-bold text-[#0F172A]">
              Hasil Pekerjaan & Tindakan *
            </Label>
            <Textarea
              id="res"
              rows={3}
              value={result}
              onChange={(e) => setResult(e.target.value)}
              placeholder="Ringkasan tindakan teknis dan hasil servis..."
              disabled={isLocked || isPending}
              className="rounded-lg border-[#CBD5E1] text-sm font-medium focus-visible:ring-[#007ACC] p-3"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="nt" className="text-xs sm:text-sm font-medium text-[#475569]">
              Catatan / Rekomendasi (Opsional)
            </Label>
            <Textarea
              id="nt"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Catatan perawatan atau temuan teknisi..."
              disabled={isLocked || isPending}
              className="rounded-lg border-[#CBD5E1] text-sm font-medium focus-visible:ring-[#007ACC] p-3"
            />
          </div>

          {!disabled && hasCheckIn && (
            <Button
              type="submit"
              className="w-full h-12 gap-2 text-sm font-bold text-white rounded-lg shadow-xs touch-press cursor-pointer bg-[#007ACC] hover:bg-[#0062A3] active:bg-[#004F82]"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Menyimpan Laporan...
                </>
              ) : existingReport ? (
                <>
                  <Send className="h-4 w-4" /> Perbarui Laporan
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
