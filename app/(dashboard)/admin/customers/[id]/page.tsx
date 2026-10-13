import Link from 'next/link'
import { notFound } from 'next/navigation'
import { requireRole } from '@/lib/auth'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { WhatsAppActionDialog } from '@/components/whatsapp/whatsapp-action-dialog'
import { SlaBadge } from '@/components/jobs/sla-badge'
import { CustomerAssetsTab } from '@/components/customers/customer-assets-tab'
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
  Wrench,
  Calendar,
  Clock,
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

  // 3. Fetch Customer's Assets
  const { data: assets } = await supabase
    .from('customer_assets')
    .select('*')
    .eq('customer_id', id)
    .eq('org_id', profile.orgId)
    .order('created_at', { ascending: false })

  const assetList = assets || []

  // Metrics
  const totalJobs = jobList.length
  const completedJobs = jobList.filter((j) => j.status === 'completed').length
  const activeJobs = jobList.filter((j) => j.status === 'on_progress' || j.status === 'assigned').length
  const totalAssets = assetList.length

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Top Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-4">
        <div className="flex items-center gap-3">
          <Button asChild variant="outline" size="sm" className="h-8 w-8 p-0 rounded-[8px] border-[#E2E8F0]">
            <Link href="/admin/customers">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-heading text-2xl font-bold tracking-tight text-[#0F172A]">{customer.name}</h1>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              ID Customer: <span className="font-mono text-[#475569]">{customer.id}</span>
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
              className="rounded-[8px] h-8 text-xs"
            />
          )}

          <Button asChild className="gap-2 font-medium bg-[#007ACC] hover:bg-[#0062A3] rounded-[8px] h-8 text-xs shadow-[0_1px_2px_0_rgba(0,122,204,0.15)]">
            <Link href={`/admin/jobs/new?customerId=${customer.id}`}>
              <Plus className="h-4 w-4" />
              Buat Job Baru
            </Link>
          </Button>
        </div>
      </div>

      {/* Customer Info Card & Metric Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="md:col-span-2 rounded-[12px] border border-[#E2E8F0] bg-[#FFFFFF] shadow-[0_1px_3px_0_rgba(15,23,42,0.03),0_1px_2px_0_rgba(15,23,42,0.02)]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
              <Building2 className="h-4 w-4 text-[#007ACC]" />
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

        <Card className="rounded-[12px] border border-[#E2E8F0] bg-[#FFFFFF] shadow-[0_1px_3px_0_rgba(15,23,42,0.03),0_1px_2px_0_rgba(15,23,42,0.02)]">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground">Unit Aset Pelanggan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{totalAssets}</div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Unit aset terdaftar
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-[12px] border border-[#E2E8F0] bg-[#FFFFFF] shadow-[0_1px_3px_0_rgba(15,23,42,0.03),0_1px_2px_0_rgba(15,23,42,0.02)]">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground">Status Pekerjaan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#007ACC]">{activeJobs}</div>
            <p className="text-[11px] text-muted-foreground mt-1">
              {completedJobs} selesai / {totalJobs} total tiket
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs: Assets & Equipment and Service History */}
      <Tabs defaultValue="assets" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 sm:w-[400px] border border-[#E2E8F0] bg-[#F1F5F9] rounded-[8px] h-8 p-0.5">
          <TabsTrigger value="assets" className="gap-2 text-xs rounded-[6px]">
            <Wrench className="h-3.5 w-3.5" />
            Unit Aset Pelanggan ({totalAssets})
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2 text-xs rounded-[6px]">
            <Briefcase className="h-3.5 w-3.5" />
            Riwayat Servis ({totalJobs})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="assets" className="mt-0">
          <CustomerAssetsTab
            customerId={customer.id}
            customerName={customer.name}
            assets={assetList}
          />
        </TabsContent>

        <TabsContent value="history" className="mt-0">
          <Card className="rounded-[12px] border border-[#E2E8F0] bg-[#FFFFFF] shadow-[0_1px_3px_0_rgba(15,23,42,0.03),0_1px_2px_0_rgba(15,23,42,0.02)] overflow-hidden">
            <CardHeader className="pb-3 border-b border-[#F1F5F9]">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-[#007ACC]" />
                    Riwayat Servis Pelanggan (Service History)
                  </CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    Daftar semua riwayat penugasan, perbaikan, dan pemeliharaan untuk customer ini.
                  </CardDescription>
                </div>
                <Badge variant="outline" className="text-xs border-[#E2E8F0] text-[#475569]">
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
                  <TableRow className="border-b border-[#E2E8F0] bg-[#F8FAFC] hover:bg-[#F8FAFC]">
                    <TableHead className="h-11 px-4 text-[12px] font-semibold text-[#475569] uppercase tracking-[0.02em] w-[120px]">
                      No. Tiket
                    </TableHead>
                    <TableHead className="h-11 px-4 text-[12px] font-semibold text-[#475569] uppercase tracking-[0.02em]">
                      Layanan & Keluhan
                    </TableHead>
                    <TableHead className="h-11 px-4 text-[12px] font-semibold text-[#475569] uppercase tracking-[0.02em]">
                      Teknisi
                    </TableHead>
                    <TableHead className="h-11 px-4 text-[12px] font-semibold text-[#475569] uppercase tracking-[0.02em]">
                      Jadwal / Tanggal
                    </TableHead>
                    <TableHead className="h-11 px-4 text-[12px] font-semibold text-[#475569] uppercase tracking-[0.02em]">
                      Status & SLA
                    </TableHead>
                    <TableHead className="h-11 px-4 text-[12px] font-semibold text-[#475569] uppercase tracking-[0.02em] text-center">
                      Aksi
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jobList.map((j) => {
                    type TechType = { id: string; name: string; phone: string | null } | null
                    const tech = j.profiles as unknown as TechType
                    type ScheduleType = { start_at: string; end_at: string } | null
                    const sched = (Array.isArray(j.schedules) ? j.schedules[0] : j.schedules) as ScheduleType

                    return (
                      <TableRow key={j.id} className="border-b border-[#F1F5F9] hover:bg-[#F8FAFC] transition-colors group">
                        <TableCell className="px-4 py-2 align-middle font-mono font-semibold text-primary">
                          <Link href={`/admin/jobs/${j.id}`} className="hover:underline">
                            {j.job_number}
                          </Link>
                        </TableCell>
                        <TableCell className="px-4 py-2 align-middle">
                          <div className="font-medium text-xs text-[#0F172A]">{j.service_type}</div>
                          <div className="text-[11px] text-[#64748B] line-clamp-1 mt-0.5">
                            {j.issue}
                          </div>
                        </TableCell>
                        <TableCell className="px-4 py-2 align-middle text-xs">
                          {tech ? tech.name : <span className="text-[#94A3B8] italic">Belum ditugaskan</span>}
                        </TableCell>
                        <TableCell className="px-4 py-2 align-middle">
                          {sched?.start_at ? (
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#0F172A]">
                                <Calendar className="h-3.5 w-3.5 text-[#007ACC] shrink-0" />
                                <span>
                                  {new Date(sched.start_at).toLocaleDateString('id-ID', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                  })}
                                </span>
                              </div>
                              <div className="flex items-center gap-1 text-[11px] text-[#64748B]">
                                <Clock className="h-3 w-3 text-[#94A3B8] shrink-0" />
                                <span>
                                  {new Date(sched.start_at).toLocaleTimeString('id-ID', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                  {sched.end_at
                                    ? ` - ${new Date(sched.end_at).toLocaleTimeString('id-ID', {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                      })}`
                                    : ''}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-0.5">
                              <span className="text-xs text-[#94A3B8] italic block">Belum dijadwalkan</span>
                              <span className="text-[10px] text-[#94A3B8] block">
                                Dibuat: {new Date(j.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                              </span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="px-4 py-2 align-middle">
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
                        <TableCell className="px-4 py-2 align-middle text-center">
                          <div className="flex items-center justify-center gap-2">
                            {j.status === 'completed' && (
                              <Link
                                href={`/admin/jobs/${j.id}/bap`}
                                target="_blank"
                                title="Cetak BAP"
                                className="h-8 w-8 rounded-[8px] border border-[#E2E8F0] hover:bg-primary hover:text-white text-[#64748B] transition-colors flex items-center justify-center shrink-0"
                              >
                                <Printer className="h-3.5 w-3.5" />
                              </Link>
                            )}
                            <Link
                              href={`/admin/jobs/${j.id}`}
                              title="Lihat Detail"
                              className="h-8 w-8 rounded-[8px] border border-[#E2E8F0] hover:bg-primary hover:text-white text-[#64748B] transition-colors flex items-center justify-center shrink-0"
                            >
                              <Eye className="h-4 w-4" />
                            </Link>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
