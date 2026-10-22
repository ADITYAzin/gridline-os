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
        <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10 gap-1.5 cursor-pointer">
          <Ban className="h-4 w-4" /> Batalkan
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md rounded-2xl p-6 space-y-4">
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-base font-semibold text-destructive flex items-center gap-2">
            <Ban className="h-4 w-4" /> Batalkan Pekerjaan
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Alasan pembatalan akan dicatat dalam riwayat pekerjaan.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-1">
          {error && (
            <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive font-medium">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="reason" className="text-xs font-medium text-foreground">
              Alasan Pembatalan <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="reason"
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Contoh: Pelanggan meminta pembatalan / suku cadang tidak tersedia"
              disabled={isPending}
              className="text-xs rounded-lg resize-none bg-background"
            />
          </div>
        </div>

        <DialogFooter className="pt-3 border-t border-border/50 gap-2 sm:gap-2 flex items-center justify-end">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isPending}
            className="h-9 px-4 text-xs font-medium rounded-lg cursor-pointer"
          >
            Batal
          </Button>
          <Button
            variant="destructive"
            onClick={handleCancel}
            disabled={isPending || !reason.trim()}
            className="h-9 px-4 text-xs font-medium rounded-lg cursor-pointer shadow-xs"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                Membatalkan...
              </>
            ) : (
              'Batalkan Pekerjaan'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
