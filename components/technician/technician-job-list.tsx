'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TechnicianStatusBadge } from '@/components/technician/status-badge'
import { MapPin, ArrowRight, Navigation, CheckCircle2, Wrench, Calendar, Clock, Loader2 } from 'lucide-react'
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
  scheduledStart?: string | null
  scheduledEnd?: string | null
}

interface TechnicianJobListProps {
  jobs: TechnicianJobItem[]
}

export function TechnicianJobList({ jobs }: TechnicianJobListProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'completed'>('active')
  const [completedLimit, setCompletedLimit] = useState(3)
  const [navigatingJobId, setNavigatingJobId] = useState<string | null>(null)

  const activeJobs = jobs.filter((j) => j.status === 'assigned' || j.status === 'on_progress')
  const completedJobs = jobs.filter((j) => j.status === 'completed')

  const displayedJobs =
    activeTab === 'active'
      ? activeJobs
      : activeTab === 'completed'
      ? completedJobs.slice(0, completedLimit)
      : jobs

  // Find topmost priority / active job for the Hero Banner
  const nextJob = activeJobs.find((j) => j.status === 'on_progress') || activeJobs[0]

  return (
    <div className="space-y-4">
      {/* Hero Card: Next / Urgent Job Action */}
      {nextJob && (
        <Card className="border-[#007ACC]/50 bg-gradient-to-br from-white to-[#EBF5FC]/70 shadow-sm rounded-xl overflow-hidden">
          <div className="bg-[#007ACC] text-white px-3.5 py-2 flex items-center justify-between text-xs">
            <span className="font-bold flex items-center gap-1.5 text-xs">
              <span className="h-2 w-2 rounded-full bg-amber-300 animate-ping" />
              Tugas Prioritas
            </span>
            <span className="font-mono font-bold text-xs bg-white/20 px-2 py-0.5 rounded">
              {nextJob.jobNumber}
            </span>
          </div>
          <CardContent className="p-4 space-y-3">
            <div className="space-y-1">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-bold text-lg text-[#0F172A] leading-tight">{nextJob.serviceType}</h3>
                <TechnicianStatusBadge status={nextJob.status} />
              </div>
              <p className="text-sm text-[#334155] line-clamp-2 leading-relaxed font-normal">
                {nextJob.issue}
              </p>
            </div>

            {nextJob.assetName && (
              <div className="flex items-center gap-2 text-xs font-semibold text-[#007ACC] bg-[#EBF5FC] p-2.5 rounded-lg border border-[#007ACC]/20">
                <Wrench className="h-4 w-4 shrink-0" />
                <span className="truncate">
                  Unit: [{nextJob.assetBrand}] {nextJob.assetName}
                </span>
              </div>
            )}

            {nextJob.scheduledStart && (
              <div className="flex items-center gap-2 text-xs text-[#0F172A] bg-white border border-[#CBD5E1] p-2.5 rounded-lg">
                <Calendar className="h-4 w-4 text-[#007ACC] shrink-0" />
                <span className="font-bold text-xs">
                  {new Date(nextJob.scheduledStart).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
                <span className="text-[#94A3B8]">•</span>
                <Clock className="h-3.5 w-3.5 text-[#475569] shrink-0" />
                <span className="text-xs font-semibold text-[#1E293B]">
                  {new Date(nextJob.scheduledStart).toLocaleTimeString('id-ID', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                  {nextJob.scheduledEnd
                    ? ` - ${new Date(nextJob.scheduledEnd).toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}`
                    : ''}
                </span>
              </div>
            )}

            <div className="flex items-start gap-2 text-xs sm:text-sm text-[#1E293B] font-medium">
              <MapPin className="h-4 w-4 text-[#007ACC] shrink-0 mt-0.5" />
              <span className="line-clamp-2 leading-snug">{nextJob.address}</span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <Button
                asChild
                variant="outline"
                className="h-11 text-xs sm:text-sm font-bold gap-1.5 border-[#CBD5E1] text-[#0F172A] hover:bg-slate-100 rounded-lg touch-press cursor-pointer"
              >
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(nextJob.address)}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Navigation className="h-4 w-4 text-[#007ACC]" />
                  Buka Peta
                </a>
              </Button>

              <Button
                asChild
                className="h-11 text-xs sm:text-sm font-bold gap-1.5 bg-[#007ACC] hover:bg-[#0062A3] text-white rounded-lg shadow-sm touch-press cursor-pointer"
              >
                <Link
                  href={`/technician/jobs/${nextJob.id}`}
                  prefetch={false}
                  onClick={() => setNavigatingJobId(nextJob.id)}
                >
                  {navigatingJobId === nextJob.id ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Membuka...</span>
                    </>
                  ) : (
                    <>
                      <span>Buka Tiket</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Segmented Tab Filter */}
      <div className="flex items-center p-1.5 bg-[#F1F5F9] rounded-xl gap-1 select-none">
        <button
          type="button"
          onClick={() => setActiveTab('active')}
          className={cn(
            'flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-lg transition-all touch-press min-h-[44px] cursor-pointer',
            activeTab === 'active'
              ? 'bg-white text-[#007ACC] shadow-xs'
              : 'text-[#475569] active:text-[#0F172A]'
          )}
        >
          Aktif ({activeJobs.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('completed')}
          className={cn(
            'flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-lg transition-all touch-press min-h-[44px] cursor-pointer',
            activeTab === 'completed'
              ? 'bg-white text-[#007ACC] shadow-xs'
              : 'text-[#475569] active:text-[#0F172A]'
          )}
        >
          Selesai ({completedJobs.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={cn(
            'flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-lg transition-all touch-press min-h-[44px] cursor-pointer',
            activeTab === 'all'
              ? 'bg-white text-[#007ACC] shadow-xs'
              : 'text-[#475569] active:text-[#0F172A]'
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
          {displayedJobs.map((job) => {
            const isNavigating = navigatingJobId === job.id
            return (
              <Link
                key={job.id}
                href={`/technician/jobs/${job.id}`}
                prefetch={false}
                onClick={() => setNavigatingJobId(job.id)}
                className="block group touch-press"
              >
                <Card
                  className={cn(
                    'shadow-xs hover:border-[#007ACC]/50 active:bg-[#F8FAFC] active:border-[#007ACC]/60 transition-all rounded-[10px] bg-white border-[#E2E8F0]',
                    isNavigating && 'border-[#007ACC] bg-[#F8FAFC] opacity-80'
                  )}
                >
                  <CardHeader className="p-3.5 pb-2 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-[#007ACC] bg-[#EBF5FC] px-1.5 py-0.5 rounded">
                        {job.jobNumber}
                      </span>
                      <TechnicianStatusBadge status={job.status} />
                    </div>
                    <CardTitle className="text-base font-bold text-[#0F172A] group-hover:text-[#007ACC] transition-colors flex items-center justify-between">
                      <span>{job.serviceType}</span>
                      {isNavigating ? (
                        <Loader2 className="h-4 w-4 text-[#007ACC] animate-spin" />
                      ) : (
                        <ArrowRight className="h-4 w-4 text-[#64748B] group-hover:text-[#007ACC] transition-transform group-hover:translate-x-0.5" />
                      )}
                    </CardTitle>
                  <CardDescription className="text-sm text-[#334155] line-clamp-2 leading-snug">
                    {job.issue}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-3.5 pt-1.5 text-xs text-[#334155] space-y-2 border-t border-[#F1F5F9] mt-1.5">
                  {job.scheduledStart ? (
                    <div className="flex items-center gap-1.5 text-xs text-[#0F172A] font-medium">
                      <Calendar className="h-3.5 w-3.5 text-[#007ACC] shrink-0" />
                      <span className="font-bold">
                        {new Date(job.scheduledStart).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </span>
                      <span className="text-[#94A3B8]">•</span>
                      <Clock className="h-3.5 w-3.5 text-[#64748B] shrink-0" />
                      <span className="text-xs font-semibold text-[#1E293B]">
                        {new Date(job.scheduledStart).toLocaleTimeString('id-ID', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                        {job.scheduledEnd
                          ? ` - ${new Date(job.scheduledEnd).toLocaleTimeString('id-ID', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}`
                          : ''}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
                      <Calendar className="h-3.5 w-3.5 shrink-0" />
                      <span>
                        Dibuat: {new Date(job.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                  )}
                  <div className="flex items-start gap-1.5 text-xs sm:text-sm text-[#1E293B] font-medium">
                    <MapPin className="h-3.5 w-3.5 text-[#007ACC] shrink-0 mt-0.5" />
                    <span className="line-clamp-1">{job.address}</span>
                  </div>
                  {job.assetName && (
                    <div className="flex items-center gap-1.5 text-xs text-[#007ACC] font-bold bg-[#EBF5FC] px-2 py-1 rounded-md w-fit">
                      <Wrench className="h-3.5 w-3.5 shrink-0" />
                      <span>Unit: {job.assetBrand} - {job.assetName}</span>
                    </div>
                  )}
                </CardContent>
                </Card>
              </Link>
            )
          })}

          {/* Slicing: Load 3 more completed jobs on demand */}
          {activeTab === 'completed' && completedJobs.length > completedLimit && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setCompletedLimit((prev) => prev + 3)}
              className="w-full h-10 text-xs font-semibold border-dashed border-[#007ACC]/40 text-[#007ACC] hover:bg-[#EBF5FC] rounded-[8px] touch-press mt-2 shadow-2xs cursor-pointer"
            >
              <span>Tampilkan 3 Tugas Sebelumnya ({completedJobs.length - completedLimit} tersisa)</span>
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
