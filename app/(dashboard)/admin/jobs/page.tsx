import Link from 'next/link'
import { requireRole } from '@/lib/auth'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { ExportJobsButton } from '@/components/jobs/export-jobs-button'
import { RealtimeJobsListener } from '@/components/realtime/realtime-jobs-listener'
import { JobsTableView, type JobRowItem } from '@/components/jobs/jobs-table-view'
import { Plus } from 'lucide-react'

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
  const jobList = (jobs || []) as unknown as JobRowItem[]

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
      issue: j.issue || '',
      customerName: cust?.name || '-',
      customerPhone: cust?.phone || '-',
      address: j.address,
      technicianName: tech?.name || 'Belum Ditugaskan',
      completedAt: j.completed_at || null,
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

      <JobsTableView
        jobs={jobList}
        currentTab={currentTab}
        tabs={tabs}
      />
    </div>
  )
}
