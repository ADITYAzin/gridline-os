'use client'

import { useState, useMemo, useEffect } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import {
  MapPin,
  Search,
  Camera,
  X,
  Calendar,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
  check_in_photo_url?: string | null
  scheduled_start?: string | null
  scheduled_end?: string | null
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
  { value: 'all', label: 'Semua Status' },
  { value: 'on_progress', label: 'Hadir di Lokasi', color: 'bg-emerald-500' },
  { value: 'assigned', label: 'Ditugaskan', color: 'bg-primary' },
  { value: 'pending', label: 'Belum Ada Teknisi', color: 'bg-amber-500' },
  { value: 'completed', label: 'Selesai', color: 'bg-emerald-700' },
]

export function LiveMapView({ jobs, orgId }: LiveMapViewProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null)
  const [now, setNow] = useState<Date>(() => new Date())
  const [previewPhoto, setPreviewPhoto] = useState<{
    url: string
    jobNumber: string
    techName: string
    time: string
  } | null>(null)

  // Realtime subscription
  const { status, lastUpdated, isRefreshing, refresh } = useRealtimeJobs({
    orgId,
    enableToasts: true,
  })

  // Synchronize client date with user's device clock periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date())
    }, 60000)
    return () => clearInterval(interval)
  }, [])

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

  // Filter jobs: Hanya menampilkan hari ini dan lusa sesuai dengan tanggal & waktu pengguna
  // untuk mencegah tumpukan tiket lama/tidak penting
  const nearTermJobs = useMemo(() => {
    const userYear = now.getFullYear()
    const userMonth = now.getMonth()
    const userDate = now.getDate()
    const midnightUserToday = new Date(userYear, userMonth, userDate).getTime()

    return activeJobs.filter((job) => {
      // Tiket yang sedang dikerjakan di lokasi (on_progress) selalu ditampilkan
      if (job.status === 'on_progress') {
        return true
      }

      const dateStr = job.scheduled_start || job.check_in_at || job.created_at
      const dateObj = new Date(dateStr)
      if (isNaN(dateObj.getTime())) return false

      const jobYear = dateObj.getFullYear()
      const jobMonth = dateObj.getMonth()
      const jobDate = dateObj.getDate()
      const midnightJobDate = new Date(jobYear, jobMonth, jobDate).getTime()

      const diffDays = Math.round((midnightJobDate - midnightUserToday) / (24 * 3600 * 1000))

      // Hanya tampilkan hari ini (0), besok (1), dan lusa (2)
      return diffDays >= 0 && diffDays <= 2
    })
  }, [activeJobs, now])

  // Further filter by status & search query
  const filteredJobs = useMemo(() => {
    return nearTermJobs
      .filter((job) => {
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
      .sort((a, b) => {
        // Active jobs currently on-progress come first
        if (a.status === 'on_progress' && b.status !== 'on_progress') return -1
        if (b.status === 'on_progress' && a.status !== 'on_progress') return 1

        const timeA = new Date(a.scheduled_start || a.check_in_at || a.created_at).getTime()
        const timeB = new Date(b.scheduled_start || b.check_in_at || b.created_at).getTime()
        return timeA - timeB
      })
  }, [nearTermJobs, statusFilter, searchQuery])

  // Get jobs that have valid GPS coordinates for the map
  const mappedJobs = useMemo(() => {
    return filteredJobs.filter(
      (job) => job.latitude != null && job.longitude != null && !isNaN(job.latitude) && !isNaN(job.longitude)
    )
  }, [filteredJobs])

  const hiddenOlderCount = activeJobs.length - nearTermJobs.length

  return (
    <div className="space-y-4">
      {/* Top Bar: Title & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Peta Lapangan & Presensi
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Monitoring lokasi penugasan, status GPS kehadiran, dan bukti foto teknisi secara realtime.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <RealtimeIndicator
            status={status}
            lastUpdated={lastUpdated}
            onRefresh={refresh}
            isRefreshing={isRefreshing}
          />
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari no tiket, pelanggan, teknisi, alamat..."
            className="pl-8.5 pr-8 h-8.5 text-xs bg-card"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 rounded transition-colors"
              title="Hapus pencarian"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Status Filter Badges */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {STATUS_FILTERS.map((filter) => {
            const isSelected = statusFilter === filter.value
            const count =
              filter.value === 'all'
                ? nearTermJobs.length
                : nearTermJobs.filter((j) => j.status === filter.value).length

            return (
              <button
                key={filter.value}
                type="button"
                onClick={() => setStatusFilter(filter.value)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-primary text-primary-foreground shadow-2xs font-semibold'
                    : 'bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                {filter.color && (
                  <span
                    className={`h-2 w-2 rounded-full ${filter.color} ${
                      isSelected ? 'ring-2 ring-primary-foreground/30' : ''
                    }`}
                  />
                )}
                <span>{filter.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isSelected ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-background/80 text-muted-foreground'
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
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-foreground">
                Daftar Tiket
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Hari Ini & Lusa
              </span>
            </div>
            <span className="text-[11px] text-muted-foreground">
              {filteredJobs.length} tiket ({mappedJobs.length} di peta)
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-2.5 space-y-2">
            {filteredJobs.length === 0 ? (
              <div className="text-center py-12 px-4 text-xs text-muted-foreground space-y-2">
                <p className="font-semibold text-foreground">Tidak ada tiket aktif untuk hari ini dan lusa.</p>
                <p className="text-[11px] text-muted-foreground max-w-xs mx-auto leading-relaxed">
                  Daftar tiket otomatis hanya menampilkan pekerjaan hari ini hingga lusa sesuai tanggal & waktu perangkat Anda untuk mencegah tumpukan.
                </p>
                {hiddenOlderCount > 0 && (
                  <p className="text-[10.5px] text-slate-400 pt-1">
                    ({hiddenOlderCount} tiket lampau otomatis disaring keluar)
                  </p>
                )}
                {searchQuery && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setSearchQuery('')}
                    className="mt-2 text-xs h-7"
                  >
                    Reset Pencarian
                  </Button>
                )}
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

                let checkOutTime = ''
                if (job.check_out_at) {
                  try {
                    const d = new Date(job.check_out_at)
                    checkOutTime = d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB'
                  } catch {
                    checkOutTime = ''
                  }
                }

                const isCheckedOut = Boolean(job.check_out_at)

                // Label Hari Ini / Besok / Lusa
                let scheduleTag = ''
                const dateStr = job.scheduled_start || job.check_in_at || job.created_at
                const dateObj = new Date(dateStr)
                if (!isNaN(dateObj.getTime())) {
                  const midnightUserToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
                  const midnightJob = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate()).getTime()
                  const diff = Math.round((midnightJob - midnightUserToday) / 86400000)
                  const time = dateObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
                  if (diff === 0) scheduleTag = `Hari Ini • ${time}`
                  else if (diff === 1) scheduleTag = `Besok • ${time}`
                  else if (diff === 2) scheduleTag = `Lusa • ${time}`
                  else scheduleTag = dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
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
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-mono text-xs font-bold text-primary">
                          {job.job_number}
                        </span>
                        {scheduleTag && (
                          <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-muted text-muted-foreground border border-border/60">
                            {scheduleTag}
                          </span>
                        )}
                      </div>

                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border shrink-0 ${
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

                      <div className="flex items-center gap-1.5">
                        {isCheckedOut || job.status === 'completed' ? (
                          <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1 text-[10px]">
                            <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
                            {checkOutTime ? `Check-out ${checkOutTime}` : 'Selesai'}
                          </span>
                        ) : isCheckedIn ? (
                          <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 text-[10px]">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Hadir {checkInTime}
                          </span>
                        ) : (
                          <span className="text-[10px] text-muted-foreground/70">
                            {job.status === 'assigned' ? 'Menuju Lokasi' : 'Belum Check-in'}
                          </span>
                        )}

                        {/* Thumbnail Foto Kehadiran Teknisi (Bisa diklik untuk memperbesar) */}
                        {job.check_in_photo_url && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              setPreviewPhoto({
                                url: job.check_in_photo_url!,
                                jobNumber: job.job_number,
                                techName: job.technician_name || 'Teknisi',
                                time: checkInTime,
                              })
                            }}
                            className="relative h-6 w-6 rounded border border-emerald-300 overflow-hidden shrink-0 hover:scale-110 transition-transform cursor-pointer shadow-2xs"
                            title="Lihat Foto Presensi"
                          >
                            <img
                              src={job.check_in_photo_url}
                              alt="Selfie Check-in"
                              className="h-full w-full object-cover"
                            />
                          </button>
                        )}
                      </div>
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

      {/* Modal Dialog Zoom Foto Presensi Teknisi */}
      {previewPhoto && (
        <Dialog open={Boolean(previewPhoto)} onOpenChange={() => setPreviewPhoto(null)}>
          <DialogContent className="sm:max-w-md p-5 sm:p-6 rounded-2xl bg-card border border-border shadow-xl">
            <DialogHeader className="pb-3 border-b">
              <DialogTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
                <Camera className="h-4 w-4 text-primary" />
                Bukti Foto Presensi — {previewPhoto.jobNumber}
              </DialogTitle>
            </DialogHeader>

            <div className="mt-3.5 space-y-3">
              <div className="aspect-4/3 rounded-xl overflow-hidden bg-slate-950 border border-border/80 shadow-inner flex items-center justify-center">
                <img
                  src={previewPhoto.url}
                  alt={`Presensi ${previewPhoto.jobNumber}`}
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="p-3 rounded-xl bg-muted/40 border border-border text-xs flex items-center justify-between">
                <div>
                  <span className="text-muted-foreground block text-[11px]">Teknisi Bertugas:</span>
                  <span className="font-semibold text-foreground text-xs">{previewPhoto.techName}</span>
                </div>
                <div className="text-right">
                  <span className="text-muted-foreground block text-[11px]">Waktu Presensi:</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400 font-mono text-xs">
                    {previewPhoto.time || 'Tercatat'}
                  </span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={() => setPreviewPhoto(null)}
                className="w-full h-9 text-xs font-medium rounded-lg"
              >
                Tutup
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
