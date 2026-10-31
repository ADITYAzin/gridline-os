import Link from 'next/link'
import { requireRole } from '@/lib/auth'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  calculateJobCommission,
  formatRupiah,
  formatDuration,
  type CommissionSettings,
} from '@/lib/commission'
import {
  Coins,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  Award,
  ChevronRight,
  Info,
  Clock,
  Briefcase,
} from 'lucide-react'

export default async function TechnicianCommissionsPage() {
  const profile = await requireRole('technician')
  const supabase = await createSupabaseServerClient()

  // Concurrently fetch completed jobs, organization commission config, and company services
  const [
    { data: jobs },
    { data: org },
    { data: services },
  ] = await Promise.all([
    supabase
      .from('jobs')
      .select(`
        id,
        job_number,
        service_type,
        priority,
        status,
        created_at,
        completed_at,
        schedules(start_at, end_at),
        job_attendance(check_in_at)
      `)
      .eq('technician_id', profile.id)
      .eq('status', 'completed')
      .order('completed_at', { ascending: false }),
    supabase
      .from('organizations')
      .select('id, commission_enabled, commission_type, default_commission_rate, on_time_bonus_enabled, on_time_bonus_rate')
      .eq('id', profile.orgId)
      .maybeSingle(),
    supabase
      .from('company_services')
      .select('id, name, commission_rate')
      .eq('org_id', profile.orgId)
      .eq('is_active', true),
  ])

  const completedJobs = jobs || []
  const activeServices = services || []

  // Dynamic commission configuration with safe default Rp 0
  const commissionSettings: CommissionSettings = {
    commission_enabled: org?.commission_enabled ?? false,
    commission_type: (org?.commission_type as 'service_based' | 'flat') || 'service_based',
    default_commission_rate: org?.default_commission_rate != null ? Number(org.default_commission_rate) : 0,
    on_time_bonus_enabled: org?.on_time_bonus_enabled ?? false,
    on_time_bonus_rate: org?.on_time_bonus_rate != null ? Number(org.on_time_bonus_rate) : 0,
    serviceRates: activeServices.reduce((acc, s) => {
      if (s.name) {
        acc[s.name] = s.commission_rate != null ? Number(s.commission_rate) : (Number(org?.default_commission_rate) || 0)
      }
      return acc
    }, {} as Record<string, number>),
  }

  const isEnabled = commissionSettings.commission_enabled

  let totalBaseCommission = 0
  let totalSlaBonus = 0
  let onTimeCount = 0
  let totalMinutes = 0
  let countWithDuration = 0

  const items = completedJobs.map((j) => {
    type SchedType = { start_at: string; end_at: string } | null
    type AttType = { check_in_at: string | null } | null
    const sched = (Array.isArray(j.schedules) ? j.schedules[0] : j.schedules) as SchedType
    const att = (Array.isArray(j.job_attendance) ? j.job_attendance[0] : j.job_attendance) as AttType

    const comm = calculateJobCommission(
      {
        id: j.id,
        job_number: j.job_number,
        service_type: j.service_type,
        status: j.status,
        created_at: j.created_at,
        completed_at: j.completed_at,
        scheduled_end: sched?.end_at,
        check_in_at: att?.check_in_at,
      },
      commissionSettings
    )

    totalBaseCommission += comm.baseCommission
    totalSlaBonus += comm.onTimeBonus
    if (comm.isOnTime) onTimeCount++
    if (comm.durationMinutes != null) {
      totalMinutes += comm.durationMinutes
      countWithDuration++
    }

    return {
      ...j,
      comm,
    }
  })

  const grandTotal = totalBaseCommission + totalSlaBonus
  const averagePerJob = completedJobs.length > 0 ? Math.round(grandTotal / completedJobs.length) : 0
  const onTimeRate = completedJobs.length > 0 ? Math.round((onTimeCount / completedJobs.length) * 100) : 0
  const avgDurationMinutes = countWithDuration > 0 ? Math.round(totalMinutes / countWithDuration) : 0

  return (
    <div className="space-y-4 pb-4">
      {/* Native Tab Screen Header */}
      <header className="flex items-center justify-between gap-3 border-b border-[#E2E8F0] pb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] bg-[#EBF5FC] text-[#007ACC] shadow-2xs">
            {isEnabled ? <Coins className="h-4 w-4" /> : <Award className="h-4 w-4" />}
          </div>
          <div className="min-w-0">
            <h1 className="text-heading-2 font-heading text-[#0F172A] tracking-tight truncate">
              {isEnabled ? 'Insentif & Komisi' : 'Performa & Tugas Selesai'}
            </h1>
            <p className="text-[11px] text-[#475569] truncate">
              {isEnabled
                ? 'Rekap transparan komisi & bonus tiket tuntas Anda'
                : 'Rekap pencapaian tiket selesai dan ketepatan waktu'}
            </p>
          </div>
        </div>
      </header>

      {/* Jika Komisi Nonaktif: Tampilkan Banner Ringkas Gaji Tetap */}
      {!isEnabled && (
        <div className="rounded-[12px] bg-slate-50 border border-[#CBD5E1] p-3.5 text-xs text-[#0F172A] space-y-1.5">
          <div className="flex items-center gap-2 text-[#007ACC] font-bold">
            <ShieldCheck className="h-4 w-4" />
            <span>Mode Gaji Tetap Aktif</span>
          </div>
          <p className="text-[11.5px] text-[#475569] leading-relaxed">
            Perusahaan Anda menggunakan sistem gaji tetap. Halaman ini merekam riwayat tiket yang telah Anda tuntaskan serta kepatuhan jadwal kerja.
          </p>
        </div>
      )}

      {/* Hero Earnings Banner (Hanya jika Komisi Aktif) */}
      {isEnabled && (
        <Card className="border-[#007ACC]/30 bg-gradient-to-br from-[#007ACC] to-[#005A99] text-white shadow-md rounded-[12px] overflow-hidden">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-caption text-white/80 font-medium flex items-center gap-1.5">
                <Coins className="h-4 w-4 text-amber-300" />
                Total Hak Komisi
              </span>
              <span className="text-micro font-semibold bg-white/20 text-white px-2 py-0.5 rounded-full backdrop-blur-xs">
                {commissionSettings.commission_type === 'service_based' ? 'Sesuai Layanan' : 'Tarif Flat'}
              </span>
            </div>

            <div>
              <div className="text-display-1 font-heading text-white tracking-tight font-mono">
                {formatRupiah(grandTotal)}
              </div>
              <p className="text-[11px] text-white/80 mt-0.5">
                Akumulasi dari {completedJobs.length} tiket pekerjaan tuntas
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/20 text-xs">
              <div>
                <span className="text-[10px] text-white/70 block">Komisi Dasar:</span>
                <span className="font-semibold text-white">{formatRupiah(totalBaseCommission)}</span>
              </div>
              <div>
                <span className="text-[10px] text-white/70 block">Bonus Tepat Waktu:</span>
                <span className="font-semibold text-amber-300">+{formatRupiah(totalSlaBonus)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 3 Metric Cards (Tampil di kedua mode) */}
      <div className="grid grid-cols-3 gap-2">
        <Card className="shadow-xs rounded-[10px] p-2.5 text-center bg-white border-[#E2E8F0]">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 mx-auto mb-1" />
          <div className="text-base font-bold text-[#0F172A]">{completedJobs.length}</div>
          <span className="text-[10px] text-[#475569]">Tiket Selesai</span>
        </Card>

        <Card className="shadow-xs rounded-[10px] p-2.5 text-center bg-white border-[#E2E8F0]">
          <ShieldCheck className="h-4 w-4 text-[#007ACC] mx-auto mb-1" />
          <div className="text-base font-bold text-[#0F172A]">{onTimeRate}%</div>
          <span className="text-[10px] text-[#475569]">Tepat Waktu</span>
        </Card>

        <Card className="shadow-xs rounded-[10px] p-2.5 text-center bg-white border-[#E2E8F0]">
          {isEnabled ? (
            <>
              <TrendingUp className="h-4 w-4 text-amber-500 mx-auto mb-1" />
              <div className="text-base font-bold text-[#0F172A] truncate">
                {formatRupiah(averagePerJob)}
              </div>
              <span className="text-[10px] text-[#475569]">Rata-rata/Tiket</span>
            </>
          ) : (
            <>
              <Clock className="h-4 w-4 text-amber-500 mx-auto mb-1" />
              <div className="text-base font-bold text-[#0F172A] truncate">
                {formatDuration(avgDurationMinutes)}
              </div>
              <span className="text-[10px] text-[#475569]">Rata Durasi</span>
            </>
          )}
        </Card>
      </div>

      {/* Info Tips for Technicians (Hanya jika bonus SLA aktif dengan nominal > 0) */}
      {isEnabled && commissionSettings.on_time_bonus_enabled && commissionSettings.on_time_bonus_rate > 0 && (
        <div className="rounded-[8px] bg-[#EBF5FC] border border-[#D0E8F8] p-3 text-xs text-[#0F172A] flex items-start gap-2.5">
          <Info className="h-4 w-4 text-[#007ACC] shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-semibold block text-[#007ACC]">Tips Pendapatan:</span>
            <p className="text-[11px] text-[#475569] leading-relaxed">
              Selesaikan tiket sebelum batas jadwal untuk mendapatkan{' '}
              <strong>Bonus Tepat Waktu ({formatRupiah(commissionSettings.on_time_bonus_rate)})</strong> per tiket.
            </p>
          </div>
        </div>
      )}

      {/* List of Job Items */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-[#475569]">
            {isEnabled ? `Rincian per Tiket (${items.length})` : `Riwayat Tiket Selesai (${items.length})`}
          </span>
        </div>

        {items.length === 0 ? (
          <Card className="text-center p-8 border-dashed bg-white">
            <Briefcase className="h-10 w-10 text-muted-foreground/50 mx-auto mb-2" />
            <CardTitle className="text-sm font-semibold">Belum Ada Tiket Selesai</CardTitle>
            <CardDescription className="text-xs mt-1">
              Selesaikan pekerjaan tiket pertama Anda untuk mulai melihat rekapitulasi.
            </CardDescription>
            <Button asChild className="mt-4 h-8 text-xs font-semibold bg-[#007ACC] hover:bg-[#0062A3]">
              <Link href="/technician">Lihat Jadwal Tugas</Link>
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
                            {isEnabled && job.comm.onTimeBonus > 0 ? '+Bonus SLA' : 'Tepat Waktu'}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 text-muted-foreground">
                            Lewat Waktu
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
                        {job.comm.durationMinutes != null && (
                          <span> • {formatDuration(job.comm.durationMinutes)}</span>
                        )}
                      </div>
                    </div>

                    <div className="text-right shrink-0 flex items-center gap-2">
                      {isEnabled ? (
                        <div>
                          <div className="text-sm font-extrabold text-[#007ACC] font-mono">
                            {formatRupiah(job.comm.totalCommission)}
                          </div>
                          <div className="text-[10px] text-[#475569]">
                            Pokok: {formatRupiah(job.comm.baseCommission)}
                          </div>
                        </div>
                      ) : (
                        <div className="text-right">
                          <Badge variant="secondary" className="text-[10px] font-medium text-emerald-700 bg-emerald-50">
                            Selesai
                          </Badge>
                        </div>
                      )}
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
