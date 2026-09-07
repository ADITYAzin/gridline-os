'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download, Loader2 } from 'lucide-react'

export interface ExportJobItem {
  jobNumber: string
  createdAt: string
  status: string
  priority: string
  serviceType: string
  issue: string
  customerName: string
  customerPhone?: string | null
  address: string
  technicianName?: string | null
  completedAt?: string | null
  scheduledStart?: string | null
  scheduledEnd?: string | null
}

interface ExportJobsButtonProps {
  jobs: ExportJobItem[]
  filenamePrefix?: string
  label?: string
}

export function ExportJobsButton({
  jobs,
  filenamePrefix = 'Laporan-Jobs-GridlineOS',
  label = 'Export CSV / Excel',
}: ExportJobsButtonProps) {
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = () => {
    try {
      setIsExporting(true)

      const headers = [
        'No Tiket',
        'Tanggal Dibuat',
        'Status',
        'Prioritas',
        'Jenis Layanan',
        'Pelanggan',
        'No Telepon Pelanggan',
        'Alamat Servis',
        'Teknisi',
        'Jadwal Mulai',
        'Jadwal Selesai',
        'Waktu Selesai',
        'Keluhan / Isu',
      ]

      const escapeCSV = (val: string | null | undefined) => {
        if (val === null || val === undefined) return '""'
        const clean = String(val).replace(/"/g, '""')
        return `"${clean}"`
      }

      const rows = jobs.map((j) => [
        escapeCSV(j.jobNumber),
        escapeCSV(new Date(j.createdAt).toLocaleString('id-ID')),
        escapeCSV(j.status.toUpperCase().replace('_', ' ')),
        escapeCSV(j.priority.toUpperCase()),
        escapeCSV(j.serviceType),
        escapeCSV(j.customerName),
        escapeCSV(j.customerPhone || '-'),
        escapeCSV(j.address),
        escapeCSV(j.technicianName || 'Belum Ditugaskan'),
        escapeCSV(j.scheduledStart ? new Date(j.scheduledStart).toLocaleString('id-ID') : '-'),
        escapeCSV(j.scheduledEnd ? new Date(j.scheduledEnd).toLocaleString('id-ID') : '-'),
        escapeCSV(j.completedAt ? new Date(j.completedAt).toLocaleString('id-ID') : '-'),
        escapeCSV(j.issue),
      ])

      // UTF-8 BOM (\uFEFF) ensures Excel displays Indonesian characters cleanly without corrupted encoding
      const csvContent =
        '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n')

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      const today = new Date().toISOString().slice(0, 10)

      link.setAttribute('href', url)
      link.setAttribute('download', `${filenamePrefix}-${today}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      disabled={isExporting || jobs.length === 0}
      className="gap-1.5 shadow-sm text-xs font-semibold"
    >
      {isExporting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
      {label}
    </Button>
  )
}
