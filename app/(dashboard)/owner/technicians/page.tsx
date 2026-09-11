import { requireRole } from '@/lib/auth'
import { createSupabaseServerClient } from '@/lib/supabase/server'
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

      <div className="rounded-[12px] bg-[#FFFFFF] border border-[#E2E8F0] shadow-[0_1px_3px_0_rgba(15,23,42,0.03),0_1px_2px_0_rgba(15,23,42,0.02)] overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-[#E2E8F0] bg-[#F8FAFC] hover:bg-[#F8FAFC]">
                <TableHead className="h-11 px-4 text-[12px] font-semibold text-[#475569] uppercase tracking-[0.02em]">
                  Nama Teknisi
                </TableHead>
                <TableHead className="h-11 px-4 text-[12px] font-semibold text-[#475569] uppercase tracking-[0.02em]">
                  Email
                </TableHead>
                <TableHead className="h-11 px-4 text-[12px] font-semibold text-[#475569] uppercase tracking-[0.02em]">
                  Kontak Telepon
                </TableHead>
                <TableHead className="h-11 px-4 text-[12px] font-semibold text-[#475569] uppercase tracking-[0.02em] w-[140px]">
                  Bergabung
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.map((t) => (
                <TableRow key={t.id} className="border-b border-[#F1F5F9] hover:bg-[#F8FAFC] transition-colors group">
                  <TableCell className="px-4 py-2 align-middle font-semibold text-sm text-[#0F172A]">{t.name}</TableCell>
                  <TableCell className="px-4 py-2 align-middle text-xs text-[#64748B]">
                    <span className="flex items-center gap-1.5">
                      <Mail className="h-3 w-3" /> {t.email}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-2 align-middle text-xs text-[#64748B]">
                    {t.phone ? (
                      <span className="flex items-center gap-1.5">
                        <Phone className="h-3 w-3" /> {t.phone}
                      </span>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell className="px-4 py-2 align-middle text-xs text-[#64748B]">
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
        </div>
      </div>
    </div>
  )
}
