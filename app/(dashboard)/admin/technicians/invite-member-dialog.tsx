'use client'

import { useState, useActionState } from 'react'
import { createInviteAction, type InviteActionState } from '@/app/actions/team'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { UserPlus, Loader2, Copy, Check, Link2 } from 'lucide-react'

const initialState: InviteActionState = {}

export function InviteMemberDialog() {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [role, setRole] = useState<'technician' | 'owner'>('technician')
  const [state, formAction, isPending] = useActionState(createInviteAction, initialState)

  const handleCopy = (link: string) => {
    navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 font-semibold">
          <UserPlus className="h-4 w-4" />
          Undang Anggota
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Undang Anggota Tim Baru</DialogTitle>
          <DialogDescription>
            Sistem akan menghasilkan tautan undangan aktif 24 jam sekali pakai.
          </DialogDescription>
        </DialogHeader>

        {state.success && state.inviteLink ? (
          <div className="space-y-4 pt-2">
            <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-4 space-y-2">
              <div className="flex items-center gap-2 text-emerald-600 font-semibold text-sm">
                <Check className="h-4 w-4" /> Undangan Berhasil Dibuat!
              </div>
              <p className="text-xs text-muted-foreground">
                {state.emailSent
                  ? 'Email undangan resmi telah otomatis dikirimkan ke kotak masuk (inbox) calon pengguna.'
                  : 'Undangan siap dibagikan. Konfigurasi RESEND_API_KEY untuk pengiriman email otomatis.'}
              </p>
              <div className="pt-2 border-t border-emerald-500/20">
                <p className="text-[11px] text-muted-foreground mb-1.5 font-medium">
                  Tautan alternatif (berlaku 24 jam untuk WhatsApp/manual):
                </p>
                <div className="flex items-center gap-2">
                  <Input value={state.inviteLink} readOnly className="text-xs font-mono bg-card" />
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    className="shrink-0 gap-1.5"
                    onClick={() => handleCopy(state.inviteLink!)}
                  >
                    {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                    {copied ? 'Tersalin' : 'Salin'}
                  </Button>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" onClick={() => setOpen(false)} className="w-full">
                Selesai
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <form action={formAction} className="space-y-4 pt-2">
            {state.error && (
              <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3 text-xs font-medium text-destructive">
                {state.error}
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="email">Email Anggota *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                placeholder="rekan@perusahaan.com"
                disabled={isPending}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="role">Peran / Role Akses *</Label>
              <input type="hidden" name="role" value={role} />
              <Select value={role} onValueChange={(v) => setRole(v as 'technician' | 'owner')}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih peran" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="technician">Field Technician (Pekerja Lapangan)</SelectItem>
                  <SelectItem value="owner">Owner / Manager (Monitoring Hub)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-[11px] text-muted-foreground">
                {role === 'technician'
                  ? 'Teknisi hanya dapat melihat pekerjaan yang ditugaskan kepadanya.'
                  : 'Owner memiliki akses melihat seluruh ringkasan performa dan laporan.'}
              </p>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
                Batal
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Membuat Undangan...
                  </>
                ) : (
                  <>
                    <Link2 className="mr-2 h-4 w-4" />
                    Buat Link Undangan
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
