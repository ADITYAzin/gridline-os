'use client'

import { useState } from 'react'
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
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  createWhatsAppUrl,
  formatWhatsAppPhone,
  generateWhatsAppMessage,
  type WhatsAppScenario,
  type WhatsAppTemplateData,
} from '@/lib/whatsapp'
import { MessageSquare, Send, AlertCircle, ExternalLink } from 'lucide-react'

interface WhatsAppActionDialogProps {
  recipientType: 'customer' | 'technician'
  recipientName: string
  recipientPhone?: string | null
  templateData: WhatsAppTemplateData
  defaultScenario?: WhatsAppScenario
  triggerButtonText?: string
  variant?: 'default' | 'outline' | 'secondary' | 'ghost'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  className?: string
}

export function WhatsAppActionDialog({
  recipientType,
  recipientName,
  recipientPhone,
  templateData,
  defaultScenario,
  triggerButtonText,
  variant = 'outline',
  size = 'sm',
  className = '',
}: WhatsAppActionDialogProps) {
  const [open, setOpen] = useState(false)

  // Determine appropriate initial scenario
  const initialScenario: WhatsAppScenario =
    defaultScenario || (recipientType === 'technician' ? 'technician_dispatch' : 'customer_scheduled')

  const [scenario, setScenario] = useState<WhatsAppScenario>(initialScenario)
  const [message, setMessage] = useState<string>(() =>
    generateWhatsAppMessage(initialScenario, templateData)
  )

  const normalizedPhone = formatWhatsAppPhone(recipientPhone)
  const isValidPhone = Boolean(normalizedPhone)

  const handleScenarioChange = (newScenario: WhatsAppScenario) => {
    setScenario(newScenario)
    setMessage(generateWhatsAppMessage(newScenario, templateData))
  }

  const handleOpenWhatsApp = () => {
    if (!normalizedPhone) return
    const url = createWhatsAppUrl(normalizedPhone, message)
    window.open(url, '_blank', 'noopener,noreferrer')
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant={variant}
          size={size}
          className={`gap-1.5 border-emerald-500/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-800 font-medium ${className}`}
        >
          <MessageSquare className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
          {size !== 'icon' && (triggerButtonText !== undefined ? triggerButtonText : (recipientType === 'customer' ? 'WhatsApp Klien' : 'WhatsApp Teknisi'))}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
              <MessageSquare className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle className="text-base">Kirim WhatsApp ke {recipientName}</DialogTitle>
              <DialogDescription className="text-xs">
                Pilih template pesan resmi Gridline OS atau sesuaikan teks sebelum dikirim.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Target Info */}
          <div className="flex items-center justify-between text-xs rounded-md bg-muted/60 px-3 py-2">
            <span className="text-muted-foreground">Nomor Tujuan ({recipientType === 'customer' ? 'Pelanggan' : 'Teknisi'}):</span>
            <span className="font-mono font-semibold">
              {recipientPhone || <span className="text-destructive font-normal italic">Tidak ada nomor terdaftar</span>}
            </span>
          </div>

          {!isValidPhone && (
            <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/10 p-2.5 rounded-md border border-destructive/20">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>Nomor telepon tidak valid atau belum diisi. Pastikan nomor kontak customer/teknisi telah tersimpan.</span>
            </div>
          )}

          {/* Template Selector */}
          <div className="space-y-1.5">
            <Label className="text-xs">Template Pesan</Label>
            <Select
              value={scenario}
              onValueChange={(val) => handleScenarioChange(val as WhatsAppScenario)}
            >
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="Pilih Template Pesan" />
              </SelectTrigger>
              <SelectContent>
                {recipientType === 'customer' ? (
                  <>
                    <SelectItem value="customer_scheduled">📅 Jadwal Servis & Konfirmasi</SelectItem>
                    <SelectItem value="customer_on_the_way">🚗 Teknisi Sedang Menuju Lokasi</SelectItem>
                    <SelectItem value="customer_completed">✅ Pekerjaan Servis Telah Selesai</SelectItem>
                    <SelectItem value="custom">✍️ Pesan Kustom Bebas</SelectItem>
                  </>
                ) : (
                  <>
                    <SelectItem value="technician_dispatch">📋 Disposisi & Instruksi Job Baru</SelectItem>
                    <SelectItem value="custom">✍️ Pesan Kustom Bebas</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Editable Message Preview */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Isi Pesan (Bisa diedit)</Label>
              <span className="text-[10px] text-muted-foreground">Akan terbuka langsung di WhatsApp Web/App</span>
            </div>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={8}
              className="text-xs font-sans resize-none leading-relaxed"
              placeholder="Tulis pesan..."
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>
            Batal
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={!isValidPhone || !message.trim()}
            onClick={handleOpenWhatsApp}
            className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
          >
            <Send className="h-3.5 w-3.5" />
            Buka WhatsApp
            <ExternalLink className="h-3 w-3 opacity-70" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
