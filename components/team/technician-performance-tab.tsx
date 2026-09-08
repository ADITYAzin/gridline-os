'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Trophy, CheckCircle2, Clock, Users, Flame } from 'lucide-react'
import { formatDuration, type TechnicianPerformanceMetrics } from '@/lib/commission'

interface TechnicianPerformanceTabProps {
  metrics: TechnicianPerformanceMetrics[]
}

export function TechnicianPerformanceTab({ metrics }: TechnicianPerformanceTabProps) {
  const totalCompletedAll = metrics.reduce((acc, m) => acc + m.totalCompleted, 0)
  const totalAssignedAll = metrics.reduce((acc, m) => acc + m.totalAssigned, 0)
  const averageSla =
    metrics.length > 0
      ? Math.round(metrics.reduce((acc, m) => acc + m.onTimeRate, 0) / metrics.length)
      : 100

  // Sorted by total completed descending
  const sortedByCompleted = [...metrics].sort((a, b) => b.totalCompleted - a.totalCompleted)
  const topPerformer = sortedByCompleted[0]

  return (
    <div className="space-y-6">
      {/* Executive KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Job Diselesaikan
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCompletedAll}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Dari total {totalAssignedAll} tiket yang ditugaskan
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Rata-rata SLA On-Time
            </CardTitle>
            <Clock className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageSla}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Tingkat penyelesaian sebelum batas waktu
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Teknisi Teraktif
            </CardTitle>
            <Trophy className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold truncate">
              {topPerformer && topPerformer.totalCompleted > 0 ? topPerformer.name : '-'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {topPerformer && topPerformer.totalCompleted > 0
                ? `${topPerformer.totalCompleted} job tuntas (${topPerformer.onTimeRate}% on-time)`
                : 'Belum ada data'}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Teknisi
            </CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Pekerja lapangan terdaftar</p>
          </CardContent>
        </Card>
      </div>

      {/* Leaderboard & Detailed Table */}
      <Card className="shadow-sm overflow-hidden">
        <CardHeader className="border-b bg-muted/20 py-4 px-6 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Flame className="h-4 w-4 text-orange-500" />
              Peringkat & Produktivitas Tim Lapangan
            </CardTitle>
            <CardDescription className="text-xs mt-0.5">
              Evaluasi kinerja teknisi berdasarkan jumlah pekerjaan tuntas, durasi, dan SLA.
            </CardDescription>
          </div>
        </CardHeader>

        {metrics.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted-foreground">
            Belum ada teknisi terdaftar untuk dihitung performanya.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/10">
                <TableHead className="w-12 text-center text-xs">Rank</TableHead>
                <TableHead className="text-xs">Nama Teknisi</TableHead>
                <TableHead className="text-xs text-center">Beban Kerja</TableHead>
                <TableHead className="text-xs">SLA Tepat Waktu</TableHead>
                <TableHead className="text-xs">Rata-rata Durasi</TableHead>
                <TableHead className="text-xs text-right">Status Lapangan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedByCompleted.map((m, index) => {
                const isTop1 = index === 0 && m.totalCompleted > 0
                const isTop2 = index === 1 && m.totalCompleted > 0
                const isTop3 = index === 2 && m.totalCompleted > 0

                return (
                  <TableRow key={m.technicianId} className="hover:bg-muted/30">
                    <TableCell className="text-center font-bold text-xs">
                      {isTop1 ? (
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/20 text-amber-600">
                          🥇
                        </span>
                      ) : isTop2 ? (
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-400/20 text-slate-600">
                          🥈
                        </span>
                      ) : isTop3 ? (
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-amber-700/20 text-amber-700">
                          🥉
                        </span>
                      ) : (
                        <span className="text-muted-foreground">#{index + 1}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold text-xs text-foreground">{m.name}</div>
                      <div className="text-[11px] text-muted-foreground">{m.email}</div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="text-xs font-bold">{m.totalCompleted} <span className="text-muted-foreground font-normal">/ {m.totalAssigned}</span></div>
                      <div className="text-[10px] text-muted-foreground">
                        {m.totalActive > 0 ? `${m.totalActive} aktif` : '0 aktif'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1 w-32">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-semibold">{m.onTimeRate}%</span>
                          <span className="text-muted-foreground text-[10px]">
                            {m.onTimeCount}/{m.totalCompleted}
                          </span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              m.onTimeRate >= 85
                                ? 'bg-emerald-500'
                                : m.onTimeRate >= 70
                                ? 'bg-amber-500'
                                : 'bg-rose-500'
                            }`}
                            style={{ width: `${m.onTimeRate}%` }}
                          />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatDuration(m.averageDurationMinutes)}
                    </TableCell>
                    <TableCell className="text-right">
                      {m.totalActive > 0 ? (
                        <Badge variant="default" className="text-[10px] bg-blue-600 hover:bg-blue-600">
                          Sedang Bertugas
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-[10px]">
                          Siap Ditugaskan
                        </Badge>
                      )}
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
