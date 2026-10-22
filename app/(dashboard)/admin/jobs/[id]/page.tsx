import Link from 'next/link'
import { notFound } from 'next/navigation'
import { requireRole } from '@/lib/auth'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { STORAGE } from '@/lib/constants'
import { AssignmentCard } from './assignment-card'
import { CancellationDialog } from './cancellation-dialog'
import { CompletionReviewCard } from './completion-review-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
  ShieldCheck,
  UserCheck,
  Wrench,
  ExternalLink,
  Clock,
  Sparkles,
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

  // 1. Fetch Job and Supporting Artifacts in Parallel (Eliminate Waterfall)
  const [
    { data: job },
    { data: schedule },
    { data: checklist },
    { data: photos },
    { data: signature },
    { data: report },
    { data: technicians },
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
        cancelled_at,
        cancellation_reason,
        customers(id, name, phone, email, address),
        customer_assets(id, asset_name, brand, model_number, serial_number, location_tag, warranty_expires_at, status),
        profiles!jobs_technician_id_fkey(id, name, phone, email)
      `)
      .eq('id', id)
      .eq('org_id', profile.orgId)
      .maybeSingle(),
    supabase.from('schedules').select('start_at, end_at').eq('job_id', id).maybeSingle(),
    supabase.from('checklist_items').select('*').eq('job_id', id).order('created_at', { ascending: true }),
    supabase.from('job_photos').select('*').eq('job_id', id),
    supabase.from('signatures').select('*').eq('job_id', id).maybeSingle(),
    supabase.from('work_reports').select('*').eq('job_id', id).maybeSingle(),
    supabase.from('profiles').select('id, name').eq('org_id', profile.orgId).eq('role', 'technician').order('name'),
  ])

  if (!job) {
    notFound()
  }

  const customer = job.customers as unknown as { id: string; name: string; phone: string | null; email: string | null; address: string | null } | null
  const assignedTech = job.profiles as unknown as { id: string; name: string; phone: string | null; email: string | null } | null
  type AssetType = {
    id: string
    asset_name: string
    brand: string
    model_number: string | null
    serial_number: string | null
    location_tag: string | null
    warranty_expires_at: string | null
    status: string
  } | null
  const asset = (Array.isArray(job.customer_assets) ? job.customer_assets[0] : job.customer_assets) as AssetType
  const isLocked = job.status === 'completed' || job.status === 'cancelled'

  const scheduleDateStr = schedule?.start_at
    ? new Date(schedule.start_at).toLocaleDateString('id-ID', { dateStyle: 'long' })
    : undefined
  const scheduleTimeStr = schedule?.start_at && schedule?.end_at
    ? `${new Date(schedule.start_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} - ${new Date(schedule.end_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`
    : undefined

  const admin = getSupabaseAdmin()

  // Generate signed URLs for before/after photos (valid 2 hours)
  const photosWithSignedUrls = await Promise.all(
    (photos || []).map(async (photo) => {
      let displayUrl = photo.file_url
      if (
        !photo.file_url.startsWith('http://') &&
        !photo.file_url.startsWith('https://') &&
        !photo.file_url.startsWith('data:image')
      ) {
        try {
          const { data } = await admin.storage
            .from(STORAGE.jobFilesBucket)
            .createSignedUrl(photo.file_url, 7200)
          if (data?.signedUrl) {
            displayUrl = data.signedUrl
          }
        } catch {
          // fallback to raw path
        }
      }
      return {
        ...photo,
        display_url: displayUrl,
      }
    })
  )

  const beforePhotos = photosWithSignedUrls.filter((p) => p.type === 'before')
  const afterPhotos = photosWithSignedUrls.filter((p) => p.type === 'after')

  // Generate signed URL for customer signature
  let signatureWithSignedUrl: { customer_name: string; display_url: string; signed_at: string } | null = null
  if (signature) {
    let displayUrl = signature.signature_url
    if (
      !signature.signature_url.startsWith('http://') &&
      !signature.signature_url.startsWith('https://') &&
      !signature.signature_url.startsWith('data:image')
    ) {
      try {
        const { data: sigData } = await admin.storage
          .from(STORAGE.jobFilesBucket)
          .createSignedUrl(signature.signature_url, 7200)
        if (sigData?.signedUrl) {
          displayUrl = sigData.signedUrl
        }
      } catch {
        // fallback to raw path
      }
    }
    signatureWithSignedUrl = {
      customer_name: signature.customer_name,
      display_url: displayUrl,
      signed_at: signature.signed_at,
    }
  }

  const completedChecklistCount = (checklist || []).filter((c) => c.is_completed).length
  const totalChecklistCount = (checklist || []).length

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Top Navigation & Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div className="flex items-center gap-3">
          <Button asChild variant="outline" size="sm" className="h-8 w-8 p-0 cursor-pointer">
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
                Prioritas {job.priority}
              </Badge>
              <SlaBadge
                status={job.status}
                scheduledEnd={schedule?.end_at}
                completedAt={job.completed_at}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Dibuat {new Date(job.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {job.status === 'completed' && (
            <Button asChild variant="outline" size="sm" className="gap-1.5 shadow-2xs text-primary border-primary/30 hover:bg-primary/5 cursor-pointer">
              <Link href={`/admin/jobs/${job.id}/bap`} target="_blank">
                <Printer className="h-4 w-4" />
                Cetak BAP
              </Link>
            </Button>
          )}
          {!isLocked && <CancellationDialog jobId={job.id} />}
        </div>
      </div>

      {/* Cancellation Notice if Cancelled */}
      {job.status === 'cancelled' && (
        <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-4 space-y-1">
          <div className="flex items-center gap-2 text-destructive font-semibold text-sm">
            <ShieldAlert className="h-4 w-4" /> Pekerjaan Dibatalkan
          </div>
          <p className="text-xs text-muted-foreground">
            Alasan: <span className="font-medium text-foreground">{job.cancellation_reason}</span>
          </p>
          {job.cancelled_at && (
            <p className="text-[11px] text-muted-foreground">
              Waktu: {new Date(job.cancelled_at).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })} WIB
            </p>
          )}
        </div>
      )}

      {/* Grid: 2 Cols Left, 1 Col Right */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          {/* Work Order Info */}
          <Card className="shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-primary" />
                Detail Pekerjaan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider block mb-1">
                  Layanan
                </span>
                <span className="font-semibold text-base">{job.service_type}</span>
              </div>

              {asset && (
                <div className="rounded-xl border bg-muted/30 p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <Wrench className="h-3.5 w-3.5 text-primary" />
                      Aset Unit
                    </span>
                    <Badge variant="outline" className="text-[10px] capitalize">
                      {asset.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                    <div>
                      <span className="text-[10px] text-muted-foreground block">Unit</span>
                      <span className="font-semibold text-foreground">{asset.asset_name}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground block">Model</span>
                      <span className="font-medium text-foreground">
                        {asset.brand} {asset.model_number ? `(${asset.model_number})` : ''}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground block">No. Seri</span>
                      <span className="font-mono text-foreground">{asset.serial_number || '-'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground block">Lokasi</span>
                      <span className="text-foreground">{asset.location_tag || '-'}</span>
                    </div>
                  </div>
                  {asset.warranty_expires_at && (
                    <div className="pt-2 border-t flex items-center gap-1.5 text-[11px]">
                      {new Date(asset.warranty_expires_at) >= new Date() ? (
                        <span className="text-emerald-600 flex items-center gap-1 font-medium">
                          <ShieldCheck className="h-3.5 w-3.5" /> Garansi aktif s/d {new Date(asset.warranty_expires_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      ) : (
                        <span className="text-rose-600 flex items-center gap-1">
                          <ShieldAlert className="h-3.5 w-3.5" /> Garansi habis ({new Date(asset.warranty_expires_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })})
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div>
                <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider block mb-1">
                  Keluhan
                </span>
                <p className="rounded-xl bg-muted/40 p-3.5 text-sm leading-relaxed">{job.issue}</p>
              </div>

              {job.instructions && (
                <div>
                  <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider block mb-1">
                    Instruksi
                  </span>
                  <p className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-3 text-xs leading-relaxed text-amber-900 dark:text-amber-200">
                    {job.instructions}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* SOP Checklist Status */}
          <Card className="shadow-xs">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  Checklist SOP
                </CardTitle>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-muted">
                  {completedChecklistCount} / {totalChecklistCount} Selesai
                </span>
              </div>
            </CardHeader>
            <CardContent>
              {totalChecklistCount === 0 ? (
                <p className="text-xs text-muted-foreground italic">Belum ada checklist.</p>
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

          {/* Foto Pekerjaan (Before & After) */}
          <Card className="shadow-xs rounded-2xl border overflow-hidden">
            <CardHeader className="pb-3 border-b bg-muted/20">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-primary" />
                  Foto Pekerjaan
                </CardTitle>
                <div className="flex items-center gap-1.5">
                  <Badge
                    variant="outline"
                    className={`text-[10px] font-semibold px-2 py-0.5 ${
                      beforePhotos.length > 0
                        ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                        : 'bg-amber-500/10 text-amber-600 border-amber-500/30'
                    }`}
                  >
                    {beforePhotos.length} Sebelum
                  </Badge>
                  <Badge
                    variant="outline"
                    className={`text-[10px] font-semibold px-2 py-0.5 ${
                      afterPhotos.length > 0
                        ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                        : 'bg-amber-500/10 text-amber-600 border-amber-500/30'
                    }`}
                  >
                    {afterPhotos.length} Sesudah
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* BEFORE PHOTOS COLUMN */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b pb-2">
                    <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-amber-500" />
                      Sebelum
                    </span>
                    <span className="text-[11px] text-muted-foreground font-mono">
                      {beforePhotos.length} Foto
                    </span>
                  </div>

                  {beforePhotos.length === 0 ? (
                    <div className="rounded-xl border border-dashed p-8 text-center bg-muted/20 text-xs text-muted-foreground flex flex-col items-center justify-center gap-2">
                      <ImageIcon className="h-5 w-5 text-muted-foreground/40" />
                      <span>Belum ada foto sebelum.</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      {beforePhotos.map((p, idx) => (
                        <a
                          key={p.id}
                          href={p.display_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group relative aspect-4/3 rounded-xl border border-border/80 overflow-hidden bg-muted/40 shadow-2xs block"
                        >
                          <img
                            src={p.display_url}
                            alt={`Foto Sebelum #${idx + 1}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white text-xs font-medium">
                            <ExternalLink className="h-4 w-4" />
                            <span>Lihat Foto</span>
                          </div>
                          <span className="absolute bottom-1.5 left-1.5 text-[10px] font-mono bg-black/60 text-white px-1.5 py-0.5 rounded backdrop-blur-xs">
                            Sebelum #{idx + 1}
                          </span>
                        </a>
                      ))}
                    </div>
                  )}
                </div>

                {/* AFTER PHOTOS COLUMN */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b pb-2">
                    <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      Sesudah
                    </span>
                    <span className="text-[11px] text-muted-foreground font-mono">
                      {afterPhotos.length} Foto
                    </span>
                  </div>

                  {afterPhotos.length === 0 ? (
                    <div className="rounded-xl border border-dashed p-8 text-center bg-muted/20 text-xs text-muted-foreground flex flex-col items-center justify-center gap-2">
                      <ImageIcon className="h-5 w-5 text-muted-foreground/40" />
                      <span>Belum ada foto sesudah.</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      {afterPhotos.map((p, idx) => (
                        <a
                          key={p.id}
                          href={p.display_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group relative aspect-4/3 rounded-xl border border-border/80 overflow-hidden bg-muted/40 shadow-2xs block"
                        >
                          <img
                            src={p.display_url}
                            alt={`Foto Sesudah #${idx + 1}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white text-xs font-medium">
                            <ExternalLink className="h-4 w-4" />
                            <span>Lihat Foto</span>
                          </div>
                          <span className="absolute bottom-1.5 left-1.5 text-[10px] font-mono bg-black/60 text-white px-1.5 py-0.5 rounded backdrop-blur-xs">
                            Sesudah #{idx + 1}
                          </span>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer E-Signature Display */}
          <Card className="shadow-xs rounded-2xl border overflow-hidden">
            <CardHeader className="pb-3 border-b bg-muted/20">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <PenTool className="h-4 w-4 text-primary" />
                  Tanda Tangan Pelanggan
                </CardTitle>
                {signatureWithSignedUrl ? (
                  <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-600 border-emerald-500/30 gap-1 font-semibold">
                    <CheckCircle2 className="h-3 w-3" /> Terverifikasi
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-xs text-amber-600 border-amber-500/30 bg-amber-500/10 font-semibold">
                    Belum Ada
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-5">
              {signatureWithSignedUrl ? (
                <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-xl border bg-card/60">
                  {/* Signature Visual Canvas Card */}
                  <div className="w-full sm:w-60 h-28 rounded-xl border border-border bg-white dark:bg-slate-950 p-3 flex items-center justify-center shrink-0 shadow-2xs">
                    <img
                      src={signatureWithSignedUrl.display_url}
                      alt={`Tanda tangan ${signatureWithSignedUrl.customer_name}`}
                      className="h-full w-auto max-w-full object-contain filter contrast-125 select-none"
                    />
                  </div>

                  {/* Signature Metadata */}
                  <div className="space-y-2 flex-1 min-w-0 text-center sm:text-left">
                    <div>
                      <span className="text-[11px] text-muted-foreground block font-medium">Penandatangan</span>
                      <span className="text-sm font-bold text-foreground block mt-0.5">
                        {signatureWithSignedUrl.customer_name}
                      </span>
                    </div>

                    <div>
                      <span className="text-[11px] text-muted-foreground block font-medium">Waktu</span>
                      <span className="text-xs font-semibold text-muted-foreground block mt-0.5 font-mono">
                        {new Date(signatureWithSignedUrl.signed_at).toLocaleString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}{' '}
                        WIB
                      </span>
                    </div>

                    <div className="pt-0.5">
                      <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Tersimpan dalam Berita Acara Pekerjaan (BAP).
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed p-8 text-center bg-muted/20 text-xs text-muted-foreground flex flex-col items-center justify-center gap-2">
                  <PenTool className="h-5 w-5 text-muted-foreground/40" />
                  <span>Belum ada tanda tangan pelanggan.</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Work Report Section (if submitted) */}
          {report && (
            <Card className="shadow-xs rounded-2xl border overflow-hidden">
              <CardHeader className="pb-3 border-b bg-muted/20">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    Laporan Pekerjaan
                  </CardTitle>
                  <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-600 border-emerald-500/30 font-semibold">
                    Terkirim
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-5 space-y-3 text-xs">
                {report.result && (
                  <div>
                    <span className="font-semibold text-muted-foreground block text-[11px]">Tindakan:</span>
                    <p className="mt-1 p-3 rounded-lg bg-muted/30 border leading-relaxed text-foreground whitespace-pre-wrap">
                      {report.result}
                    </p>
                  </div>
                )}
                {report.notes && (
                  <div>
                    <span className="font-semibold text-muted-foreground block text-[11px]">Catatan:</span>
                    <p className="mt-1 p-3 rounded-lg bg-muted/30 border leading-relaxed text-muted-foreground whitespace-pre-wrap">
                      {report.notes}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Sidebar: Customer & Scheduling */}
        <div className="space-y-6">
          <Card className="shadow-xs">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-primary" />
                  Pelanggan
                </CardTitle>
                {customer?.id && (
                  <Link
                    href={`/admin/customers/${customer.id}`}
                    className="text-[11px] text-primary hover:underline font-medium"
                  >
                    Riwayat →
                  </Link>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div>
                <span className="text-[11px] text-muted-foreground block font-medium">Nama</span>
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
                <span className="text-[11px] text-muted-foreground block font-medium mb-1">Alamat</span>
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
            <Card className="shadow-xs">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-primary" />
                  Teknisi
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div>
                  <span className="text-[11px] text-muted-foreground block font-medium">Nama</span>
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
                      triggerButtonText="WhatsApp Teknisi"
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

