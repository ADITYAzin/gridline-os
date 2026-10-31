'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { WhatsAppActionDialog } from '@/components/whatsapp/whatsapp-action-dialog'
import { MapPin, Phone, Navigation, Copy, Check } from 'lucide-react'

interface QuickActionTrayProps {
  customerName: string
  customerPhone?: string | null
  address: string
  jobNumber: string
  serviceType: string
  technicianName: string
}

export function QuickActionTray({
  customerName,
  customerPhone,
  address,
  jobNumber,
  serviceType,
  technicianName,
}: QuickActionTrayProps) {
  const [copied, setCopied] = useState(false)

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback
    }
  }

  const openGoogleMaps = () => {
    const query = encodeURIComponent(address)
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank')
  }

  return (
    <div className="space-y-2">
      {/* Primary Actions Grid (Maps & Calling) */}
      <div className="grid grid-cols-2 gap-2">
        <Button
          type="button"
          onClick={openGoogleMaps}
          className="h-11 gap-2 text-xs sm:text-sm font-bold bg-[#007ACC] hover:bg-[#0062A3] active:bg-[#004F82] text-white shadow-xs rounded-lg touch-press cursor-pointer"
        >
          <Navigation className="h-4.5 w-4.5 shrink-0" />
          <span>Buka Peta</span>
        </Button>

        {customerPhone ? (
          <Button
            asChild
            variant="outline"
            className="h-11 gap-2 text-xs sm:text-sm font-bold border-[#CBD5E1] hover:bg-slate-50 active:bg-slate-100 text-[#0F172A] rounded-lg touch-press cursor-pointer"
          >
            <a href={`tel:${customerPhone}`}>
              <Phone className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
              <span>Telepon</span>
            </a>
          </Button>
        ) : (
          <Button
            type="button"
            variant="outline"
            disabled
            className="h-11 text-xs sm:text-sm text-muted-foreground rounded-lg"
          >
            <Phone className="h-4 w-4 shrink-0 mr-1.5 opacity-40" />
            <span>Tanpa HP</span>
          </Button>
        )}
      </div>

      {/* Secondary Row: WhatsApp Direct & Copy Address */}
      <div className="flex items-center gap-2">
        {customerPhone && (
          <div className="flex-1">
            <WhatsAppActionDialog
              recipientType="customer"
              recipientName={customerName}
              recipientPhone={customerPhone}
              templateData={{
                customerName,
                technicianName,
                jobNumber,
                serviceType,
                address,
              }}
              defaultScenario="customer_on_the_way"
              triggerButtonText="Kirim WhatsApp"
              size="sm"
            />
          </div>
        )}

        <Button
          type="button"
          variant="outline"
          onClick={handleCopyAddress}
          className="h-9 px-3 gap-1.5 text-xs font-semibold text-[#334155] hover:text-[#0F172A] shrink-0 rounded-lg touch-press border-[#CBD5E1]"
          title="Salin Alamat Lengkap"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 text-emerald-600" />
              <span>Tersalin</span>
            </>
          ) : (
            <>
              <Copy className="h-4 w-4 text-[#475569]" />
              <span>Salin Alamat</span>
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
