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
  LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface FiveGateProgressProps {
  hasCheckIn: boolean
  hasChecklistCompleted: boolean
  hasPhotosCompleted: boolean
  hasSignature: boolean
  hasReport: boolean
  hasCheckOut?: boolean
  isCompleted: boolean
}

export function FiveGateProgress({
  hasCheckIn,
  hasChecklistCompleted,
  hasPhotosCompleted,
  hasSignature,
  hasReport,
  hasCheckOut = false,
  isCompleted,
}: FiveGateProgressProps) {
  const gates = [
    { label: 'Check-in', done: hasCheckIn, icon: Navigation },
    { label: 'SOP', done: hasChecklistCompleted, icon: ListChecks },
    { label: 'Foto Bukti', done: hasPhotosCompleted, icon: Camera },
    { label: 'Ttd', done: hasSignature, icon: PenTool },
    { label: 'Laporan', done: hasReport, icon: FileText },
    { label: 'Check-out', done: hasCheckOut, icon: LogOut },
  ]

  const completedCount = gates.filter((g) => g.done).length
  const progressPercent = Math.round((completedCount / gates.length) * 100)

  return (
    <Card className="shadow-xs border-primary/20 bg-gradient-to-br from-card to-primary/5 overflow-hidden">
      <CardContent className="p-3.5 space-y-2.5">
        {/* Header summary */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-[#0F172A]">Progres Tiket</span>
            {isCompleted ? (
              <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Selesai
              </span>
            ) : (
              <span className="text-xs font-semibold text-[#475569] bg-slate-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-amber-600" /> {completedCount}/6 Selesai
              </span>
            )}
          </div>
          <span className="text-sm font-bold font-mono text-[#007ACC]">{progressPercent}%</span>
        </div>

        {/* Visual Progress Bar */}
        <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
          <div
            className={cn(
              'h-full transition-all duration-500 ease-out rounded-full',
              progressPercent === 100 ? 'bg-emerald-500' : 'bg-[#007ACC]'
            )}
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* 6-Gate Step Pills */}
        <div className="grid grid-cols-6 gap-1 pt-1">
          {gates.map((g, idx) => {
            const Icon = g.icon
            return (
              <div
                key={idx}
                className={cn(
                  'flex flex-col items-center justify-center py-1.5 px-0.5 rounded-lg border text-center transition-all',
                  g.done
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900 shadow-2xs'
                    : 'bg-white border-slate-200 text-[#64748B]'
                )}
              >
                <div
                  className={cn(
                    'h-6 w-6 rounded-full flex items-center justify-center mb-1 text-xs',
                    g.done
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-[#64748B]'
                  )}
                >
                  {g.done ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Icon className="h-3.5 w-3.5" />}
                </div>
                <span className="text-[11px] font-bold leading-none truncate max-w-full">
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
