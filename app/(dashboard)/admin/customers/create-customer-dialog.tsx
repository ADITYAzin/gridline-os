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
import { Plus, Loader2, Building2, Phone, Mail, MapPin } from 'lucide-react'

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
        <Button
          type="button"
          className="h-8 px-3 rounded-[8px] bg-[#007ACC] hover:bg-primary hover:text-white active:bg-[#004F82] text-[#FFFFFF] font-medium text-xs flex items-center gap-2 shadow-[0_1px_2px_0_rgba(0,122,204,0.15)] transition-all cursor-pointer focus:outline-none focus-visible:ring-4 focus-visible:ring-[#007ACC]/25"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Tambah Customer</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md rounded-[12px] border border-[#E2E8F0] shadow-[0_4px_20px_-4px_rgba(15,23,42,0.08),0_2px_6px_-2px_rgba(15,23,42,0.04)] bg-[#FFFFFF] p-6">
        <DialogHeader className="space-y-2 pb-3 border-b border-[#F1F5F9]">
          <DialogTitle className="font-heading text-[18px] font-semibold text-[#0F172A]">
            Tambah Data Customer
          </DialogTitle>
          <DialogDescription className="text-[13px] text-[#475569]">
            Masukkan informasi klien untuk kebutuhan penugasan pekerjaan teknisi.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4 pt-4">
          {state.error && (
            <div className="rounded-[8px] bg-[#FEF2F2] border border-[#EF4444]/30 p-3 text-[12.5px] font-medium text-[#B91C1C]">
              {state.error}
            </div>
          )}

          {/* Customer Name */}
          <div className="space-y-2">
            <label htmlFor="name" className="block text-[12px] font-medium text-[#475569] tracking-[0.01em]">
              Nama Customer / Bisnis <span className="text-[#EF4444]">*</span>
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#94A3B8]">
                <Building2 className="h-4 w-4" />
              </div>
              <input
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder="PT Graha Pratama / Ibu Siti"
                disabled={isPending}
                className="w-full h-10 rounded-[8px] border border-[#E2E8F0] bg-[#FFFFFF] pl-9 pr-3 text-[14px] text-[#0F172A] placeholder:text-[#94A3B8] transition-all focus:border-[#007ACC] focus:ring-4 focus:ring-[#007ACC]/15 outline-none disabled:bg-[#F1F5F9]"
              />
            </div>
          </div>

          {/* 2 Cols: Phone & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="phone" className="block text-[12px] font-medium text-[#475569] tracking-[0.01em]">
                Nomor Telepon / WA
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#94A3B8]">
                  <Phone className="h-4 w-4" />
                </div>
                <input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  placeholder="08123456789"
                  disabled={isPending}
                  className="w-full h-10 rounded-[8px] border border-[#E2E8F0] bg-[#FFFFFF] pl-9 pr-3 text-[14px] text-[#0F172A] placeholder:text-[#94A3B8] transition-all focus:border-[#007ACC] focus:ring-4 focus:ring-[#007ACC]/15 outline-none disabled:bg-[#F1F5F9]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="block text-[12px] font-medium text-[#475569] tracking-[0.01em]">
                Alamat Email
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#94A3B8]">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  placeholder="kontak@perusahaan.com"
                  disabled={isPending}
                  className="w-full h-10 rounded-[8px] border border-[#E2E8F0] bg-[#FFFFFF] pl-9 pr-3 text-[14px] text-[#0F172A] placeholder:text-[#94A3B8] transition-all focus:border-[#007ACC] focus:ring-4 focus:ring-[#007ACC]/15 outline-none disabled:bg-[#F1F5F9]"
                />
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="space-y-2">
            <label htmlFor="address" className="block text-[12px] font-medium text-[#475569] tracking-[0.01em]">
              Alamat Lengkap Servis <span className="text-[#EF4444]">*</span>
            </label>
            <div className="relative">
              <textarea
                id="address"
                name="address"
                required
                rows={3}
                value={formData.address}
                onChange={(e) => updateField('address', e.target.value)}
                placeholder="Jl. Sudirman No. 45, Gedung A Lt. 3, Jakarta Selatan"
                disabled={isPending}
                className="w-full rounded-[8px] border border-[#E2E8F0] bg-[#FFFFFF] p-3 text-[13.5px] text-[#0F172A] placeholder:text-[#94A3B8] transition-all focus:border-[#007ACC] focus:ring-4 focus:ring-[#007ACC]/15 outline-none disabled:bg-[#F1F5F9] resize-none"
              />
            </div>
          </div>

          <DialogFooter className="pt-4 gap-2 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
              className="h-8 px-3.5 rounded-[8px] border border-[#CBD5E1] bg-[#FFFFFF] hover:bg-[#F8FAFC] text-[#0F172A] font-medium text-xs transition-colors"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="h-8 px-3.5 rounded-[8px] bg-[#007ACC] hover:bg-primary hover:text-white active:bg-[#004F82] text-white font-medium text-xs shadow-[0_1px_2px_0_rgba(0,122,204,0.15)] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <span>Simpan Customer</span>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
