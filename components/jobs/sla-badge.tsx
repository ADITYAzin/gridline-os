import { Badge } from '@/components/ui/badge'
import { AlertCircle, Clock, CheckCircle2 } from 'lucide-react'

interface SlaBadgeProps {
  status: string
  scheduledEnd?: string | null
  completedAt?: string | null
  className?: string
}

export function SlaBadge({
  status,
  scheduledEnd,
  completedAt,
  className = '',
}: SlaBadgeProps) {
  if (!scheduledEnd) return null

  const now = new Date().getTime()
  const deadline = new Date(scheduledEnd).getTime()
  const twoHoursMs = 2 * 60 * 60 * 1000

  // 1. If Job is Completed
  if (status === 'completed') {
    if (completedAt) {
      const finishTime = new Date(completedAt).getTime()
      if (finishTime <= deadline) {
        return (
          <Badge
            variant="outline"
            className={`gap-1 border-emerald-500/40 text-emerald-700 dark:text-emerald-400 bg-emerald-500/5 text-[10px] font-semibold ${className}`}
          >
            <CheckCircle2 className="h-2.5 w-2.5" />
            SLA On-Time
          </Badge>
        )
      } else {
        return (
          <Badge
            variant="outline"
            className={`gap-1 border-amber-500/40 text-amber-700 dark:text-amber-400 bg-amber-500/5 text-[10px] font-semibold ${className}`}
          >
            <Clock className="h-2.5 w-2.5" />
            SLA Terlewati
          </Badge>
        )
      }
    }
    return null
  }

  // 2. If Job is Cancelled
  if (status === 'cancelled') {
    return null
  }

  // 3. If Job is Active (Pending / Assigned / On Progress)
  if (now > deadline) {
    return (
      <Badge
        variant="destructive"
        className={`gap-1 animate-pulse text-[10px] font-semibold shadow-xs ${className}`}
      >
        <AlertCircle className="h-2.5 w-2.5" />
        Overdue (Terlambat)
      </Badge>
    )
  }

  if (deadline - now <= twoHoursMs) {
    return (
      <Badge
        variant="outline"
        className={`gap-1 border-amber-500 text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 text-[10px] font-semibold ${className}`}
      >
        <Clock className="h-2.5 w-2.5" />
        Mendekati Batas SLA
      </Badge>
    )
  }

  return (
    <Badge
      variant="outline"
      className={`gap-1 text-muted-foreground border-muted-foreground/20 text-[10px] ${className}`}
    >
      <Clock className="h-2.5 w-2.5" />
      SLA Aman
    </Badge>
  )
}
