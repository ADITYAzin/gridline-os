import { requireRole } from '@/lib/auth'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SignOutButton } from '@/components/navigation/sign-out-button'
import { 
  Mail, 
  Briefcase, 
  CheckCircle2, 
  Wallet, 
  ChevronRight, 
  PhoneCall, 
  ShieldCheck, 
  Smartphone,
  Headphones
} from 'lucide-react'
import Link from 'next/link'

export default async function TechnicianProfilePage() {
  const profile = await requireRole('technician')
  const supabase = await createSupabaseServerClient()

  // Fetch technician stats
  const [{ count: totalAssigned }, { count: totalCompleted }] = await Promise.all([
    supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('technician_id', profile.id),
    supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('technician_id', profile.id).eq('status', 'completed'),
  ])

  const completionRate = totalAssigned && totalAssigned > 0 
    ? Math.round(((totalCompleted || 0) / totalAssigned) * 100) 
    : 100

  return (
    <div className="space-y-4 max-w-lg mx-auto">
      <header className="border-b border-[#E2E8F0] pb-3">
        <h1 className="text-heading-2 font-heading text-[#0F172A] tracking-tight">Profil Teknisi</h1>
        <p className="text-[11px] text-[#475569]">Informasi akun, reputasi, dan bantuan teknis lapangan</p>
      </header>

      {/* Main Profile Card */}
      <Card className="shadow-sm border-slate-200 overflow-hidden">
        <div className="h-2 bg-[#007ACC]" />
        <CardHeader className="p-4 pb-2">
          <div className="flex items-center gap-3.5">
            <div className="h-14 w-14 rounded-full bg-[#EBF5FC] text-[#007ACC] border-2 border-[#007ACC]/20 flex items-center justify-center font-bold text-lg shadow-sm">
              {profile.name.substring(0, 2).toUpperCase()}
            </div>
            <div className="space-y-1 flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <CardTitle className="text-base font-bold text-slate-900 truncate">{profile.name}</CardTitle>
                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] px-1.5 py-0">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-1 animate-pulse" />
                  Siaga Aktif
                </Badge>
              </div>
              <CardDescription className="text-xs text-slate-500 flex items-center gap-1 truncate">
                <Mail className="h-3 w-3 shrink-0" /> {profile.email}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-3 space-y-4">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-100">
              <Briefcase className="h-4 w-4 text-[#007ACC] mx-auto mb-1" />
              <div className="text-base font-bold text-slate-800">{totalAssigned || 0}</div>
              <span className="text-[10px] text-muted-foreground block">Total Job</span>
            </div>

            <div className="rounded-lg bg-emerald-50/50 p-2.5 border border-emerald-100/60">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 mx-auto mb-1" />
              <div className="text-base font-bold text-emerald-700">{totalCompleted || 0}</div>
              <span className="text-[10px] text-emerald-800/80 block">Selesai</span>
            </div>

            <div className="rounded-lg bg-blue-50/50 p-2.5 border border-blue-100/60">
              <ShieldCheck className="h-4 w-4 text-[#007ACC] mx-auto mb-1" />
              <div className="text-base font-bold text-[#007ACC]">{completionRate}%</div>
              <span className="text-[10px] text-[#007ACC]/80 block">Sukses Rate</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Navigation to Commissions */}
      <Link href="/technician/commissions" className="block group">
        <Card className="border-slate-200 hover:border-[#007ACC] transition-all duration-150 shadow-sm overflow-hidden">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-amber-50 text-amber-600 border border-amber-200/60 group-hover:scale-105 transition-transform">
                <Wallet className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900 group-hover:text-[#007ACC] transition-colors">
                  Insentif & Komisi Saya
                </p>
                <p className="text-xs text-muted-foreground">
                  Lihat riwayat fee per tiket & estimasi pencairan
                </p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-[#007ACC] group-hover:translate-x-0.5 transition-all" />
          </CardContent>
        </Card>
      </Link>

      {/* Dispatch Support & Emergency Hotline */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="p-4 pb-2">
          <div className="flex items-center gap-2">
            <Headphones className="h-4 w-4 text-[#007ACC]" />
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Bantuan Lapangan & Dispatcher
            </CardTitle>
          </div>
          <CardDescription className="text-xs">
            Hubungi penanggung jawab jika ada kendala di lokasi customer atau kecelakaan kerja
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-1 space-y-2">
          <a
            href="tel:081234567890"
            className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50 hover:bg-slate-100 transition-colors text-xs"
          >
            <div className="flex items-center gap-2.5">
              <PhoneCall className="h-4 w-4 text-[#007ACC]" />
              <span className="font-medium text-slate-800">Dispatch Support Hotline</span>
            </div>
            <span className="text-[11px] text-[#007ACC] font-semibold">Hubungi Segera</span>
          </a>
        </CardContent>
      </Card>

      {/* App Info & Device Sync */}
      <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/80 text-xs text-slate-500 space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 font-medium text-slate-700">
            <Smartphone className="h-3.5 w-3.5 text-slate-500" />
            Gridline OS Mobile Field
          </span>
          <span className="font-mono text-[10px] bg-slate-200/70 text-slate-700 px-1.5 py-0.5 rounded">v1.2.0-pwa</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Dilengkapi Geolocation GPS Verification, 5-Gate Checklist SOP, dan Auto Cloud Sync.
        </p>
      </div>

      {/* Logout Action */}
      <div className="pt-2 pb-6 flex justify-center">
        <SignOutButton variant="outline" className="w-full text-rose-600 border-rose-200 hover:bg-rose-50 hover:text-rose-700 h-11" />
      </div>
    </div>
  )
}
