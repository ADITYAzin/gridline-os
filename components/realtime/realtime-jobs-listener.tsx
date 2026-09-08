'use client'

import { useRealtimeJobs } from './use-realtime-jobs'
import { RealtimeIndicator } from './realtime-indicator'

interface RealtimeJobsListenerProps {
  orgId?: string
  technicianId?: string
  showIndicator?: boolean
  compact?: boolean
  className?: string
  enableToasts?: boolean
}

export function RealtimeJobsListener({
  orgId,
  technicianId,
  showIndicator = true,
  compact = false,
  className,
  enableToasts = true,
}: RealtimeJobsListenerProps) {
  const { status, lastUpdated, isRefreshing, refresh } = useRealtimeJobs({
    orgId,
    technicianId,
    enableToasts,
  })

  if (!showIndicator) return null

  return (
    <RealtimeIndicator
      status={status}
      lastUpdated={lastUpdated}
      onRefresh={refresh}
      isRefreshing={isRefreshing}
      compact={compact}
      className={className}
    />
  )
}
