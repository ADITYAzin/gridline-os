import { requireRole } from '@/lib/auth'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { LiveMapView, type MapJobItem } from '@/components/map/live-map-view'

export const metadata = {
  title: 'Peta Lapangan | Opilines',
  description: 'Verifikasi kehadiran teknisi dan peta pekerjaan lapangan Opilines.',
}

export default async function AdminMapPage() {
  const profile = await requireRole('admin')
  const supabase = await createSupabaseServerClient()

  // Fetch only active/relevant jobs (exclude cancelled jobs)
  const { data: rawJobs, error } = await supabase
    .from('jobs')
    .select(`
      id,
      job_number,
      service_type,
      address,
      priority,
      status,
      latitude,
      longitude,
      created_at,
      customer_id,
      technician_id,
      customers (
        name,
        phone
      ),
      profiles:technician_id (
        name
      ),
      job_attendance (
        check_in_at,
        check_in_latitude,
        check_in_longitude,
        check_out_at
      )
    `)
    .eq('org_id', profile.orgId)
    .neq('status', 'cancelled')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching jobs for map:', error)
  }

  const jobs: MapJobItem[] = (rawJobs || []).map((j: any) => {
    // Look up attendance check-in
    const attendanceList = Array.isArray(j.job_attendance) ? j.job_attendance : []
    // Find latest check_in_at
    const latestAttendance = attendanceList.length > 0 ? attendanceList[attendanceList.length - 1] : null

    const checkInAt = latestAttendance?.check_in_at || null
    const checkOutAt = latestAttendance?.check_out_at || null

    // If technician checked in with GPS coordinates, prioritize attendance coordinates
    const lat = latestAttendance?.check_in_latitude != null
      ? Number(latestAttendance.check_in_latitude)
      : j.latitude != null
      ? Number(j.latitude)
      : null

    const lng = latestAttendance?.check_in_longitude != null
      ? Number(latestAttendance.check_in_longitude)
      : j.longitude != null
      ? Number(j.longitude)
      : null

    return {
      id: j.id,
      job_number: j.job_number,
      service_type: j.service_type,
      address: j.address || '',
      priority: j.priority || 'medium',
      status: j.status || 'pending',
      latitude: lat,
      longitude: lng,
      created_at: j.created_at,
      customer_name: j.customers?.name || 'Pelanggan',
      customer_phone: j.customers?.phone || null,
      technician_name: j.profiles?.name || null,
      technician_id: j.technician_id || null,
      check_in_at: checkInAt,
      check_out_at: checkOutAt,
    }
  })

  return <LiveMapView jobs={jobs} orgId={profile.orgId} />
}
