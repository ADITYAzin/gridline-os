import Link from 'next/link'
import { format } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'
import { requireRole } from '@/lib/auth'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { JobStatusChart } from '@/components/charts/job-status-chart'
import { ServiceTypeChart } from '@/components/charts/service-type-chart'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RealtimeJobsListener } from '@/components/realtime/realtime-jobs-listener'
import {
  Building2,
  Briefcase,
  Users,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ArrowRight,
  Sparkles,
  Plus,
  Navigation,
  Wrench,
  CalendarDays,
  MapPin,
  AlertCircle,
  ChevronRight,
  UserCheck,
  UserX,
} from 'lucide-react'

// Status configuration following Opilines Design System (Section 5.2)
const STATUS_CONFIG: Record<
  string,
  { label: string; bgClass: string; textClass: string; dotClass: string }
> = {
  pending: {
    label: 'Menunggu',
    bgClass: 'bg-amber-50 border-amber-200/80',
    textClass: 'text-amber-800',
    dotClass: 'bg-amber-500',
  },
  assigned: {
    label: 'Ditugaskan',
    bgClass: 'bg-blue-50 border-blue-200/80',
    textClass: 'text-blue-800',
    dotClass: 'bg-[#007ACC]',
  },
  on_progress: {
    label: 'Dikerjakan',
    bgClass: 'bg-sky-50 border-sky-200/80',
    textClass: 'text-sky-800',
    dotClass: 'bg-sky-500',
  },
  completed: {
    label: 'Selesai',
    bgClass: 'bg-emerald-50 border-emerald-200/80',
    textClass: 'text-emerald-800',
    dotClass: 'bg-emerald-500',
  },
  cancelled: {
    label: 'Dibatalkan',
    bgClass: 'bg-rose-50 border-rose-200/80',
    textClass: 'text-rose-800',
    dotClass: 'bg-rose-500',
  },
}

// Priority configuration
const PRIORITY_CONFIG: Record<
  string,
  { label: string; className: string }
> = {
  urgent: {
    label: 'Mendesak',
    className: 'bg-rose-50 text-rose-700 border-rose-200/70',
  },
  high: {
    label: 'Tinggi',
    className: 'bg-orange-50 text-orange-700 border-orange-200/70',
  },
  medium: {
    label: 'Normal',
    className: 'bg-slate-100 text-slate-700 border-slate-200',
  },
  low: {
    label: 'Rendah',
    className: 'bg-slate-50 text-slate-600 border-slate-200/60',
  },
}

