'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TechnicianStatusBadge } from '@/components/technician/status-badge'
import { MapPin, ArrowRight, Navigation, CheckCircle2, AlertCircle, Wrench } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface TechnicianJobItem {
  id: string
  jobNumber: string
  serviceType: string
  issue: string
  address: string
  priority: 'low' | 'medium' | 'high'
  status: string
  createdAt: string
  completedAt: string | null
  assetName?: string | null
  assetBrand?: string | null
}

interface TechnicianJobListProps {
  jobs: TechnicianJobItem[]
}

export function TechnicianJobList({ jobs }: TechnicianJobListProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'completed'>('active')

  const activeJobs = jobs.filter((j) => j.status === 'assigned' || j.status === 'on_progress')
  const completedJobs = jobs.filter((j) => j.status === 'completed')

  const displayedJobs =
    activeTab === 'active'
      ? activeJobs
      : activeTab === 'completed'
      ? completedJobs
      : jobs

  // Find topmost priority / active job for the Hero Banner
  const nextJob = activeJobs.find((j) => j.status === 'on_progress') || activeJobs[0]

  return (
    <div className="space-y-4">
      {/* Hero Card: Next / Urgent Job Action */}
      {nextJob && (
        <Card className="border-[#007ACC]/40 bg-gradient-to-br from-white to-[#EBF5FC]/60 shadow-sm rounded-[12px] overflow-hidden">
          <div className="bg-[#007ACC] text-white px-4 py-1.5 flex items-center justify-between text-xs">
            <span className="font-semibold flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-amber-300 animate-ping" />
              Tugas Prioritas Utama Saat Ini
            </span>
            <span className="font-mono font-bold text-[11px] bg-white/20 px-1.5 py-0.2 rounded">
              {nextJob.jobNumber}
            </span>
          </div>
          <CardContent className="p-4 space-y-3">
            <div className="space-y-1">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-bold text-base text-[#0F172A]">{nextJob.serviceType}</h3>
                <TechnicianStatusBadge status={nextJob.status} />
              </div>
              <p className="text-xs text-[#475569] line-clamp-2 leading-relaxed">
                {nextJob.issue}
              </p>
            </div>

            {nextJob.assetName && (
              <div className="flex items-center gap-1.5 text-xs text-[#007ACC] bg-[#EBF5FC] p-2 rounded-[6px]">
                <Wrench className="h-3.5 w-3.5 shrink-0" />
                <span className="font-medium truncate">
                  Unit: [{nextJob.assetBrand}] {nextJob.assetName}
                </span>
              </div>
            )}

            <div className="flex items-start gap-1.5 text-xs text-[#475569]">
              <MapPin className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
              <span className="line-clamp-1">{nextJob.address}</span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <Button
                asChild
                variant="outline"
                size="sm"
                className="h-10 text-xs font-semibold gap-1.5 border-border rounded-[8px]"
              >
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(nextJob.address)}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Navigation className="h-3.5 w-3.5 text-[#007ACC]" />
                  Peta Navigasi
                </a>
              </Button>

              <Button
                asChild
                size="sm"
                className="h-10 text-xs font-semibold gap-1.5 bg-[#007ACC] hover:bg-[#0062A3] text-white rounded-[8px] shadow-xs"
              >
                <Link href={`/technician/jobs/${nextJob.id}`}>
                  <span>Buka Lembar Kerja</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Segmented Tab Filter */}
      <div className="flex items-center p-1 bg-[#F1F5F9] rounded-[10px] gap-1">
        <button
          type="button"
          onClick={() => setActiveTab('active')}
          className={cn(
            'flex-1 py-2 text-xs font-semibold rounded-[8px] transition-all',
            activeTab === 'active'
              ? 'bg-white text-[#007ACC] shadow-xs'
              : 'text-[#475569] hover:text-[#0F172A]'
          )}
        >
          Aktif ({activeJobs.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('completed')}
          className={cn(
            'flex-1 py-2 text-xs font-semibold rounded-[8px] transition-all',
            activeTab === 'completed'
              ? 'bg-white text-[#007ACC] shadow-xs'
              : 'text-[#475569] hover:text-[#0F172A]'
          )}
        >
          Selesai ({completedJobs.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={cn(
            'flex-1 py-2 text-xs font-semibold rounded-[8px] transition-all',
            activeTab === 'all'
              ? 'bg-white text-[#007ACC] shadow-xs'
              : 'text-[#475569] hover:text-[#0F172A]'
          )}
        >
          Semua ({jobs.length})
        </button>
      </div>

      {/* List Display */}
      {displayedJobs.length === 0 ? (
        <Card className="text-center p-8 space-y-3 border-dashed bg-white rounded-[12px]">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#F1F5F9] text-[#475569]">
            <CheckCircle2 className="h-6 w-6 text-[#007ACC]" />
          </div>
          <CardTitle className="text-sm font-semibold text-[#0F172A]">
            {activeTab === 'active'
              ? 'Semua Tugas Aktif Telah Tuntas!'
              : activeTab === 'completed'
              ? 'Belum Ada Pekerjaan Selesai'
              : 'Tidak Ada Pekerjaan'}
          </CardTitle>
          <CardDescription className="text-xs text-[#475569] max-w-xs mx-auto">
            {activeTab === 'active'
              ? 'Hebat! Anda tidak memiliki tiket tugas lapangan yang tertunda saat ini.'
              : 'Riwayat pekerjaan Anda akan tersimpan rapi di sini.'}
          </CardDescription>
        </Card>
      ) : (
        <div className="space-y-2.5">
          {displayedJobs.map((job) => (
            <Link key={job.id} href={`/technician/jobs/${job.id}`} className="block group">
              <Card className="shadow-xs hover:border-[#007ACC]/50 transition-all rounded-[10px] bg-white border-[#E2E8F0]">
                <CardHeader className="p-3.5 pb-2 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-[#007ACC]">
                      {job.jobNumber}
                    </span>
                    <TechnicianStatusBadge status={job.status} />
                  </div>
                  <CardTitle className="text-sm font-semibold group-hover:text-[#007ACC] transition-colors flex items-center justify-between">
                    <span className="text-[#0F172A]">{job.serviceType}</span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-[#007ACC] transition-transform group-hover:translate-x-0.5" />
                  </CardTitle>
                  <CardDescription className="text-xs text-[#475569] line-clamp-2">
                    {job.issue}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-3.5 pt-1 text-xs text-[#475569] space-y-1 border-t border-[#F1F5F9] mt-2">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span className="truncate">{job.address}</span>
                  </div>
                  {job.assetName && (
                    <div className="flex items-center gap-1 text-[11px] text-[#007ACC] font-medium pt-0.5">
                      <Wrench className="h-3 w-3 shrink-0" />
                      <span>Unit: {job.assetBrand} - {job.assetName}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
