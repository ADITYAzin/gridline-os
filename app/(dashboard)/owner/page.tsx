import { requireRole } from '@/lib/auth'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { JobStatusChart } from '@/components/charts/job-status-chart'
import { ServiceTypeChart } from '@/components/charts/service-type-chart'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Briefcase,
  CheckCircle2,
  Clock,
  Users,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react'
import { format } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'

export default async function OwnerDashboardPage() {
  const profile = await requireRole('owner')
  const supabase = await createSupabaseServerClient()

  // Fetch executive metrics for this organization
  const [
    { data: allJobs },
    { count: totalTechs },
  ] = await Promise.all([
    supabase
      .from('jobs')
      .select('status, service_type')
      .eq('org_id', profile.orgId),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('org_id', profile.orgId).eq('role', 'technician'),
  ])

  const jobs = allJobs || []
  const totalJobs = jobs.length
  const activeJobs = jobs.filter((j) => ['pending', 'assigned', 'on_progress'].includes(j.status)).length
  const completedJobs = jobs.filter((j) => j.status === 'completed').length

  const statusData = [
    { name: 'Menunggu', value: jobs.filter((j) => j.status === 'pending').length, color: '#F59E0B' },
    { name: 'Ditugaskan', value: jobs.filter((j) => j.status === 'assigned').length, color: '#007ACC' },
    { name: 'Dikerjakan', value: jobs.filter((j) => j.status === 'on_progress').length, color: '#0EA5E9' },
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

  const todayFormatted = format(new Date(), 'EEEE, d MMMM yyyy', { locale: idLocale })

  return (
    <div className="space-y-6">
      {/* Executive Header */}
      <div className="pb-3 border-b border-border/60">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-1">
          <span>{todayFormatted}</span>
          <span>•</span>
          <span className="font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5" /> Owner & Management Portal
          </span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-heading">
          Executive Visibility Hub
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Ringkasan performa operasional lapangan, utilisasi teknisi, dan pemenuhan servis klien.
        </p>
      </div>

      {/* KPI Overview Grid */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Active Jobs */}
        <div className="p-4 rounded-xl border border-border/80 bg-white shadow-elevation-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-600">Pekerjaan Berjalan</span>
            <div className="h-8 w-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="text-3xl font-bold font-heading text-slate-900 mt-2 tracking-tight">
            {activeJobs}
          </div>
          <p className="text-[11px] text-slate-500 mt-1.5 pt-2 border-t border-slate-100">
            Dalam penanganan di lapangan
          </p>
        </div>

        {/* Card 2: Completed Jobs */}
        <div className="p-4 rounded-xl border border-border/80 bg-white shadow-elevation-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-600">Terselesaikan</span>
            <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="text-3xl font-bold font-heading text-slate-900 mt-2 tracking-tight">
            {completedJobs}
          </div>
          <p className="text-[11px] text-slate-500 mt-1.5 pt-2 border-t border-slate-100">
            Laporan & bukti servis valid
          </p>
        </div>

        {/* Card 3: Total Jobs */}
        <div className="p-4 rounded-xl border border-border/80 bg-white shadow-elevation-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-600">Total Tiket</span>
            <div className="h-8 w-8 rounded-lg bg-blue-50 text-[#007ACC] flex items-center justify-center">
              <Briefcase className="h-4 w-4" />
            </div>
          </div>
          <div className="text-3xl font-bold font-heading text-slate-900 mt-2 tracking-tight">
            {totalJobs}
          </div>
          <p className="text-[11px] text-slate-500 mt-1.5 pt-2 border-t border-slate-100">
            Akumulasi seluruh siklus order
          </p>
        </div>

        {/* Card 4: Technicians Strength */}
        <div className="p-4 rounded-xl border border-border/80 bg-white shadow-elevation-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-600">Kekuatan Teknisi</span>
            <div className="h-8 w-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="text-3xl font-bold font-heading text-slate-900 mt-2 tracking-tight">
            {totalTechs || 0}
          </div>
          <p className="text-[11px] text-slate-500 mt-1.5 pt-2 border-t border-slate-100">
            Tenaga lapangan terdaftar
          </p>
        </div>
      </div>

      {/* Visual Analytics */}
      <div className="grid gap-5 md:grid-cols-2">
        <JobStatusChart data={statusData} />
        <ServiceTypeChart data={serviceData} />
      </div>
    </div>
  )
}
