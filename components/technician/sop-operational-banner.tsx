'use client'

import { Clock, ShieldAlert, ShieldCheck, AlertTriangle, FileText } from 'lucide-react'

interface SopOperationalBannerProps {
  estimatedDuration?: number | null
  riskLevel?: 'low' | 'medium' | 'high' | null
  sopNotes?: string | null
  sopMode?: 'strict' | 'reference' | 'none' | null
}

export function SopOperationalBanner({
  estimatedDuration,
  riskLevel = 'low',
  sopNotes,
  sopMode = 'strict',
}: SopOperationalBannerProps) {
  // If there's no SOP configuration and no notes or duration, don't show an empty box
  if (!estimatedDuration && !sopNotes && riskLevel === 'low' && sopMode === 'none') {
    return null
  }

  const riskConfig = {
    low: {
      label: 'Risiko Rendah',
      badgeClass: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20',
      icon: ShieldCheck,
      note: 'Patuhi standar kerja reguler',
    },
    medium: {
      label: 'Risiko Sedang',
      badgeClass: 'bg-amber-500/10 text-amber-800 dark:text-amber-200 border-amber-500/30',
      icon: AlertTriangle,
      note: 'Wajib gunakan APD standar (sarung tangan & kacamata)',
    },
    high: {
      label: 'Risiko Tinggi (K3)',
      badgeClass: 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30',
      icon: ShieldAlert,
      note: 'Wajib APD lengkap, cek tegangan/ketinggian',
    },
  }[riskLevel || 'low']

  const RiskIcon = riskConfig.icon

  return (
    <div className="rounded-xl border border-border/80 bg-card p-3 space-y-2 text-xs shadow-2xs">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          {estimatedDuration && estimatedDuration > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted text-foreground font-semibold text-[11px]">
              <Clock className="h-3 w-3 text-[#007ACC]" />
              Est. {estimatedDuration} Menit
            </span>
          )}

          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[11px] font-semibold ${riskConfig.badgeClass}`}>
            <RiskIcon className="h-3 w-3" />
            {riskConfig.label}
          </span>
        </div>

        {sopMode === 'reference' && (
          <span className="text-[10px] text-muted-foreground font-medium">
            Mode Panduan
          </span>
        )}
      </div>

      {sopNotes && (
        <div className="rounded-lg bg-muted/40 p-2.5 text-[11px] text-muted-foreground leading-relaxed flex items-start gap-1.5">
          <FileText className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
          <p className="flex-1">
            <span className="font-semibold text-foreground mr-1">Petunjuk Khusus:</span>
            {sopNotes}
          </p>
        </div>
      )}
    </div>
  )
}
