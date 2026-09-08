import Link from 'next/link'
import { requireRole } from '@/lib/auth'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { RealtimeJobsListener } from '@/components/realtime/realtime-jobs-listener'
import { InstallPrompt } from '@/components/pwa/install-prompt'
import { MapPin, CheckCircle2, ArrowRight } from 'lucide-react'

export default async function TechnicianHomePage() {
  const profile = await requireRole('technician')
  const supabase = await createSupabaseServerClient()

  // Fetch jobs assigned to this technician
  const { data: jobs } = await supabase
    .from('jobs')
    .select('id, job_number, service_type, issue, address, priority, status, created_at')
    .eq('technician_id', profile.id)
    .order('created_at', { ascending: false })

  const assignedJobs = jobs || []

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div className="space-y-0.5">
          <h1 className="text-xl font-bold tracking-tight">Tugas Lapangan Saya</h1>
          <p className="text-xs text-muted-foreground">
            Daftar pekerjaan servis yang ditugaskan kepada Anda hari ini
          </p>
        </div>
        <RealtimeJobsListener technicianId={profile.id} compact={true} />
      </div>

      {/* PWA Mobile Add to Home Screen Banner */}
      <InstallPrompt />

      {assignedJobs.length === 0 ? (
        <Card className="text-center p-8 space-y-3 border-dashed">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <CardTitle className="text-base font-semibold">Tidak Ada Tugas Aktif</CardTitle>
          <CardDescription className="text-xs">
            Saat ini belum ada pekerjaan yang ditugaskan kepada Anda. Silakan hubungi Dispatcher/Admin jika ada jadwal baru.
          </CardDescription>
        </Card>
      ) : (
        <div className="space-y-3">
          {assignedJobs.map((job) => (
            <Link key={job.id} href={`/technician/jobs/${job.id}`} className="block group">
              <Card className="shadow-sm hover:border-primary/50 transition-colors">
                <CardHeader className="p-4 pb-2 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-primary">{job.job_number}</span>
                    <Badge variant={job.status === 'on_progress' ? 'default' : 'secondary'} className="capitalize text-[10px]">
                      {job.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <CardTitle className="text-sm font-semibold group-hover:text-primary transition-colors flex items-center justify-between">
                    <span>{job.service_type}</span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-transform group-hover:translate-x-0.5" />
                  </CardTitle>
                  <CardDescription className="text-xs line-clamp-2">{job.issue}</CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-2 text-xs text-muted-foreground space-y-1">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span className="truncate">{job.address}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
