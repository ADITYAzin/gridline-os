'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Card, CardDescription, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { SlaBadge } from '@/components/jobs/sla-badge'
import {
  Briefcase,
  User,
  MapPin,
  Eye,
  Printer,
  Calendar,
  Clock,
  Search,
  X,
} from 'lucide-react'

export interface RawJobCustomer {
  id?: string
  name: string
  phone?: string | null
}

export interface RawJobTechnician {
  name: string
}

export interface RawJobSchedule {
  start_at: string
  end_at: string
}

export interface JobRowItem {
  id: string
  job_number: string
  service_type: string
  issue?: string | null
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'pending' | 'assigned' | 'on_progress' | 'completed' | 'cancelled'
  address: string
  created_at: string
  completed_at?: string | null
  customers?: RawJobCustomer | RawJobCustomer[] | null
  profiles?: RawJobTechnician | RawJobTechnician[] | null
  schedules?: RawJobSchedule | RawJobSchedule[] | null
}

interface JobsTableViewProps {
  jobs: JobRowItem[]
  currentTab: string
  tabs: { label: string; value: string }[]
}

export function JobsTableView({ jobs, currentTab, tabs }: JobsTableViewProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredJobs = useMemo(() => {
    if (!searchQuery.trim()) return jobs
    const q = searchQuery.toLowerCase().trim()

    return jobs.filter((j) => {
      const cust = (Array.isArray(j.customers) ? j.customers[0] : j.customers) as RawJobCustomer | null
      const tech = (Array.isArray(j.profiles) ? j.profiles[0] : j.profiles) as RawJobTechnician | null

      const matchNumber = j.job_number.toLowerCase().includes(q)
      const matchCustomer = (cust?.name || '').toLowerCase().includes(q)
      const matchPhone = (cust?.phone || '').toLowerCase().includes(q)
      const matchTech = (tech?.name || '').toLowerCase().includes(q)
      const matchService = (j.service_type || '').toLowerCase().includes(q)
      const matchIssue = (j.issue || '').toLowerCase().includes(q)
      const matchAddress = (j.address || '').toLowerCase().includes(q)

      return (
        matchNumber ||
        matchCustomer ||
        matchPhone ||
        matchTech ||
        matchService ||
        matchIssue ||
        matchAddress
      )
    })
  }, [jobs, searchQuery])

  return (
    <div className="space-y-4">
      {/* Search Bar on LEFT & Filter Tabs on RIGHT */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3">
        {/* Search Box on the LEFT - exact same placement and styling */}
        <div className="relative w-full sm:w-80 md:w-96 shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari no tiket, pelanggan, teknisi, masalah..."
            className="pl-8.5 pr-8 h-9 text-xs bg-white rounded-lg border-slate-200"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 rounded transition-colors"
              title="Hapus pencarian"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Status Tabs on the RIGHT */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 sm:pb-0">
          {tabs.map((tab) => {
            const isActive = currentTab === tab.value
            const href = tab.value === 'all' ? '/admin/jobs' : `/admin/jobs?status=${tab.value}`
            return (
              <Link
                key={tab.value}
                href={href}
                className={`inline-flex items-center justify-center h-9 rounded-md px-3 text-xs font-semibold whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                {tab.label}
              </Link>
            )
          })}
        </div>
      </div>

      {/* Counter when searching */}
      {searchQuery && (
        <div className="flex items-center justify-between text-xs text-slate-500 font-medium px-1">
          <span>
            Hasil pencarian: <strong>{filteredJobs.length}</strong> dari {jobs.length} tiket
          </span>
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="text-primary hover:underline"
          >
            Bersihkan filter
          </button>
        </div>
      )}

      {jobs.length === 0 ? (
        <Card className="text-center p-12 border-dashed">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-muted-foreground mb-3">
            <Briefcase className="h-6 w-6" />
          </div>
          <CardTitle className="text-lg">Tidak Ada Tiket</CardTitle>
          <CardDescription className="text-sm max-w-sm mx-auto mt-1 mb-4">
            {currentTab === 'all'
              ? 'Belum ada tiket pekerjaan yang dibuat. Buat tiket pertama sekarang.'
              : `Tidak ada tiket dengan status ini.`}
          </CardDescription>
          {currentTab === 'all' && (
            <Button asChild>
              <Link href="/admin/jobs/new">Buat Tiket Pertama</Link>
            </Button>
          )}
        </Card>
      ) : filteredJobs.length === 0 ? (
        <div className="rounded-[12px] bg-white border border-slate-200 p-12 text-center space-y-3 shadow-xs">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-400">
            <Search className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <p className="font-heading text-sm font-semibold text-slate-900">
              Tidak ada tiket yang cocok
            </p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Tidak ditemukan tiket yang cocok dengan kata kunci &quot;{searchQuery}&quot;.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setSearchQuery('')}
            className="text-xs h-8"
          >
            Reset Pencarian
          </Button>
        </div>
      ) : (
        <div className="rounded-[12px] bg-[#FFFFFF] border border-[#E2E8F0] shadow-[0_1px_3px_0_rgba(15,23,42,0.03),0_1px_2px_0_rgba(15,23,42,0.02)] overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-[#E2E8F0] bg-[#F8FAFC] hover:bg-[#F8FAFC]">
                  <TableHead className="h-11 px-4 text-[12px] font-semibold text-[#475569] uppercase tracking-[0.02em] w-[110px]">
                    No. Tiket
                  </TableHead>
                  <TableHead className="h-11 px-4 text-[12px] font-semibold text-[#475569] uppercase tracking-[0.02em]">
                    Pelanggan & Lokasi
                  </TableHead>
                  <TableHead className="h-11 px-4 text-[12px] font-semibold text-[#475569] uppercase tracking-[0.02em]">
                    Layanan & Masalah
                  </TableHead>
                  <TableHead className="h-11 px-4 text-[12px] font-semibold text-[#475569] uppercase tracking-[0.02em]">
                    Jadwal
                  </TableHead>
                  <TableHead className="h-11 px-4 text-[12px] font-semibold text-[#475569] uppercase tracking-[0.02em]">
                    Teknisi
                  </TableHead>
                  <TableHead className="h-11 px-4 text-[12px] font-semibold text-[#475569] uppercase tracking-[0.02em]">
                    Prioritas
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
                {filteredJobs.map((j) => {
                  const customer = (Array.isArray(j.customers) ? j.customers[0] : j.customers) as RawJobCustomer | null
                  const technician = (Array.isArray(j.profiles) ? j.profiles[0] : j.profiles) as RawJobTechnician | null
                  const sched = (Array.isArray(j.schedules) ? j.schedules[0] : j.schedules) as RawJobSchedule | null

                  const priorityBadge: 'destructive' | 'default' | 'secondary' =
                    j.priority === 'urgent' || j.priority === 'high'
                      ? 'destructive'
                      : j.priority === 'medium'
                      ? 'default'
                      : 'secondary'

                  const statusBadge =
                    j.status === 'completed'
                      ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                      : j.status === 'cancelled'
                      ? 'bg-destructive/10 text-destructive border-destructive/20'
                      : j.status === 'on_progress'
                      ? 'bg-blue-500/10 text-blue-600 border-blue-500/20'
                      : j.status === 'assigned'
                      ? 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                      : 'bg-muted text-muted-foreground'

                  return (
                    <TableRow key={j.id} className="border-b border-[#F1F5F9] hover:bg-[#F8FAFC] transition-colors group">
                      <TableCell className="px-4 py-2 align-middle font-mono font-bold text-xs text-primary">
                        <Link href={`/admin/jobs/${j.id}`} className="hover:underline">
                          {j.job_number}
                        </Link>
                      </TableCell>
                      <TableCell className="px-4 py-2 align-middle">
                        {customer?.id ? (
                          <Link
                            href={`/admin/customers/${customer.id}`}
                            className="font-semibold text-sm hover:underline hover:text-[#007ACC]"
                          >
                            {customer.name}
                          </Link>
                        ) : (
                          <div className="font-semibold text-sm">
                            {customer?.name || 'Customer'}
                          </div>
                        )}
                        <div className="text-xs text-[#64748B] flex items-center gap-1 mt-0.5 truncate max-w-xs">
                          <MapPin className="h-3 w-3 shrink-0" />
                          <span className="truncate">{j.address}</span>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-2 align-middle">
                        <div className="font-medium text-sm text-[#0F172A]">{j.service_type}</div>
                        <div className="text-xs text-[#64748B] line-clamp-1 max-w-xs">{j.issue}</div>
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
                        {technician?.name ? (
                          <div className="flex items-center gap-1.5 text-xs font-medium text-[#0F172A]">
                            <User className="h-3.5 w-3.5 text-[#64748B]" />
                            <span>{technician.name}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-[#94A3B8] italic">Belum ada</span>
                        )}
                      </TableCell>
                      <TableCell className="px-4 py-2 align-middle">
                        <Badge variant={priorityBadge} className="text-[10px] font-semibold">
                          {j.priority === 'urgent'
                            ? 'Mendesak'
                            : j.priority === 'high'
                            ? 'Tinggi'
                            : j.priority === 'medium'
                            ? 'Normal'
                            : 'Rendah'}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-4 py-2 align-middle">
                        <div className="flex flex-col gap-1 items-start">
                          <Badge variant="outline" className={`text-[10px] font-semibold ${statusBadge}`}>
                            {j.status === 'on_progress'
                              ? 'Dikerjakan'
                              : j.status === 'assigned'
                              ? 'Ditugaskan'
                              : j.status === 'completed'
                              ? 'Selesai'
                              : j.status === 'cancelled'
                              ? 'Dibatalkan'
                              : 'Menunggu'}
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
                            title="Buka Tiket"
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
          </div>
        </div>
      )}
    </div>
  )
}
