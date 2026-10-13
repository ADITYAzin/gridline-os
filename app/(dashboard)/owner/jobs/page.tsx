import { requireRole } from '@/lib/auth'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ExportJobsButton } from '@/components/jobs/export-jobs-button'
import { SlaBadge } from '@/components/jobs/sla-badge'
import { User, Calendar, Clock } from 'lucide-react'

export default async function OwnerJobsPage() {
  const profile = await requireRole('owner')
  const supabase = await createSupabaseServerClient()

  const { data: jobs } = await supabase
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
      customers(name, phone),
      profiles!jobs_technician_id_fkey(name),
      schedules(start_at, end_at)
    `)
    .eq('org_id', profile.orgId)
    .order('created_at', { ascending: false })

  const list = jobs || []

  // Prepare export data
  const exportData = list.map((j) => {
    type CustType = { name: string; phone?: string | null }
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
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Monitoring Jobs (Owner View)</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Pantauan status seluruh pekerjaan teknisi di lapangan secara real-time.
          </p>
        </div>
        <ExportJobsButton jobs={exportData} filenamePrefix="Laporan-Eksekutif-Jobs" />
      </div>

      <div className="rounded-[12px] bg-[#FFFFFF] border border-[#E2E8F0] shadow-[0_1px_3px_0_rgba(15,23,42,0.03),0_1px_2px_0_rgba(15,23,42,0.02)] overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-[#E2E8F0] bg-[#F8FAFC] hover:bg-[#F8FAFC]">
                <TableHead className="h-11 px-4 text-[12px] font-semibold text-[#475569] uppercase tracking-[0.02em] w-[110px]">
                  No. Job
                </TableHead>
                <TableHead className="h-11 px-4 text-[12px] font-semibold text-[#475569] uppercase tracking-[0.02em]">
                  Customer
                </TableHead>
                <TableHead className="h-11 px-4 text-[12px] font-semibold text-[#475569] uppercase tracking-[0.02em]">
                  Layanan
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
                <TableHead className="h-11 px-4 text-[12px] font-semibold text-[#475569] uppercase tracking-[0.02em]">
                  Jadwal Servis
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.map((j) => {
                type CustType = { name: string }
                const customer = (Array.isArray(j.customers) ? j.customers[0] : j.customers) as CustType | null
                type TechType = { name: string }
                const technician = (Array.isArray(j.profiles) ? j.profiles[0] : j.profiles) as TechType | null
                type SchedType = { start_at: string; end_at: string }
                const sched = (Array.isArray(j.schedules) ? j.schedules[0] : j.schedules) as SchedType | null

                return (
                  <TableRow key={j.id} className="border-b border-[#F1F5F9] hover:bg-[#F8FAFC] transition-colors group">
                    <TableCell className="px-4 py-2 align-middle font-mono font-bold text-xs text-[#007ACC]">
                      {j.job_number}
                    </TableCell>
                    <TableCell className="px-4 py-2 align-middle">
                      <span className="font-semibold text-sm text-[#0F172A]">
                        {customer?.name || 'Customer'}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-2 align-middle">
                      <span className="text-sm font-medium text-[#0F172A]">{j.service_type}</span>
                    </TableCell>
                    <TableCell className="px-4 py-2 align-middle">
                      {technician?.name ? (
                        <span className="text-xs font-medium flex items-center gap-1 text-[#0F172A]">
                          <User className="h-3 w-3 text-[#64748B]" />
                          {technician.name}
                        </span>
                      ) : (
                        <span className="text-xs text-[#94A3B8] italic">Belum ada</span>
                      )}
                    </TableCell>
                    <TableCell className="px-4 py-2 align-middle">
                      <Badge variant="outline" className="capitalize text-[10px]">
                        {j.priority}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 py-2 align-middle">
                      <div className="flex flex-col gap-1 items-start">
                        <Badge
                          variant={j.status === 'completed' ? 'default' : 'secondary'}
                          className="capitalize text-[10px]"
                        >
                          {j.status.replace('_', ' ')}
                        </Badge>
                        <SlaBadge
                          status={j.status}
                          scheduledEnd={sched?.end_at}
                          completedAt={j.completed_at}
                        />
                      </div>
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
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
