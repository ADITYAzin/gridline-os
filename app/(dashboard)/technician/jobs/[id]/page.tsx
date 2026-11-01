import Link from 'next/link'
import { notFound } from 'next/navigation'
import { requireRole } from '@/lib/auth'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { STORAGE } from '@/lib/constants'
import { CheckInButton } from './check-in-button'
import { CheckOutSection } from './check-out-section'
import { ChecklistSection } from './checklist-section'
import { PhotoUploadSection } from './photo-upload-section'
import { SignaturePadModal } from './signature-pad-modal'
import { WorkReportForm } from './work-report-form'
import { JobCompletedBanner } from '@/components/technician/job-completed-view'
import { calculateJobCommission } from '@/lib/commission'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, MapPin, AlertCircle, Printer, Wrench, ShieldAlert, ShieldCheck, Sparkles } from 'lucide-react'
import { TechnicianStatusBadge } from '@/components/technician/status-badge'
import { FiveGateProgress } from '@/components/technician/five-gate-progress'
import { QuickActionTray } from '@/components/technician/quick-action-tray'
import { SopOperationalBanner } from '@/components/technician/sop-operational-banner'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function TechnicianJobDetailPage({ params }: PageProps) {
  const profile = await requireRole('technician')
  const { id } = await params
  const supabase = await createSupabaseServerClient()

  // 1. Fetch Job and Supporting Artifacts in Parallel (Eliminate Waterfall)
  const [
    { data: job },
    { data: attendance },
    { data: checklist },
    { data: photos },
    { data: signature },
    { data: report },
    { data: schedule },
    { data: orgConfig },
    { data: allServices },
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
        created_at,
        completed_at,
        technician_id,
        customers(name, phone),
        customer_assets(id, asset_name, brand, model_number, serial_number, location_tag, notes, warranty_expires_at, status)
      `)
      .eq('id', id)
      .eq('org_id', profile.orgId)
      .eq('technician_id', profile.id)
      .maybeSingle(),
    supabase.from('job_attendance').select('check_in_at, check_out_at, check_in_photo_url, check_in_latitude, check_in_longitude').eq('job_id', id).eq('org_id', profile.orgId).maybeSingle(),
    supabase
      .from('checklist_items')
      .select('id, item, is_completed, is_na, na_reason, sop_mode, requires_photo, is_critical, hint')
      .eq('job_id', id)
      .eq('org_id', profile.orgId)
      .order('created_at', { ascending: true }),
    supabase.from('job_photos').select('id, type, file_url, created_at, checklist_item_id, caption').eq('job_id', id).eq('org_id', profile.orgId),
    supabase.from('signatures').select('customer_name, signature_url, signed_at').eq('job_id', id).eq('org_id', profile.orgId).maybeSingle(),
    supabase.from('work_reports').select('result, notes, submitted_at').eq('job_id', id).eq('org_id', profile.orgId).maybeSingle(),
    supabase.from('schedules').select('start_at, end_at').eq('job_id', id).eq('org_id', profile.orgId).maybeSingle(),
    supabase
      .from('organizations')
      .select('commission_enabled, commission_type, default_commission_rate, on_time_bonus_enabled, on_time_bonus_rate')
      .eq('id', profile.orgId)
      .maybeSingle(),
    supabase
      .from('company_services')
      .select('name, sop_mode, sop_notes, estimated_duration_minutes, risk_level, commission_rate')
      .eq('org_id', profile.orgId),
  ])

  if (!job) {
    notFound()
  }

  const serviceConfig = (allServices || []).find((s) => s.name === job.service_type) || null

  const customer = job.customers as unknown as { name: string; phone: string | null } | null
  const custName = Array.isArray(customer) ? customer[0]?.name : customer?.name
  const custPhone = Array.isArray(customer) ? customer[0]?.phone : customer?.phone

  type AssetType = {
    id: string
    asset_name: string
    brand: string
    model_number: string | null
    serial_number: string | null
    location_tag: string | null
    notes: string | null
    warranty_expires_at: string | null
    status: string | null
  } | null
  const asset = (Array.isArray(job.customer_assets) ? job.customer_assets[0] : job.customer_assets) as AssetType
  const isLocked = job.status === 'completed' || job.status === 'cancelled'

  const admin = getSupabaseAdmin()

  // Batch generate signed URLs in a SINGLE network request with strict multi-tenant path verification
  const isStoragePath = (url?: string | null): url is string =>
    Boolean(
      url &&
        url.startsWith(`${profile.orgId}/`) &&
        !url.includes('..') &&
        !url.startsWith('http://') &&
        !url.startsWith('https://') &&
        !url.startsWith('data:image')
    )

  const pathsToSign = new Set<string>()
  for (const photo of photos || []) {
    if (isStoragePath(photo.file_url)) {
      pathsToSign.add(photo.file_url)
    }
  }
  if (isStoragePath(signature?.signature_url)) {
    pathsToSign.add(signature.signature_url)
  }
  if (isStoragePath(attendance?.check_in_photo_url)) {
    pathsToSign.add(attendance.check_in_photo_url)
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

  const photosWithSignedUrls = (photos || []).map((photo) => ({
    ...photo,
    display_url: signedUrlMap.get(photo.file_url) || photo.file_url,
  }))

  const signatureWithSignedUrl: { customer_name: string; display_url?: string; signed_at: string } | null = signature
    ? {
        customer_name: signature.customer_name,
        display_url: signedUrlMap.get(signature.signature_url) || signature.signature_url,
        signed_at: signature.signed_at,
      }
    : null

  const attendanceWithSignedPhoto = attendance
    ? {
        ...attendance,
        display_photo_url: attendance.check_in_photo_url
          ? signedUrlMap.get(attendance.check_in_photo_url) || null
          : null,
      }
    : null

  // Calculate 6-Gate Completion State (supports Tri-Mode SOP and N/A)
  const hasCheckIn = Boolean(attendance?.check_in_at)
  const hasCheckOut = Boolean(attendance?.check_out_at)
  const checklistList = checklist || []
  const isReferenceSop = checklistList.length > 0 && checklistList[0]?.sop_mode === 'reference'
  const hasChecklistCompleted =
    checklistList.length === 0 ||
    isReferenceSop ||
    checklistList.every((c) => c.is_completed || (c.is_na && !c.is_critical))
  const hasPhotosCompleted =
    (photos || []).some((p) => p.type === 'before') &&
    (photos || []).some((p) => p.type === 'after')
  const hasSignature = Boolean(signature?.signed_at)
  const hasReport = Boolean(report?.submitted_at)
  const isReadyForCheckout =
    hasCheckIn && hasChecklistCompleted && hasPhotosCompleted && hasSignature && hasReport
  const isAllGatesMet = isReadyForCheckout && hasCheckOut

  // Calculate job commission if organization commission is enabled
  let jobCommission = null
  if (orgConfig?.commission_enabled) {
    const sRates: Record<string, number> = {}
    if (job.service_type && serviceConfig?.commission_rate != null) {
      sRates[job.service_type] = Number(serviceConfig.commission_rate)
    }

    jobCommission = calculateJobCommission(
      {
        id: job.id,
        job_number: job.job_number,
        service_type: job.service_type,
        status: job.status,
        created_at: job.created_at,
        completed_at: job.completed_at,
        scheduled_end: schedule?.end_at,
        check_in_at: attendance?.check_in_at,
      },
      {
        commission_enabled: true,
        commission_type: (orgConfig.commission_type as 'service_based' | 'flat') || 'service_based',
        default_commission_rate: Number(orgConfig.default_commission_rate) || 0,
        on_time_bonus_enabled: Boolean(orgConfig.on_time_bonus_enabled),
        on_time_bonus_rate: Number(orgConfig.on_time_bonus_rate) || 0,
        serviceRates: sRates,
      }
    )
  }

  return (
    <div className="space-y-4 pb-14">
      {/* Native Mobile App Bar */}
      <header className="sticky top-0 -mx-4 -mt-3 px-4 py-2.5 z-30 bg-white/95 backdrop-blur-md border-b border-[#E2E8F0] flex items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <Button asChild variant="ghost" size="icon" className="h-10 w-10 shrink-0 text-[#0F172A] hover:bg-[#F1F5F9] active:bg-[#E2E8F0] rounded-[8px] touch-press">
            <Link href="/technician" aria-label="Kembali ke Tugas Saya">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-mono font-bold text-sm text-[#007ACC]">{job.job_number}</span>
              <TechnicianStatusBadge status={job.status} />
            </div>
            <h1 className="text-base font-bold font-heading text-[#0F172A] truncate leading-tight">
              {job.service_type}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {job.status === 'completed' && (
            <Button asChild variant="outline" size="sm" className="h-9 px-3 gap-1.5 text-xs font-bold text-[#007ACC] border-[#007ACC]/40 hover:bg-[#EBF5FC] rounded-lg shrink-0 touch-press">
              <Link href={`/technician/jobs/${job.id}/bap`} target="_blank">
                <Printer className="h-4 w-4" />
                <span>BAP</span>
              </Link>
            </Button>
          )}
        </div>
      </header>

      {/* 6-Gate Visual Readiness Progress */}
      <FiveGateProgress
        hasCheckIn={hasCheckIn}
        hasChecklistCompleted={hasChecklistCompleted}
        hasPhotosCompleted={hasPhotosCompleted}
        hasSignature={hasSignature}
        hasReport={hasReport}
        hasCheckOut={hasCheckOut}
        isCompleted={isLocked}
      />

      {/* Visual Banner Perayaan Penyelesaian Tiket (Ketika Status Selesai) */}
      {job.status === 'completed' && (
        <JobCompletedBanner
          jobNumber={job.job_number}
          serviceType={job.service_type}
          completedAt={job.completed_at}
          jobId={job.id}
          commissionAmount={jobCommission?.totalCommission}
        />
      )}

      {/* GPS Check-in & Presence Action (TOP) */}
      {!isLocked && (
        <>
          <CheckInButton jobId={job.id} attendance={attendanceWithSignedPhoto} />
          {!hasCheckIn && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-950 text-xs sm:text-sm font-semibold flex items-center gap-2.5 shadow-2xs">
              <AlertCircle className="h-4.5 w-4.5 shrink-0 text-amber-600" />
              <span>Check-in di lokasi terlebih dahulu untuk membuka SOP & laporan kerja.</span>
            </div>
          )}
        </>
      )}

      {/* Work Order Info & Quick Navigation Action Card */}
      <Card className="shadow-xs rounded-xl bg-white border-[#E2E8F0]">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm text-[#0F172A] font-bold">
            Pelanggan & Lokasi
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-1 space-y-3 text-xs sm:text-sm">
          <div className="space-y-1">
            <span className="font-bold text-[#0F172A] text-base block">
              {custName || 'Pelanggan'}
            </span>
            <div className="flex items-start gap-1.5 text-[#1E293B] font-medium">
              <MapPin className="h-4 w-4 text-[#007ACC] shrink-0 mt-0.5" />
              <span className="leading-relaxed">{job.address}</span>
            </div>
          </div>

          {/* Quick Action Bar for Field Navigation & Direct Phone/WhatsApp */}
          <QuickActionTray
            customerName={custName || 'Pelanggan'}
            customerPhone={custPhone}
            address={job.address}
            jobNumber={job.job_number}
            serviceType={job.service_type}
            technicianName={profile.name}
          />

          {asset && (
            <div className="rounded-lg border bg-[#EBF5FC]/60 border-[#D0E8F8] p-3 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#0F172A] flex items-center gap-1.5 text-xs sm:text-sm">
                  <Wrench className="h-4 w-4 text-[#007ACC]" />
                  Aset Unit: {asset.asset_name}
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-[#007ACC] text-white">
                  {asset.brand}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-[#334155] bg-white p-2.5 rounded-md border border-[#E2E8F0] font-medium">
                <div>Model: <span className="font-mono font-bold text-[#0F172A]">{asset.model_number || '-'}</span></div>
                <div>No. Seri: <span className="font-mono font-bold text-[#0F172A]">{asset.serial_number || '-'}</span></div>
                {asset.location_tag && (
                  <div className="col-span-2">Lokasi: <span className="font-bold text-[#0F172A]">{asset.location_tag}</span></div>
                )}
              </div>
              {asset.notes && (
                <p className="text-xs text-[#475569] italic pt-0.5">
                  Catatan: {asset.notes}
                </p>
              )}
              {asset.warranty_expires_at && (
                <div className="pt-2 border-t border-[#D0E8F8] flex items-center gap-1.5 text-xs">
                  {new Date(asset.warranty_expires_at) >= new Date() ? (
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      <ShieldCheck className="h-4 w-4" /> Garansi Aktif (s/d {new Date(asset.warranty_expires_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })})
                    </span>
                  ) : (
                    <span className="text-rose-600 font-semibold flex items-center gap-1">
                      <ShieldAlert className="h-4 w-4" /> Garansi Habis ({new Date(asset.warranty_expires_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })})
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="rounded-md bg-muted/50 p-2.5 space-y-1">
            <span className="font-semibold text-foreground block">Keluhan:</span>
            <p className="text-muted-foreground">{job.issue}</p>
          </div>

          {job.instructions && (
            <div className="rounded-md bg-amber-500/10 border border-amber-500/20 p-2.5 space-y-1 text-amber-900 dark:text-amber-200">
              <span className="font-semibold block flex items-center gap-1">
                <AlertCircle className="h-3.5 w-3.5" /> Instruksi:
              </span>
              <p>{job.instructions}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* SOP Operational Guidelines & Safety Risk */}
      <SopOperationalBanner
        estimatedDuration={serviceConfig?.estimated_duration_minutes}
        riskLevel={serviceConfig?.risk_level as 'low' | 'medium' | 'high' | null}
        sopNotes={serviceConfig?.sop_notes}
        sopMode={serviceConfig?.sop_mode as 'strict' | 'reference' | 'none' | null}
      />

      {/* SOP Checklist Section with Direct 1-Tap Photo Action */}
      <ChecklistSection
        items={checklist || []}
        jobId={job.id}
        photos={photosWithSignedUrls}
        disabled={isLocked || !hasCheckIn}
      />

      {/* Photo Evidence Section (Before / After) */}
      <PhotoUploadSection
        jobId={job.id}
        photos={photosWithSignedUrls}
        disabled={isLocked || !hasCheckIn}
      />

      {/* Customer E-Signature Section */}
      <SignaturePadModal
        jobId={job.id}
        existingSignature={signatureWithSignedUrl}
        disabled={isLocked || !hasCheckIn}
      />

      {/* Work Report Section */}
      <WorkReportForm
        jobId={job.id}
        existingReport={report}
        disabled={isLocked || !hasCheckIn}
        hasCheckIn={hasCheckIn}
      />

      {/* Check-out Lapangan (BOTTOM) - Diposisikan di akhir setelah laporan pengerjaan */}
      {!isLocked && (
        <CheckOutSection
          jobId={job.id}
          attendance={attendanceWithSignedPhoto}
          disabled={isLocked}
          isReadyForCheckout={isReadyForCheckout}
          jobNumber={job.job_number}
          serviceType={job.service_type}
          commissionAmount={jobCommission?.totalCommission}
        />
      )}
    </div>
  )
}
