import Link from 'next/link'
import { requireRole } from '@/lib/auth'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CalendarDays, Clock, MapPin, Plus, ArrowRight } from 'lucide-react'
import { SlaBadge } from '@/components/jobs/sla-badge'

export default async function DispatchBoardPage() {
  const profile = await requireRole('admin')
  const supabase = await createSupabaseServerClient()

  // Fetch technicians and schedules
  const [{ data: techs }, { data: schedules }] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, name, email')
      .eq('org_id', profile.orgId)
      .eq('role', 'technician')
      .order('name'),
    supabase
      .from('schedules')
      .select(`
        id,
        technician_id,
        start_at,
        end_at,
        jobs(id, job_number, service_type, address, priority, status, completed_at, customers(name))
      `)
      .eq('org_id', profile.orgId)
      .order('start_at', { ascending: true }),
  ])

  const technicianList = techs || []
  const scheduleList = schedules || []

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Visual Dispatch Board</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Visualisasi distribusi jadwal pekerjaan dan ketersediaan teknisi secara terpusat.
          </p>
        </div>
        <Button asChild className="gap-2 font-semibold">
          <Link href="/admin/jobs/new">
            <Plus className="h-4 w-4" />
            + Buat Job Baru
          </Link>
        </Button>
      </div>

      {technicianList.length === 0 ? (
        <Card className="text-center p-12 border-dashed">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-muted-foreground mb-3">
            <CalendarDays className="h-6 w-6" />
          </div>
          <CardTitle className="text-lg">Belum Ada Teknisi Terdaftar</CardTitle>
          <CardDescription className="text-sm max-w-sm mx-auto mt-1 mb-4">
            Undang teknisi pertama Anda agar dapat melihat papan penjadwalan dispatch.
          </CardDescription>
          <Button asChild>
            <Link href="/admin/technicians">Undang Teknisi</Link>
          </Button>
        </Card>
      ) : (
        <div className="space-y-6">
          {technicianList.map((tech) => {
            const techSchedules = scheduleList.filter((s) => s.technician_id === tech.id)

            return (
              <Card key={tech.id} className="shadow-sm overflow-hidden">
                <CardHeader className="bg-muted/30 border-b py-3 px-5 flex flex-row items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-xs">
                      {tech.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <CardTitle className="text-sm font-semibold">{tech.name}</CardTitle>
                      <CardDescription className="text-[11px]">{tech.email}</CardDescription>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {techSchedules.length} Pekerjaan Terjadwal
                  </Badge>
                </CardHeader>
                <CardContent className="p-4">
                  {techSchedules.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic py-2">
                      Tidak ada jadwal aktif untuk teknisi ini. Siap menerima tugas baru.
                    </p>
                  ) : (
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {techSchedules.map((s) => {
                        type JobItem = { id: string; job_number: string; service_type: string; address: string; priority: string; status: string; completed_at: string | null; customers: { name: string } | { name: string }[] | null }
                        const job = s.jobs as unknown as JobItem | null
                        if (!job) return null
                        const customer = job.customers

                        const startDate = new Date(s.start_at)
                        const endDate = new Date(s.end_at)
                        const timeStr = `${startDate.toLocaleTimeString('id-ID', {
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: false,
                        })} - ${endDate.toLocaleTimeString('id-ID', {
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: false,
                        })}`

                        return (
                          <div
                            key={s.id}
                            className="rounded-lg border bg-card p-3.5 space-y-2 hover:border-primary/50 transition-colors"
                          >
                            <div className="flex items-center justify-between gap-1 flex-wrap">
                              <span className="font-mono font-bold text-xs text-primary">{job.job_number}</span>
                              <div className="flex items-center gap-1">
                                <Badge variant="secondary" className="capitalize text-[10px]">
                                  {job.status.replace('_', ' ')}
                                </Badge>
                                <SlaBadge
                                  status={job.status}
                                  scheduledEnd={s.end_at}
                                  completedAt={job.completed_at}
                                />
                              </div>
                            </div>

                            <div>
                              <span className="font-semibold text-xs block">{job.service_type}</span>
                              <span className="text-[11px] text-muted-foreground block truncate">
                                {Array.isArray(customer) ? customer[0]?.name : customer?.name}
                              </span>
                            </div>

                            <div className="pt-1 border-t space-y-1 text-[11px] text-muted-foreground">
                              <div className="flex items-center gap-1.5 font-medium text-foreground">
                                <Clock className="h-3 w-3 text-primary" />
                                <span>
                                  {startDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}, {timeStr}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5 truncate">
                                <MapPin className="h-3 w-3 shrink-0" />
                                <span className="truncate">{job.address}</span>
                              </div>
                            </div>

                            <Button asChild variant="ghost" size="sm" className="w-full h-7 text-xs gap-1 mt-1">
                              <Link href={`/admin/jobs/${job.id}`}>
                                Lihat Detail <ArrowRight className="h-3 w-3" />
                              </Link>
                            </Button>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
