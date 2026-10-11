import Link from 'next/link'
import { notFound } from 'next/navigation'
import { requireRole } from '@/lib/auth'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { CheckInButton } from './check-in-button'
import { ChecklistSection } from './checklist-section'
import { PhotoUploadSection } from './photo-upload-section'
import { SignaturePadModal } from './signature-pad-modal'
import { WorkReportForm } from './work-report-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, MapPin, AlertCircle, Printer, Wrench, ShieldAlert, Sparkles } from 'lucide-react'
import { TechnicianStatusBadge } from '@/components/technician/status-badge'
import { FiveGateProgress } from '@/components/technician/five-gate-progress'
import { QuickActionTray } from '@/components/technician/quick-action-tray'

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
        customers(name, phone),
        customer_assets(id, asset_name, brand, model_number, serial_number, location_tag, notes)
      `)
      .eq('id', id)
      .eq('org_id', profile.orgId)
      .eq('technician_id', profile.id)
      .maybeSingle(),
    supabase.from('job_attendance').select('check_in_at, check_out_at').eq('job_id', id).maybeSingle(),
    supabase.from('checklist_items').select('id, item, is_completed').eq('job_id', id).order('created_at', { ascending: true }),
    supabase.from('job_photos').select('id, type, file_url, created_at').eq('job_id', id),
    supabase.from('signatures').select('customer_name, signed_at').eq('job_id', id).maybeSingle(),
    supabase.from('work_reports').select('result, notes, submitted_at').eq('job_id', id).maybeSingle(),
  ])

  if (!job) {
    notFound()
  }

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
  } | null
  const asset = (Array.isArray(job.customer_assets) ? job.customer_assets[0] : job.customer_assets) as AssetType
  const isLocked = job.status === 'completed' || job.status === 'cancelled'

  // Calculate 5-Gate Completion State
  const hasCheckIn = Boolean(attendance?.check_in_at)
  const hasChecklistCompleted = (checklist || []).length > 0 && (checklist || []).every((c) => c.is_completed)
  const hasPhotosCompleted =
    (photos || []).some((p) => p.type === 'before') &&
    (photos || []).some((p) => p.type === 'after')
  const hasSignature = Boolean(signature?.signed_at)
  const hasReport = Boolean(report?.submitted_at)

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
              <span className="font-mono font-bold text-xs text-[#007ACC]">{job.job_number}</span>
              <TechnicianStatusBadge status={job.status} />
            </div>
            <h1 className="text-sm font-bold font-heading text-[#0F172A] truncate leading-tight">
              {job.service_type}
            </h1>
          </div>
        </div>
        {job.status === 'completed' && (
          <Button asChild variant="outline" size="sm" className="h-9 px-2.5 gap-1.5 text-xs font-semibold text-[#007ACC] border-[#007ACC]/30 hover:bg-[#EBF5FC] rounded-[8px] shrink-0 touch-press">
            <Link href={`/technician/jobs/${job.id}/bap`} target="_blank">
              <Printer className="h-3.5 w-3.5" />
              <span>BAP</span>
            </Link>
          </Button>
        )}
      </header>

      {/* 5-Gate Visual Readiness Progress */}
      <FiveGateProgress
        hasCheckIn={hasCheckIn}
        hasChecklistCompleted={hasChecklistCompleted}
        hasPhotosCompleted={hasPhotosCompleted}
        hasSignature={hasSignature}
        hasReport={hasReport}
        isCompleted={isLocked}
      />

      {/* GPS Check-in / Check-out Action */}
      {!isLocked && (
        <CheckInButton jobId={job.id} attendance={attendance} />
      )}

      {/* Work Order Info & Quick Navigation Action Card */}
      <Card className="shadow-xs rounded-[12px] bg-white border-[#E2E8F0]">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-xs text-[#475569] uppercase tracking-wider font-semibold">
            Informasi Pelanggan & Lokasi
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-1 space-y-3 text-xs">
          <div className="space-y-1">
            <span className="font-bold text-foreground text-sm block">
              {custName || 'Pelanggan'}
            </span>
            <div className="flex items-start gap-1.5 text-[#475569]">
              <MapPin className="h-3.5 w-3.5 text-[#007ACC] shrink-0 mt-0.5" />
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
            <div className="rounded-[8px] border bg-[#EBF5FC]/60 border-[#D0E8F8] p-3 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#0F172A] flex items-center gap-1.5">
                  <Wrench className="h-4 w-4 text-[#007ACC]" />
                  Unit Target: {asset.asset_name}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-[6px] bg-[#007ACC] text-white">
                  {asset.brand}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-[#475569] bg-white/80 p-2 rounded-[6px] border border-[#E2E8F0]">
                <div>Model: <span className="font-mono font-semibold text-[#0F172A]">{asset.model_number || '-'}</span></div>
                <div>S/N: <span className="font-mono font-semibold text-[#0F172A]">{asset.serial_number || '-'}</span></div>
                {asset.location_tag && (
                  <div className="col-span-2">Lokasi: <span className="font-medium text-[#0F172A]">{asset.location_tag}</span></div>
                )}
              </div>
              {asset.notes && (
                <p className="text-[11px] text-[#475569] italic pt-0.5">
                  Catatan: {asset.notes}
                </p>
              )}
            </div>
          )}

          <div className="rounded-md bg-muted/50 p-2.5 space-y-1">
            <span className="font-semibold text-foreground block">Keluhan Pelanggan:</span>
            <p className="text-muted-foreground">{job.issue}</p>
          </div>

          {job.instructions && (
            <div className="rounded-md bg-amber-500/10 border border-amber-500/20 p-2.5 space-y-1 text-amber-900 dark:text-amber-200">
              <span className="font-semibold block flex items-center gap-1">
                <AlertCircle className="h-3.5 w-3.5" /> Instruksi Khusus:
              </span>
              <p>{job.instructions}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* SOP Checklist Section */}
      <ChecklistSection items={checklist || []} disabled={isLocked} />

      {/* Photo Evidence Section (Before / After) */}
      <PhotoUploadSection jobId={job.id} photos={photos || []} disabled={isLocked} />

      {/* Customer E-Signature Section */}
      <SignaturePadModal jobId={job.id} existingSignature={signature} disabled={isLocked} />

      {/* Work Report Section */}
      <WorkReportForm jobId={job.id} existingReport={report} disabled={isLocked} />
    </div>
  )
}
