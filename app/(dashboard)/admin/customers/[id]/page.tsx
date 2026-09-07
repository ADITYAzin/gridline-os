import Link from 'next/link'
import { notFound } from 'next/navigation'
import { requireRole } from '@/lib/auth'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { WhatsAppActionDialog } from '@/components/whatsapp/whatsapp-action-dialog'
import { SlaBadge } from '@/components/jobs/sla-badge'
import {
  ArrowLeft,
  Building2,
  Phone,
  Mail,
  MapPin,
  Plus,
  Briefcase,
  Printer,
  Eye,
} from 'lucide-react'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function CustomerDetailPage({ params }: PageProps) {
  const profile = await requireRole('admin')
  const { id } = await params
  const supabase = await createSupabaseServerClient()

  // 1. Fetch Customer
  const { data: customer } = await supabase
    .from('customers')
    .select('*')
    .eq('id', id)
    .eq('org_id', profile.orgId)
    .maybeSingle()

  if (!customer) {
    notFound()
  }

  // 2. Fetch Customer's Jobs with technicians and schedules
  const { data: jobs } = await supabase
    .from('jobs')
    .select(`
      id,
      job_number,
      service_type,
      issue,
      priority,
      status,
      address,
      created_at,
      completed_at,
      profiles!jobs_technician_id_fkey(id, name, phone),
      schedules(start_at, end_at)
    `)
    .eq('customer_id', id)
    .eq('org_id', profile.orgId)
    .order('created_at', { ascending: false })

  const jobList = jobs || []

  // Metrics
  const totalJobs = jobList.length
  const completedJobs = jobList.filter((j) => j.status === 'completed').length
  const activeJobs = jobList.filter((j) => j.status === 'on_progress' || j.status === 'assigned').length
  const cancelledJobs = jobList.filter((j) => j.status === 'cancelled').length

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Top Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div className="flex items-center gap-3">
          <Button asChild variant="outline" size="sm" className="h-8 w-8 p-0">
            <Link href="/admin/customers">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">{customer.name}</h1>
              <Badge variant="outline" className="text-xs">
                Klien Terdaftar
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              ID Customer: <span className="font-mono">{customer.id}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {customer.phone && (
            <WhatsAppActionDialog
              recipientType="customer"
              recipientName={customer.name}
              recipientPhone={customer.phone}
              templateData={{
                customerName: customer.name,
                address: customer.address,
              }}
              triggerButtonText="Hubungi WhatsApp"
            />
          )}

          <Button asChild className="gap-1.5 font-semibold" size="sm">
            <Link href={`/admin/jobs/new?customerId=${customer.id}`}>
              <Plus className="h-4 w-4" />
              + Buat Job Baru
            </Link>
          </Button>
        </div>
      </div>

      {/* Customer Info Card & Metric Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="md:col-span-2 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
              <Building2 className="h-4 w-4 text-primary" />
              Detail Kontak & Lokasi
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5 text-xs">
            <div className="flex items-start gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4 shrink-0 text-primary mt-0.5" />
              <span className="text-foreground font-medium">{customer.address}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="h-4 w-4 shrink-0 text-primary" />
              <span className="text-foreground">{customer.phone || '-'}</span>
              {customer.phone && (
                <a
                  href={`tel:${customer.phone}`}
                  className="text-[11px] text-primary hover:underline ml-2"
                >
                  (Panggil)
                </a>
              )}
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="h-4 w-4 shrink-0 text-primary" />
              <span className="text-foreground">{customer.email || '-'}</span>
            </div>
            <p className="text-[11px] text-muted-foreground pt-1 border-t">
              Bergabung sejak: {new Date(customer.created_at).toLocaleDateString('id-ID', { dateStyle: 'long' })}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground">Total Pekerjaan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalJobs}</div>
            <p className="text-[11px] text-muted-foreground mt-1">
              {completedJobs} selesai dari total {totalJobs} tiket
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground">Status Aktif / Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{activeJobs}</div>
            <p className="text-[11px] text-muted-foreground mt-1">
              {cancelledJobs} tiket dibatalkan
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Service History Table */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-primary" />
                Riwayat Servis Pelanggan (Service History)
              </CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Daftar semua riwayat penugasan, perbaikan, dan pemeliharaan untuk customer ini.
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-xs">
              {jobList.length} Catatan
            </Badge>
          </div>
        </CardHeader>

        {jobList.length === 0 ? (
          <div className="p-8 text-center border-t border-dashed">
            <p className="text-xs text-muted-foreground mb-3">
              Customer ini belum memiliki riwayat pekerjaan servis.
            </p>
            <Button asChild size="sm" variant="outline">
              <Link href={`/admin/jobs/new?customerId=${customer.id}`}>
                Jadwalkan Job Pertama
              </Link>
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">No. Tiket</TableHead>
                <TableHead>Layanan & Keluhan</TableHead>
                <TableHead>Teknisi</TableHead>
                <TableHead>Jadwal / Tanggal</TableHead>
                <TableHead>Status & SLA</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobList.map((j) => {
                type TechType = { id: string; name: string; phone: string | null } | null
                const tech = j.profiles as unknown as TechType
                type ScheduleType = { start_at: string; end_at: string } | null
                const sched = (Array.isArray(j.schedules) ? j.schedules[0] : j.schedules) as ScheduleType

                return (
                  <TableRow key={j.id}>
                    <TableCell className="font-mono font-semibold text-primary">
                      <Link href={`/admin/jobs/${j.id}`} className="hover:underline">
                        {j.job_number}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-xs">{j.service_type}</div>
                      <div className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                        {j.issue}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs">
                      {tech ? tech.name : <span className="text-muted-foreground italic">Belum ditugaskan</span>}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {sched ? (
                        <div>
                          <div>{new Date(sched.start_at).toLocaleDateString('id-ID')}</div>
                          <div className="text-[10px]">
                            {new Date(sched.start_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} - {new Date(sched.end_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      ) : (
                        new Date(j.created_at).toLocaleDateString('id-ID')
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1 items-start">
                        <Badge
                          variant={
                            j.status === 'completed'
                              ? 'default'
                              : j.status === 'cancelled'
                              ? 'destructive'
                              : 'secondary'
                          }
                          className="capitalize text-[10px]"
                        >
                          {j.status.replace('_', ' ')}
                        </Badge>
                        <SlaBadge
                          status={j.status}
                          scheduledEnd={sched?.end_at}
                          completedAt={j.completed_at}
                        />
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {j.status === 'completed' && (
                          <Button asChild variant="outline" size="sm" className="h-7 px-2 text-[11px] gap-1">
                            <Link href={`/admin/jobs/${j.id}/bap`} target="_blank">
                              <Printer className="h-3 w-3" />
                              BAP
                            </Link>
                          </Button>
                        )}
                        <Button asChild variant="ghost" size="sm" className="h-7 w-7 p-0">
                          <Link href={`/admin/jobs/${j.id}`}>
                            <Eye className="h-3.5 w-3.5" />
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  )
}
