import Link from 'next/link'
import { requireRole } from '@/lib/auth'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { Card, CardDescription, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ExportJobsButton } from '@/components/jobs/export-jobs-button'
import { SlaBadge } from '@/components/jobs/sla-badge'
import { RealtimeJobsListener } from '@/components/realtime/realtime-jobs-listener'
import { Plus, Briefcase, User, MapPin, Eye, Printer } from 'lucide-react'

interface PageProps {
  searchParams: Promise<{ status?: string }>
}

export default async function JobsListPage({ searchParams }: PageProps) {
  const profile = await requireRole('admin')
  const { status: activeStatus } = await searchParams
  const supabase = await createSupabaseServerClient()

  let query = supabase
    .from('jobs')
    .select(`
      id,
      job_number,
      service_type,
      issue,
      priority,
      status,
      address,
      created_at,
      completed_at,
      customers(id, name, phone),
      profiles!jobs_technician_id_fkey(name),
      schedules(start_at, end_at)
    `)
    .eq('org_id', profile.orgId)
    .order('created_at', { ascending: false })

  if (activeStatus && activeStatus !== 'all') {
    query = query.eq('status', activeStatus as 'pending' | 'assigned' | 'on_progress' | 'completed' | 'cancelled')
  }

  const { data: jobs } = await query
  const jobList = jobs || []

  const tabs = [
    { label: 'Semua', value: 'all' },
    { label: 'Pending', value: 'pending' },
    { label: 'Assigned', value: 'assigned' },
    { label: 'On Progress', value: 'on_progress' },
    { label: 'Completed', value: 'completed' },
    { label: 'Cancelled', value: 'cancelled' },
  ]

  const currentTab = activeStatus || 'all'

  // Prepare export data
  const exportData = jobList.map((j) => {
    type CustType = { id: string; name: string; phone?: string | null }
    const cust = (Array.isArray(j.customers) ? j.customers[0] : j.customers) as CustType | null
    type TechType = { name: string }
    const tech = (Array.isArray(j.profiles) ? j.profiles[0] : j.profiles) as TechType | null
    type SchedType = { start_at: string; end_at: string }
    const sched = (Array.isArray(j.schedules) ? j.schedules[0] : j.schedules) as SchedType | null

    return {
      jobNumber: j.job_number,
      createdAt: j.created_at,
      status: j.status,
      priority: j.priority,
      serviceType: j.service_type,
      issue: j.issue,
      customerName: cust?.name || '-',
      customerPhone: cust?.phone || '-',
      address: j.address,
      technicianName: tech?.name || 'Belum Ditugaskan',
      completedAt: j.completed_at,
      scheduledStart: sched?.start_at || null,
      scheduledEnd: sched?.end_at || null,
    }
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Daftar Pekerjaan (Jobs)</h1>
            <RealtimeJobsListener orgId={profile.orgId} />
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Pantau dan kelola seluruh siklus penugasan teknisi dari awal hingga penyelesaian secara live.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ExportJobsButton jobs={exportData} />
          <Button asChild className="gap-2 font-semibold">
            <Link href="/admin/jobs/new">
              <Plus className="h-4 w-4" />
              + Buat Job Baru
            </Link>
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 border-b pb-2 overflow-x-auto">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.value
          const href = tab.value === 'all' ? '/admin/jobs' : `/admin/jobs?status=${tab.value}`
          return (
            <Link
              key={tab.value}
              href={href}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              {tab.label}
            </Link>
          )
        })}
      </div>

      {jobList.length === 0 ? (
        <Card className="text-center p-12 border-dashed">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-muted-foreground mb-3">
            <Briefcase className="h-6 w-6" />
          </div>
          <CardTitle className="text-lg">Tidak Ada Job Pada Kategori Ini</CardTitle>
          <CardDescription className="text-sm max-w-sm mx-auto mt-1 mb-4">
            {currentTab === 'all'
              ? 'Belum ada pekerjaan servis yang dibuat. Buat job pertama Anda sekarang.'
              : `Tidak ada pekerjaan dengan status "${currentTab}".`}
          </CardDescription>
          {currentTab === 'all' && (
            <Button asChild>
              <Link href="/admin/jobs/new">Buat Job Pertama</Link>
            </Button>
          )}
        </Card>
      ) : (
        <Card className="shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[110px]">No. Job</TableHead>
                <TableHead>Customer & Lokasi</TableHead>
                <TableHead>Layanan & Kendala</TableHead>
                <TableHead>Teknisi</TableHead>
                <TableHead>Prioritas</TableHead>
                <TableHead>Status & SLA</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobList.map((j) => {
                type CustType = { id: string; name: string; phone?: string | null }
                const customer = (Array.isArray(j.customers) ? j.customers[0] : j.customers) as CustType | null
                type TechType = { name: string }
                const technician = (Array.isArray(j.profiles) ? j.profiles[0] : j.profiles) as TechType | null
                type SchedType = { start_at: string; end_at: string }
                const sched = (Array.isArray(j.schedules) ? j.schedules[0] : j.schedules) as SchedType | null

                const priorityBadge: 'destructive' | 'default' | 'secondary' =
                  j.priority === 'high'
                    ? 'destructive'
                    : j.priority === 'medium'
                    ? 'default'
                    : 'secondary'

                const statusBadge =
                  j.status === 'completed'
                    ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                    : j.status === 'cancelled'
                    ? 'bg-destructive/10 text-destructive border-destructive/20'
                    : j.status === 'on_progress'
                    ? 'bg-blue-500/10 text-blue-600 border-blue-500/20'
                    : j.status === 'assigned'
                    ? 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                    : 'bg-muted text-muted-foreground'

                return (
                  <TableRow key={j.id}>
                    <TableCell className="font-mono font-bold text-xs text-primary">
                      <Link href={`/admin/jobs/${j.id}`} className="hover:underline">
                        {j.job_number}
                      </Link>
                    </TableCell>
                    <TableCell>
                      {customer?.id ? (
                        <Link
                          href={`/admin/customers/${customer.id}`}
                          className="font-semibold text-sm hover:underline hover:text-primary"
                        >
                          {customer.name}
                        </Link>
                      ) : (
                        <div className="font-semibold text-sm">
                          {customer?.name || 'Customer'}
                        </div>
                      )}
                      <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5 truncate max-w-xs">
                        <MapPin className="h-3 w-3 shrink-0" />
                        <span className="truncate">{j.address}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-sm">{j.service_type}</div>
                      <div className="text-xs text-muted-foreground line-clamp-1 max-w-xs">{j.issue}</div>
                    </TableCell>
                    <TableCell>
                      {technician?.name ? (
                        <div className="flex items-center gap-1.5 text-xs font-medium">
                          <User className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>{technician.name}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">Belum ada</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={priorityBadge} className="capitalize text-[10px] font-semibold">
                        {j.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1 items-start">
                        <Badge variant="outline" className={`capitalize text-[10px] font-semibold ${statusBadge}`}>
                          {j.status.replace('_', ' ')}
                        </Badge>
                        <SlaBadge
                          status={j.status}
                          scheduledEnd={sched?.end_at}
                          completedAt={j.completed_at}
                        />
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {j.status === 'completed' && (
                          <Button asChild variant="outline" size="sm" className="h-8 px-2 text-xs gap-1">
                            <Link href={`/admin/jobs/${j.id}/bap`} target="_blank">
                              <Printer className="h-3.5 w-3.5" />
                              BAP
                            </Link>
                          </Button>
                        )}
                        <Button asChild variant="outline" size="sm" className="h-8 w-8 p-0">
                          <Link href={`/admin/jobs/${j.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  )
}
