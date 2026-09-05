import { requireRole } from '@/lib/auth'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { InviteMemberDialog } from './invite-member-dialog'
import { Card } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Mail, Phone } from 'lucide-react'

export default async function TechniciansPage() {
  const profile = await requireRole('admin')
  const supabase = await createSupabaseServerClient()

  // Fetch team members in this org
  const { data: members } = await supabase
    .from('profiles')
    .select('id, name, email, phone, role, created_at')
    .eq('org_id', profile.orgId)
    .order('role', { ascending: true })

  const list = members || []

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Anggota Tim & Teknisi</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Kelola daftar pekerja lapangan dan hak akses operasional organisasi.
          </p>
        </div>
        <InviteMemberDialog />
      </div>

      <Card className="shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>Peran</TableHead>
              <TableHead>Kontak</TableHead>
              <TableHead className="w-[140px]">Bergabung</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.map((m) => (
              <TableRow key={m.id}>
                <TableCell>
                  <div className="font-semibold">{m.name}</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <Mail className="h-3 w-3" /> {m.email}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      m.role === 'admin'
                        ? 'default'
                        : m.role === 'owner'
                        ? 'secondary'
                        : 'outline'
                    }
                    className="capitalize text-xs font-semibold px-2.5 py-0.5"
                  >
                    {m.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="text-xs text-muted-foreground">
                    {m.phone ? (
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" /> {m.phone}
                      </span>
                    ) : (
                      '-'
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {new Date(m.created_at).toLocaleDateString('id-ID', {
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
