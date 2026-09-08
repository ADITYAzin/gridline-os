import { requireRole } from '@/lib/auth'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { DispatchView, type ScheduleItem, type TechnicianItem } from './dispatch-view'

export default async function DispatchBoardPage() {
  const profile = await requireRole('admin')
  const supabase = await createSupabaseServerClient()

  // Fetch technicians and schedules
  const [{ data: techs }, { data: schedules }] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, name, email')
      .eq('org_id', profile.orgId)
      .eq('role', 'technician')
      .order('name'),
    supabase
      .from('schedules')
      .select(`
        id,
        technician_id,
        start_at,
        end_at,
        jobs(id, job_number, service_type, address, priority, status, completed_at, customers(name))
      `)
      .eq('org_id', profile.orgId)
      .order('start_at', { ascending: true }),
  ])

  const technicianList = (techs || []) as TechnicianItem[]
  const scheduleList = (schedules || []) as unknown as ScheduleItem[]

  return (
    <DispatchView
      technicians={technicianList}
      schedules={scheduleList}
      orgId={profile.orgId}
    />
  )
}