export default async function AdminDashboardPage() {
  const profile = await requireRole('admin')
  const supabase = await createSupabaseServerClient()

  // Fetch metrics and recent jobs in parallel
  const [
    { data: allJobs },
    { count: totalCustomers },
    { count: totalTechs },
    { data: recentJobsRaw },
  ] = await Promise.all([
    supabase
      .from('jobs')
      .select('status, service_type')
      .eq('org_id', profile.orgId),
    supabase.from('customers').select('*', { count: 'exact', head: true }).eq('org_id', profile.orgId),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('org_id', profile.orgId).eq('role', 'technician'),
    supabase
      .from('jobs')
      .select(`
        id,
        job_number,
        service_type,
        priority,
        status,
        address,
        created_at,
        customers (
          name,
          phone
        ),
        profiles:technician_id (
          name
        )
      `)
      .eq('org_id', profile.orgId)
      .neq('status', 'cancelled')
      .order('created_at', { ascending: false })
      .limit(6),
  ])

  const jobs = allJobs || []
  const totalJobs = jobs.length
  const pendingJobs = jobs.filter((j) => j.status === 'pending').length
  const assignedJobs = jobs.filter((j) => j.status === 'assigned').length
  const onProgressJobs = jobs.filter((j) => j.status === 'on_progress').length
  const completedJobs = jobs.filter((j) => j.status === 'completed').length

  const isFirstRun = totalJobs === 0 && (totalCustomers || 0) === 0

  // Chart data with Indonesian labels
  const statusData = [
    { name: 'Menunggu Teknisi', value: pendingJobs, color: '#F59E0B' },
    { name: 'Ditugaskan', value: assignedJobs, color: '#007ACC' },
    { name: 'Sedang Dikerjakan', value: onProgressJobs, color: '#0EA5E9' },
    { name: 'Selesai', value: completedJobs, color: '#10B981' },
    { name: 'Dibatalkan', value: jobs.filter((j) => j.status === 'cancelled').length, color: '#EF4444' },
  ]

  const serviceCounts: Record<string, number> = {}
  jobs.forEach((j) => {
    serviceCounts[j.service_type] = (serviceCounts[j.service_type] || 0) + 1
  })

  const serviceData = Object.entries(serviceCounts)
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  const recentJobs = recentJobsRaw || []

  const todayFormatted = format(new Date(), 'EEEE, d MMMM yyyy', { locale: idLocale })

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-1">
            <span>{todayFormatted}</span>
            <span>•</span>
            <span className="font-semibold text-slate-700">Pusat Kendali Operasional</span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-heading">
              Dashboard Operasional
            </h1>
            <RealtimeJobsListener orgId={profile.orgId} />
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Pantau pergerakan teknisi, alokasi tiket baru, dan efisiensi penyelesaian pekerjaan lapangan.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="h-9 px-3.5 text-xs font-medium gap-1.5 rounded-lg border-border hover:bg-slate-50 text-slate-700"
          >
            <Link href="/admin/technicians">
              <Users className="h-3.5 w-3.5 text-slate-500" />
              <span>Undang Teknisi</span>
            </Link>
          </Button>
          <Button
            asChild
            size="sm"
            className="h-9 px-3.5 text-xs gap-1.5 rounded-lg bg-[#007ACC] hover:bg-[#0062A3] text-white font-medium shadow-elevation-1 transition-all"
          >
            <Link href="/admin/jobs/new">
              <Plus className="h-3.5 w-3.5" />
              <span>Buat Tiket Baru</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* First-Run Onboarding State */}
      {isFirstRun && (
        <Card className="border-blue-200 bg-blue-50/40 shadow-elevation-1 rounded-xl">
          <CardHeader className="p-5 pb-3">
            <div className="flex items-center gap-2 text-[#007ACC] font-semibold text-sm">
              <Sparkles className="h-4 w-4" />
              Selamat Datang di Opilines — Langkah Awal Memulai
            </div>
            <CardDescription className="text-xs text-slate-600">
              Selesaikan 3 langkah mudah berikut untuk mulai menjalankan penugasan lapangan secara teratur:
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 pt-1">
            <div className="grid md:grid-cols-3 gap-3.5">
              <div className="p-4 rounded-xl border border-border/80 bg-white space-y-3 shadow-elevation-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-50 text-[#007ACC]">Langkah 1</span>
                  <Building2 className="h-4 w-4 text-slate-400" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-900">Tambah Pelanggan</h4>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                    Daftarkan nama klien, nomor WhatsApp, dan koordinat lokasi servis.
                  </p>
                </div>
                <Button asChild variant="outline" size="sm" className="w-full h-8 text-xs gap-1.5">
                  <Link href="/admin/customers">
                    Input Pelanggan <ArrowUpRight className="h-3 w-3" />
                  </Link>
                </Button>
              </div>

              <div className="p-4 rounded-xl border border-border/80 bg-white space-y-3 shadow-elevation-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-50 text-[#007ACC]">Langkah 2</span>
                  <Users className="h-4 w-4 text-slate-400" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-900">Undang Teknisi</h4>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                    Kirim link aktivasi login untuk aplikasi mobile teknisi di lapangan.
                  </p>
                </div>
                <Button asChild variant="outline" size="sm" className="w-full h-8 text-xs gap-1.5">
                  <Link href="/admin/technicians">
                    Undang Teknisi <ArrowUpRight className="h-3 w-3" />
                  </Link>
                </Button>
              </div>

              <div className="p-4 rounded-xl border border-blue-200 bg-white space-y-3 shadow-elevation-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-[#007ACC] text-white">Langkah 3</span>
                  <Briefcase className="h-4 w-4 text-[#007ACC]" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-900">Buat Tiket Perdana</h4>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                    Jadwalkan pekerjaan servis dan delegasikan ke teknisi yang siap kerja.
                  </p>
                </div>
                <Button asChild size="sm" className="w-full h-8 text-xs gap-1.5 bg-[#007ACC] hover:bg-[#0062A3] text-white">
                  <Link href="/admin/jobs/new">
                    Buat Tiket Sekarang <ArrowUpRight className="h-3 w-3" />
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Primary Operational KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Perlu Ditugaskan (Action Needed) */}
        <Link
          href="/admin/jobs?status=pending"
          className={`p-4 rounded-xl border transition-all duration-200 group ${
            pendingJobs > 0
              ? 'bg-amber-50/40 border-amber-300 hover:border-amber-400 shadow-elevation-1 hover:shadow-elevation-2'
              : 'bg-white border-border/80 hover:border-slate-300 shadow-elevation-1 hover:shadow-elevation-2'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-600">Perlu Ditugaskan</span>
            <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
              pendingJobs > 0 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'
            }`}>
              <AlertCircle className={`h-4 w-4 ${pendingJobs > 0 ? 'animate-pulse text-amber-600' : ''}`} />
            </div>
          </div>
          <div className="text-3xl font-bold font-heading text-slate-900 mt-2 tracking-tight">
            {pendingJobs}
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
            <p className="text-[11px] text-slate-500 truncate">
              {pendingJobs > 0 ? 'Segera pilih teknisi' : 'Tiket telah teralokasi'}
            </p>
            <ChevronRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-slate-700 group-hover:translate-x-0.5 transition-all" />
          </div>
        </Link>

        {/* Card 2: Menuju Lokasi */}
        <Link
          href="/admin/jobs?status=assigned"
          className="p-4 rounded-xl border bg-white border-border/80 hover:border-slate-300 shadow-elevation-1 hover:shadow-elevation-2 transition-all duration-200 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-600">Menuju Lokasi</span>
            <div className="h-8 w-8 rounded-lg bg-blue-50 text-[#007ACC] flex items-center justify-center">
              <Navigation className="h-4 w-4" />
            </div>
          </div>
          <div className="text-3xl font-bold font-heading text-slate-900 mt-2 tracking-tight">
            {assignedJobs}
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
            <p className="text-[11px] text-slate-500 truncate">Teknisi telah dijadwalkan</p>
            <ChevronRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-slate-700 group-hover:translate-x-0.5 transition-all" />
          </div>
        </Link>

        {/* Card 3: Sedang Dikerjakan */}
        <Link
          href="/admin/jobs?status=on_progress"
          className="p-4 rounded-xl border bg-white border-border/80 hover:border-slate-300 shadow-elevation-1 hover:shadow-elevation-2 transition-all duration-200 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-600">Sedang Dikerjakan</span>
            <div className="h-8 w-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
              <Wrench className="h-4 w-4" />
            </div>
          </div>
          <div className="text-3xl font-bold font-heading text-slate-900 mt-2 tracking-tight">
            {onProgressJobs}
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
            <p className="text-[11px] text-slate-500 truncate">Aktif di lokasi servis</p>
            <ChevronRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-slate-700 group-hover:translate-x-0.5 transition-all" />
          </div>
        </Link>

        {/* Card 4: Selesai */}
        <Link
          href="/admin/jobs?status=completed"
          className="p-4 rounded-xl border bg-white border-border/80 hover:border-slate-300 shadow-elevation-1 hover:shadow-elevation-2 transition-all duration-200 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-600">Tiket Selesai</span>
            <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="text-3xl font-bold font-heading text-slate-900 mt-2 tracking-tight">
            {completedJobs}
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
            <p className="text-[11px] text-slate-500 truncate">Pekerjaan & BAP tuntas</p>
            <ChevronRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-slate-700 group-hover:translate-x-0.5 transition-all" />
          </div>
        </Link>
      </div>

      {/* Secondary Resource Summary Ribbon */}
      <div className="p-3 px-4 rounded-xl border border-border/80 bg-white shadow-elevation-1 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-slate-600">
          <Link
            href="/admin/technicians"
            className="flex items-center gap-2 hover:text-[#007ACC] transition-colors"
          >
            <div className="h-6 w-6 rounded-md bg-blue-50 text-[#007ACC] flex items-center justify-center">
              <Users className="h-3.5 w-3.5" />
            </div>
            <span>
              Teknisi Siaga: <strong className="text-slate-900 font-semibold">{totalTechs || 0}</strong> personil
            </span>
          </Link>

          <span className="hidden sm:inline text-slate-300">|</span>

          <Link
            href="/admin/customers"
            className="flex items-center gap-2 hover:text-[#007ACC] transition-colors"
          >
            <div className="h-6 w-6 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Building2 className="h-3.5 w-3.5" />
            </div>
            <span>
              Pelanggan Terdaftar: <strong className="text-slate-900 font-semibold">{totalCustomers || 0}</strong> klien
            </span>
          </Link>

          <span className="hidden sm:inline text-slate-300">|</span>

          <Link
            href="/admin/jobs"
            className="flex items-center gap-2 hover:text-[#007ACC] transition-colors"
          >
            <div className="h-6 w-6 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center">
              <Briefcase className="h-3.5 w-3.5" />
            </div>
            <span>
              Total Siklus Tiket: <strong className="text-slate-900 font-semibold">{totalJobs}</strong>
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="h-7 px-2.5 text-xs gap-1.5 text-[#007ACC] hover:text-[#0062A3] hover:bg-blue-50 font-medium"
          >
            <Link href="/admin/map">
              <MapPin className="h-3.5 w-3.5" />
              <span>Pantau Peta Lapangan</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Main Operational Section: Recent Jobs & Operational Hub */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left Column: Recent Jobs Table */}
        <div className="lg:col-span-8 rounded-xl border border-border/80 bg-white shadow-elevation-1 overflow-hidden flex flex-col h-full">
          <div className="p-4 px-5 border-b border-border/70 flex items-center justify-between bg-slate-50/50">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold font-heading text-slate-900">
                  Tiket Pekerjaan Terbaru
                </h2>
                <Badge variant="secondary" className="text-[10px] font-semibold h-5 px-1.5 bg-slate-100 text-slate-600">
                  {recentJobs.length} Tiket
                </Badge>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Daftar tiket aktif yang membutuhkan pengawasan, jadwal, atau konfirmasi penugasan.
              </p>
            </div>
            <Link
              href="/admin/jobs"
              className="text-xs font-medium text-[#007ACC] hover:text-[#0062A3] flex items-center gap-1 hover:underline"
            >
              <span>Semua Tiket</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="divide-y divide-border/60 flex-1">
            {recentJobs.length === 0 ? (
              <div className="p-12 text-center flex flex-col items-center justify-center flex-1">
                <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                  <Briefcase className="h-5 w-5" />
                </div>
                <p className="text-xs font-medium text-slate-700">Belum ada tiket pekerjaan aktif</p>
                <p className="text-[11px] text-slate-400 mt-1 max-w-xs">
                  Semua tiket telah terselesaikan atau Anda belum membuat tiket pekerjaan baru.
                </p>
                <Button asChild size="sm" className="mt-4 h-8 text-xs bg-[#007ACC] hover:bg-[#0062A3]">
                  <Link href="/admin/jobs/new">Buat Tiket Perdana</Link>
                </Button>
              </div>
            ) : (
              recentJobs.map((job: any) => {
                const customer = Array.isArray(job.customers) ? job.customers[0] : job.customers
                const tech = Array.isArray(job.profiles) ? job.profiles[0] : job.profiles
                const statusCfg = STATUS_CONFIG[job.status] || {
                  label: job.status,
                  bgClass: 'bg-slate-50 border-slate-200',
                  textClass: 'text-slate-700',
                  dotClass: 'bg-slate-400',
                }
                const priorityCfg = PRIORITY_CONFIG[job.priority] || {
                  label: job.priority,
                  className: 'bg-slate-50 text-slate-600 border-slate-200',
                }

                const createdAtDate = job.created_at ? new Date(job.created_at) : null
                const formattedTime = createdAtDate
                  ? format(createdAtDate, 'd MMM, HH:mm', { locale: idLocale })
                  : null

                return (
                  <div
                    key={job.id}
                    className="p-4 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1.5 min-w-0 flex-1">
                      {/* Top Badges Bar */}
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={`/admin/jobs/${job.id}`}
                          className="font-mono text-xs font-bold text-[#007ACC] hover:underline"
                        >
                          {job.job_number}
                        </Link>

                        {/* Status Badge with Dot Indicator */}
                        <span
                          className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-md border ${statusCfg.bgClass} ${statusCfg.textClass}`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${statusCfg.dotClass}`} />
                          {statusCfg.label}
                        </span>

                        {/* Priority Badge */}
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${priorityCfg.className}`}
                        >
                          {priorityCfg.label}
                        </span>

                        {formattedTime && (
                          <span className="text-[11px] text-slate-400 ml-auto hidden sm:inline-block">
                            {formattedTime}
                          </span>
                        )}
                      </div>

                      {/* Service Type */}
                      <div className="text-xs font-semibold text-slate-900 truncate">
                        {job.service_type}
                      </div>

                      {/* Customer & Address Metadata with Lucide Icons */}
                      <div className="text-[11.5px] text-slate-500 flex flex-wrap items-center gap-3">
                        <span className="flex items-center gap-1.5 truncate max-w-[200px]">
                          <Building2 className="h-3 w-3 text-slate-400 shrink-0" />
                          <span className="truncate">{customer?.name || 'Pelanggan'}</span>
                        </span>
                        {job.address && (
                          <span className="flex items-center gap-1.5 truncate max-w-[260px] text-slate-400">
                            <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                            <span className="truncate">{job.address}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Right Side: Assigned Technician & Action */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      {tech?.name ? (
                        <div className="flex items-center gap-1.5 text-xs text-slate-700 bg-slate-50 px-2 py-1 rounded-md border border-slate-200/60">
                          <UserCheck className="h-3.5 w-3.5 text-emerald-600" />
                          <span className="font-medium truncate max-w-[120px]">{tech.name}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
                          <UserX className="h-3 w-3 text-amber-500" />
                          <span>Belum Ditugaskan</span>
                        </div>
                      )}

                      <Link
                        href={`/admin/jobs/${job.id}`}
                        className="text-xs font-medium text-[#007ACC] hover:text-[#0062A3] flex items-center gap-0.5 group"
                      >
                        <span>Buka Tiket</span>
                        <ChevronRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                      </Link>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Right Column: Aksi Cepat Dispatcher (Tinggi sejajar dengan Tiket Pekerjaan Terbaru) */}
        <div className="lg:col-span-4 flex flex-col h-full">
          <div className="h-full rounded-xl border border-border/80 bg-white shadow-elevation-1 overflow-hidden flex flex-col">
            <div className="p-4 px-5 border-b border-border/70 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-sm font-semibold font-heading text-slate-900">
                  Aksi Cepat Dispatcher
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Akses instan modul kerja operasional harian.
                </p>
              </div>
            </div>

            <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between gap-3">
              <Link
                href="/admin/jobs/new"
                className="p-3.5 rounded-lg border border-border/70 hover:border-blue-200 hover:bg-blue-50/40 transition-all flex items-center justify-between group block"
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-blue-50 text-[#007ACC] flex items-center justify-center shrink-0">
                    <Plus className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-900 group-hover:text-[#007ACC] transition-colors">
                      Buat Tiket Baru
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Entri jadwal order servis klien
                    </div>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-[#007ACC] group-hover:translate-x-0.5 transition-all" />
              </Link>

              <Link
                href="/admin/dispatch"
                className="p-3.5 rounded-lg border border-border/70 hover:border-blue-200 hover:bg-blue-50/40 transition-all flex items-center justify-between group block"
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                    <CalendarDays className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-900 group-hover:text-[#007ACC] transition-colors">
                      Jadwal & Dispatch
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Alokasi kalender teknisi tim
                    </div>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-[#007ACC] group-hover:translate-x-0.5 transition-all" />
              </Link>

              <Link
                href="/admin/map"
                className="p-3.5 rounded-lg border border-border/70 hover:border-emerald-200 hover:bg-emerald-50/40 transition-all flex items-center justify-between group block"
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <MapPin className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors">
                      Peta Live Lapangan
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Pantau kehadiran & lokasi teknisi
                    </div>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-emerald-700 group-hover:translate-x-0.5 transition-all" />
              </Link>

              <Link
                href="/admin/technicians"
                className="p-3.5 rounded-lg border border-border/70 hover:border-purple-200 hover:bg-purple-50/40 transition-all flex items-center justify-between group block"
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                    <Users className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-900 group-hover:text-purple-700 transition-colors">
                      Kelola Teknisi
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Atur personil, izin & skema komisi
                    </div>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-purple-700 group-hover:translate-x-0.5 transition-all" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Analytics Charts */}
      <div className="grid gap-5 md:grid-cols-2">
        <JobStatusChart data={statusData} />
        <ServiceTypeChart data={serviceData} />
      </div>
    </div>
  )
}
