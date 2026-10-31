import { notFound, redirect } from 'next/navigation'
import { requireRole } from '@/lib/auth'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { STORAGE } from '@/lib/constants'
import { BapDocument } from '@/components/bap/bap-document'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function TechnicianJobBapPage({ params }: PageProps) {
  const profile = await requireRole('technician')
  const { id } = await params
  const supabase = await createSupabaseServerClient()
  const admin = getSupabaseAdmin()

  // 1. Fetch Job, Org Details, Schedule, Attendance, Checklist, Photos, Signature, Report in parallel
  const [
    { data: job },
    { data: org },
    { data: schedule },
    { data: attendance },
    { data: checklist },
    { data: rawPhotos },
    { data: signature },
    { data: report },
  ] = await Promise.all([
    supabase
      .from('jobs')
      .select(`
        id,
        job_number,
        service_type,
        issue,
        instructions,
        address,
        priority,
        status,
        technician_id,
        created_at,
        completed_at,
        customers(id, name, phone, email, address),
        customer_assets(id, asset_name, brand, model_number, serial_number, location_tag, warranty_expires_at, status),
        profiles!jobs_technician_id_fkey(id, name, phone, email)
      `)
      .eq('id', id)
      .eq('org_id', profile.orgId)
      .eq('technician_id', profile.id)
      .maybeSingle(),
    admin
      .from('organizations')
      .select('id, name, address, city, province, postal_code, phone, email')
      .eq('id', profile.orgId)
      .single(),
    supabase.from('schedules').select('start_at, end_at').eq('job_id', id).eq('org_id', profile.orgId).maybeSingle(),
    supabase.from('job_attendance').select('*').eq('job_id', id).eq('org_id', profile.orgId).maybeSingle(),
    supabase.from('checklist_items').select('*').eq('job_id', id).eq('org_id', profile.orgId).order('created_at', { ascending: true }),
    supabase.from('job_photos').select('*').eq('job_id', id).eq('org_id', profile.orgId).order('created_at', { ascending: true }),
    supabase.from('signatures').select('*').eq('job_id', id).eq('org_id', profile.orgId).maybeSingle(),
    supabase.from('work_reports').select('*').eq('job_id', id).eq('org_id', profile.orgId).maybeSingle(),
  ])

  if (!job) {
    notFound()
  }

  // BAP is only available for completed jobs
  if (job.status !== 'completed') {
    redirect(`/technician/jobs/${id}`)
  }

  // 2. Batch Generate Signed URLs for Photos & Signature in a SINGLE network call (with strict tenant prefix guard)
  const isTenantStoragePath = (url?: string | null): url is string =>
    Boolean(url && url.startsWith(`${profile.orgId}/`) && !url.includes('..'))

  const pathsToSign = new Set<string>()
  for (const photo of rawPhotos || []) {
    if (isTenantStoragePath(photo.file_url)) pathsToSign.add(photo.file_url)
  }
  if (isTenantStoragePath(signature?.signature_url)) {
    pathsToSign.add(signature.signature_url)
  }

  const signedUrlMap = new Map<string, string>()
  if (pathsToSign.size > 0) {
    try {
      const { data: signedList } = await admin.storage
        .from(STORAGE.jobFilesBucket)
        .createSignedUrls(Array.from(pathsToSign), 7200)
      for (const item of signedList || []) {
        if (item.path && item.signedUrl) {
          signedUrlMap.set(item.path, item.signedUrl)
        }
      }
    } catch {
      // fallback
    }
  }

  const photosWithSignedUrls = (rawPhotos || []).map((photo) => ({
    id: photo.id,
    type: photo.type,
    signed_url: signedUrlMap.get(photo.file_url) || '',
    captured_at: photo.captured_at,
    checklist_item_id: photo.checklist_item_id,
    caption: photo.caption,
  }))

  const beforePhotos = photosWithSignedUrls.filter((p) => p.type === 'before')
  const afterPhotos = photosWithSignedUrls.filter((p) => p.type === 'after')

  const signatureWithSignedUrl = signature
    ? {
        customer_name: signature.customer_name,
        signed_url: signedUrlMap.get(signature.signature_url) || '',
        signed_at: signature.signed_at,
      }
    : null

  const customer = job.customers as unknown as {
    id: string
    name: string
    phone: string | null
    email: string | null
    address: string | null
  } | null

  const technician = job.profiles as unknown as {
    id: string
    name: string
    phone: string | null
    email: string | null
  } | null

  type AssetType = {
    id: string
    asset_name: string
    brand: string
    model_number: string | null
    serial_number: string | null
    location_tag: string | null
    warranty_expires_at?: string | null
    status?: string | null
  } | null

  const asset = (Array.isArray(job.customer_assets) ? job.customer_assets[0] : job.customer_assets) as AssetType

  return (
    <BapDocument
      organization={{
        id: profile.orgId,
        name: org?.name || 'Opilines Partner',
        address: org?.address,
        city: org?.city,
        province: org?.province,
        postal_code: org?.postal_code,
        phone: org?.phone,
        email: org?.email,
      }}
      job={job}
      customer={customer}
      asset={asset}
      technician={technician}
      schedule={schedule}
      attendance={attendance}
      checklist={checklist || []}
      beforePhotos={beforePhotos}
      afterPhotos={afterPhotos}
      signature={signatureWithSignedUrl}
      report={report}
      backHref={`/technician/jobs/${id}`}
    />
  )
}
