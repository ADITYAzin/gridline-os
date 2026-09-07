'use client'

import { useState, useActionState } from 'react'
import { createCustomerAction, type CustomerActionState } from '@/app/actions/customers'
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
import { Plus, Loader2 } from 'lucide-react'

const initialState: CustomerActionState = {}

export function CreateCustomerDialog() {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
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
      }
      return res
    },
    initialState
  )

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 font-semibold">
          <Plus className="h-4 w-4" />
          Tambah Customer
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Tambah Data Customer</DialogTitle>
          <DialogDescription>
            Masukkan informasi klien untuk kebutuhan penugasan pekerjaan teknisi.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-4 pt-2">
          {state.error && (
            <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3 text-xs font-medium text-destructive">
              {state.error}
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="name">Nama Customer / Bisnis *</Label>
            <Input
              id="name"
              name="name"
              required
              value={formData.name}
              onChange={(e) => updateField('name', e.target.value)}
              placeholder="PT Graha Pratama / Ibu Siti"
              disabled={isPending}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="phone">Nomor Telepon / WA</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={(e) => updateField('phone', e.target.value)}
                placeholder="08123456789"
                disabled={isPending}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={(e) => updateField('email', e.target.value)}
                placeholder="kontak@perusahaan.com"
                disabled={isPending}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="address">Alamat Lengkap Servis *</Label>
            <Textarea
              id="address"
              name="address"
              required
              rows={3}
              value={formData.address}
              onChange={(e) => updateField('address', e.target.value)}
              placeholder="Jl. Sudirman No. 45, Gedung A Lt. 3, Jakarta Selatan"
              disabled={isPending}
            />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
              Batal
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                'Simpan Customer'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
