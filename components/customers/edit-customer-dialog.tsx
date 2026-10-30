'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { updateCustomerAction } from '@/app/actions/customers'
import { toast } from 'sonner'
import { Pencil, Loader2, Building2, Phone, Mail, MapPin } from 'lucide-react'

interface EditCustomerDialogProps {
  customer: {
    id: string
    name: string
    phone?: string | null
    email?: string | null
    address: string
  }
  triggerVariant?: 'icon' | 'button'
  onCustomerUpdated?: (customer: {
    id: string
    name: string
    phone?: string | null
    email?: string | null
    address: string
  }) => void
}

export function EditCustomerDialog({
  customer,
  triggerVariant = 'icon',
  onCustomerUpdated,
}: EditCustomerDialogProps) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: customer.name || '',
    phone: customer.phone || '',
    email: customer.email || '',
    address: customer.address || '',
  })

  const handleOpenChange = (nextOpen: boolean) => {
    if (!isPending) {
      setOpen(nextOpen)
      if (nextOpen) {
        setFormData({
          name: customer.name || '',
          phone: customer.phone || '',
          email: customer.email || '',
          address: customer.address || '',
        })
        setError(null)
      }
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!formData.name.trim()) {
      setError('Nama pelanggan tidak boleh kosong.')
      return
    }

    if (!formData.address.trim()) {
      setError('Alamat servis tidak boleh kosong.')
      return
    }

    startTransition(async () => {
      const res = await updateCustomerAction({
        id: customer.id,
        name: formData.name.trim(),
        phone: formData.phone.trim() || null,
        email: formData.email.trim() || null,
        address: formData.address.trim(),
      })

      if (res.success && res.customer) {
        toast.success('Data Pelanggan Berhasil Diperbarui', {
          description: `Perubahan data untuk "${res.customer.name}" telah disimpan.`,
        })
        onCustomerUpdated?.(res.customer)
        setOpen(false)
      } else {
        setError(res.error || 'Gagal memperbarui data pelanggan.')
        toast.error('Gagal Memperbarui', {
          description: res.error || 'Terjadi kesalahan saat menyimpan data.',
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
            className="h-8 px-2.5 text-xs text-slate-700 hover:text-slate-900 hover:bg-slate-50 border-slate-200 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900 gap-1.5 font-medium transition-colors cursor-pointer"
            title={`Edit data pelanggan ${customer.name}`}
          >
            <Pencil className="h-3.5 w-3.5 text-slate-500" />
            <span>Edit Pelanggan</span>
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-[8px] border border-[#E2E8F0] hover:border-primary/50 hover:bg-primary/5 hover:text-primary text-[#64748B] transition-colors p-0 flex items-center justify-center shadow-none shrink-0 cursor-pointer"
            title={`Edit pelanggan ${customer.name}`}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-md rounded-2xl p-6 space-y-4">
        <DialogHeader className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Pencil className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold text-foreground">
                Edit Data Pelanggan
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Perbarui detail kontak dan alamat lokasi servis pelanggan.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {error && (
          <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Nama */}
          <div className="space-y-1.5">
            <Label htmlFor={`edit-cust-name-${customer.id}`} className="text-xs font-medium">
              Nama Pelanggan / Perusahaan <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id={`edit-cust-name-${customer.id}`}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Contoh: PT Sumber Makmur"
                className="pl-9 h-9 text-xs"
                required
                disabled={isPending}
              />
            </div>
          </div>

          {/* Telepon */}
          <div className="space-y-1.5">
            <Label htmlFor={`edit-cust-phone-${customer.id}`} className="text-xs font-medium">
              Nomor Telepon / WhatsApp
            </Label>
            <div className="relative">
              <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id={`edit-cust-phone-${customer.id}`}
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Contoh: 081234567890"
                className="pl-9 h-9 text-xs font-mono"
                disabled={isPending}
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <Label htmlFor={`edit-cust-email-${customer.id}`} className="text-xs font-medium">
              Alamat Email (Opsional)
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id={`edit-cust-email-${customer.id}`}
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Contoh: admin@perusahaan.com"
                className="pl-9 h-9 text-xs"
                disabled={isPending}
              />
            </div>
          </div>

          {/* Alamat */}
          <div className="space-y-1.5">
            <Label htmlFor={`edit-cust-address-${customer.id}`} className="text-xs font-medium">
              Alamat Servis Lengkap <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Textarea
                id={`edit-cust-address-${customer.id}`}
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Nama jalan, nomor gedung/ruko, kelurahan, kecamatan..."
                className="pl-9 text-xs resize-none min-h-[72px]"
                required
                disabled={isPending}
              />
            </div>
          </div>

          <DialogFooter className="flex flex-row items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleOpenChange(false)}
              disabled={isPending}
              className="h-8 text-xs cursor-pointer"
            >
              Batal
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isPending || !formData.name.trim() || !formData.address.trim()}
              className="h-8 text-xs gap-1.5 font-semibold bg-[#007ACC] hover:bg-[#0062A3] text-white cursor-pointer"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <span>Simpan Perubahan</span>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
