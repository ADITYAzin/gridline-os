import Link from 'next/link'
import { requireRole } from '@/lib/auth'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { JobStatusChart } from '@/components/charts/job-status-chart'
import { ServiceTypeChart } from '@/components/charts/service-type-chart'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Building2,
  Briefcase,
  Users,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Sparkles,
  Plus,
} from 'lucide-react'

export default async function AdminDashboardPage() {
  const profile = await requireRole('admin')
  const supabase = await createSupabaseServerClient()

  // Fetch metrics and job distribution for this organization
  const [
    { data: allJobs },
    { count: totalCustomers },
    { count: totalTechs },
  ] = await Promise.all([
    supabase
      .from('jobs')
      .select('status, service_type')
      .eq('org_id', profile.orgId),
    supabase.from('customers').select('*', { count: 'exact', head: true }).eq('org_id', profile.orgId),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('org_id', profile.orgId).eq('role', 'technician'),
  ])

  const jobs = allJobs || []
  const totalJobs = jobs.length
  const activeJobs = jobs.filter((j) => ['pending', 'assigned', 'on_progress'].includes(j.status)).length
  const completedJobs = jobs.filter((j) => j.status === 'completed').length

  const isFirstRun = totalJobs === 0 && (totalCustomers || 0) === 0

  // Calculate Chart Data
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
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Operasional</h1>
          <p className="text-muted-foreground mt-1">
            Selamat datang kembali, <span className="font-semibold text-foreground">{profile.name}</span>. Pantau dan kelola seluruh penugasan teknisi.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button asChild variant="outline" className="gap-2">
            <Link href="/admin/technicians">
              <Users className="h-4 w-4" />
              Undang Teknisi
            </Link>
          </Button>
          <Button asChild className="gap-2 font-semibold">
            <Link href="/admin/jobs/new">
              <Plus className="h-4 w-4" />
              Buat Job
            </Link>
          </Button>
        </div>
      </div>

      {/* First-Run Onboarding State (Appendix v1.1 §7) */}
      {isFirstRun && (
        <Card className="border-primary/30 bg-primary/5 shadow-md">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2 text-primary font-semibold text-base">
              <Sparkles className="h-5 w-5" />
              Perusahaan kamu sudah siap digunakan!
            </div>
            <CardDescription className="text-sm">
              Selesaikan 3 langkah mudah berikut untuk memulai alur operasional teknisi pertama Anda:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="bg-card/80 border-border/60">
                <CardHeader className="p-4 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-primary/10 text-primary">Langkah 1</span>
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <CardTitle className="text-base font-semibold pt-1">Buat Data Customer</CardTitle>
                  <CardDescription className="text-xs">
                    Simpan nama klien, alamat lokasi servis, dan nomor kontak.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <Button asChild variant="secondary" size="sm" className="w-full gap-1">
                    <Link href="/admin/customers">
                      Mulai Tambah <ArrowUpRight className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-card/80 border-border/60">
                <CardHeader className="p-4 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-primary/10 text-primary">Langkah 2</span>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <CardTitle className="text-base font-semibold pt-1">Undang Teknisi</CardTitle>
                  <CardDescription className="text-xs">
                    Kirim link aktivasi via email agar teknisi dapat login di lapangan.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <Button asChild variant="secondary" size="sm" className="w-full gap-1">
                    <Link href="/admin/technicians">
                      Undang Anggota <ArrowUpRight className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-card/80 border-border/60">
                <CardHeader className="p-4 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-primary/10 text-primary">Langkah 3</span>
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <CardTitle className="text-base font-semibold pt-1">Buat Job / Tiket Pertama</CardTitle>
                  <CardDescription className="text-xs">
                    Jadwalkan pekerjaan servis dan delegasikan ke teknisi yang tersedia.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <Button asChild variant="default" size="sm" className="w-full gap-1">
                    <Link href="/admin/jobs/new">
                      Buat Job Sekarang <ArrowUpRight className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      )}

      {/* KPI Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Job Aktif</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeJobs}</div>
            <p className="text-xs text-muted-foreground mt-1">Pending, assigned & progress</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Job Selesai</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedJobs}</div>
            <p className="text-xs text-muted-foreground mt-1">Laporan & bukti terverifikasi</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Teknisi</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTechs || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Teknisi aktif di lapangan</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customer</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCustomers || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Klien terdaftar dalam sistem</p>
          </CardContent>
        </Card>
      </div>

      {/* Visual Analytics Charts (PRD §11.18 & §11.19) */}
      <div className="grid gap-6 md:grid-cols-2">
        <JobStatusChart data={statusData} />
        <ServiceTypeChart data={serviceData} />
      </div>
    </div>
  )
}
