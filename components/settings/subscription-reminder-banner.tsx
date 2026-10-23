'use client'

import * as React from 'react'
import {
  Clock,
  Sparkles,
  X,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export interface SubscriptionReminderBannerProps {
  daysLeft: number
  expiryDate: Date
  currentTier: string
  onExtendClick: () => void
  onDismiss?: () => void
  isDismissed?: boolean
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function SubscriptionReminderBanner({
  daysLeft,
  expiryDate,
  currentTier,
  onExtendClick,
  onDismiss,
  isDismissed = false,
}: SubscriptionReminderBannerProps) {
  const [internalDismissed, setInternalDismissed] = React.useState(false)

  if (isDismissed || internalDismissed || daysLeft > 7) {
    return null
  }

  const isExpired = daysLeft <= 0

  return (
    <div
      role="alert"
      className={`relative overflow-hidden rounded-xl border p-3.5 sm:p-4 transition-all shadow-xs ${
        isExpired
          ? 'border-destructive/40 bg-destructive/10 text-foreground'
          : 'border-amber-400/50 bg-amber-500/10 text-foreground'
      }`}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        {/* Icon & Direct Microcopy */}
        <div className="flex items-center gap-3">
          <div
            className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
              isExpired
                ? 'bg-destructive/15 text-destructive'
                : 'bg-amber-500/20 text-amber-700 dark:text-amber-400'
            }`}
          >
            {isExpired ? (
              <ShieldAlert className="h-4 w-4" />
            ) : (
              <Clock className="h-4 w-4 animate-pulse" />
            )}
          </div>

          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-bold text-foreground">
                {isExpired
                  ? 'Masa Aktif Langganan Telah Berakhir'
                  : `Masa Aktif Berakhir ${daysLeft} Hari Lagi`}
              </span>
              <Badge
                variant="outline"
                className={`text-[9px] font-bold px-1.5 py-0 uppercase ${
                  isExpired
                    ? 'border-destructive/40 bg-destructive/15 text-destructive'
                    : 'border-amber-500/40 bg-amber-500/20 text-amber-800 dark:text-amber-200'
                }`}
              >
                {isExpired ? 'Kadaluarsa' : `${daysLeft} Hari`}
              </Badge>
            </div>

            <p className="text-xs text-muted-foreground">
              Paket <span className="font-semibold text-foreground capitalize">{currentTier}</span> jatuh tempo pada{' '}
              <span className="font-semibold text-foreground">{formatDate(expiryDate)}</span>. Perpanjang agar layanan teknisi tetap aktif.
            </p>
          </div>
        </div>

        {/* Action Button & Dismiss */}
        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
          <Button
            type="button"
            size="sm"
            onClick={onExtendClick}
            className={`h-8 px-3 text-xs font-semibold text-white cursor-pointer gap-1.5 ${
              isExpired
                ? 'bg-destructive hover:bg-destructive/90'
                : 'bg-amber-600 hover:bg-amber-700'
            }`}
          >
            <Sparkles className="h-3 w-3" />
            <span>Perpanjang</span>
            <ArrowRight className="h-3 w-3" />
          </Button>

          <button
            type="button"
            onClick={() => {
              setInternalDismissed(true)
              onDismiss?.()
            }}
            className="p-1 rounded-md text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            title="Tutup"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
