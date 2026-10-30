'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { deleteTechnicianAction } from '@/app/actions/team'
import { toast } from 'sonner'
import { Trash2, AlertTriangle, AlertCircle, Loader2 } from 'lucide-react'

interface DeleteTechnicianDialogProps {
  technicianId: string
  technicianName: string
}

export function DeleteTechnicianDialog({
  technicianId,
  technicianName,
}: DeleteTechnicianDialogProps) {
  const [open, setOpen] = useState(false)
  const [inputName, setInputName] = useState('')
  const [isPending, startTransition] = useTransition()

  const isMatch =
    inputName.trim().length > 0 &&
    inputName.trim().toLowerCase() === technicianName.trim().toLowerCase()

  const handleOpenChange = (nextOpen: boolean) => {
    if (!isPending) {
      setOpen(nextOpen)
      if (!nextOpen) {
        setInputName('')
      }
    }
  }

  const handleDelete = () => {
    if (!isMatch || isPending) return

    startTransition(async () => {
      const res = await deleteTechnicianAction(technicianId, inputName)
      if (res.success) {
        toast.success('Data Teknisi Dihapus', {
          description: `Data teknisi ${technicianName} telah berhasil dihapus dari sistem.`,
        })
        setOpen(false)
        setInputName('')
      } else {
        toast.error('Gagal Menghapus Teknisi', {
          description: res.error || 'Terjadi kesalahan saat menghapus teknisi.',
        })
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 px-2.5 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200 dark:border-rose-900/50 dark:hover:bg-rose-950/40 gap-1.5 font-medium transition-colors"
          title={`Hapus teknisi ${technicianName}`}
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span>Hapus</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md rounded-2xl p-6 space-y-4">
        <DialogHeader className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold text-foreground">
                Hapus Data Teknisi
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Konfirmasi penghapusan akses dan data teknisi.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="rounded-xl border border-rose-200 bg-rose-50/70 p-3.5 text-xs text-rose-800 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300 space-y-1">
          <p className="font-semibold flex items-center gap-1.5">
            <AlertCircle className="h-4 w-4 shrink-0" />
            Tindakan ini tidak dapat dibatalkan
          </p>
          <p className="text-[11px] leading-relaxed text-rose-700 dark:text-rose-400">
            Akun dan akses teknisi <strong>{technicianName}</strong> akan dihapus permanen. Jadwal yang belum dikerjakan akan dialihkan kembali ke status antrean (belum ditugaskan).
          </p>
        </div>

        <div className="space-y-2 pt-1">
          <Label
            htmlFor={`confirm-input-${technicianId}`}
            className="text-xs font-medium text-slate-700 dark:text-slate-300 block"
          >
            Ketik nama teknisi{' '}
            <span className="font-semibold text-rose-600 dark:text-rose-400 font-mono bg-rose-50 dark:bg-rose-950/50 px-1.5 py-0.5 rounded border border-rose-200 dark:border-rose-800 select-all">
              {technicianName}
            </span>{' '}
            di bawah untuk konfirmasi:
          </Label>
          <Input
            id={`confirm-input-${technicianId}`}
            type="text"
            value={inputName}
            onChange={(e) => setInputName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && isMatch && !isPending) {
                e.preventDefault()
                handleDelete()
              }
            }}
            placeholder={`Ketik "${technicianName}"`}
            className="h-9 text-xs"
            autoComplete="off"
            disabled={isPending}
            autoFocus
          />
        </div>

        <DialogFooter className="flex flex-row items-center justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleOpenChange(false)}
            disabled={isPending}
            className="h-8 text-xs"
          >
            Batal
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={!isMatch || isPending}
            className="h-8 text-xs gap-1.5 font-semibold bg-rose-600 hover:bg-rose-700 text-white disabled:opacity-50"
          >
            {isPending ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Menghapus...</span>
              </>
            ) : (
              <>
                <Trash2 className="h-3.5 w-3.5" />
                <span>Hapus Teknisi</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
