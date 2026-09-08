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
            <h1 className="text-heading-1 font-heading text-slate-900 tracking-tight">Visual Dispatch Board</h1>
            <RealtimeIndicator
              status={status}
              lastUpdated={lastUpdated}
              onRefresh={refresh}
              isRefreshing={isRefreshing}
            />
          </div>
          <p className="text-body-reg text-slate-500 mt-1">
            Visualisasi distribusi jadwal pekerjaan dan ketersediaan teknisi secara live dan terpusat.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button asChild className="gap-2 font-semibold shadow-sm bg-[#007ACC] hover:bg-[#0062A3]">
            <Link href="/admin/jobs/new">
              <Plus className="h-4 w-4" />
              + Buat Job Baru
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
            <span className="text-muted-foreground">Pekerjaan Aktif Lapangan</span>
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
                      {techSchedules.length} Pekerjaan Terjadwal
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
                      {techSchedules.map((s) => {
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

                        return (
                          <div
                            key={s.id}
                            className={`rounded-lg border p-3.5 space-y-2 transition-all ${
                              isProgress
                                ? 'bg-primary/5 border-primary/40 shadow-sm ring-1 ring-primary/20'
                                : isCompleted
                                ? 'bg-muted/20 border-border opacity-75'
                                : 'bg-card hover:border-primary/50'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-1 flex-wrap">
                              <span className="font-mono font-bold text-xs text-primary">{job.job_number}</span>
                              <div className="flex items-center gap-1">
                                <Badge
                                  variant={isProgress ? 'default' : 'secondary'}
                                  className="capitalize text-[10px]"
                                >
                                  {job.status.replace('_', ' ')}
                                </Badge>
                                <SlaBadge
                                  status={job.status}
                                  scheduledEnd={s.end_at}
                                  completedAt={job.completed_at}
                                />
                              </div>
                            </div>

                            <div>
                              <span className="font-semibold text-xs block">{job.service_type}</span>
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

                            <Button asChild variant="ghost" size="sm" className="w-full h-7 text-xs gap-1 mt-1">
                              <Link href={`/admin/jobs/${job.id}`}>
                                Lihat Detail <ArrowRight className="h-3 w-3" />
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
