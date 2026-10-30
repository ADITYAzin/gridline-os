'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
  formatWhatsAppPhone,
  generateWhatsAppMessage,
  openWhatsAppTargeted,
  type WhatsAppScenario,
  type WhatsAppTemplateData,
  type WhatsAppTargetPlatform,
} from '@/lib/whatsapp'
import { MessageSquare, Send, AlertCircle, ExternalLink, Globe, Smartphone, Check } from 'lucide-react'

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
  const [targetPlatform, setTargetPlatform] = useState<WhatsAppTargetPlatform>(() => {
    if (typeof window === 'undefined') return 'web_tab'
    try {
      const saved = localStorage.getItem('gridline_wa_target_platform')
      if (saved === 'web_tab' || saved === 'app') {
        return saved
      }
    } catch {
      // Ignore localStorage restrictions
    }
    return 'web_tab'
  })

  // Determine appropriate initial scenario
  const initialScenario: WhatsAppScenario =
    defaultScenario || (recipientType === 'technician' ? 'technician_dispatch' : 'customer_scheduled')

  const [scenario, setScenario] = useState<WhatsAppScenario>(initialScenario)
  const [message, setMessage] = useState<string>(() =>
    generateWhatsAppMessage(initialScenario, templateData)
  )

  const normalizedPhone = formatWhatsAppPhone(recipientPhone)
  const isValidPhone = Boolean(normalizedPhone)

  const handlePlatformChange = (val: WhatsAppTargetPlatform) => {
    setTargetPlatform(val)
    try {
      localStorage.setItem('gridline_wa_target_platform', val)
    } catch {
      // Ignore
    }
  }

  const handleScenarioChange = (newScenario: WhatsAppScenario) => {
    setScenario(newScenario)
    setMessage(generateWhatsAppMessage(newScenario, templateData))
  }

  const handleOpenWhatsApp = () => {
    if (!normalizedPhone) return
    openWhatsAppTargeted({
      phone: normalizedPhone,
      message,
      targetPlatform,
    })
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

      <DialogContent className="sm:max-w-md w-[94vw] max-h-[85vh] p-0 gap-0 overflow-hidden rounded-2xl flex flex-col shadow-xl">
        {/* Header - Fixed at Top */}
        <DialogHeader className="p-6 pb-4 border-b shrink-0 bg-background">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <DialogTitle className="text-base font-semibold">Kirim WhatsApp</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5 truncate">
                Pesan ke {recipientName} via WhatsApp.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Scrollable Form Body - Overflow Protected */}
        <div className="flex-1 overflow-y-auto p-6 py-4 space-y-4">
          {/* Target Info */}
          <div className="flex items-center justify-between text-xs rounded-xl bg-muted/40 border px-3.5 py-2.5">
            <span className="text-muted-foreground font-medium">Tujuan ({recipientType === 'customer' ? 'Pelanggan' : 'Teknisi'}):</span>
            <span className="font-mono font-semibold">
              {recipientPhone || <span className="text-destructive font-normal italic">Tidak ada nomor</span>}
            </span>
          </div>

          {!isValidPhone && (
            <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/10 p-3 rounded-xl border border-destructive/20">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>Nomor telepon belum diisi atau format tidak valid.</span>
            </div>
          )}

          {/* Template Selector */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Template Pesan</Label>
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
                    <SelectItem value="customer_scheduled">📅 Jadwal Servis</SelectItem>
                    <SelectItem value="customer_on_the_way">🚗 Sedang Menuju Lokasi</SelectItem>
                    <SelectItem value="customer_completed">✅ Pekerjaan Selesai</SelectItem>
                    <SelectItem value="custom">✍️ Pesan Kustom</SelectItem>
                  </>
                ) : (
                  <>
                    <SelectItem value="technician_dispatch">📋 Disposisi Job Baru</SelectItem>
                    <SelectItem value="custom">✍️ Pesan Kustom</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Editable Message Preview - Standardized Height */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium">Isi Pesan</Label>
              <span className="text-[10px] text-muted-foreground">Dapat disunting</span>
            </div>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="text-xs font-sans resize-none leading-relaxed h-28 max-h-36 rounded-lg"
              placeholder="Tulis pesan..."
            />
          </div>

          {/* Platform Selector & Anti-Tab Note */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Tujuan Pembukaan
              </Label>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                <Check className="h-3 w-3" /> Tab aktif digunakan ulang
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handlePlatformChange('web_tab')}
                className={`flex items-center justify-center gap-1.5 p-2 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                  targetPlatform === 'web_tab'
                    ? 'border-emerald-500 bg-emerald-50/80 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 font-semibold shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Globe className="h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span>WhatsApp Web</span>
              </button>
              <button
                type="button"
                onClick={() => handlePlatformChange('app')}
                className={`flex items-center justify-center gap-1.5 p-2 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                  targetPlatform === 'app'
                    ? 'border-emerald-500 bg-emerald-50/80 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 font-semibold shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Smartphone className="h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span>Aplikasi WhatsApp</span>
              </button>
            </div>
            <p className="text-[10.5px] text-slate-500 dark:text-slate-400 leading-tight">
              {targetPlatform === 'web_tab'
                ? 'Menggunakan tab WhatsApp yang sama tanpa membuka tab baru berulang kali.'
                : 'Membuka langsung aplikasi WhatsApp Desktop atau HP tanpa membuka tab browser.'}
            </p>
          </div>
        </div>

        {/* Footer - Fixed at Bottom */}
        <div className="p-6 py-3.5 border-t bg-muted/20 flex items-center justify-end gap-2 shrink-0">
          <Button
            type="button"
            variant="outline"
            className="h-9 text-xs px-4 cursor-pointer"
            onClick={() => setOpen(false)}
          >
            Batal
          </Button>
          <Button
            type="button"
            disabled={!isValidPhone || !message.trim()}
            onClick={handleOpenWhatsApp}
            className="h-9 text-xs px-4 bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 cursor-pointer shadow-xs"
          >
            <Send className="h-3.5 w-3.5" />
            Buka WhatsApp
            <ExternalLink className="h-3 w-3 opacity-70" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

