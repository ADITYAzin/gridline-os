import { requireRole } from '@/lib/auth'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { STORAGE } from '@/lib/constants'
import { LiveMapView, type MapJobItem } from '@/components/map/live-map-view'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Peta Lapangan | Opilines',
  description: 'Verifikasi kehadiran teknisi dan peta pekerjaan lapangan Opilines.',
}

export default async function AdminMapPage() {
  const profile = await requireRole('admin')
  const admin = getSupabaseAdmin()

  // Fetch active/relevant jobs (exclude cancelled jobs) using admin client to ensure 100% complete relation joins
  const { data: rawJobs, error } = await admin
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
        check_in_photo_url,
        check_out_at,
        check_out_latitude,
        check_out_longitude
      )
    `)
    .eq('org_id', profile.orgId)
    .neq('status', 'cancelled')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching jobs for map:', error)
  }

  // Batch sign all attendance check-in photos in a single HTTP request (with strict tenant prefix guard)
  const photoPaths = new Set<string>()
  for (const j of rawJobs || []) {
    const rawAtt = (j as any).job_attendance
    const latestAttendance = Array.isArray(rawAtt)
      ? (rawAtt.length > 0 ? rawAtt[rawAtt.length - 1] : null)
      : (rawAtt || null)
    const pUrl = latestAttendance?.check_in_photo_url
    if (typeof pUrl === 'string' && pUrl.startsWith(`${profile.orgId}/`) && !pUrl.includes('..')) {
      photoPaths.add(pUrl)
    }
  }

  const signedUrlMap = new Map<string, string>()
  if (photoPaths.size > 0) {
    try {
      const { data: signedBatch } = await admin.storage
        .from(STORAGE.jobFilesBucket)
        .createSignedUrls(Array.from(photoPaths), 7200)
      for (const item of signedBatch || []) {
        if (item.path && item.signedUrl) {
          signedUrlMap.set(item.path, item.signedUrl)
        }
      }
    } catch {
      // fallback
    }
  }

  const jobs: MapJobItem[] = (rawJobs || []).map((j: any) => {
    // Look up attendance check-in (handles both 1-to-1 object and array returns from PostgREST)
    const rawAtt = j.job_attendance
    const latestAttendance: any = Array.isArray(rawAtt)
      ? (rawAtt.length > 0 ? rawAtt[rawAtt.length - 1] : null)
      : (rawAtt || null)

    const checkInAt = latestAttendance?.check_in_at || null
    const checkOutAt = latestAttendance?.check_out_at || null
    const checkInPhotoUrl = latestAttendance?.check_in_photo_url
      ? signedUrlMap.get(latestAttendance.check_in_photo_url) || null
      : null

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
      check_in_photo_url: checkInPhotoUrl,
    }
  })

  return <LiveMapView jobs={jobs} orgId={profile.orgId} />
}
