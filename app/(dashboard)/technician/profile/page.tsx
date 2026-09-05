import { requireRole } from '@/lib/auth'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Mail, Briefcase, CheckCircle2 } from 'lucide-react'

export default async function TechnicianProfilePage() {
  const profile = await requireRole('technician')
  const supabase = await createSupabaseServerClient()

  // Fetch technician stats
  const [{ count: totalAssigned }, { count: totalCompleted }] = await Promise.all([
    supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('technician_id', profile.id),
    supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('technician_id', profile.id).eq('status', 'completed'),
  ])

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold tracking-tight">Profil Teknisi</h1>
        <p className="text-xs text-muted-foreground">Informasi akun dan statistik pekerjaan Anda di lapangan</p>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="p-4 pb-2">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-base">
              {profile.name.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <CardTitle className="text-base">{profile.name}</CardTitle>
              <CardDescription className="text-xs flex items-center gap-1 mt-0.5">
                <Mail className="h-3 w-3" /> {profile.email}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-3 space-y-3 text-xs">
          <div className="flex items-center justify-between py-1 border-b">
            <span className="text-muted-foreground">Peran:</span>
            <Badge variant="outline" className="capitalize font-semibold text-[10px]">
              Field Technician
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="rounded-lg bg-muted/40 p-3 text-center space-y-0.5">
              <Briefcase className="h-4 w-4 text-primary mx-auto mb-1" />
              <div className="text-lg font-bold">{totalAssigned || 0}</div>
              <span className="text-[10px] text-muted-foreground block">Total Ditugaskan</span>
            </div>

            <div className="rounded-lg bg-muted/40 p-3 text-center space-y-0.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 mx-auto mb-1" />
              <div className="text-lg font-bold">{totalCompleted || 0}</div>
              <span className="text-[10px] text-muted-foreground block">Terselesaikan</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
