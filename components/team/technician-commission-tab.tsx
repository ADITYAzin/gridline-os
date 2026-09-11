'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Coins, TrendingUp, Award, DollarSign } from 'lucide-react'
import { formatRupiah, type TechnicianPerformanceMetrics } from '@/lib/commission'
import { TechnicianCommissionDialog } from './technician-commission-dialog'

interface TechnicianCommissionTabProps {
  metrics: TechnicianPerformanceMetrics[]
}

export function TechnicianCommissionTab({ metrics }: TechnicianCommissionTabProps) {
  const totalCommissionAll = metrics.reduce((acc, m) => acc + m.totalCommission, 0)
  const totalBaseCommissionAll = metrics.reduce((acc, m) => acc + m.totalBaseCommission, 0)
  const totalBonusCommissionAll = metrics.reduce((acc, m) => acc + m.totalBonusCommission, 0)
  const totalCompletedAll = metrics.reduce((acc, m) => acc + m.totalCompleted, 0)

  const avgPerJob = totalCompletedAll > 0 ? Math.round(totalCommissionAll / totalCompletedAll) : 0

  return (
    <div className="space-y-6">
      {/* Commission Summary KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm border-primary/30 bg-primary/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-primary uppercase tracking-wider">
              Total Insentif & Komisi
            </CardTitle>
            <Coins className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{formatRupiah(totalCommissionAll)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Akumulasi komisi yang berhak diterima tim
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Komisi Dasar Servis
            </CardTitle>
            <DollarSign className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatRupiah(totalBaseCommissionAll)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Berdasarkan tipe servis pekerjaan tuntas
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Bonus SLA Tepat Waktu
            </CardTitle>
            <Award className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{formatRupiah(totalBonusCommissionAll)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Bonus ekstra pengerjaan sebelum batas waktu
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Rata-rata per Tiket
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatRupiah(avgPerJob)}</div>
            <p className="text-xs text-muted-foreground mt-1">Rata-rata insentif per pekerjaan</p>
          </CardContent>
        </Card>
      </div>

      {/* Commission Table per Technician */}
      <Card className="shadow-sm overflow-hidden">
        <CardHeader className="border-b bg-muted/20 py-4 px-6 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Coins className="h-4 w-4 text-amber-500" />
              Rekapitulasi Komisi Teknisi Lapangan
            </CardTitle>
            <CardDescription className="text-xs mt-0.5">
              Rincian hak komisi per teknisi berdasarkan pekerjaan yang telah lolos verifikasi completion.
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-xs">
            Skema Standar v1.1
          </Badge>
        </CardHeader>

        {metrics.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted-foreground">
            Belum ada teknisi terdaftar untuk dihitung komisinya.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-b border-[#E2E8F0] bg-[#F8FAFC] hover:bg-[#F8FAFC]">
                <TableHead className="h-11 px-4 text-[12px] font-semibold text-[#475569] uppercase tracking-[0.02em]">
                  Nama Teknisi
                </TableHead>
                <TableHead className="h-11 px-4 text-[12px] font-semibold text-[#475569] uppercase tracking-[0.02em] text-center">
                  Job Selesai
                </TableHead>
                <TableHead className="h-11 px-4 text-[12px] font-semibold text-[#475569] uppercase tracking-[0.02em]">
                  Komisi Dasar
                </TableHead>
                <TableHead className="h-11 px-4 text-[12px] font-semibold text-[#475569] uppercase tracking-[0.02em]">
                  Bonus SLA On-Time
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
                      {m.totalCompleted} job
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
    </div>
  )
}
