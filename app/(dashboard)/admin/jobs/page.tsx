import Link from 'next/link'
import { requireRole } from '@/lib/auth'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { Card, CardDescription, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, Briefcase, User, MapPin, Eye } from 'lucide-react'

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
      customers(name),
      profiles!jobs_technician_id_fkey(name)
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Daftar Pekerjaan (Jobs)</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Pantau dan kelola seluruh siklus penugasan teknisi dari awal hingga penyelesaian.
          </p>
        </div>
        <Button asChild className="gap-2 font-semibold">
          <Link href="/admin/jobs/new">
            <Plus className="h-4 w-4" />
            + Buat Job Baru
          </Link>
        </Button>
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
              : `Belum ada pekerjaan dengan status ${currentTab}.`}
          </CardDescription>
          <Button asChild>
            <Link href="/admin/jobs/new">Buat Job Baru</Link>
          </Button>
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
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobList.map((j) => {
                type RelItem = { name: string } | { name: string }[] | null
                const customer = j.customers as unknown as RelItem
                const technician = j.profiles as unknown as RelItem

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
                      {j.job_number}
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold text-sm">
                        {Array.isArray(customer) ? customer[0]?.name : customer?.name || 'Customer'}
                      </div>
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
                      {Array.isArray(technician) ? (
                        <div className="flex items-center gap-1.5 text-xs font-medium">
                          <User className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>{technician[0]?.name}</span>
                        </div>
                      ) : technician?.name ? (
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
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusBadge}`}>
                        {j.status.replace('_', ' ')}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="ghost" size="sm" className="h-8 gap-1">
                        <Link href={`/admin/jobs/${j.id}`}>
                          <Eye className="h-3.5 w-3.5" />
                          Detail
                        </Link>
                      </Button>
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
