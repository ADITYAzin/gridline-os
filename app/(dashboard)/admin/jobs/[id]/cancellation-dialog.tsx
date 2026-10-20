'use client'

import { useState, useTransition } from 'react'
import { cancelJobAction } from '@/app/actions/jobs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Ban, Loader2 } from 'lucide-react'

export function CancellationDialog({ jobId }: { jobId: string }) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleCancel = () => {
    if (!reason.trim()) {
      setError('Alasan pembatalan wajib diisi.')
      return
    }
    setError(null)
    startTransition(async () => {
      const res = await cancelJobAction(jobId, reason)
      if (res.error) {
        setError(res.error)
      } else {
        setOpen(false)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10 gap-1.5">
          <Ban className="h-4 w-4" /> Batalkan Job
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-destructive flex items-center gap-2">
            <Ban className="h-5 w-5" /> Batalkan Pekerjaan
          </DialogTitle>
          <DialogDescription>
            Sesuai aturan Decision Log #6 & #9, pembatalan job wajib menyertakan alasan yang jelas untuk kebutuhan audit jejak operasional.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 pt-2">
          {error && (
            <div className="rounded-md bg-destructive/10 border border-destructive/20 p-2.5 text-xs text-destructive font-medium">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="reason">Alasan Pembatalan *</Label>
            <Textarea
              id="reason"
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Masukkan alasan pembatalan pekerjaan ini"
              disabled={isPending}
            />
          </div>
        </div>

        <DialogFooter className="pt-2">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
            Batal
          </Button>
          <Button variant="destructive" onClick={handleCancel} disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Membatalkan...
              </>
            ) : (
              'Konfirmasi Pembatalan'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
