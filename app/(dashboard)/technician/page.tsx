import Link from 'next/link'
import { requireRole } from '@/lib/auth'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { RealtimeJobsListener } from '@/components/realtime/realtime-jobs-listener'
import { InstallPrompt } from '@/components/pwa/install-prompt'
import { TechnicianJobList, type TechnicianJobItem } from '@/components/technician/technician-job-list'
import { calculateJobCommission, formatRupiah } from '@/lib/commission'
import { Coins, ChevronRight, Sparkles } from 'lucide-react'

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
      customer_assets(asset_name, brand)
    `)
    .eq('technician_id', profile.id)
    .order('created_at', { ascending: false })

  const assignedJobs = jobs || []
  const completedJobs = assignedJobs.filter((j) => j.status === 'completed')

  let totalTechCommission = 0
  completedJobs.forEach((j) => {
    const item = calculateJobCommission({
      id: j.id,
      job_number: j.job_number,
      service_type: j.service_type,
      status: j.status,
      created_at: j.created_at,
      completed_at: j.completed_at,
    })
    totalTechCommission += item.totalCommission
  })

  // Format job items for client list
  const formattedJobs: TechnicianJobItem[] = assignedJobs.map((j) => {
    type AssetInfo = { asset_name: string; brand: string } | null
    const asset = (Array.isArray(j.customer_assets) ? j.customer_assets[0] : j.customer_assets) as AssetInfo
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
    }
  })

  const todayStr = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="space-y-4 pb-4">
      {/* Top Greeting & Realtime Sync Bar */}
      <div className="flex items-center justify-between gap-2 border-b border-[#E2E8F0] pb-3">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-micro font-semibold text-[#007ACC] uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="h-3 w-3" /> Siap Melayani
            </span>
            <span className="text-caption text-slate-500">• {todayStr}</span>
          </div>
          <h1 className="text-heading-1 font-heading text-[#0F172A] tracking-tight">
            Semangat, {profile.name}! 👋
          </h1>
        </div>
        <RealtimeJobsListener technicianId={profile.id} compact={true} />
      </div>

      {/* PWA Mobile Add to Home Screen Banner */}
      <InstallPrompt />

      {/* Quick Earnings Card with direct route to Commissions */}
      <Link href="/technician/commissions" className="block group">
        <Card className="border-[#007ACC]/30 bg-gradient-to-r from-white via-white to-[#EBF5FC]/60 shadow-xs hover:border-[#007ACC] transition-all rounded-[12px]">
          <CardContent className="p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-[#007ACC]/10 text-[#007ACC]">
                <Coins className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[11px] text-[#475569] block font-medium">
                  Insentif Selesai Terkumpul:
                </span>
                <span className="text-sm font-extrabold text-[#007ACC] font-mono">
                  {formatRupiah(totalTechCommission)}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs font-semibold text-[#007ACC] group-hover:translate-x-0.5 transition-transform">
              <span>Rincian</span>
              <ChevronRight className="h-4 w-4" />
            </div>
          </CardContent>
        </Card>
      </Link>

      {/* Interactive Segmented Job List */}
      <TechnicianJobList jobs={formattedJobs} />
    </div>
  )
}
