'use client'

import { useState, useMemo } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import {
  MapPin,
  Search,
  RefreshCw,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useRealtimeJobs } from '@/components/realtime/use-realtime-jobs'
import { RealtimeIndicator } from '@/components/realtime/realtime-indicator'

export interface MapJobItem {
  id: string
  job_number: string
  service_type: string
  address: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'pending' | 'assigned' | 'on_progress' | 'completed'
  latitude: number | null
  longitude: number | null
  created_at: string
  customer_name: string
  customer_phone?: string | null
  technician_name?: string | null
  technician_id?: string | null
  check_in_at?: string | null
  check_out_at?: string | null
}

interface LiveMapViewProps {
  jobs: MapJobItem[]
  orgId: string
}

// Dynamically load Leaflet with SSR disabled
const LeafletMap = dynamic(() => import('./leaflet-map-inner'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[580px] rounded-xl border border-border bg-muted/20 flex flex-col items-center justify-center gap-2.5">
      <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      <span className="text-xs text-muted-foreground font-medium">Memuat peta...</span>
    </div>
  ),
})

const STATUS_FILTERS = [
  { value: 'all', label: 'Semua Tiket' },
  { value: 'on_progress', label: 'Hadir di Lokasi', color: 'bg-emerald-500' },
  { value: 'assigned', label: 'Ditugaskan', color: 'bg-primary' },
  { value: 'pending', label: 'Belum Ada Teknisi', color: 'bg-amber-500' },
  { value: 'completed', label: 'Selesai', color: 'bg-emerald-700' },
]

