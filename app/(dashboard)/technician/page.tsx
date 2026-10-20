import { requireRole } from '@/lib/auth'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { RealtimeJobsListener } from '@/components/realtime/realtime-jobs-listener'
import { InstallPrompt } from '@/components/pwa/install-prompt'
import { TechnicianJobList, type TechnicianJobItem } from '@/components/technician/technician-job-list'
import { Sparkles } from 'lucide-react'

export default async function TechnicianHomePage() {
  const profile = await requireRole('technician')
  const supabase = await createSupabaseServerClient()

  // Fetch jobs assigned to this technician with customer assets
  const { data: jobs } = await supabase
    .from('jobs')
    .select(`
      id,
      job_number,
      service_type,
      issue,
      address,
      priority,
      status,
      created_at,
      completed_at,
      customer_assets(asset_name, brand),
      schedules(start_at, end_at)
    `)
    .eq('org_id', profile.orgId)
    .eq('technician_id', profile.id)
    .order('created_at', { ascending: false })

  const assignedJobs = jobs || []

  // Format job items for client list
  const formattedJobs: TechnicianJobItem[] = assignedJobs.map((j) => {
    type AssetInfo = { asset_name: string; brand: string } | null
    const asset = (Array.isArray(j.customer_assets) ? j.customer_assets[0] : j.customer_assets) as AssetInfo
    type SchedType = { start_at: string; end_at: string } | null
    const sched = (Array.isArray(j.schedules) ? j.schedules[0] : j.schedules) as SchedType
    return {
      id: j.id,
      jobNumber: j.job_number,
      serviceType: j.service_type,
      issue: j.issue,
      address: j.address,
      priority: j.priority as 'low' | 'medium' | 'high',
      status: j.status,
      createdAt: j.created_at,
      completedAt: j.completed_at,
      assetName: asset?.asset_name || null,
      assetBrand: asset?.brand || null,
      scheduledStart: sched?.start_at || null,
      scheduledEnd: sched?.end_at || null,
    }
  })

  const todayStr = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const initials = profile.name
    ? profile.name
        .split(' ')
        .map((n: string) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'TK'

  return (
    <div className="space-y-4 pb-4">
      {/* Native Mobile App Bar */}
      <header className="flex items-center justify-between gap-3 py-1 border-b border-[#E2E8F0] pb-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#007ACC] text-white font-bold text-sm shadow-xs">
            <span>{initials}</span>
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-[#10B981] ring-2 ring-white" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-micro font-semibold text-[#007ACC] uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="h-3 w-3" /> Siaga Aktif
              </span>
              <span className="text-[11px] text-[#475569] truncate">• {todayStr}</span>
            </div>
            <h1 className="text-heading-2 font-heading text-[#0F172A] tracking-tight truncate">
              Halo, {profile.name}!
            </h1>
          </div>
        </div>
        <div className="shrink-0">
          <RealtimeJobsListener technicianId={profile.id} compact={true} />
        </div>
      </header>

      {/* PWA Mobile Add to Home Screen Banner */}
      <InstallPrompt />

      {/* Interactive Segmented Job List */}
      <TechnicianJobList jobs={formattedJobs} />
    </div>
  )
}
