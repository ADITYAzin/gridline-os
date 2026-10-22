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
      <DialogContent className="sm:max-w-md rounded-2xl p-6 space-y-4">
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-base font-semibold text-foreground">
            Undang Anggota Tim
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Buat tautan undangan akses untuk teknisi atau manajer tim.
          </DialogDescription>
        </DialogHeader>

        {state.success && state.inviteLink ? (
          <div className="space-y-4 pt-1">
            <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 space-y-2.5">
              <div className="flex items-center gap-2 text-emerald-600 font-semibold text-xs">
                <Check className="h-4 w-4" /> Undangan Berhasil Dibuat
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {state.emailSent
                  ? 'Email undangan resmi telah dikirim ke kotak masuk calon pengguna.'
                  : 'Undangan aktif selama 24 jam. Salin tautan di bawah untuk dibagikan:'}
              </p>
              <div className="pt-2 border-t border-emerald-500/20 space-y-1.5">
                <div className="flex items-center gap-2">
                  <Input value={state.inviteLink} readOnly className="h-9 text-xs font-mono bg-background rounded-lg" />
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    className="h-9 px-3 shrink-0 gap-1.5 text-xs font-medium rounded-lg cursor-pointer"
                    onClick={() => handleCopy(state.inviteLink!)}
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                    {copied ? 'Tersalin' : 'Salin'}
                  </Button>
                </div>
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" onClick={() => setOpen(false)} className="w-full h-9 text-xs font-medium bg-[#007ACC] hover:bg-[#0062A3] text-white rounded-lg cursor-pointer">
                Selesai
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <form action={formAction} className="space-y-4 pt-1">
            {state.error && (
              <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-3 text-xs font-medium text-destructive">
                {state.error}
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-medium text-foreground">
                Alamat Email <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                placeholder="rekan@perusahaan.com"
                disabled={isPending}
                className="h-9 text-xs rounded-lg bg-background"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="role" className="text-xs font-medium text-foreground">
                Peran Akses <span className="text-destructive">*</span>
              </Label>
              <input type="hidden" name="role" value={role} />
              <Select value={role} onValueChange={(v) => setRole(v as 'technician' | 'owner')}>
                <SelectTrigger className="h-9 text-xs rounded-lg bg-background">
                  <SelectValue placeholder="Pilih peran" />
                </SelectTrigger>
                <SelectContent className="text-xs">
                  <SelectItem value="technician">Teknisi Lapangan (Field Tech)</SelectItem>
                  <SelectItem value="owner">Manajer / Pemilik (Monitoring)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-[11px] text-muted-foreground pt-0.5">
                {role === 'technician'
                  ? 'Hanya dapat melihat pekerjaan yang ditugaskan kepadanya.'
                  : 'Dapat melihat ringkasan performa dan laporan tim.'}
              </p>
            </div>

            <DialogFooter className="pt-3 border-t border-border/50 gap-2 sm:gap-2 flex items-center justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isPending}
                className="h-9 px-4 text-xs font-medium rounded-lg cursor-pointer"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="h-9 px-4 text-xs font-medium bg-[#007ACC] hover:bg-[#0062A3] text-white rounded-lg gap-2 cursor-pointer shadow-xs"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Membuat Undangan...
                  </>
                ) : (
                  <>
                    <Link2 className="h-3.5 w-3.5" />
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
