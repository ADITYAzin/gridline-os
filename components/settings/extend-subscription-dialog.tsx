'use client'

import * as React from 'react'
import {
  CalendarCheck,
  CreditCard,
  Loader2,
  Sparkles,
  Zap,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { extendSubscriptionAction } from '@/app/actions/organization'

export interface ExtensionPeriodOption {
  months: number
  title: string
  pricePerMonth: number
  totalPrice: number
  discountPercent: number
  discountAmount: number
  badge?: string
  isPopular?: boolean
}

const TIER_PRICING: Record<string, { monthly: number; annual: number }> = {
  starter: { monthly: 299000, annual: 249000 },
  pro: { monthly: 699000, annual: 599000 },
}

function getPeriodOptions(tier: string): ExtensionPeriodOption[] {
  const isStarter = tier.toLowerCase() === 'starter'
  const rates = isStarter ? TIER_PRICING.starter : TIER_PRICING.pro

  const oneMo = rates.monthly
  const threeMoRate = Math.round(rates.monthly * 0.95)
  const sixMoRate = Math.round(rates.monthly * 0.9)
  const twelveMoRate = rates.annual

  return [
    {
      months: 1,
      title: '1 Bulan',
      pricePerMonth: oneMo,
      totalPrice: oneMo,
      discountPercent: 0,
      discountAmount: 0,
    },
    {
      months: 3,
      title: '3 Bulan',
      pricePerMonth: threeMoRate,
      totalPrice: threeMoRate * 3,
      discountPercent: 5,
      discountAmount: rates.monthly * 3 - threeMoRate * 3,
      badge: 'Hemat 5%',
    },
    {
      months: 6,
      title: '6 Bulan',
      pricePerMonth: sixMoRate,
      totalPrice: sixMoRate * 6,
      discountPercent: 10,
      discountAmount: rates.monthly * 6 - sixMoRate * 6,
      badge: 'Hemat 10%',
    },
    {
      months: 12,
      title: '12 Bulan',
      pricePerMonth: twelveMoRate,
      totalPrice: twelveMoRate * 12,
      discountPercent: 20,
      discountAmount: rates.monthly * 12 - twelveMoRate * 12,
      badge: 'Hemat 20%',
      isPopular: true,
    },
  ]
}

export interface ExtendSubscriptionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentTier: string
  targetTier?: string
  currentExpiryDate: Date
  onExtendSuccess: (newExpiryDate: Date, monthsAdded: number, appliedTier?: string) => void
}

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function ExtendSubscriptionDialog({
  open,
  onOpenChange,
  currentTier,
  targetTier,
  currentExpiryDate,
  onExtendSuccess,
}: ExtendSubscriptionDialogProps) {
  const initialTier = targetTier || (currentTier === 'trial' ? 'pro' : currentTier)
  const [activeTier, setActiveTier] = React.useState<string>(initialTier)
  const [selectedMonths, setSelectedMonths] = React.useState<number>(12)
  const [paymentMethod, setPaymentMethod] = React.useState<string>('bca_va')
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false)

  // Sync if targetTier changes when modal opens
  React.useEffect(() => {
    if (open) {
      setActiveTier(targetTier || (currentTier === 'trial' ? 'pro' : currentTier))
    }
  }, [open, targetTier, currentTier])

  const periodOptions = React.useMemo(() => getPeriodOptions(activeTier), [activeTier])

  const selectedOption =
    periodOptions.find((opt) => opt.months === selectedMonths) || periodOptions[3]

  const newExpiryDate = React.useMemo(() => {
    const base = new Date(currentExpiryDate.getTime())
    base.setMonth(base.getMonth() + selectedOption.months)
    return base
  }, [currentExpiryDate, selectedOption.months])

  const handleConfirmExtend = async () => {
    setIsSubmitting(true)
    try {
      const res = await extendSubscriptionAction(selectedOption.months, activeTier)
      if (res.error) {
        toast.error(res.error)
      } else {
        const tierName = activeTier === 'starter' ? 'Starter' : 'Professional'
        toast.success(
          `Paket ${tierName} berhasil diaktifkan selama ${selectedOption.months} bulan (hingga ${formatDate(newExpiryDate)}).`
        )
        onExtendSuccess(newExpiryDate, selectedOption.months, activeTier)
        onOpenChange(false)
      }
    } catch {
      toast.error('Gagal memproses langganan.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto p-5 sm:p-6">
        <DialogHeader className="space-y-1 pb-2 border-b border-border/50">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-[#EBF5FC] text-[#007ACC] flex items-center justify-center shrink-0">
              <CalendarCheck className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-foreground">
                {currentTier === 'trial' ? 'Upgrade Paket Langganan' : 'Perpanjang Langganan'}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Pilih paket dan periode perpanjangan armada teknisi Anda.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Plan Selector Buttons */}
          <div className="grid grid-cols-2 p-1 rounded-lg bg-muted/60 border border-border/60 text-xs font-semibold gap-1">
            <button
              type="button"
              onClick={() => setActiveTier('starter')}
              className={`py-1.5 px-3 rounded-md transition-all cursor-pointer text-center ${
                activeTier === 'starter'
                  ? 'bg-white text-[#007ACC] shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Paket Starter (3 Teknisi)
            </button>
            <button
              type="button"
              onClick={() => setActiveTier('pro')}
              className={`py-1.5 px-3 rounded-md transition-all cursor-pointer text-center ${
                activeTier === 'pro'
                  ? 'bg-[#007ACC] text-white shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Paket Professional (10 Teknisi)
            </button>
          </div>

          {/* Active Period Preview Bar */}
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/40 border border-border/50 text-xs">
            <span className="text-muted-foreground">
              Paket: <strong className="text-foreground capitalize">{activeTier}</strong>
            </span>
            <span className="text-[#007ACC] font-semibold flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              Aktif s/d: {formatDate(newExpiryDate)}
            </span>
          </div>

          {/* Period Options Grid */}
          <div className="grid grid-cols-2 gap-2.5">
            {periodOptions.map((opt) => {
              const isSelected = selectedMonths === opt.months
              return (
                <div
                  key={opt.months}
                  onClick={() => setSelectedMonths(opt.months)}
                  className={`relative p-3 rounded-lg border-2 transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-[#007ACC] bg-[#EBF5FC]/40 shadow-xs'
                      : 'border-border/60 hover:border-border hover:bg-muted/20'
                  }`}
                >
                  {opt.isPopular && (
                    <span className="absolute -top-2 right-2 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-[#007ACC] text-white">
                      Rekomendasi
                    </span>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-foreground">
                      {opt.title}
                    </span>
                    {opt.badge && (
                      <span className="text-[10px] font-semibold px-1 py-0.2 rounded bg-emerald-500/10 text-emerald-600">
                        {opt.badge}
                      </span>
                    )}
                  </div>

                  <div className="pt-2 mt-2 border-t border-border/40 flex items-baseline justify-between">
                    <span className="text-[10px] text-muted-foreground">
                      {formatRupiah(opt.pricePerMonth)}/bln
                    </span>
                    <span className="text-xs font-bold text-[#007ACC]">
                      {formatRupiah(opt.totalPrice)}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <CreditCard className="h-3.5 w-3.5 text-[#007ACC]" />
              <span>Metode Pembayaran:</span>
            </label>

            <div className="grid grid-cols-4 gap-2 text-xs">
              {[
                { id: 'bca_va', label: 'BCA VA' },
                { id: 'mandiri_va', label: 'Mandiri VA' },
                { id: 'qris', label: 'QRIS' },
                { id: 'credit_card', label: 'Kartu Kredit' },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setPaymentMethod(m.id)}
                  className={`py-2 px-2 rounded-lg border text-center transition-all cursor-pointer text-xs ${
                    paymentMethod === m.id
                      ? 'border-[#007ACC] bg-[#EBF5FC] text-[#007ACC] font-semibold'
                      : 'border-border/60 hover:border-border text-foreground'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Price Summary */}
          <div className="p-3 rounded-lg bg-muted/30 border border-border/60 space-y-1.5 text-xs">
            <div className="flex items-center justify-between text-muted-foreground">
              <span>Paket & Durasi:</span>
              <span className="font-medium text-foreground capitalize">
                Gridline {activeTier} ({selectedOption.title})
              </span>
            </div>

            {selectedOption.discountAmount > 0 && (
              <div className="flex items-center justify-between text-emerald-600 font-medium">
                <span>Diskon ({selectedOption.discountPercent}%):</span>
                <span>-{formatRupiah(selectedOption.discountAmount)}</span>
              </div>
            )}

            <div className="pt-1.5 border-t border-border/50 flex items-center justify-between">
              <span className="font-semibold text-foreground">Total:</span>
              <span className="text-sm font-bold text-[#007ACC]">
                {formatRupiah(selectedOption.totalPrice)}
              </span>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-2 pt-3 border-t border-border/50">
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            onClick={() => onOpenChange(false)}
            className="h-8 text-xs px-3 cursor-pointer"
          >
            Batal
          </Button>

          <Button
            type="button"
            disabled={isSubmitting}
            onClick={handleConfirmExtend}
            className="h-8 text-xs font-semibold bg-[#007ACC] hover:bg-[#0062A3] text-white px-4 gap-1.5 cursor-pointer shadow-xs"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin" />
                Memproses...
              </>
            ) : (
              <>
                <Zap className="h-3 w-3" />
                Konfirmasi Pembayaran
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
