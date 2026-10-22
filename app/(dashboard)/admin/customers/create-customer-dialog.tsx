'use client'

import { useState, useActionState } from 'react'
import { createCustomerAction, type CustomerActionState } from '@/app/actions/customers'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Plus, Loader2, Building2, Phone, Mail } from 'lucide-react'

const initialState: CustomerActionState = {}

interface CreateCustomerDialogProps {
  trigger?: React.ReactNode
  initialName?: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onCustomerCreated?: (customer: { id: string; name: string; address: string; phone?: string | null }) => void
}

export function CreateCustomerDialog({
  trigger,
  initialName = '',
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  onCustomerCreated,
}: CreateCustomerDialogProps = {}) {
  const [internalOpen, setInternalOpen] = useState(false)
  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : internalOpen

  const setOpen = (val: boolean) => {
    if (!isControlled) {
      setInternalOpen(val)
    }
    controlledOnOpenChange?.(val)
  }

  const [formData, setFormData] = useState({
    name: initialName || '',
    phone: '',
    email: '',
    address: '',
  })

  const [state, formAction, isPending] = useActionState(
    async (prevState: CustomerActionState, fd: FormData) => {
      const res = await createCustomerAction(prevState, fd)
      if (res.success) {
        setFormData({ name: '', phone: '', email: '', address: '' })
        setOpen(false)
        if (res.customer && onCustomerCreated) {
          onCustomerCreated(res.customer)
        }
      }
      return res
    },
    initialState
  )

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen)
    if (isOpen) {
      setFormData({ name: initialName || '', phone: '', email: '', address: '' })
    } else {
      setFormData({ name: '', phone: '', email: '', address: '' })
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {trigger ? (
        <DialogTrigger asChild>{trigger}</DialogTrigger>
      ) : !isControlled ? (
        <DialogTrigger asChild>
          <Button
            type="button"
            className="h-8 px-3 rounded-[8px] bg-[#007ACC] hover:bg-primary hover:text-white active:bg-[#004F82] text-[#FFFFFF] font-medium text-xs flex items-center gap-2 shadow-[0_1px_2px_0_rgba(0,122,204,0.15)] transition-all cursor-pointer focus:outline-none focus-visible:ring-4 focus-visible:ring-[#007ACC]/25"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Tambah Pelanggan</span>
          </Button>
        </DialogTrigger>
      ) : null}
      <DialogContent className="sm:max-w-md rounded-2xl p-6 space-y-4">
        <DialogHeader className="space-y-1">
          <DialogTitle className="font-heading text-base font-semibold text-foreground">
            Tambah Pelanggan Baru
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Simpan data kontak pelanggan untuk penugasan tiket servis.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4 pt-1">
          {state.error && (
            <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-3 text-xs font-medium text-destructive">
              {state.error}
            </div>
          )}

          {/* Customer Name */}
          <div className="space-y-1.5">
            <label htmlFor="name" className="block text-xs font-medium text-foreground">
              Nama Pelanggan / Bisnis <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                <Building2 className="h-4 w-4" />
              </div>
              <input
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder="Contoh: PT Graha Pratama / Ibu Siti"
                disabled={isPending}
                className="w-full h-9 rounded-lg border border-input bg-background pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground transition-all focus:border-[#007ACC] focus:ring-1 focus:ring-[#007ACC] outline-none disabled:bg-muted"
              />
            </div>
          </div>

          {/* 2 Cols: Phone & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="phone" className="block text-xs font-medium text-foreground">
                Nomor Telepon / WA
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                  <Phone className="h-4 w-4" />
                </div>
                <input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  placeholder="08123456789"
                  disabled={isPending}
                  className="w-full h-9 rounded-lg border border-input bg-background pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground transition-all focus:border-[#007ACC] focus:ring-1 focus:ring-[#007ACC] outline-none disabled:bg-muted"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-xs font-medium text-foreground">
                Email (Opsional)
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  placeholder="kontak@klien.com"
                  disabled={isPending}
                  className="w-full h-9 rounded-lg border border-input bg-background pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground transition-all focus:border-[#007ACC] focus:ring-1 focus:ring-[#007ACC] outline-none disabled:bg-muted"
                />
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="space-y-1.5">
            <label htmlFor="address" className="block text-xs font-medium text-foreground">
              Alamat Lokasi Servis <span className="text-destructive">*</span>
            </label>
            <textarea
              id="address"
              name="address"
              required
              rows={2}
              value={formData.address}
              onChange={(e) => updateField('address', e.target.value)}
              placeholder="Alamat lengkap lokasi unit/gedung..."
              disabled={isPending}
              className="w-full rounded-lg border border-input bg-background p-3 text-xs text-foreground placeholder:text-muted-foreground transition-all focus:border-[#007ACC] focus:ring-1 focus:ring-[#007ACC] outline-none disabled:bg-muted resize-none"
            />
          </div>

          <DialogFooter className="pt-3 border-t border-border/50 gap-2 sm:gap-2 flex items-center justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
              className="h-9 px-4 rounded-lg text-xs font-medium cursor-pointer"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="h-9 px-4 rounded-lg bg-[#007ACC] hover:bg-[#0062A3] text-white font-medium text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <span>Simpan Pelanggan</span>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
