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

  // 1. Fetch Job
  const { data: job } = await supabase
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
      profiles!jobs_technician_id_fkey(id, name, phone, email)
    `)
    .eq('id', id)
    .eq('org_id', profile.orgId)
    .eq('technician_id', profile.id)
    .maybeSingle()

  if (!job) {
    notFound()
  }

  // BAP is only available for completed jobs
  if (job.status !== 'completed') {
    redirect(`/technician/jobs/${id}`)
  }

  // 2. Fetch Org Name, Attendance, Checklist, Photos, Signature, Report in parallel
  const [
    { data: org },
    { data: attendance },
    { data: checklist },
    { data: rawPhotos },
    { data: signature },
    { data: report },
  ] = await Promise.all([
    admin.from('organizations').select('id, name').eq('id', profile.orgId).single(),
    supabase.from('job_attendance').select('*').eq('job_id', id).maybeSingle(),
    supabase.from('checklist_items').select('*').eq('job_id', id).order('created_at', { ascending: true }),
    supabase.from('job_photos').select('*').eq('job_id', id).order('created_at', { ascending: true }),
    supabase.from('signatures').select('*').eq('job_id', id).maybeSingle(),
    supabase.from('work_reports').select('*').eq('job_id', id).maybeSingle(),
  ])

  // 3. Generate Signed URLs for Photos (valid 2 hours)
  const photosWithSignedUrls = await Promise.all(
    (rawPhotos || []).map(async (photo) => {
      const { data } = await admin.storage
        .from(STORAGE.jobFilesBucket)
        .createSignedUrl(photo.file_url, 7200)
      return {
        id: photo.id,
        type: photo.type,
        signed_url: data?.signedUrl || '',
        captured_at: photo.captured_at,
      }
    })
  )

  const beforePhotos = photosWithSignedUrls.filter((p) => p.type === 'before')
  const afterPhotos = photosWithSignedUrls.filter((p) => p.type === 'after')

  // 4. Generate Signed URL for Customer Signature
  let signatureWithSignedUrl = null
  if (signature) {
    const { data: sigData } = await admin.storage
      .from(STORAGE.jobFilesBucket)
      .createSignedUrl(signature.signature_url, 7200)
    signatureWithSignedUrl = {
      customer_name: signature.customer_name,
      signed_url: sigData?.signedUrl || '',
      signed_at: signature.signed_at,
    }
  }

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

  return (
    <BapDocument
      organization={{ id: profile.orgId, name: org?.name || 'Gridline OS Partner' }}
      job={job}
      customer={customer}
      technician={technician}
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
