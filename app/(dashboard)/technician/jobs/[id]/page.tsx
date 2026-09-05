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
import { ArrowLeft, MapPin, Phone, AlertCircle } from 'lucide-react'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function TechnicianJobDetailPage({ params }: PageProps) {
  const profile = await requireRole('technician')
  const { id } = await params
  const supabase = await createSupabaseServerClient()

  // 1. Fetch Job (guaranteed only technician assigned)
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
      customers(name, phone)
    `)
    .eq('id', id)
    .eq('org_id', profile.orgId)
    .eq('technician_id', profile.id)
    .maybeSingle()

  if (!job) {
    notFound()
  }

  // 2. Fetch Supporting Artifacts
  const [
    { data: attendance },
    { data: checklist },
    { data: photos },
    { data: signature },
    { data: report },
  ] = await Promise.all([
    supabase.from('job_attendance').select('check_in_at, check_out_at').eq('job_id', id).maybeSingle(),
    supabase.from('checklist_items').select('id, item, is_completed').eq('job_id', id).order('created_at', { ascending: true }),
    supabase.from('job_photos').select('id, type, file_url, created_at').eq('job_id', id),
    supabase.from('signatures').select('customer_name, signed_at').eq('job_id', id).maybeSingle(),
    supabase.from('work_reports').select('result, notes, submitted_at').eq('job_id', id).maybeSingle(),
  ])

  const customer = job.customers as unknown as { name: string; phone: string | null } | null
  const isLocked = job.status === 'completed' || job.status === 'cancelled'

  return (
    <div className="space-y-4 pb-12">
      {/* Top Header */}
      <div className="flex items-center gap-3">
        <Button asChild variant="outline" size="sm" className="h-8 w-8 p-0">
          <Link href="/technician">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-sm text-primary">{job.job_number}</span>
            <Badge variant={job.status === 'on_progress' ? 'default' : 'secondary'} className="capitalize text-[10px]">
              {job.status.replace('_', ' ')}
            </Badge>
          </div>
          <h1 className="text-base font-bold truncate">{job.service_type}</h1>
        </div>
      </div>

      {/* GPS Check-in / Check-out Action */}
      {!isLocked && (
        <CheckInButton jobId={job.id} attendance={attendance} />
      )}

      {/* Work Order Info Card */}
      <Card className="shadow-sm">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
            Informasi Pekerjaan & Pelanggan
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-1 space-y-3 text-xs">
          <div>
            <span className="font-semibold text-foreground text-sm block">
              {Array.isArray(customer) ? customer[0]?.name : customer?.name}
            </span>
            {(Array.isArray(customer) ? customer[0]?.phone : customer?.phone) && (
              <div className="flex items-center gap-1 text-muted-foreground mt-0.5">
                <Phone className="h-3 w-3 text-primary" />
                <a href={`tel:${Array.isArray(customer) ? customer[0]?.phone : customer?.phone}`} className="hover:underline">
                  {Array.isArray(customer) ? customer[0]?.phone : customer?.phone}
                </a>
              </div>
            )}
          </div>

          <div className="flex items-start gap-1.5 text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
            <span>{job.address}</span>
          </div>

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
