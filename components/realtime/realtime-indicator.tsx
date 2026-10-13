'use client'

import { RotateCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export type RealtimeConnectionStatus = 'connected' | 'connecting' | 'disconnected' | 'error'

interface RealtimeIndicatorProps {
  status: RealtimeConnectionStatus
  lastUpdated?: Date | null
  onRefresh?: () => void
  isRefreshing?: boolean
  className?: string
  compact?: boolean
}

export function RealtimeIndicator({
  status,
  lastUpdated,
  onRefresh,
  isRefreshing = false,
  className,
  compact = false,
}: RealtimeIndicatorProps) {
  const statusConfig = {
    connected: {
      dotColor: 'bg-emerald-500',
      pingColor: 'bg-emerald-400',
      label: 'Live Realtime',
      border: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
    },
    connecting: {
      dotColor: 'bg-amber-500',
      pingColor: 'bg-amber-400',
      label: 'Menghubungkan...',
      border: 'border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400',
    },
    disconnected: {
      dotColor: 'bg-slate-400',
      pingColor: 'bg-slate-300',
      label: 'Terputus',
      border: 'border-border bg-muted/50 text-muted-foreground',
    },
    error: {
      dotColor: 'bg-rose-500',
      pingColor: 'bg-rose-400',
      label: 'Gagal Terhubung',
      border: 'border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-400',
    },
  }[status]

  return (
    <div className={cn('inline-flex items-center gap-2', className)}>
      <div
        className={cn(
          'inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-medium transition-all duration-300',
          statusConfig.border
        )}
      >
        <span className="relative flex h-2 w-2">
          {status === 'connected' && (
            <span
              className={cn(
                'absolute inline-flex h-full w-full animate-ping rounded-full opacity-75',
                statusConfig.pingColor
              )}
            />
          )}
          <span className={cn('relative inline-flex h-2 w-2 rounded-full', statusConfig.dotColor)} />
        </span>
        <span className="text-[11px] font-semibold tracking-tight">{statusConfig.label}</span>

        {!compact && lastUpdated && (
          <span className="hidden sm:inline text-[10px] text-muted-foreground font-normal border-l border-border/50 pl-2">
            Update: {lastUpdated.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
        )}
      </div>

      {onRefresh && (
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-7 rounded-full text-muted-foreground hover:text-foreground"
          onClick={onRefresh}
          disabled={isRefreshing}
          title="Segarkan data sekarang"
        >
          <RotateCw className={cn('h-3.5 w-3.5', isRefreshing && 'animate-spin text-primary')} />
          <span className="sr-only">Segarkan data</span>
        </Button>
      )}
    </div>
  )
}
