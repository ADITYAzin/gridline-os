import { requireRole } from '@/lib/auth'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { CreateCustomerDialog } from './create-customer-dialog'
import { Card, CardDescription, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Building2, Phone, Mail, MapPin } from 'lucide-react'

export default async function CustomersPage() {
  const profile = await requireRole('admin')
  const supabase = await createSupabaseServerClient()

  const { data: customers } = await supabase
    .from('customers')
    .select('id, name, phone, email, address, created_at')
    .eq('org_id', profile.orgId)
    .order('created_at', { ascending: false })

  const list = customers || []

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Manajemen Customer</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Daftar klien dan lokasi pekerjaan servis untuk penugasan job lapangan.
          </p>
        </div>
        <CreateCustomerDialog />
      </div>

      {list.length === 0 ? (
        <Card className="text-center p-12 border-dashed">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-muted-foreground mb-3">
            <Building2 className="h-6 w-6" />
          </div>
          <CardTitle className="text-lg">Belum Ada Data Customer</CardTitle>
          <CardDescription className="text-sm max-w-sm mx-auto mt-1 mb-4">
            Tambahkan customer pertama Anda agar dapat menjadwalkan pekerjaan servis teknisi.
          </CardDescription>
          <CreateCustomerDialog />
        </Card>
      ) : (
        <Card className="shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Customer</TableHead>
                <TableHead>Kontak</TableHead>
                <TableHead>Alamat Servis</TableHead>
                <TableHead className="w-[120px]">Terdaftar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-semibold">{c.name}</TableCell>
                  <TableCell>
                    <div className="text-xs space-y-1">
                      {c.phone && (
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Phone className="h-3 w-3" /> {c.phone}
                        </div>
                      )}
                      {c.email && (
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Mail className="h-3 w-3" /> {c.email}
                        </div>
                      )}
                      {!c.phone && !c.email && <span className="text-muted-foreground">-</span>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-start gap-1.5 text-xs text-muted-foreground max-w-md">
                      <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                      <span>{c.address}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(c.created_at).toLocaleDateString('id-ID', {
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
      )}
    </div>
  )
}
