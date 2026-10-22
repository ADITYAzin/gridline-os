'use client'

import { Card, CardContent } from '@/components/ui/card'
import {
  Navigation,
  ListChecks,
  Camera,
  PenTool,
  FileText,
  CheckCircle2,
  Clock,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface FiveGateProgressProps {
  hasCheckIn: boolean
  hasChecklistCompleted: boolean
  hasPhotosCompleted: boolean
  hasSignature: boolean
  hasReport: boolean
  isCompleted: boolean
}

export function FiveGateProgress({
  hasCheckIn,
  hasChecklistCompleted,
  hasPhotosCompleted,
  hasSignature,
  hasReport,
  isCompleted,
}: FiveGateProgressProps) {
  const gates = [
    { label: 'Check-in', done: hasCheckIn, icon: Navigation },
    { label: 'Checklist SOP', done: hasChecklistCompleted, icon: ListChecks },
    { label: 'Foto Bukti', done: hasPhotosCompleted, icon: Camera },
    { label: 'Tanda Tangan', done: hasSignature, icon: PenTool },
    { label: 'Laporan', done: hasReport, icon: FileText },
  ]

  const completedCount = gates.filter((g) => g.done).length
  const progressPercent = Math.round((completedCount / gates.length) * 100)

  return (
    <Card className="shadow-xs border-primary/20 bg-gradient-to-br from-card to-primary/5 overflow-hidden">
      <CardContent className="p-3.5 space-y-2.5">
        {/* Header summary */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-foreground">Syarat Penyelesaian</span>
            {isCompleted ? (
              <span className="text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                <CheckCircle2 className="h-3 w-3" /> Selesai
              </span>
            ) : (
              <span className="text-[10px] font-medium text-muted-foreground flex items-center gap-0.5">
                <Clock className="h-3 w-3 text-amber-500" /> {completedCount}/5 Lengkap
              </span>
            )}
          </div>
          <span className="text-xs font-bold font-mono text-primary">{progressPercent}%</span>
        </div>

        {/* Visual Progress Bar */}
        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
          <div
            className={cn(
              'h-full transition-all duration-500 ease-out rounded-full',
              progressPercent === 100 ? 'bg-emerald-500' : 'bg-[#007ACC]'
            )}
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* 5-Gate Step Pills */}
        <div className="grid grid-cols-5 gap-1.5 pt-1">
          {gates.map((g, idx) => {
            const Icon = g.icon
            return (
              <div
                key={idx}
                className={cn(
                  'flex flex-col items-center justify-center p-1.5 rounded-md border text-center transition-all',
                  g.done
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300 shadow-2xs'
                    : 'bg-muted/40 border-border/40 text-muted-foreground'
                )}
              >
                <div
                  className={cn(
                    'h-5 w-5 rounded-full flex items-center justify-center mb-1 text-[10px]',
                    g.done
                      ? 'bg-emerald-500 text-white'
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  {g.done ? <CheckCircle2 className="h-3 w-3" /> : <Icon className="h-2.5 w-2.5" />}
                </div>
                <span className="text-[9px] font-medium leading-tight truncate max-w-full">
                  {g.label}
                </span>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
