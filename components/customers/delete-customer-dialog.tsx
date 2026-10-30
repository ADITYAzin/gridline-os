'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
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
import { deleteCustomerAction } from '@/app/actions/customers'
import { toast } from 'sonner'
import { Trash2, AlertTriangle, AlertCircle, Loader2 } from 'lucide-react'

interface DeleteCustomerDialogProps {
  customerId: string
  customerName: string
  triggerVariant?: 'icon' | 'button'
  redirectOnDelete?: boolean
}

export function DeleteCustomerDialog({
  customerId,
  customerName,
  triggerVariant = 'icon',
  redirectOnDelete = false,
}: DeleteCustomerDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [inputName, setInputName] = useState('')
  const [isPending, startTransition] = useTransition()

  const isMatch =
    inputName.trim().length > 0 &&
    inputName.trim().toLowerCase() === customerName.trim().toLowerCase()

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
      const res = await deleteCustomerAction(customerId, inputName)
      if (res.success) {
        toast.success('Data Pelanggan Berhasil Dihapus', {
          description: `Pelanggan "${customerName}" beserta riwayatnya telah dihapus dari sistem.`,
        })
        setOpen(false)
        setInputName('')
        if (redirectOnDelete) {
          router.push('/admin/customers')
        }
      } else {
        toast.error('Gagal Menghapus Pelanggan', {
          description: res.error || 'Terjadi kesalahan saat menghapus data pelanggan.',
        })
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {triggerVariant === 'button' ? (
          <Button
            variant="outline"
            size="sm"
            className="h-8 px-2.5 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200 dark:border-rose-900/50 dark:hover:bg-rose-950/40 gap-1.5 font-medium transition-colors"
            title={`Hapus pelanggan ${customerName}`}
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Hapus Pelanggan</span>
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-[8px] border border-rose-200 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700 text-rose-600 dark:border-rose-900/50 dark:hover:bg-rose-950/40 transition-colors p-0 flex items-center justify-center shadow-none shrink-0"
            title={`Hapus pelanggan ${customerName}`}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-md rounded-2xl p-6 space-y-4">
        <DialogHeader className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold text-foreground">
                Hapus Data Pelanggan
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Konfirmasi penghapusan data profil dan riwayat pelanggan.
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
            Data pelanggan <strong>{customerName}</strong>, termasuk riwayat tiket pekerjaan, aset perangkat, dan jadwal terkait akan dihapus secara permanen dari sistem.
          </p>
        </div>

        <div className="space-y-2 pt-1">
          <Label
            htmlFor={`confirm-input-customer-${customerId}`}
            className="text-xs font-medium text-slate-700 dark:text-slate-300 block"
          >
            Ketik nama pelanggan{' '}
            <span className="font-semibold text-rose-600 dark:text-rose-400 font-mono bg-rose-50 dark:bg-rose-950/50 px-1.5 py-0.5 rounded border border-rose-200 dark:border-rose-800 select-all">
              {customerName}
            </span>{' '}
            di bawah untuk konfirmasi:
          </Label>
          <Input
            id={`confirm-input-customer-${customerId}`}
            type="text"
            value={inputName}
            onChange={(e) => setInputName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && isMatch && !isPending) {
                e.preventDefault()
                handleDelete()
              }
            }}
            placeholder={`Ketik "${customerName}"`}
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
                <span>Hapus Pelanggan</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
