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
} from 'lucide-react'

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
    { name: 'Pending', value: jobs.filter((j) => j.status === 'pending').length, color: '#94a3b8' },
    { name: 'Assigned', value: jobs.filter((j) => j.status === 'assigned').length, color: '#f59e0b' },
    { name: 'On Progress', value: jobs.filter((j) => j.status === 'on_progress').length, color: '#3b82f6' },
    { name: 'Completed', value: jobs.filter((j) => j.status === 'completed').length, color: '#10b981' },
    { name: 'Cancelled', value: jobs.filter((j) => j.status === 'cancelled').length, color: '#ef4444' },
  ]

  const serviceCounts: Record<string, number> = {}
  jobs.forEach((j) => {
    serviceCounts[j.service_type] = (serviceCounts[j.service_type] || 0) + 1
  })

  const serviceData = Object.entries(serviceCounts)
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Executive Visibility Hub</h1>
        <p className="text-muted-foreground mt-1">
          Pantauan terpusat operasional lapangan untuk Owner & Management.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pekerjaan Sedang Berjalan</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeJobs}</div>
            <p className="text-xs text-muted-foreground mt-1">Dalam pengerjaan di lapangan</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Terselesaikan</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedJobs}</div>
            <p className="text-xs text-muted-foreground mt-1">Laporan & bukti valid</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pekerjaan</CardTitle>
            <Briefcase className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalJobs}</div>
            <p className="text-xs text-muted-foreground mt-1">Akumulasi siklus job</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kekuatan Teknisi</CardTitle>
            <Users className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTechs || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">SDM teknis terdaftar</p>
          </CardContent>
        </Card>
      </div>

      {/* Visual Analytics */}
      <div className="grid gap-6 md:grid-cols-2">
        <JobStatusChart data={statusData} />
        <ServiceTypeChart data={serviceData} />
      </div>
    </div>
  )
}
