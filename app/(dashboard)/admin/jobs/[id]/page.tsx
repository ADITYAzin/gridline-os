import Link from 'next/link'
import { notFound } from 'next/navigation'
import { requireRole } from '@/lib/auth'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { AssignmentCard } from './assignment-card'
import { CancellationDialog } from './cancellation-dialog'
import { CompletionReviewCard } from './completion-review-card'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  ArrowLeft,
  Briefcase,
  Building2,
  CheckCircle2,
  FileText,
  ImageIcon,
  MapPin,
  PenTool,
  Phone,
  Printer,
  ShieldAlert,
  UserCheck,
} from 'lucide-react'
import { WhatsAppActionDialog } from '@/components/whatsapp/whatsapp-action-dialog'
import { SlaBadge } from '@/components/jobs/sla-badge'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function JobDetailPage({ params }: PageProps) {
  const profile = await requireRole('admin')
  const { id } = await params
  const supabase = await createSupabaseServerClient()

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
      cancelled_at,
      cancellation_reason,
      customers(id, name, phone, email, address),
      profiles!jobs_technician_id_fkey(id, name, phone, email)
    `)
    .eq('id', id)
    .eq('org_id', profile.orgId)
    .maybeSingle()

  if (!job) {
    notFound()
  }

  // 2. Fetch Supporting Artifacts in Parallel
  const [
    { data: schedule },
    { data: checklist },
    { data: photos },
    { data: signature },
    { data: report },
    { data: technicians },
  ] = await Promise.all([
    supabase.from('schedules').select('start_at, end_at').eq('job_id', id).maybeSingle(),
    supabase.from('checklist_items').select('*').eq('job_id', id).order('created_at', { ascending: true }),
    supabase.from('job_photos').select('*').eq('job_id', id),
    supabase.from('signatures').select('*').eq('job_id', id).maybeSingle(),
    supabase.from('work_reports').select('*').eq('job_id', id).maybeSingle(),
    supabase.from('profiles').select('id, name').eq('org_id', profile.orgId).eq('role', 'technician').order('name'),
  ])

  const customer = job.customers as unknown as { id: string; name: string; phone: string | null; email: string | null; address: string | null } | null
  const assignedTech = job.profiles as unknown as { id: string; name: string; phone: string | null; email: string | null } | null
  const isLocked = job.status === 'completed' || job.status === 'cancelled'

  const scheduleDateStr = schedule?.start_at
    ? new Date(schedule.start_at).toLocaleDateString('id-ID', { dateStyle: 'long' })
    : undefined
  const scheduleTimeStr = schedule?.start_at && schedule?.end_at
    ? `${new Date(schedule.start_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} - ${new Date(schedule.end_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`
    : undefined

  const beforePhotos = (photos || []).filter((p) => p.type === 'before')
  const afterPhotos = (photos || []).filter((p) => p.type === 'after')
  const completedChecklistCount = (checklist || []).filter((c) => c.is_completed).length
  const totalChecklistCount = (checklist || []).length

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Top Navigation & Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div className="flex items-center gap-3">
          <Button asChild variant="outline" size="sm" className="h-8 w-8 p-0">
            <Link href="/admin/jobs">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-lg font-bold text-primary">{job.job_number}</span>
              <Badge
                variant={
                  job.status === 'completed'
                    ? 'default'
                    : job.status === 'cancelled'
                    ? 'destructive'
                    : 'secondary'
                }
                className="capitalize text-xs font-semibold"
              >
                {job.status.replace('_', ' ')}
              </Badge>
              <Badge variant="outline" className="capitalize text-xs font-semibold">
                Prioritas: {job.priority}
              </Badge>
              <SlaBadge
                status={job.status}
                scheduledEnd={schedule?.end_at}
                completedAt={job.completed_at}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Dibuat pada {new Date(job.created_at).toLocaleDateString('id-ID', { dateStyle: 'long' })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {job.status === 'completed' && (
            <Button asChild variant="outline" size="sm" className="gap-1.5 shadow-sm text-primary border-primary/30 hover:bg-primary/5">
              <Link href={`/admin/jobs/${job.id}/bap`} target="_blank">
                <Printer className="h-4 w-4" />
                Cetak / Unduh BAP
              </Link>
            </Button>
          )}
          {!isLocked && <CancellationDialog jobId={job.id} />}
        </div>
      </div>

      {/* Cancellation Notice if Cancelled */}
      {job.status === 'cancelled' && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4 space-y-1">
          <div className="flex items-center gap-2 text-destructive font-semibold text-sm">
            <ShieldAlert className="h-4 w-4" /> Pekerjaan Dibatalkan
          </div>
          <p className="text-xs text-muted-foreground">
            Alasan: <span className="font-medium text-foreground">{job.cancellation_reason}</span>
          </p>
          {job.cancelled_at && (
            <p className="text-[11px] text-muted-foreground">
              Waktu pembatalan: {new Date(job.cancelled_at).toLocaleString('id-ID')}
            </p>
          )}
        </div>
      )}

      {/* Grid: 2 Cols Left, 1 Col Right */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          {/* Work Order Info */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-primary" />
                Work Order & Kendala Servis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                  Jenis Layanan
                </span>
                <span className="font-semibold text-base">{job.service_type}</span>
              </div>

              <div>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                  Deskripsi Keluhan
                </span>
                <p className="rounded-md bg-muted/40 p-3 text-sm leading-relaxed">{job.issue}</p>
              </div>

              {job.instructions && (
                <div>
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                    Instruksi Khusus
                  </span>
                  <p className="rounded-md bg-amber-500/10 border border-amber-500/20 p-3 text-xs leading-relaxed text-amber-900 dark:text-amber-200">
                    {job.instructions}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* SOP Checklist Status */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  SOP Checklist Lapangan
                </CardTitle>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-muted">
                  {completedChecklistCount} / {totalChecklistCount} Selesai
                </span>
              </div>
              <CardDescription className="text-xs">
                Checklist prosedur wajib diselesaikan teknisi sebelum status dapat menjadi Completed.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {totalChecklistCount === 0 ? (
                <p className="text-xs text-muted-foreground italic">Belum ada item checklist.</p>
              ) : (
                <ul className="space-y-2">
                  {(checklist || []).map((item) => (
                    <li key={item.id} className="flex items-start gap-2.5 text-xs">
                      <div
                        className={`h-4 w-4 rounded border flex items-center justify-center mt-0.5 shrink-0 ${
                          item.is_completed
                            ? 'bg-emerald-500 border-emerald-500 text-white'
                            : 'border-muted-foreground/30 bg-muted/20'
                        }`}
                      >
                        {item.is_completed && <CheckCircle2 className="h-3 w-3" />}
                      </div>
                      <span className={item.is_completed ? 'line-through text-muted-foreground' : 'font-medium'}>
                        {item.item}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          {/* Evidence & Report Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="p-4 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
                <span>Foto Evidence</span>
                <ImageIcon className="h-4 w-4 text-primary" />
              </div>
              <div className="text-lg font-bold">
                {beforePhotos.length} Before / {afterPhotos.length} After
              </div>
              <p className="text-[11px] text-muted-foreground">Minimal 1 each untuk selesai</p>
            </Card>

            <Card className="p-4 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
                <span>E-Signature</span>
                <PenTool className="h-4 w-4 text-primary" />
              </div>
              <div className="text-lg font-bold">
                {signature ? 'Tersedia' : 'Belum Ada'}
              </div>
              <p className="text-[11px] text-muted-foreground">{signature ? signature.customer_name : 'Menunggu tanda tangan'}</p>
            </Card>

            <Card className="p-4 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
                <span>Work Report</span>
                <FileText className="h-4 w-4 text-primary" />
              </div>
              <div className="text-lg font-bold">
                {report ? 'Submitted' : 'Belum Ada'}
              </div>
              <p className="text-[11px] text-muted-foreground">{report ? 'Laporan terkirim' : 'Menunggu teknisi'}</p>
            </Card>
          </div>
        </div>

        {/* Right Sidebar: Customer & Scheduling */}
        <div className="space-y-6">
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-primary" />
                  Informasi Customer
                </CardTitle>
                {customer?.id && (
                  <Link
                    href={`/admin/customers/${customer.id}`}
                    className="text-[11px] text-primary hover:underline font-medium"
                  >
                    Riwayat Servis →
                  </Link>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div>
                <span className="text-[11px] text-muted-foreground block font-medium">Nama Pelanggan</span>
                {customer?.id ? (
                  <Link
                    href={`/admin/customers/${customer.id}`}
                    className="font-semibold text-sm text-foreground hover:text-primary hover:underline"
                  >
                    {customer.name}
                  </Link>
                ) : (
                  <span className="font-semibold text-sm">{customer?.name || '-'}</span>
                )}
              </div>

              {customer?.phone && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Phone className="h-3 w-3 text-primary" />
                    <span>{customer.phone}</span>
                  </div>
                  <a
                    href={`tel:${customer.phone}`}
                    className="text-[10px] text-primary hover:underline font-medium"
                  >
                    Panggil
                  </a>
                </div>
              )}

              <div>
                <span className="text-[11px] text-muted-foreground block font-medium mb-1">Alamat Pengerjaan</span>
                <div className="flex items-start gap-1.5 text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-primary mt-0.5" />
                  <span>{job.address}</span>
                </div>
              </div>

              {customer?.phone && (
                <div className="pt-2 border-t">
                  <WhatsAppActionDialog
                    recipientType="customer"
                    recipientName={customer.name}
                    recipientPhone={customer.phone}
                    templateData={{
                      customerName: customer.name,
                      technicianName: assignedTech?.name,
                      jobNumber: job.job_number,
                      serviceType: job.service_type,
                      address: job.address,
                      scheduleDate: scheduleDateStr,
                      scheduleTime: scheduleTimeStr,
                      issue: job.issue,
                    }}
                    defaultScenario={
                      job.status === 'completed'
                        ? 'customer_completed'
                        : job.status === 'on_progress'
                        ? 'customer_on_the_way'
                        : 'customer_scheduled'
                    }
                    triggerButtonText="WhatsApp Pelanggan"
                    className="w-full justify-center"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Assigned Technician Card (if assigned) */}
          {assignedTech && (
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-primary" />
                  Teknisi Bertugas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div>
                  <span className="text-[11px] text-muted-foreground block font-medium">Nama Teknisi</span>
                  <span className="font-semibold text-sm">{assignedTech.name}</span>
                </div>
                {assignedTech.phone && (
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Phone className="h-3 w-3 text-primary" />
                    <span>{assignedTech.phone}</span>
                  </div>
                )}
                {assignedTech.phone && (
                  <div className="pt-2 border-t">
                    <WhatsAppActionDialog
                      recipientType="technician"
                      recipientName={assignedTech.name}
                      recipientPhone={assignedTech.phone}
                      templateData={{
                        customerName: customer?.name,
                        technicianName: assignedTech.name,
                        jobNumber: job.job_number,
                        serviceType: job.service_type,
                        address: job.address,
                        scheduleDate: scheduleDateStr,
                        scheduleTime: scheduleTimeStr,
                        issue: job.issue,
                      }}
                      defaultScenario="technician_dispatch"
                      triggerButtonText="Kirim Disposisi ke WhatsApp"
                      className="w-full justify-center"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Scheduling Card */}
          <AssignmentCard
            jobId={job.id}
            currentTechId={job.technician_id}
            currentSchedule={schedule}
            technicians={technicians || []}
            isLocked={isLocked}
          />

          {/* Decision #4 Completion Gate Review Card */}
          <CompletionReviewCard
            jobId={job.id}
            status={job.status}
            isChecklistComplete={completedChecklistCount === totalChecklistCount && totalChecklistCount > 0}
            hasBeforePhoto={beforePhotos.length >= 1}
            hasAfterPhoto={afterPhotos.length >= 1}
            hasSignature={Boolean(signature)}
            hasReport={Boolean(report)}
          />
        </div>
      </div>
    </div>
  )
}

