import Link from 'next/link'
import { requireRole } from '@/lib/auth'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { calculateJobCommission, formatRupiah } from '@/lib/commission'
import {
  Coins,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  Award,
  ChevronRight,
  Info,
} from 'lucide-react'

export default async function TechnicianCommissionsPage() {
  const profile = await requireRole('technician')
  const supabase = await createSupabaseServerClient()

  // Fetch all completed jobs for this technician
  const { data: jobs } = await supabase
    .from('jobs')
    .select(`
      id,
      job_number,
      service_type,
      priority,
      status,
      created_at,
      completed_at,
      schedules(start_at, end_at)
    `)
    .eq('technician_id', profile.id)
    .eq('status', 'completed')
    .order('completed_at', { ascending: false })

  const completedJobs = jobs || []

  let totalBaseCommission = 0
  let totalSlaBonus = 0
  let onTimeCount = 0

  const items = completedJobs.map((j) => {
    type SchedType = { start_at: string; end_at: string } | null
    const sched = (Array.isArray(j.schedules) ? j.schedules[0] : j.schedules) as SchedType
    const comm = calculateJobCommission({
      id: j.id,
      job_number: j.job_number,
      service_type: j.service_type,
      status: j.status,
      created_at: j.created_at,
      completed_at: j.completed_at,
      scheduled_end: sched?.end_at,
    })

    totalBaseCommission += comm.baseCommission
    totalSlaBonus += comm.onTimeBonus
    if (comm.isOnTime) onTimeCount++

    return {
      ...j,
      comm,
    }
  })

  const grandTotal = totalBaseCommission + totalSlaBonus
  const averagePerJob = completedJobs.length > 0 ? Math.round(grandTotal / completedJobs.length) : 0
  const onTimeRate = completedJobs.length > 0 ? Math.round((onTimeCount / completedJobs.length) * 100) : 100

  return (
    <div className="space-y-4 pb-4">
      {/* Native Tab Screen Header */}
      <header className="border-b border-[#E2E8F0] pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] bg-[#EBF5FC] text-[#007ACC] shadow-2xs">
            <Coins className="h-4 w-4" />
          </div>
          <div>
            <h1 className="text-heading-2 font-heading text-[#0F172A] tracking-tight">Insentif & Komisi</h1>
            <p className="text-[11px] text-[#475569]">
              Rekap pendapatan transparan atas tiket tuntas Anda
            </p>
          </div>
        </div>
      </header>

      {/* Hero Earnings Banner */}
      <Card className="border-[#007ACC]/30 bg-gradient-to-br from-[#007ACC] to-[#005A99] text-white shadow-md rounded-[12px] overflow-hidden">
        <CardContent className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-caption text-white/80 font-medium flex items-center gap-1.5">
              <Coins className="h-4 w-4 text-amber-300" />
              Total Insentif Terkumpul
            </span>
            <span className="text-micro font-semibold bg-white/20 text-white px-2 py-0.5 rounded-full backdrop-blur-xs">
              Sistem Otomatis
            </span>
          </div>

          <div>
            <div className="text-display-1 font-heading text-white tracking-tight font-mono">
              {formatRupiah(grandTotal)}
            </div>
            <p className="text-[11px] text-white/80 mt-0.5">
              Dari total {completedJobs.length} tiket pekerjaan tuntas
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/20 text-xs">
            <div>
              <span className="text-[10px] text-white/70 block">Komisi Pokok:</span>
              <span className="font-semibold text-white">{formatRupiah(totalBaseCommission)}</span>
            </div>
            <div>
              <span className="text-[10px] text-white/70 block">Bonus SLA On-Time:</span>
              <span className="font-semibold text-amber-300">+{formatRupiah(totalSlaBonus)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-3 gap-2">
        <Card className="shadow-xs rounded-[10px] p-2.5 text-center bg-white border-[#E2E8F0]">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 mx-auto mb-1" />
          <div className="text-base font-bold text-[#0F172A]">{completedJobs.length}</div>
          <span className="text-[10px] text-[#475569]">Job Selesai</span>
        </Card>

        <Card className="shadow-xs rounded-[10px] p-2.5 text-center bg-white border-[#E2E8F0]">
          <ShieldCheck className="h-4 w-4 text-[#007ACC] mx-auto mb-1" />
          <div className="text-base font-bold text-[#0F172A]">{onTimeRate}%</div>
          <span className="text-[10px] text-[#475569]">On-Time SLA</span>
        </Card>

        <Card className="shadow-xs rounded-[10px] p-2.5 text-center bg-white border-[#E2E8F0]">
          <TrendingUp className="h-4 w-4 text-amber-500 mx-auto mb-1" />
          <div className="text-base font-bold text-[#0F172A] truncate">
            {formatRupiah(averagePerJob)}
          </div>
          <span className="text-[10px] text-[#475569]">Rata-rata/Job</span>
        </Card>
      </div>

      {/* Info Tips for Technicians */}
      <div className="rounded-[8px] bg-[#EBF5FC] border border-[#D0E8F8] p-3 text-xs text-[#0F172A] flex items-start gap-2.5">
        <Info className="h-4 w-4 text-[#007ACC] shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-semibold block text-[#007ACC]">Tips Maksimalkan Pendapatan:</span>
          <p className="text-[11px] text-[#475569] leading-relaxed">
            Selesaikan pengerjaan dan submit laporan sebelum batas waktu jadwal untuk mendapatkan <strong>Bonus Ekstra SLA On-Time</strong> pada setiap tiket servis Anda!
          </p>
        </div>
      </div>

      {/* List of Job Commissions */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-[#475569]">
            Rincian Per Pekerjaan ({items.length})
          </span>
        </div>

        {items.length === 0 ? (
          <Card className="text-center p-8 border-dashed bg-white">
            <Award className="h-10 w-10 text-muted-foreground/50 mx-auto mb-2" />
            <CardTitle className="text-sm font-semibold">Belum Ada Riwayat Komisi</CardTitle>
            <CardDescription className="text-xs mt-1">
              Selesaikan tiket pekerjaan servis pertama Anda untuk mulai mengumpulkan komisi & insentif.
            </CardDescription>
            <Button asChild size="sm" className="mt-4 text-xs font-semibold bg-[#007ACC] hover:bg-[#0062A3]">
              <Link href="/technician">Lihat Tugas Aktif</Link>
            </Button>
          </Card>
        ) : (
          <div className="space-y-2">
            {items.map((job) => (
              <Link key={job.id} href={`/technician/jobs/${job.id}`} className="block group touch-press">
                <Card className="shadow-xs hover:border-[#007ACC]/40 active:bg-[#F8FAFC] transition-all rounded-[10px] bg-white border-[#E2E8F0]">
                  <CardContent className="p-3.5 flex items-center justify-between gap-3">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#007ACC]">{job.job_number}</span>
                        {job.comm.isOnTime ? (
                          <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-200 text-[10px] px-1.5 py-0 h-4">
                            +Bonus On-Time
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 text-muted-foreground">
                            Standard
                          </Badge>
                        )}
                      </div>
                      <div className="font-semibold text-xs text-[#0F172A] truncate">
                        {job.service_type}
                      </div>
                      <div className="text-[11px] text-[#475569]">
                        {job.completed_at
                          ? new Date(job.completed_at).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })
                          : '-'}
                      </div>
                    </div>

                    <div className="text-right shrink-0 flex items-center gap-2">
                      <div>
                        <div className="text-sm font-extrabold text-[#007ACC] font-mono">
                          {formatRupiah(job.comm.totalCommission)}
                        </div>
                        <div className="text-[10px] text-[#475569]">
                          Pokok: {formatRupiah(job.comm.baseCommission)}
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-[#007ACC] transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
