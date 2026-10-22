'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CalendarDays, Clock, MapPin, ArrowRight, Search, Plus, UserCheck } from 'lucide-react'
import { SlaBadge } from '@/components/jobs/sla-badge'
import { useRealtimeJobs } from '@/components/realtime/use-realtime-jobs'
import { RealtimeIndicator } from '@/components/realtime/realtime-indicator'

export interface TechnicianItem {
  id: string
  name: string
  email: string
}

export interface ScheduleJobItem {
  id: string
  job_number: string
  service_type: string
  address: string
  priority: string
  status: string
  completed_at: string | null
  customers: { name: string } | { name: string }[] | null
}

export interface ScheduleItem {
  id: string
  technician_id: string
  start_at: string
  end_at: string
  jobs: ScheduleJobItem | ScheduleJobItem[] | null
}

interface DispatchViewProps {
  technicians: TechnicianItem[]
  schedules: ScheduleItem[]
  orgId: string
}

export function DispatchView({ technicians, schedules, orgId }: DispatchViewProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const { status, lastUpdated, isRefreshing, refresh } = useRealtimeJobs({
    orgId,
    enableToasts: true,
  })

  // Filter technicians based on search query
  const filteredTechnicians = technicians.filter(
    (tech) =>
      tech.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tech.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const activeSchedulesCount = schedules.filter((s) => {
    const job = Array.isArray(s.jobs) ? s.jobs[0] : s.jobs
    return job && job.status !== 'completed' && job.status !== 'cancelled'
  }).length

  return (
    <div className="space-y-6">
      {/* Header & Realtime Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-heading">Jadwal & Dispatch</h1>
            <RealtimeIndicator
              status={status}
              lastUpdated={lastUpdated}
              onRefresh={refresh}
              isRefreshing={isRefreshing}
            />
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Pantau jadwal kerja dan alokasi tiket teknisi secara realtime.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button asChild className="gap-2 font-medium bg-[#007ACC] hover:bg-primary hover:text-white rounded-[8px] h-8 text-xs shadow-[0_1px_2px_0_rgba(0,122,204,0.15)]">
            <Link href="/admin/jobs/new">
              <Plus className="h-4 w-4" />
              Buat Tiket Baru
            </Link>
          </Button>
        </div>
      </div>

      {/* Overview Stats Bar & Quick Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-3 rounded-lg border bg-card/60 backdrop-blur">
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-foreground">{technicians.length}</span>
            <span className="text-muted-foreground">Teknisi Terdaftar</span>
          </div>
          <span className="text-border">|</span>
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-primary">{activeSchedulesCount}</span>
            <span className="text-muted-foreground">Tiket Aktif Lapangan</span>
          </div>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Cari teknisi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-8 text-xs bg-background"
          />
        </div>
      </div>

      {technicians.length === 0 ? (
        <Card className="text-center p-12 border-dashed">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-muted-foreground mb-3">
            <CalendarDays className="h-6 w-6" />
          </div>
          <CardTitle className="text-lg">Belum Ada Teknisi Terdaftar</CardTitle>
          <CardDescription className="text-sm max-w-sm mx-auto mt-1 mb-4">
            Undang teknisi pertama Anda agar dapat melihat papan penjadwalan dispatch secara live.
          </CardDescription>
          <Button asChild>
            <Link href="/admin/technicians">Undang Teknisi</Link>
          </Button>
        </Card>
      ) : filteredTechnicians.length === 0 ? (
        <Card className="text-center p-8 border-dashed">
          <CardDescription className="text-sm">
            Tidak ada teknisi yang cocok dengan pencarian &quot;{searchQuery}&quot;.
          </CardDescription>
        </Card>
      ) : (
        <div className="space-y-6">
          {filteredTechnicians.map((tech) => {
            const techSchedules = schedules.filter((s) => s.technician_id === tech.id)
            const hasOngoingJob = techSchedules.some((s) => {
              const job = Array.isArray(s.jobs) ? s.jobs[0] : s.jobs
              return job?.status === 'on_progress'
            })
            const activeTechSchedules = techSchedules.filter((s) => {
              const job = Array.isArray(s.jobs) ? s.jobs[0] : s.jobs
              return job && job.status !== 'cancelled'
            })

            // Sort schedules: active jobs first (on_progress -> assigned/pending -> completed), cancelled jobs placed strictly at the end
            const sortedSchedules = [...techSchedules].sort((a, b) => {
              const jobA = Array.isArray(a.jobs) ? a.jobs[0] : a.jobs
              const jobB = Array.isArray(b.jobs) ? b.jobs[0] : b.jobs

              const isCancelledA = jobA?.status === 'cancelled'
              const isCancelledB = jobB?.status === 'cancelled'

              if (isCancelledA && !isCancelledB) return 1
              if (!isCancelledA && isCancelledB) return -1

              const getPriority = (st?: string) => {
                if (st === 'on_progress') return 1
                if (st === 'assigned' || st === 'pending') return 2
                if (st === 'completed') return 3
                return 4
              }

              const prioA = getPriority(jobA?.status)
              const prioB = getPriority(jobB?.status)
              if (prioA !== prioB) return prioA - prioB

              return new Date(a.start_at).getTime() - new Date(b.start_at).getTime()
            })

            return (
              <Card key={tech.id} className="shadow-sm overflow-hidden border-border/80">
                <CardHeader className="bg-muted/30 border-b py-3 px-5 flex flex-row items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-xs">
                      {tech.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-sm font-semibold">{tech.name}</CardTitle>
                        {hasOngoingJob && (
                          <Badge variant="default" className="text-[10px] bg-blue-600 hover:bg-blue-600 px-1.5 py-0">
                            Sedang Bertugas
                          </Badge>
                        )}
                      </div>
                      <CardDescription className="text-[11px]">{tech.email}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs font-medium">
                      {activeTechSchedules.length} Pekerjaan Aktif
                      {techSchedules.length > activeTechSchedules.length
                        ? ` (${techSchedules.length - activeTechSchedules.length} Batal)`
                        : ''}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="p-4">
                  {techSchedules.length === 0 ? (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground italic py-2">
                      <UserCheck className="h-3.5 w-3.5 text-emerald-500" />
                      <span>Tidak ada jadwal aktif untuk teknisi ini. Siap menerima tugas baru.</span>
                    </div>
                  ) : (
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {sortedSchedules.map((s) => {
                        const job = (Array.isArray(s.jobs) ? s.jobs[0] : s.jobs) as ScheduleJobItem | null
                        if (!job) return null
                        const customer = job.customers

                        const startDate = new Date(s.start_at)
                        const endDate = new Date(s.end_at)
                        const timeStr = `${startDate.toLocaleTimeString('id-ID', {
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: false,
                        })} - ${endDate.toLocaleTimeString('id-ID', {
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: false,
                        })}`

                        const isCompleted = job.status === 'completed'
                        const isProgress = job.status === 'on_progress'
                        const isCancelled = job.status === 'cancelled'

                        return (
                          <div
                            key={s.id}
                            className={`rounded-lg border border-border p-3.5 space-y-2 transition-all ${
                              isProgress
                                ? 'bg-primary/5 border-primary/40 shadow-sm ring-1 ring-primary/20'
                                : isCancelled
                                ? 'bg-slate-50/70 dark:bg-slate-900/40 border-dashed border-border/80 opacity-60 hover:opacity-100'
                                : 'bg-card'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-1 flex-wrap">
                              <span
                                className={`font-mono font-bold text-xs ${
                                  isCancelled ? 'text-muted-foreground line-through' : 'text-primary'
                                }`}
                              >
                                {job.job_number}
                              </span>
                              <div className="flex items-center gap-1">
                                <Badge
                                  variant={
                                    isProgress
                                      ? 'default'
                                      : isCancelled
                                      ? 'destructive'
                                      : isCompleted
                                      ? 'outline'
                                      : 'secondary'
                                  }
                                  className={`text-[10px] ${
                                    isCancelled
                                      ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50 hover:bg-rose-500/20'
                                      : ''
                                  }`}
                                >
                                  {isCancelled
                                    ? 'Dibatalkan'
                                    : job.status === 'on_progress'
                                    ? 'Dikerjakan'
                                    : job.status === 'assigned'
                                    ? 'Ditugaskan'
                                    : job.status === 'completed'
                                    ? 'Selesai'
                                    : 'Menunggu'}
                                </Badge>
                                {!isCancelled && (
                                  <SlaBadge
                                    status={job.status}
                                    scheduledEnd={s.end_at}
                                    completedAt={job.completed_at}
                                  />
                                )}
                              </div>
                            </div>

                            <div>
                              <span
                                className={`font-semibold text-xs block ${
                                  isCancelled ? 'text-muted-foreground line-through' : ''
                                }`}
                              >
                                {job.service_type}
                              </span>
                              <span className="text-[11px] text-muted-foreground block truncate">
                                {Array.isArray(customer) ? customer[0]?.name : customer?.name}
                              </span>
                            </div>

                            <div className="pt-1 border-t space-y-1 text-[11px] text-muted-foreground">
                              <div className="flex items-center gap-1.5 font-medium text-foreground">
                                <Clock className="h-3 w-3 text-primary" />
                                <span>
                                  {startDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}, {timeStr}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5 truncate">
                                <MapPin className="h-3 w-3 shrink-0" />
                                <span className="truncate">{job.address}</span>
                              </div>
                            </div>

                            <Button
                              asChild
                              variant="outline"
                              size="sm"
                              className="w-full h-8 text-xs gap-1.5 mt-1 bg-[#F1F5F9] dark:bg-slate-800 text-[#475569] dark:text-slate-300 border-[#E2E8F0] dark:border-slate-700 hover:bg-[#007ACC] hover:text-white hover:border-[#007ACC] dark:hover:bg-[#007ACC] dark:hover:text-white font-medium rounded-[8px] transition-colors"
                            >
                              <Link href={`/admin/jobs/${job.id}`}>
                                Buka Tiket <ArrowRight className="h-3 w-3" />
                              </Link>
                            </Button>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
