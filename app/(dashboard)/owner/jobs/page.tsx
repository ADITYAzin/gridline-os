import { requireRole } from '@/lib/auth'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ExportJobsButton } from '@/components/jobs/export-jobs-button'
import { SlaBadge } from '@/components/jobs/sla-badge'
import { User } from 'lucide-react'

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

      <Card className="shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[110px]">No. Job</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Layanan</TableHead>
              <TableHead>Teknisi</TableHead>
              <TableHead>Prioritas</TableHead>
              <TableHead>Status & SLA</TableHead>
              <TableHead className="text-right">Tanggal</TableHead>
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
                <TableRow key={j.id}>
                  <TableCell className="font-mono font-bold text-xs text-primary">{j.job_number}</TableCell>
                  <TableCell>
                    <span className="font-semibold text-sm">
                      {customer?.name || 'Customer'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-medium">{j.service_type}</span>
                  </TableCell>
                  <TableCell>
                    {technician?.name ? (
                      <span className="text-xs font-medium flex items-center gap-1">
                        <User className="h-3 w-3 text-muted-foreground" />
                        {technician.name}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">Belum ada</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize text-[10px]">
                      {j.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
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
                  <TableCell className="text-right text-xs text-muted-foreground">
                    {new Date(j.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