export function LiveMapView({ jobs, orgId }: LiveMapViewProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null)

  // Realtime subscription
  const { status, lastUpdated, isRefreshing, refresh } = useRealtimeJobs({
    orgId,
    enableToasts: true,
  })

  // Normalize jobs and exclude cancelled jobs
  const activeJobs = useMemo(() => {
    return jobs
      .filter((job) => (job.status as string) !== 'cancelled')
      .map((job) => ({
        ...job,
        latitude: job.latitude != null ? Number(job.latitude) : null,
        longitude: job.longitude != null ? Number(job.longitude) : null,
      }))
  }, [jobs])

  // Filter jobs based on search & status
  const filteredJobs = useMemo(() => {
    return activeJobs.filter((job) => {
      // Status filter
      if (statusFilter !== 'all' && job.status !== statusFilter) {
        return false
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim()
        const matchesNumber = job.job_number.toLowerCase().includes(query)
        const matchesCustomer = job.customer_name.toLowerCase().includes(query)
        const matchesAddress = job.address.toLowerCase().includes(query)
        const matchesTech = (job.technician_name || '').toLowerCase().includes(query)
        const matchesService = job.service_type.toLowerCase().includes(query)

        if (!matchesNumber && !matchesCustomer && !matchesAddress && !matchesTech && !matchesService) {
          return false
        }
      }

      return true
    })
  }, [activeJobs, statusFilter, searchQuery])

  // Jobs that have valid coordinates for the map
  const mappedJobs = useMemo(() => {
    return filteredJobs.filter(
      (job) => job.latitude != null && job.longitude != null && !isNaN(job.latitude) && !isNaN(job.longitude)
    )
  }, [filteredJobs])

  // Realtime counts per tab
  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: activeJobs.length,
      on_progress: 0,
      assigned: 0,
      pending: 0,
      completed: 0,
    }

    for (const job of activeJobs) {
      if (job.status in counts) {
        counts[job.status]++
      }
    }

    return counts
  }, [activeJobs])

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground font-heading">
            Peta Lapangan
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Pantau sebaran tiket dan kehadiran teknisi di lapangan secara realtime.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <RealtimeIndicator status={status} lastUpdated={lastUpdated} />
          <Button
            variant="outline"
            size="sm"
            onClick={refresh}
            disabled={isRefreshing}
            className="h-8 px-2.5 text-xs gap-1.5 rounded-lg"
          >
            <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Segarkan</span>
          </Button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-2.5 rounded-xl border bg-card/60 shadow-2xs">
        {/* Search Box */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari no. tiket, pelanggan, atau teknisi..."
            className="h-8 pl-8 text-xs rounded-lg bg-background"
          />
        </div>

        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 md:pb-0">
          {STATUS_FILTERS.map((f) => {
            const isActive = statusFilter === f.value
            const count = tabCounts[f.value] ?? 0

            return (
              <button
                key={f.value}
                type="button"
                onClick={() => setStatusFilter(f.value)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                    : 'bg-background text-muted-foreground border-border hover:bg-muted/40 hover:text-foreground'
                }`}
              >
                {f.color && <span className={`h-1.5 w-1.5 rounded-full ${f.color}`} />}
                <span>{f.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-semibold leading-none tabular-nums ${
                    isActive
                      ? 'bg-primary-foreground/20 text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Map & Sidebar Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[calc(100vh-210px)] min-h-[560px]">
        {/* Left Side: Job List Sidebar */}
        <div className="lg:col-span-4 h-full flex flex-col rounded-xl border border-border bg-card overflow-hidden shadow-2xs">
          <div className="p-3 border-b bg-muted/20 flex items-center justify-between shrink-0">
            <span className="text-xs font-semibold text-foreground">
              Daftar Tiket
            </span>
            <span className="text-[11px] text-muted-foreground">
              {filteredJobs.length} tiket ({mappedJobs.length} di peta)
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-2.5 space-y-2">
            {filteredJobs.length === 0 ? (
              <div className="text-center py-12 px-4 text-xs text-muted-foreground">
                Tidak ada tiket yang sesuai.
              </div>
            ) : (
              filteredJobs.map((job) => {
                const isSelected = job.id === selectedJobId
                const hasCoords = job.latitude != null && job.longitude != null
                const isCheckedIn = Boolean(job.check_in_at)

                let checkInTime = ''
                if (job.check_in_at) {
                  try {
                    const d = new Date(job.check_in_at)
                    checkInTime = d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB'
                  } catch {
                    checkInTime = ''
                  }
                }

                return (
                  <div
                    key={job.id}
                    onClick={() => {
                      setSelectedJobId(job.id)
                    }}
                    className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-primary/5 border-primary shadow-xs ring-1 ring-primary/20'
                        : 'bg-background hover:bg-muted/30 border-border'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-mono text-xs font-bold text-primary">
                        {job.job_number}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                          job.status === 'on_progress'
                            ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                            : job.status === 'assigned'
                            ? 'bg-blue-500/10 text-blue-600 border-blue-500/20'
                            : job.status === 'completed'
                            ? 'bg-emerald-700/10 text-emerald-700 border-emerald-700/20'
                            : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                        }`}
                      >
                        {job.status === 'on_progress'
                          ? 'Dikerjakan'
                          : job.status === 'assigned'
                          ? 'Ditugaskan'
                          : job.status === 'completed'
                          ? 'Selesai'
                          : 'Menunggu'}
                      </span>
                    </div>

                    <div className="text-xs font-semibold text-foreground truncate">
                      {job.service_type}
                    </div>

                    <div className="text-[11px] text-muted-foreground truncate mt-0.5">
                      {job.customer_name} {job.address ? `• ${job.address}` : ''}
                    </div>

                    {/* Teknisi & Kehadiran Bar */}
                    <div className="flex items-center justify-between text-[11px] pt-2 mt-2 border-t border-border/40">
                      <span className="text-muted-foreground truncate max-w-[140px]">
                        {job.technician_name ? job.technician_name : <span className="italic text-amber-600">Belum ada teknisi</span>}
                      </span>
                      {isCheckedIn ? (
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 text-[10px]">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Hadir {checkInTime}
                        </span>
                      ) : (
                        <span className="text-[10px] text-muted-foreground/70">
                          {job.status === 'assigned' ? 'Menuju Lokasi' : job.status === 'completed' ? 'Selesai' : 'Belum Check-in'}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-1.5 mt-1.5 border-t border-border/30">
                      <Link
                        href={`/admin/jobs/${job.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-[11px] font-medium text-primary hover:underline"
                      >
                        Buka Tiket →
                      </Link>

                      {hasCoords ? (
                        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                          <MapPin className="h-3 w-3" />
                          Ada GPS
                        </span>
                      ) : (
                        <span className="text-[10px] text-muted-foreground/50">
                          Tanpa GPS
                        </span>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Right Side: Leaflet Interactive Map */}
        <div className="lg:col-span-8 h-full min-h-[560px] relative rounded-xl overflow-hidden border border-border">
          <LeafletMap
            jobs={mappedJobs}
            selectedJobId={selectedJobId}
            onSelectJob={(job) => {
              setSelectedJobId(job ? job.id : null)
            }}
          />
        </div>
      </div>
    </div>
  )
}
