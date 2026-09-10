'use client'

import { useState, useTransition } from 'react'
import { submitWorkReportAction } from '@/app/actions/execution'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { FileText, CheckCircle2, Loader2, Send } from 'lucide-react'

interface WorkReportFormProps {
  jobId: string
  existingReport: {
    result: string
    notes: string | null
    submitted_at: string
  } | null
  disabled: boolean
}

export function WorkReportForm({ jobId, existingReport, disabled }: WorkReportFormProps) {
  const [result, setResult] = useState(existingReport?.result || '')
  const [notes, setNotes] = useState(existingReport?.notes || '')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!result.trim()) {
      setError('Ringkasan hasil pengerjaan wajib diisi.')
      return
    }

    setError(null)
    startTransition(async () => {
      const res = await submitWorkReportAction(jobId, result, notes)
      if (res.error) {
        setError(res.error)
      } else {
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)
      }
    })
  }

  return (
    <Card className="shadow-sm">
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" /> Laporan Hasil Pekerjaan
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
        <CardDescription className="text-xs">
          Dokumentasikan perbaikan teknis yang telah Anda lakukan di lokasi.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <form onSubmit={handleSubmit} className="space-y-3">
          {error && (
            <div className="rounded bg-destructive/10 border border-destructive/20 p-2 text-xs text-destructive">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded bg-emerald-500/10 border border-emerald-500/20 p-2 text-xs text-emerald-600 font-medium">
              Laporan kerja berhasil disimpan dan disubmit!
            </div>
          )}

          <div className="space-y-1">
            <Label htmlFor="res" className="text-xs font-medium text-[#475569]">Hasil Pekerjaan & Tindakan Teknis *</Label>
            <Textarea
              id="res"
              rows={3}
              value={result}
              onChange={(e) => setResult(e.target.value)}
              placeholder="Contoh: Pembersihan filter selesai, freon ditambah 20 psi, kebocoran pipa diperbaiki..."
              disabled={disabled || isPending}
              className="rounded-[8px] border-[#E2E8F0] text-sm focus-visible:ring-[#007ACC]"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="nt" className="text-xs font-medium text-[#475569]">Catatan Tambahan / Rekomendasi (Opsional)</Label>
            <Textarea
              id="nt"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Disarankan servis rutin kembali 3 bulan mendatang..."
              disabled={disabled || isPending}
              className="rounded-[8px] border-[#E2E8F0] text-sm focus-visible:ring-[#007ACC]"
            />
          </div>

          {!disabled && (
            <Button
              type="submit"
              className="w-full h-11 gap-2 text-xs font-semibold bg-[#007ACC] hover:bg-[#0062A3] active:bg-[#004F82] text-white rounded-[8px] shadow-xs touch-press"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Mengirim Laporan...
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
