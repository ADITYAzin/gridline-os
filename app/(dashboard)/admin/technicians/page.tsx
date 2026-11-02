import { requireRole } from '@/lib/auth'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { InviteMemberDialog } from './invite-member-dialog'
import { ImportTechniciansDialog } from './import-technicians-dialog'
import { calculateAllTechniciansMetrics, type CommissionSettings } from '@/lib/commission'
import { RealtimeJobsListener } from '@/components/realtime/realtime-jobs-listener'
import { TechniciansView, type MemberItem, type InviteItem } from '@/components/team/technicians-view'

interface PageProps {
  searchParams: Promise<{ tab?: string }>
}

export default async function TechniciansPage({ searchParams }: PageProps) {
  const profile = await requireRole('admin')
  const { tab: activeTab = 'members' } = await searchParams
  const supabase = await createSupabaseServerClient()

  // Fetch team members, pending invites, jobs, organization commission config, and services concurrently
  const [
    { data: members },
    { data: pendingInvites },
    { data: jobs },
    { data: org },
    { data: services },
  ] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, name, email, phone, role, created_at')
      .eq('org_id', profile.orgId)
      .order('role', { ascending: true }),
    supabase
      .from('invite_tokens')
      .select('id, email, role, expires_at, created_at')
      .eq('org_id', profile.orgId)
      .is('used_at', null)
      .order('created_at', { ascending: false }),
    supabase
      .from('jobs')
      .select(`
        id,
        job_number,
        service_type,
        status,
        technician_id,
        created_at,
        completed_at,
        schedules(end_at),
        job_attendance(check_in_at)
      `)
      .eq('org_id', profile.orgId),
    supabase
      .from('organizations')
      .select('id, commission_enabled, commission_type, default_commission_rate, on_time_bonus_enabled, on_time_bonus_rate')
      .eq('id', profile.orgId)
      .maybeSingle(),
    supabase
      .from('company_services')
      .select('id, name, default_price, commission_rate')
      .eq('org_id', profile.orgId)
      .eq('is_active', true)
      .order('name', { ascending: true }),
  ])

  const list = members || []
  const invites = pendingInvites || []
  const allJobs = jobs || []
  const activeServices = services || []

  // Construct dynamic commission settings with safe fallbacks (default Rp 0)
  const commissionSettings: CommissionSettings = {
    commission_enabled: org?.commission_enabled ?? false,
    commission_type: (org?.commission_type as 'service_based' | 'flat') || 'service_based',
    default_commission_rate: org?.default_commission_rate != null ? Number(org.default_commission_rate) : 0,
    on_time_bonus_enabled: org?.on_time_bonus_enabled ?? false,
    on_time_bonus_rate: org?.on_time_bonus_rate != null ? Number(org.on_time_bonus_rate) : 0,
    serviceRates: activeServices.reduce((acc, s) => {
      if (s.name) {
        acc[s.name] = s.commission_rate != null ? Number(s.commission_rate) : (Number(org?.default_commission_rate) || 0)
      }
      return acc
    }, {} as Record<string, number>),
  }

  // Filter technicians and calculate performance & commission metrics dynamically
  const technicians = list.filter((m) => m.role === 'technician')
  const metrics = calculateAllTechniciansMetrics(technicians, allJobs, commissionSettings)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-heading">Teknisi</h1>
            <RealtimeJobsListener orgId={profile.orgId} />
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Kelola akses teknisi, pantau performa tim teknisi, dan evaluasi rekap komisi.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <ImportTechniciansDialog />
          <InviteMemberDialog />
        </div>
      </div>

      <TechniciansView
        members={list as MemberItem[]}
        invites={invites as InviteItem[]}
        metrics={metrics}
        commissionSettings={commissionSettings}
        activeServices={activeServices}
        defaultTab={activeTab}
      />
    </div>
  )
}


