import { requireRole } from '@/lib/auth'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { Card } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Mail, Phone } from 'lucide-react'

export default async function OwnerTechniciansPage() {
  const profile = await requireRole('owner')
  const supabase = await createSupabaseServerClient()

  // Fetch technicians and count their assigned jobs
  const { data: techs } = await supabase
    .from('profiles')
    .select('id, name, email, phone, created_at')
    .eq('org_id', profile.orgId)
    .eq('role', 'technician')
    .order('name')

  const list = techs || []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Monitoring Teknisi (Owner View)</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Daftar seluruh tenaga kerja lapangan yang terdaftar di perusahaan.
        </p>
      </div>

      <Card className="shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama Teknisi</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Kontak Telepon</TableHead>
              <TableHead className="w-[140px]">Bergabung</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.map((t) => (
              <TableRow key={t.id}>
                <TableCell className="font-semibold text-sm">{t.name}</TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Mail className="h-3 w-3" /> {t.email}
                  </span>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {t.phone ? (
                    <span className="flex items-center gap-1.5">
                      <Phone className="h-3 w-3" /> {t.phone}
                    </span>
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {new Date(t.created_at).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
