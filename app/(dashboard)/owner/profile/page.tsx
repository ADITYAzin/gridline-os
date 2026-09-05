import { requireRole } from '@/lib/auth'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { User, Mail, Eye } from 'lucide-react'

export default async function OwnerProfilePage() {
  const profile = await requireRole('owner')
  const supabase = await createSupabaseServerClient()

  const { data: org } = await supabase
    .from('organizations')
    .select('name, subscription_tier, created_at')
    .eq('id', profile.orgId)
    .single()

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Akun Manajemen / Owner</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Akses monitoring eksekutif terhadap operasional perusahaan Anda.
        </p>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <User className="h-4 w-4 text-emerald-600" />
            Detail Akun
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-xs">
          <div>
            <span className="text-muted-foreground block font-medium">Nama:</span>
            <span className="font-bold text-sm">{profile.name}</span>
          </div>

          <div>
            <span className="text-muted-foreground block font-medium">Email:</span>
            <div className="flex items-center gap-1 mt-0.5 text-foreground">
              <Mail className="h-3.5 w-3.5 text-muted-foreground" />
              <span>{profile.email}</span>
            </div>
          </div>

          <div>
            <span className="text-muted-foreground block font-medium">Peran:</span>
            <Badge variant="secondary" className="capitalize font-semibold text-emerald-700 bg-emerald-500/10 mt-1 gap-1">
              <Eye className="h-3 w-3" /> Owner / Manager
            </Badge>
          </div>

          <div className="pt-2 border-t">
            <span className="text-muted-foreground block font-medium">Perusahaan:</span>
            <span className="font-semibold text-foreground text-sm">{org?.name}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
