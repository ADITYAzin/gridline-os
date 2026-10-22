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
      <DialogContent className="sm:max-w-2xl p-6 rounded-2xl max-h-[85vh] overflow-y-auto space-y-4">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
              <Receipt className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold">Rincian Komisi — {metrics.name}</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Rincian insentif dan bonus pekerjaan selesai.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 rounded-xl border bg-muted/30">
            <span className="text-[11px] text-muted-foreground block font-medium">Komisi Dasar</span>
            <span className="text-sm font-semibold text-foreground mt-0.5 block">{formatRupiah(metrics.totalBaseCommission)}</span>
          </div>
          <div className="p-3 rounded-xl border bg-muted/30">
            <span className="text-[11px] text-muted-foreground block font-medium">Bonus Tepat Waktu</span>
            <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5 block">{formatRupiah(metrics.totalBonusCommission)}</span>
          </div>
          <div className="p-3 rounded-xl border bg-primary/5 border-primary/20">
            <span className="text-[11px] text-primary font-medium block">Total Diterima</span>
            <span className="text-sm font-semibold text-primary mt-0.5 block">{formatRupiah(metrics.totalCommission)}</span>
          </div>
        </div>

        {metrics.completedJobs.length === 0 ? (
          <div className="text-center py-8 px-4 border rounded-xl border-dashed text-xs text-muted-foreground">
            Belum ada riwayat pekerjaan selesai untuk periode ini.
          </div>
        ) : (
          <div className="rounded-xl border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="h-10 px-3.5 text-xs font-medium text-muted-foreground">
                    No. Job
                  </TableHead>
                  <TableHead className="h-10 px-3.5 text-xs font-medium text-muted-foreground">
                    Layanan
                  </TableHead>
                  <TableHead className="h-10 px-3.5 text-xs font-medium text-muted-foreground">
                    Durasi
                  </TableHead>
                  <TableHead className="h-10 px-3.5 text-xs font-medium text-muted-foreground">
                    Status Waktu
                  </TableHead>
                  <TableHead className="h-10 px-3.5 text-xs font-medium text-muted-foreground text-right">
                    Insentif
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {metrics.completedJobs.map((job) => (
                  <TableRow key={job.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="px-3.5 py-2.5 font-mono text-xs font-semibold text-primary">
                      {job.job_number}
                    </TableCell>
                    <TableCell className="px-3.5 py-2.5 text-xs">{job.service_type}</TableCell>
                    <TableCell className="px-3.5 py-2.5 text-xs text-muted-foreground">
                      {formatDuration(job.durationMinutes || 0)}
                    </TableCell>
                    <TableCell className="px-3.5 py-2.5">
                      {job.isOnTime ? (
                        <Badge variant="outline" className="text-[10px] font-normal gap-1 text-emerald-600 border-emerald-500/30 bg-emerald-500/10">
                          <CheckCircle2 className="h-3 w-3" /> Tepat Waktu (+{formatRupiah(job.onTimeBonus)})
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px] font-normal gap-1 text-muted-foreground">
                          <Clock className="h-3 w-3" /> Lewat SLA
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="px-3.5 py-2.5 text-xs font-semibold text-right">
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
