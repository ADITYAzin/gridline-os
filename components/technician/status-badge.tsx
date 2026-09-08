import { cn } from '@/lib/utils'

export type JobStatusType = 'pending' | 'assigned' | 'on_progress' | 'completed' | 'cancelled'

interface StatusBadgeProps {
  status: JobStatusType | string
  className?: string
  showDot?: boolean
}

export function TechnicianStatusBadge({ status, className, showDot = true }: StatusBadgeProps) {
  switch (status) {
    case 'assigned':
      return (
        <span
          className={cn(
            'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[6px] text-xs font-medium bg-[#F0F9FF] text-[#0369A1] border border-[#BAE6FD]',
            className
          )}
        >
          {showDot && <span className="h-1.5 w-1.5 rounded-full bg-[#0EA5E9]" />}
          Ditugaskan
        </span>
      )
    case 'on_progress':
      return (
        <span
          className={cn(
            'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[6px] text-xs font-medium bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A]',
            className
          )}
        >
          {showDot && <span className="h-1.5 w-1.5 rounded-full bg-[#F59E0B] animate-pulse" />}
          Sedang Dikerjakan
        </span>
      )
    case 'completed':
      return (
        <span
          className={cn(
            'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[6px] text-xs font-medium bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0]',
            className
          )}
        >
          {showDot && <span className="h-1.5 w-1.5 rounded-full bg-[#10B981]" />}
          Selesai Tuntas
        </span>
      )
    case 'cancelled':
      return (
        <span
          className={cn(
            'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[6px] text-xs font-medium bg-[#FEF2F2] text-[#B91C1C] border border-[#FECACA]',
            className
          )}
        >
          {showDot && <span className="h-1.5 w-1.5 rounded-full bg-[#EF4444]" />}
          Dibatalkan
        </span>
      )
    case 'pending':
    default:
      return (
        <span
          className={cn(
            'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[6px] text-xs font-medium bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0]',
            className
          )}
        >
          {showDot && <span className="h-1.5 w-1.5 rounded-full bg-[#94A3B8]" />}
          Pending / Antrean
        </span>
      )
  }
}
