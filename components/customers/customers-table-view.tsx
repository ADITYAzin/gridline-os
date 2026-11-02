'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  Building2,
  Phone,
  Mail,
  MapPin,
  Eye,
  Plus,
  Calendar,
  Search,
  X,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { WhatsAppActionDialog } from '@/components/whatsapp/whatsapp-action-dialog'
import { EditCustomerDialog } from '@/components/customers/edit-customer-dialog'
import { DeleteCustomerDialog } from '@/components/customers/delete-customer-dialog'

export interface CustomerItem {
  id: string
  name: string
  phone?: string | null
  email?: string | null
  address?: string | null
  created_at: string
}

interface CustomersTableViewProps {
  customers: CustomerItem[]
}

export function CustomersTableView({ customers }: CustomersTableViewProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredCustomers = useMemo(() => {
    if (!searchQuery.trim()) return customers
    const q = searchQuery.toLowerCase().trim()
    return customers.filter((c) => {
      const matchName = c.name.toLowerCase().includes(q)
      const matchPhone = (c.phone || '').toLowerCase().includes(q)
      const matchEmail = (c.email || '').toLowerCase().includes(q)
      const matchAddress = (c.address || '').toLowerCase().includes(q)
      return matchName || matchPhone || matchEmail || matchAddress
    })
  }, [customers, searchQuery])

  return (
    <div className="space-y-4">
      {/* Search Bar on LEFT & Counter on RIGHT */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3">
        <div className="relative w-full sm:w-80 md:w-96 shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama pelanggan, telepon, email, alamat..."
            className="pl-8.5 pr-8 h-9 text-xs bg-white rounded-lg border-slate-200"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 rounded transition-colors"
              title="Hapus pencarian"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="text-xs text-slate-500 font-medium">
          {searchQuery ? (
            <span>
              Menampilkan <strong>{filteredCustomers.length}</strong> dari {customers.length} pelanggan
            </span>
          ) : (
            <span>Total <strong>{customers.length}</strong> pelanggan</span>
          )}
        </div>
      </div>

      {/* Table Container */}
      <div className="rounded-[12px] bg-[#FFFFFF] border border-[#E2E8F0] shadow-[0_1px_3px_0_rgba(15,23,42,0.03),0_1px_2px_0_rgba(15,23,42,0.02)] overflow-hidden">
        {filteredCustomers.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-400">
              <Search className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <p className="font-heading text-sm font-semibold text-slate-900">
                Tidak ada pelanggan yang cocok
              </p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Tidak ditemukan pelanggan yang cocok dengan kata kunci &quot;{searchQuery}&quot;.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setSearchQuery('')}
              className="text-xs h-8"
            >
              Reset Pencarian
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-[#E2E8F0] bg-[#F8FAFC] hover:bg-[#F8FAFC]">
                  <TableHead className="h-11 px-4 text-[12px] font-semibold text-[#475569] uppercase tracking-[0.02em] w-[30%] min-w-[220px]">
                    Pelanggan
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
                  <TableHead className="h-11 px-4 text-[12px] font-semibold text-[#475569] uppercase tracking-[0.02em] text-center w-[10%] min-w-[160px]">
                    Aksi
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((c) => (
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
                          <span className="text-[11px] text-[#94A3B8]">ID: {c.id.slice(0, 8)}</span>
                        </div>
                      </div>
                    </TableCell>

                    {/* Kontak */}
                    <TableCell className="px-4 py-2 align-middle">
                      <div className="flex flex-col gap-0.5">
                        {c.phone && (
                          <div className="flex items-center gap-1.5 text-[12.5px] text-[#475569] font-medium">
                            <Phone className="h-3.5 w-3.5 text-[#007ACC] shrink-0" />
                            <span>{c.phone}</span>
                          </div>
                        )}

                        {c.email && (
                          <div className="flex items-center gap-1.5 text-[12px] text-[#64748B]">
                            <Mail className="h-3.5 w-3.5 text-[#94A3B8] shrink-0" />
                            <span className="truncate max-w-[180px]" title={c.email}>
                              {c.email}
                            </span>
                          </div>
                        )}

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
                        <span className="text-[12.5px] text-[#475569] leading-relaxed line-clamp-2" title={c.address || ''}>
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
                              address: c.address || '',
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
                        <EditCustomerDialog
                          customer={{
                            id: c.id,
                            name: c.name,
                            phone: c.phone,
                            email: c.email,
                            address: c.address || '',
                          }}
                          triggerVariant="icon"
                        />
                        <DeleteCustomerDialog
                          customerId={c.id}
                          customerName={c.name}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  )
}
