'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Receipt, CheckCircle2, Clock, Eye } from 'lucide-react'
import { formatRupiah, formatDuration, type TechnicianPerformanceMetrics } from '@/lib/commission'

interface TechnicianCommissionDialogProps {
  metrics: TechnicianPerformanceMetrics
}

export function TechnicianCommissionDialog({ metrics }: TechnicianCommissionDialogProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 text-xs gap-1">
          <Eye className="h-3 w-3 text-primary" />
          Rincian
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Receipt className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold">Rincian Komisi — {metrics.name}</DialogTitle>
              <DialogDescription className="text-xs">
                Daftar pekerjaan selesai yang memenuhi syarat insentif dan komisi.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-3 my-2">
          <div className="p-3 rounded-lg border bg-muted/30">
            <span className="text-[11px] text-muted-foreground block">Komisi Dasar</span>
            <span className="text-sm font-bold text-foreground">{formatRupiah(metrics.totalBaseCommission)}</span>
          </div>
          <div className="p-3 rounded-lg border bg-muted/30">
            <span className="text-[11px] text-muted-foreground block">Bonus On-Time</span>
            <span className="text-sm font-bold text-emerald-600">{formatRupiah(metrics.totalBonusCommission)}</span>
          </div>
          <div className="p-3 rounded-lg border bg-primary/10 border-primary/20">
            <span className="text-[11px] text-primary font-medium block">Total Berhak Diterima</span>
            <span className="text-sm font-bold text-primary">{formatRupiah(metrics.totalCommission)}</span>
          </div>
        </div>

        {metrics.completedJobs.length === 0 ? (
          <div className="text-center p-6 border rounded-lg border-dashed text-xs text-muted-foreground">
            Belum ada pekerjaan selesai yang tercatat untuk teknisi ini pada periode ini.
          </div>
        ) : (
          <div className="rounded-lg border border-[#E2E8F0] overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-[#E2E8F0] bg-[#F8FAFC] hover:bg-[#F8FAFC]">
                  <TableHead className="h-11 px-4 text-[12px] font-semibold text-[#475569] uppercase tracking-[0.02em]">
                    Nomor Job
                  </TableHead>
                  <TableHead className="h-11 px-4 text-[12px] font-semibold text-[#475569] uppercase tracking-[0.02em]">
                    Layanan
                  </TableHead>
                  <TableHead className="h-11 px-4 text-[12px] font-semibold text-[#475569] uppercase tracking-[0.02em]">
                    Durasi
                  </TableHead>
                  <TableHead className="h-11 px-4 text-[12px] font-semibold text-[#475569] uppercase tracking-[0.02em]">
                    SLA Tepat Waktu
                  </TableHead>
                  <TableHead className="h-11 px-4 text-[12px] font-semibold text-[#475569] uppercase tracking-[0.02em] text-center">
                    Total Insentif
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {metrics.completedJobs.map((job) => (
                  <TableRow key={job.id} className="border-b border-[#F1F5F9] hover:bg-[#F8FAFC] transition-colors group">
                    <TableCell className="px-4 py-2 align-middle font-mono text-xs font-bold text-[#007ACC]">
                      {job.job_number}
                    </TableCell>
                    <TableCell className="px-4 py-2 align-middle text-xs text-[#0F172A]">{job.service_type}</TableCell>
                    <TableCell className="px-4 py-2 align-middle text-xs text-[#64748B]">
                      {formatDuration(job.durationMinutes || 0)}
                    </TableCell>
                    <TableCell className="px-4 py-2 align-middle">
                      {job.isOnTime ? (
                        <Badge variant="outline" className="text-[10px] gap-1 text-emerald-600 border-emerald-500/30 bg-emerald-500/10">
                          <CheckCircle2 className="h-3 w-3" /> On-Time (+{formatRupiah(job.onTimeBonus)})
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px] gap-1 text-[#64748B]">
                          <Clock className="h-3 w-3" /> Melebihi Batas
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="px-4 py-2 align-middle text-xs font-bold text-center">
                      {formatRupiah(job.totalCommission)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
