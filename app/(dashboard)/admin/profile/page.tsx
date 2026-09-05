import { requireRole } from '@/lib/auth'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Building2, User, Mail, Shield, Sparkles } from 'lucide-react'

export default async function AdminProfilePage() {
  const profile = await requireRole('admin')
  const supabase = await createSupabaseServerClient()

  const { data: org } = await supabase
    .from('organizations')
    .select('id, name, subscription_tier, created_at')
    .eq('id', profile.orgId)
    .single()

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Pengaturan & Profil</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Informasi organisasi, paket langganan, dan data akun Administrator Anda.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Organization Card */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" />
              Profil Organisasi (Tenant)
            </CardTitle>
            <CardDescription className="text-xs">
              Identitas perusahaan yang terdaftar di Gridline OS.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3.5 text-xs">
            <div>
              <span className="text-muted-foreground block font-medium">Nama Perusahaan:</span>
              <span className="font-bold text-base text-foreground">{org?.name || 'Organisasi'}</span>
            </div>

            <div>
              <span className="text-muted-foreground block font-medium">Tenant ID:</span>
              <span className="font-mono text-[11px] bg-muted px-2 py-0.5 rounded text-muted-foreground select-all">
                {org?.id}
              </span>
            </div>

            <div>
              <span className="text-muted-foreground block font-medium">Paket Langganan:</span>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="capitalize font-semibold gap-1">
                  <Sparkles className="h-3 w-3 text-amber-500" />
                  {org?.subscription_tier || 'Trial'}
                </Badge>
                <span className="text-[11px] text-muted-foreground">Aktif</span>
              </div>
            </div>

            <div>
              <span className="text-muted-foreground block font-medium">Tanggal Registrasi:</span>
              <span className="text-foreground">
                {org?.created_at ? new Date(org.created_at).toLocaleDateString('id-ID', { dateStyle: 'long' }) : '-'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* User Card */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              Akun Administrator
            </CardTitle>
            <CardDescription className="text-xs">
              Kredensial dan wewenang akun yang sedang aktif.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3.5 text-xs">
            <div>
              <span className="text-muted-foreground block font-medium">Nama Lengkap:</span>
              <span className="font-bold text-sm text-foreground">{profile.name}</span>
            </div>

            <div>
              <span className="text-muted-foreground block font-medium">Email:</span>
              <div className="flex items-center gap-1.5 text-foreground mt-0.5">
                <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                <span>{profile.email}</span>
              </div>
            </div>

            <div>
              <span className="text-muted-foreground block font-medium">Peran Akses:</span>
              <Badge variant="default" className="capitalize font-semibold mt-1">
                {profile.role}
              </Badge>
            </div>

            <div className="pt-2 border-t text-[11px] text-muted-foreground flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              <span>Akun memiliki kontrol penuh terhadap seluruh data operasional di organisasi ini.</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
