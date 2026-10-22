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
import { Plus, Briefcase, User, MapPin, Eye, Printer, Calendar, Clock } from 'lucide-react'

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
    { label: 'Menunggu', value: 'pending' },
    { label: 'Ditugaskan', value: 'assigned' },
    { label: 'Dikerjakan', value: 'on_progress' },
    { label: 'Selesai', value: 'completed' },
    { label: 'Dibatalkan', value: 'cancelled' },
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
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-heading">Tiket Kerja</h1>
            <RealtimeJobsListener orgId={profile.orgId} />
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Kelola status tiket, jadwal pengerjaan, dan penugasan teknisi secara realtime.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ExportJobsButton jobs={exportData} />
          <Button asChild className="gap-2 font-medium bg-[#007ACC] hover:bg-primary hover:text-white rounded-[8px] h-8 text-xs shadow-[0_1px_2px_0_rgba(0,122,204,0.15)]">
            <Link href="/admin/jobs/new">
              <Plus className="h-4 w-4" />
              Buat Tiket Baru
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
              className={`inline-flex items-center justify-center h-8 rounded-md px-3 text-xs font-semibold whitespace-nowrap transition-colors ${
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
          <CardTitle className="text-lg">Tidak Ada Tiket</CardTitle>
          <CardDescription className="text-sm max-w-sm mx-auto mt-1 mb-4">
            {currentTab === 'all'
              ? 'Belum ada tiket pekerjaan yang dibuat. Buat tiket pertama sekarang.'
              : `Tidak ada tiket dengan status ini.`}
          </CardDescription>
          {currentTab === 'all' && (
            <Button asChild>
              <Link href="/admin/jobs/new">Buat Tiket Pertama</Link>
            </Button>
          )}
        </Card>
      ) : (
        <div className="rounded-[12px] bg-[#FFFFFF] border border-[#E2E8F0] shadow-[0_1px_3px_0_rgba(15,23,42,0.03),0_1px_2px_0_rgba(15,23,42,0.02)] overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-[#E2E8F0] bg-[#F8FAFC] hover:bg-[#F8FAFC]">
                  <TableHead className="h-11 px-4 text-[12px] font-semibold text-[#475569] uppercase tracking-[0.02em] w-[110px]">
                    No. Tiket
                  </TableHead>
                  <TableHead className="h-11 px-4 text-[12px] font-semibold text-[#475569] uppercase tracking-[0.02em]">
                    Pelanggan & Lokasi
                  </TableHead>
                  <TableHead className="h-11 px-4 text-[12px] font-semibold text-[#475569] uppercase tracking-[0.02em]">
                    Layanan & Masalah
                  </TableHead>
                  <TableHead className="h-11 px-4 text-[12px] font-semibold text-[#475569] uppercase tracking-[0.02em]">
                    Jadwal
                  </TableHead>
                  <TableHead className="h-11 px-4 text-[12px] font-semibold text-[#475569] uppercase tracking-[0.02em]">
                    Teknisi
                  </TableHead>
                  <TableHead className="h-11 px-4 text-[12px] font-semibold text-[#475569] uppercase tracking-[0.02em]">
                    Prioritas
                  </TableHead>
                  <TableHead className="h-11 px-4 text-[12px] font-semibold text-[#475569] uppercase tracking-[0.02em]">
                    Status & SLA
                  </TableHead>
                  <TableHead className="h-11 px-4 text-[12px] font-semibold text-[#475569] uppercase tracking-[0.02em] text-center">
                    Aksi
                  </TableHead>
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
                    <TableRow key={j.id} className="border-b border-[#F1F5F9] hover:bg-[#F8FAFC] transition-colors group">
                      <TableCell className="px-4 py-2 align-middle font-mono font-bold text-xs text-primary">
                        <Link href={`/admin/jobs/${j.id}`} className="hover:underline">
                          {j.job_number}
                        </Link>
                      </TableCell>
                      <TableCell className="px-4 py-2 align-middle">
                        {customer?.id ? (
                          <Link
                            href={`/admin/customers/${customer.id}`}
                            className="font-semibold text-sm hover:underline hover:text-[#007ACC]"
                          >
                            {customer.name}
                          </Link>
                        ) : (
                          <div className="font-semibold text-sm">
                            {customer?.name || 'Customer'}
                          </div>
                        )}
                        <div className="text-xs text-[#64748B] flex items-center gap-1 mt-0.5 truncate max-w-xs">
                          <MapPin className="h-3 w-3 shrink-0" />
                          <span className="truncate">{j.address}</span>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-2 align-middle">
                        <div className="font-medium text-sm text-[#0F172A]">{j.service_type}</div>
                        <div className="text-xs text-[#64748B] line-clamp-1 max-w-xs">{j.issue}</div>
                      </TableCell>
                      <TableCell className="px-4 py-2 align-middle">
                        {sched?.start_at ? (
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#0F172A]">
                              <Calendar className="h-3.5 w-3.5 text-[#007ACC] shrink-0" />
                              <span>
                                {new Date(sched.start_at).toLocaleDateString('id-ID', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                })}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 text-[11px] text-[#64748B]">
                              <Clock className="h-3 w-3 text-[#94A3B8] shrink-0" />
                              <span>
                                {new Date(sched.start_at).toLocaleTimeString('id-ID', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                                {sched.end_at
                                  ? ` - ${new Date(sched.end_at).toLocaleTimeString('id-ID', {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}`
                                  : ''}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-0.5">
                            <span className="text-xs text-[#94A3B8] italic block">Belum dijadwalkan</span>
                            <span className="text-[10px] text-[#94A3B8] block">
                              Dibuat: {new Date(j.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                            </span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="px-4 py-2 align-middle">
                        {technician?.name ? (
                          <div className="flex items-center gap-1.5 text-xs font-medium text-[#0F172A]">
                            <User className="h-3.5 w-3.5 text-[#64748B]" />
                            <span>{technician.name}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-[#94A3B8] italic">Belum ada</span>
                        )}
                      </TableCell>
                      <TableCell className="px-4 py-2 align-middle">
                        <Badge variant={priorityBadge} className="text-[10px] font-semibold">
                          {j.priority === 'urgent'
                            ? 'Mendesak'
                            : j.priority === 'high'
                            ? 'Tinggi'
                            : j.priority === 'medium'
                            ? 'Normal'
                            : 'Rendah'}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-4 py-2 align-middle">
                        <div className="flex flex-col gap-1 items-start">
                          <Badge variant="outline" className={`text-[10px] font-semibold ${statusBadge}`}>
                            {j.status === 'on_progress'
                              ? 'Dikerjakan'
                              : j.status === 'assigned'
                              ? 'Ditugaskan'
                              : j.status === 'completed'
                              ? 'Selesai'
                              : j.status === 'cancelled'
                              ? 'Dibatalkan'
                              : 'Menunggu'}
                          </Badge>
                          <SlaBadge
                            status={j.status}
                            scheduledEnd={sched?.end_at}
                            completedAt={j.completed_at}
                          />
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-2 align-middle text-center">
                        <div className="flex items-center justify-center gap-2">
                          {j.status === 'completed' && (
                            <Link
                              href={`/admin/jobs/${j.id}/bap`}
                              target="_blank"
                              title="Cetak BAP"
                              className="h-8 w-8 rounded-[8px] border border-[#E2E8F0] hover:bg-primary hover:text-white text-[#64748B] transition-colors flex items-center justify-center shrink-0"
                            >
                              <Printer className="h-3.5 w-3.5" />
                            </Link>
                          )}
                          <Link
                            href={`/admin/jobs/${j.id}`}
                            title="Buka Tiket"
                            className="h-8 w-8 rounded-[8px] border border-[#E2E8F0] hover:bg-primary hover:text-white text-[#64748B] transition-colors flex items-center justify-center shrink-0"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  )
}
