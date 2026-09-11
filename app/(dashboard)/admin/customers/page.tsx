import Link from 'next/link'
import { requireRole } from '@/lib/auth'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { CreateCustomerDialog } from './create-customer-dialog'
import { WhatsAppActionDialog } from '@/components/whatsapp/whatsapp-action-dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Building2, Phone, Mail, MapPin, Eye, Plus, Calendar } from 'lucide-react'

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
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-[24px] font-semibold text-[#0F172A] tracking-[-0.015em]">
            Manajemen Customer
          </h1>
          <p className="text-[14px] text-[#475569] font-normal mt-2 leading-relaxed">
            Daftar klien dan lokasi pekerjaan servis untuk penugasan job lapangan.
          </p>
        </div>
        <CreateCustomerDialog />
      </div>

      {list.length === 0 ? (
        /* Empty State */
        <div className="rounded-[12px] bg-[#FFFFFF] border border-[#E2E8F0] shadow-[0_1px_3px_0_rgba(15,23,42,0.03),0_1px_2px_0_rgba(15,23,42,0.02)] p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-[8px] bg-[#EBF5FC] border border-[#D0E8F8] text-[#007ACC] mb-4">
            <Building2 className="h-6 w-6" />
          </div>
          <h3 className="font-heading text-[16px] font-semibold text-[#0F172A]">Belum Ada Data Customer</h3>
          <p className="text-[13px] text-[#475569] max-w-sm mx-auto mt-2 mb-6 leading-relaxed">
            Tambahkan customer pertama Anda agar dapat mulai menjadwalkan pekerjaan servis teknisi.
          </p>
          <CreateCustomerDialog />
        </div>
      ) : (
        /* Customer Table Container with Thin-Line & Smooth Shadow */
        <div className="rounded-[12px] bg-[#FFFFFF] border border-[#E2E8F0] shadow-[0_1px_3px_0_rgba(15,23,42,0.03),0_1px_2px_0_rgba(15,23,42,0.02)] overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-[#E2E8F0] bg-[#F8FAFC] hover:bg-[#F8FAFC]">
                  <TableHead className="h-11 px-4 text-[12px] font-semibold text-[#475569] uppercase tracking-[0.02em] w-[30%] min-w-[220px]">
                    Customer
                  </TableHead>
                  <TableHead className="h-11 px-4 text-[12px] font-semibold text-[#475569] uppercase tracking-[0.02em] w-[24%] min-w-[180px]">
                    Kontak
                  </TableHead>
                  <TableHead className="h-11 px-4 text-[12px] font-semibold text-[#475569] uppercase tracking-[0.02em] w-[28%] min-w-[220px]">
                    Alamat Servis
                  </TableHead>
                  <TableHead className="h-11 px-4 text-[12px] font-semibold text-[#475569] uppercase tracking-[0.02em] w-[10%] min-w-[110px]">
                    Terdaftar
                  </TableHead>
                  <TableHead className="h-11 px-4 text-[12px] font-semibold text-[#475569] uppercase tracking-[0.02em] text-center w-[8%] min-w-[120px]">
                    Aksi
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.map((c) => (
                  <TableRow
                    key={c.id}
                    className="border-b border-[#F1F5F9] hover:bg-[#F8FAFC] transition-colors group"
                  >
                    {/* Customer Info */}
                    <TableCell className="px-4 py-2 align-middle">
                      <div className="flex items-center gap-2">
                        <div className="h-9 w-9 rounded-[8px] bg-[#EBF5FC] border border-[#D0E8F8] text-[#007ACC] flex items-center justify-center shrink-0 font-semibold text-[13px]">
                          {c.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <Link
                            href={`/admin/customers/${c.id}`}
                            className="font-heading text-[13.5px] font-semibold text-[#0F172A] group-hover:text-[#007ACC] transition-colors truncate max-w-[200px]"
                            title={c.name}
                          >
                            {c.name}
                          </Link>
                          <span className="text-[11px] text-[#94A3B8] font-mono tracking-tight">
                            ID: {c.id.slice(0, 8)}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    {/* Kontak (Consistent 8px gap between Phone and Email) */}
                    <TableCell className="px-4 py-2 align-middle">
                      <div className="space-y-2">
                        {c.phone ? (
                          <div className="flex items-center gap-2 text-[12.5px] text-[#0F172A]">
                            <div className="h-5 w-5 rounded-[6px] bg-[#F1F5F9] text-[#64748B] flex items-center justify-center shrink-0">
                              <Phone className="h-3 w-3" />
                            </div>
                            <span className="font-mono text-[12px]">{c.phone}</span>
                          </div>
                        ) : null}

                        {c.email ? (
                          <div className="flex items-center gap-2 text-[12px] text-[#64748B]">
                            <div className="h-5 w-5 rounded-[6px] bg-[#F1F5F9] text-[#64748B] flex items-center justify-center shrink-0">
                              <Mail className="h-3 w-3" />
                            </div>
                            <span className="truncate max-w-[170px]" title={c.email}>
                              {c.email}
                            </span>
                          </div>
                        ) : null}

                        {!c.phone && !c.email && (
                          <span className="text-[12px] text-[#94A3B8] italic">Belum ada kontak</span>
                        )}
                      </div>
                    </TableCell>

                    {/* Alamat Servis */}
                    <TableCell className="px-4 py-2 align-middle">
                      <div className="flex items-start gap-2 max-w-[260px] xl:max-w-[320px]">
                        <div className="h-5 w-5 rounded-[6px] bg-[#F1F5F9] text-[#64748B] flex items-center justify-center shrink-0 mt-0.5">
                          <MapPin className="h-3 w-3" />
                        </div>
                        <span className="text-[12.5px] text-[#475569] leading-relaxed line-clamp-2" title={c.address}>
                          {c.address || <span className="text-[#94A3B8] italic">Alamat belum diisi</span>}
                        </span>
                      </div>
                    </TableCell>

                    {/* Terdaftar */}
                    <TableCell className="px-4 py-2 align-middle">
                      <div className="flex items-center gap-2 text-[12px] text-[#64748B]">
                        <Calendar className="h-3.5 w-3.5 text-[#94A3B8] shrink-0" />
                        <span className="whitespace-nowrap font-medium">
                          {new Date(c.created_at).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                    </TableCell>

                    {/* Aksi */}
                    <TableCell className="px-4 py-2 align-middle text-center">
                      <div className="flex items-center justify-center gap-2">
                        {c.phone && (
                          <WhatsAppActionDialog
                            recipientType="customer"
                            recipientName={c.name}
                            recipientPhone={c.phone}
                            templateData={{
                              customerName: c.name,
                              address: c.address,
                            }}
                            triggerButtonText=""
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 rounded-[8px] border border-[#E2E8F0] hover:bg-primary hover:text-white text-[#64748B] transition-colors p-0 flex items-center justify-center shadow-none shrink-0"
                          />
                        )}
                        <Link
                          href={`/admin/customers/${c.id}`}
                          title="Lihat Detail Customer"
                          className="h-8 w-8 rounded-[8px] border border-[#E2E8F0] hover:bg-primary hover:text-white text-[#64748B] transition-colors flex items-center justify-center shrink-0"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link
                          href={`/admin/jobs/new?customerId=${c.id}`}
                          title="Buat Job Baru"
                          className="h-8 w-8 rounded-[8px] border border-[#E2E8F0] hover:bg-primary hover:text-white text-[#64748B] transition-colors flex items-center justify-center shrink-0"
                        >
                          <Plus className="h-4 w-4" />
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  )
}
