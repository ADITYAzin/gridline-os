'use client'

import { useEffect, useState, useTransition, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserSupabaseClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { RealtimeConnectionStatus } from './realtime-indicator'

interface UseRealtimeJobsOptions {
  orgId?: string
  technicianId?: string
  enableToasts?: boolean
  onUpdate?: () => void
}

export function useRealtimeJobs({
  orgId,
  technicianId,
  enableToasts = true,
  onUpdate,
}: UseRealtimeJobsOptions = {}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [status, setStatus] = useState<RealtimeConnectionStatus>('connecting')
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const isRefreshingManual = useRef(false)
  const onUpdateRef = useRef(onUpdate)

  useEffect(() => {
    onUpdateRef.current = onUpdate
  }, [onUpdate])

  const handleRefresh = useCallback(() => {
    isRefreshingManual.current = true
    startTransition(() => {
      router.refresh()
      setLastUpdated(new Date())
      onUpdateRef.current?.()
    })
  }, [router])

  useEffect(() => {
    if (!orgId && !technicianId) return

    const supabase = createBrowserSupabaseClient()
    const channelName = `realtime-jobs-${orgId || technicianId}-${Date.now()}`
    const channel = supabase.channel(channelName)

    // 1. Subscribe to 'jobs' table
    const jobFilter = orgId
      ? `org_id=eq.${orgId}`
      : technicianId
      ? `technician_id=eq.${technicianId}`
      : undefined

    channel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'jobs',
        filter: jobFilter,
      },
      (payload) => {
        const { eventType, new: newRecord, old: oldRecord } = payload as {
          eventType: 'INSERT' | 'UPDATE' | 'DELETE'
          new: { job_number?: string; status?: string; service_type?: string }
          old: { job_number?: string; status?: string }
        }

        if (enableToasts) {
          if (eventType === 'INSERT' && newRecord?.job_number) {
            toast.success(`Job Baru: ${newRecord.job_number}`, {
              description: `${newRecord.service_type || 'Pekerjaan baru'} telah dibuat dalam sistem.`,
            })
          } else if (eventType === 'UPDATE' && newRecord?.job_number) {
            const oldStatus = oldRecord?.status
            const newStatus = newRecord?.status

            if (oldStatus !== newStatus && newStatus) {
              const statusLabels: Record<string, string> = {
                pending: 'Pending',
                assigned: 'Ditugaskan (Assigned)',
                on_progress: 'Sedang Dikerjakan (On Progress)',
                completed: 'Selesai (Completed)',
                cancelled: 'Dibatalkan (Cancelled)',
              }
              const displayStatus = statusLabels[newStatus] || newStatus

              if (newStatus === 'completed') {
                toast.success(`Job Selesai: ${newRecord.job_number}`, {
                  description: `Status telah diperbarui menjadi ${displayStatus}.`,
                })
              } else if (newStatus === 'on_progress') {
                toast.info(`Teknisi Mulai Mengerjakan: ${newRecord.job_number}`, {
                  description: `Status telah berubah menjadi ${displayStatus}.`,
                })
              } else if (newStatus === 'cancelled') {
                toast.error(`Job Dibatalkan: ${newRecord.job_number}`, {
                  description: `Pekerjaan telah dibatalkan oleh Admin.`,
                })
              } else {
                toast.info(`Update Job: ${newRecord.job_number}`, {
                  description: `Status kini: ${displayStatus}`,
                })
              }
            }
          }
        }

        startTransition(() => {
          router.refresh()
          setLastUpdated(new Date())
          onUpdateRef.current?.()
        })
      }
    )

    // 2. Subscribe to org-scoped tables (if orgId provided)
    if (orgId) {
      const orgScopedTables = [
        'schedules',
        'checklist_items',
        'job_photos',
        'work_reports',
        'signatures',
        'company_services',
        'customer_assets',
        'customers',
        'profiles',
        'invite_tokens',
      ]

      for (const tableName of orgScopedTables) {
        channel.on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: tableName,
            filter: `org_id=eq.${orgId}`,
          },
          () => {
            startTransition(() => {
              router.refresh()
              setLastUpdated(new Date())
              onUpdateRef.current?.()
            })
          }
        )
      }

      // Also subscribe to organizations row for this orgId
      channel.on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'organizations',
          filter: `id=eq.${orgId}`,
        },
        () => {
          startTransition(() => {
            router.refresh()
            setLastUpdated(new Date())
            onUpdateRef.current?.()
          })
        }
      )
    }

    // 3. Subscribe to 'job_attendance' table (GPS Check-in / Check-out)
    if (orgId) {
      channel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'job_attendance',
          filter: `org_id=eq.${orgId}`,
        },
        (payload) => {
          const newAtt = payload.new as { check_in_at?: string | null; check_out_at?: string | null }
          const oldAtt = payload.old as { check_in_at?: string | null; check_out_at?: string | null }
          if (enableToasts) {
            if (newAtt?.check_in_at && !oldAtt?.check_in_at) {
              toast.info('Check-in Lapangan Terverifikasi', {
                description: 'Teknisi telah tiba di lokasi pelanggan dan merekam koordinat GPS.',
              })
            } else if (newAtt?.check_out_at && !oldAtt?.check_out_at) {
              toast.info('Check-out Lapangan Tercatat', {
                description: 'Teknisi telah menyelesaikan kunjungan di lokasi pelanggan.',
              })
            }
          }
          startTransition(() => {
            router.refresh()
            setLastUpdated(new Date())
            onUpdateRef.current?.()
          })
        }
      )
    }

    channel.subscribe((subStatus) => {
      if (subStatus === 'SUBSCRIBED') {
        setStatus('connected')
        setLastUpdated(new Date())
      } else if (subStatus === 'CHANNEL_ERROR' || subStatus === 'TIMED_OUT') {
        setStatus('error')
      } else if (subStatus === 'CLOSED') {
        setStatus('disconnected')
      }
    })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [orgId, technicianId, enableToasts, router])

  return {
    status,
    lastUpdated,
    isRefreshing: isPending,
    refresh: handleRefresh,
  }
}
