'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Coins, TrendingUp, Award, DollarSign } from 'lucide-react'
import {
  formatRupiah,
  DEFAULT_COMMISSION_SETTINGS,
  type TechnicianPerformanceMetrics,
  type CommissionSettings,
} from '@/lib/commission'
import { TechnicianCommissionDialog } from './technician-commission-dialog'
import { CommissionSettingsDialog, type ServiceCommissionItem } from './commission-settings-dialog'

interface TechnicianCommissionTabProps {
  metrics: TechnicianPerformanceMetrics[]
  settings?: CommissionSettings
  services?: ServiceCommissionItem[]
}

export function TechnicianCommissionTab({
  metrics,
  settings = DEFAULT_COMMISSION_SETTINGS,
  services = [],
}: TechnicianCommissionTabProps) {
  const isEnabled = settings.commission_enabled

  const totalCommissionAll = metrics.reduce((acc, m) => acc + m.totalCommission, 0)
  const totalBaseCommissionAll = metrics.reduce((acc, m) => acc + m.totalBaseCommission, 0)
  const totalBonusCommissionAll = metrics.reduce((acc, m) => acc + m.totalBonusCommission, 0)
  const totalCompletedAll = metrics.reduce((acc, m) => acc + m.totalCompleted, 0)

  const avgPerJob = totalCompletedAll > 0 ? Math.round(totalCommissionAll / totalCompletedAll) : 0

  return (
    <div className="space-y-6">
      {/* Jika Komisi Nonaktif: Tampilkan Banner Inactive State Ramah & Tombol Pengaturan */}
      {!isEnabled ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-1">
            <div>
              <h2 className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
                <Coins className="h-4 w-4 text-[#64748B]" />
                Komisi & Insentif Teknisi
              </h2>
              <p className="text-xs text-[#64748B] mt-0.5">
                Pengelolaan skema komisi tiket dan insentif ketepatan waktu teknisi.
              </p>
            </div>
            <CommissionSettingsDialog settings={settings} services={services} />
          </div>

          <div className="rounded-2xl border border-dashed border-[#CBD5E1] bg-white p-8 sm:p-12 text-center space-y-4 shadow-xs">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EBF5FC] text-[#007ACC] shadow-2xs">
              <Coins className="h-7 w-7" />
            </div>
            <div className="max-w-md mx-auto space-y-1.5">
              <div className="flex items-center justify-center gap-2">
                <h3 className="text-base font-bold text-[#0F172A]">
                  Sistem Komisi Sedang Nonaktif
                </h3>
                <Badge variant="secondary" className="text-[10px] bg-slate-100 text-slate-700">
                  Mode Gaji Tetap
                </Badge>
              </div>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Perusahaan beroperasi dengan sistem gaji tetap. Nominal komisi disembunyikan dari aplikasi teknisi untuk mencegah kesalahpahaman.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-xl mx-auto pt-3 text-left">
              <div className="p-3 rounded-xl border border-[#E2E8F0] bg-slate-50/60">
                <span className="text-[11px] font-bold text-[#0F172A] block">Sesuai Layanan</span>
                <span className="text-[10.5px] text-[#64748B] mt-0.5 block leading-normal">
                  Nominal komisi berbeda per jenis servis di katalog.
                </span>
              </div>
              <div className="p-3 rounded-xl border border-[#E2E8F0] bg-slate-50/60">
                <span className="text-[11px] font-bold text-[#0F172A] block">Tarif Flat</span>
                <span className="text-[10.5px] text-[#64748B] mt-0.5 block leading-normal">
                  Satu tarif komisi seragam untuk setiap tiket selesai.
                </span>
              </div>
              <div className="p-3 rounded-xl border border-[#E2E8F0] bg-slate-50/60">
                <span className="text-[11px] font-bold text-[#0F172A] block">Bonus Tepat Waktu</span>
                <span className="text-[10.5px] text-[#64748B] mt-0.5 block leading-normal">
                  Insentif tambahan saat tiket selesai sebelum jadwal.
                </span>
              </div>
            </div>

            <div className="pt-2">
              <CommissionSettingsDialog settings={settings} services={services} />
            </div>
          </div>
        </div>
      ) : (
        /* Jika Komisi Aktif: Tampilkan KPI Cards & Tabel Rekapitulasi Komisi Dinamis */
        <>
          {/* Header Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
                <Coins className="h-4 w-4 text-[#007ACC]" />
                Komisi & Insentif Teknisi
                <Badge variant="outline" className="text-[10.5px] font-medium text-emerald-700 bg-emerald-50 border-emerald-200">
                  Aktif • {settings.commission_type === 'service_based' ? 'Sesuai Layanan' : 'Tarif Flat'}
                </Badge>
              </h2>
              <p className="text-xs text-[#64748B] mt-0.5">
                Kalkulasi otomatis dari tiket selesai dan ketepatan waktu SLA teknisi.
              </p>
            </div>
            <CommissionSettingsDialog settings={settings} services={services} />
          </div>

          {/* Commission Summary KPI Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="shadow-xs border-primary/30 bg-primary/5">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-xs font-semibold text-primary uppercase tracking-wider">
                  Total Komisi
                </CardTitle>
                <Coins className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{formatRupiah(totalCommissionAll)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Akumulasi hak komisi seluruh teknisi
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-xs">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Komisi Dasar
                </CardTitle>
                <DollarSign className="h-4 w-4 text-slate-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatRupiah(totalBaseCommissionAll)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Dari jenis servis tiket selesai
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-xs">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Bonus Tepat Waktu
                </CardTitle>
                <Award className="h-4 w-4 text-emerald-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-600">{formatRupiah(totalBonusCommissionAll)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Bonus SLA selesai sebelum batas waktu
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-xs">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Rata-rata / Tiket
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-amber-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatRupiah(avgPerJob)}</div>
                <p className="text-xs text-muted-foreground mt-1">Rata-rata pendapatan per pekerjaan</p>
              </CardContent>
            </Card>
          </div>

          {/* Commission Table per Technician */}
          <Card className="shadow-xs overflow-hidden">
            <CardHeader className="border-b bg-muted/20 py-4 px-6 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Coins className="h-4 w-4 text-amber-500" />
                  Rekap Komisi Teknisi
                </CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  Rincian komisi per teknisi dari tiket yang telah selesai.
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-xs">
                {settings.commission_type === 'service_based' ? 'Sesuai Layanan' : 'Tarif Flat'}
              </Badge>
            </CardHeader>

            {metrics.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground">
                Belum ada data teknisi terdaftar.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-[#E2E8F0] bg-[#F8FAFC] hover:bg-[#F8FAFC]">
                    <TableHead className="h-11 px-4 text-[12px] font-semibold text-[#475569] uppercase tracking-[0.02em]">
                      Teknisi
                    </TableHead>
                    <TableHead className="h-11 px-4 text-[12px] font-semibold text-[#475569] uppercase tracking-[0.02em] text-center">
                      Tiket Selesai
                    </TableHead>
                    <TableHead className="h-11 px-4 text-[12px] font-semibold text-[#475569] uppercase tracking-[0.02em]">
                      Komisi Dasar
                    </TableHead>
                    <TableHead className="h-11 px-4 text-[12px] font-semibold text-[#475569] uppercase tracking-[0.02em]">
                      Bonus Tepat Waktu
                    </TableHead>
                    <TableHead className="h-11 px-4 text-[12px] font-semibold text-[#475569] uppercase tracking-[0.02em]">
                      Total Komisi
                    </TableHead>
                    <TableHead className="h-11 px-4 text-[12px] font-semibold text-[#475569] uppercase tracking-[0.02em] text-center">
                      Aksi
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {metrics.map((m) => (
                    <TableRow key={m.technicianId} className="border-b border-[#F1F5F9] hover:bg-[#F8FAFC] transition-colors group">
                      <TableCell className="px-4 py-2 align-middle">
                        <div className="font-semibold text-xs text-[#0F172A]">{m.name}</div>
                        <div className="text-[11px] text-[#64748B]">{m.email}</div>
                      </TableCell>
                      <TableCell className="px-4 py-2 align-middle text-center">
                        <Badge variant="secondary" className="text-xs font-mono">
                          {m.totalCompleted} tiket
                        </Badge>
                      </TableCell>
                      <TableCell className="px-4 py-2 align-middle text-xs">
                        {formatRupiah(m.totalBaseCommission)}
                      </TableCell>
                      <TableCell className="px-4 py-2 align-middle text-xs text-emerald-600 font-medium">
                        +{formatRupiah(m.totalBonusCommission)}
                      </TableCell>
                      <TableCell className="px-4 py-2 align-middle text-xs font-bold text-[#007ACC]">
                        {formatRupiah(m.totalCommission)}
                      </TableCell>
                      <TableCell className="px-4 py-2 align-middle text-center">
                        <div className="flex items-center justify-center">
                          <TechnicianCommissionDialog metrics={m} />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Card>
        </>
      )}
    </div>
  )
}
