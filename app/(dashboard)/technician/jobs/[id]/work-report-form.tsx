'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { submitWorkReportAction, completeJobAction } from '@/app/actions/execution'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { FileText, CheckCircle2, Loader2, Send } from 'lucide-react'
import { toast } from 'sonner'

interface WorkReportFormProps {
  jobId: string
  existingReport: {
    result: string
    notes: string | null
    submitted_at: string
  } | null
  disabled: boolean
  allOtherGatesMet?: boolean
  isAllGatesMet?: boolean
}

export function WorkReportForm({
  jobId,
  existingReport,
  disabled,
  allOtherGatesMet = false,
  isAllGatesMet = false,
}: WorkReportFormProps) {
  const router = useRouter()
  const [result, setResult] = useState(existingReport?.result || '')
  const [notes, setNotes] = useState(existingReport?.notes || '')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!result.trim() || result.trim().length < 5) {
      setError('Ringkasan hasil pengerjaan wajib diisi (minimal 5 karakter).')
      return
    }

    setError(null)
    startTransition(async () => {
      const res = await submitWorkReportAction(jobId, result, notes, true)
      if (res.error) {
        setError(res.error)
        toast.error(res.error)
      } else {
        setSuccess(true)
        if (res.completed) {
          toast.success('Pekerjaan selesai! Status telah beralih ke Selesai.')
        } else {
          toast.success('Laporan kerja berhasil disimpan.')
        }
        router.refresh()
      }
    })
  }

  const handleFinalizeCompletion = () => {
    setError(null)
    startTransition(async () => {
      const res = await completeJobAction(jobId)
      if (res.error) {
        setError(res.error)
        toast.error(res.error)
      } else {
        toast.success('Pekerjaan selesai! Status telah beralih ke Selesai.')
        router.refresh()
      }
    })
  }

  return (
    <Card className="shadow-xs rounded-[12px] bg-white border-[#E2E8F0]">
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xs text-[#475569] uppercase tracking-wider font-semibold flex items-center gap-2">
            <FileText className="h-4 w-4 text-[#007ACC]" /> Laporan Hasil Pekerjaan
          </CardTitle>
          {existingReport ? (
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" /> Terkirim
            </span>
          ) : (
            <span className="text-[10px] font-bold text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded">
              Belum Mengirim Laporan
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-2 space-y-3">
        {error && (
          <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-2.5 text-xs text-destructive font-medium">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-2.5 text-xs text-emerald-600 font-medium flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>Laporan kerja berhasil disimpan!</span>
          </div>
        )}

        {/* If report already exists and all gates are met, but job is still on_progress, provide 1-click completion */}
        {existingReport && !disabled && isAllGatesMet && (
          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>Seluruh Syarat Pekerjaan Telah Lengkap</span>
            </div>
            <p className="text-[11px] text-emerald-700/80 leading-relaxed">
              Check-in, SOP, foto before/after, tanda tangan, dan laporan sudah valid. Klik tombol di bawah untuk menyelesaikan tiket.
            </p>
            <Button
              type="button"
              onClick={handleFinalizeCompletion}
              disabled={isPending}
              className="w-full h-10 gap-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-[8px] shadow-xs cursor-pointer touch-press"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Menyelesaikan Pekerjaan...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" /> Selesaikan Pekerjaan (Complete)
                </>
              )}
            </Button>
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
              placeholder="Tuliskan tindakan teknis dan hasil pengerjaan di lapangan"
              disabled={disabled || isPending}
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
              disabled={disabled || isPending}
              className="rounded-[8px] border-[#E2E8F0] text-sm focus-visible:ring-[#007ACC]"
            />
          </div>

          {!disabled && (
            <Button
              type="submit"
              className={`w-full h-11 gap-2 text-xs font-semibold text-white rounded-[8px] shadow-xs touch-press cursor-pointer ${
                allOtherGatesMet
                  ? 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800'
                  : 'bg-[#007ACC] hover:bg-[#0062A3] active:bg-[#004F82]'
              }`}
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Menyimpan...
                </>
              ) : allOtherGatesMet ? (
                <>
                  <CheckCircle2 className="h-4 w-4" /> Kirim Laporan & Selesaikan Pekerjaan
                </>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5" /> Kirim Laporan Kerja
                </>
              )}
            </Button>
          )}
        </form>
      </CardContent>
    </Card>
  )
}
