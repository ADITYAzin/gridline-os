import { requireRole } from '@/lib/auth'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { CreateCustomerDialog } from './create-customer-dialog'
import { ImportCustomersDialog } from './import-customers-dialog'
import { CustomersTableView } from '@/components/customers/customers-table-view'
import { Building2 } from 'lucide-react'

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
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-heading">
            Pelanggan
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Kelola data pelanggan, kontak, dan alamat lokasi servis untuk penugasan tiket.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <ImportCustomersDialog />
          <CreateCustomerDialog />
        </div>
      </div>

      {list.length === 0 ? (
        /* Empty State */
        <div className="rounded-[12px] bg-[#FFFFFF] border border-[#E2E8F0] shadow-[0_1px_3px_0_rgba(15,23,42,0.03),0_1px_2px_0_rgba(15,23,42,0.02)] p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-[8px] bg-[#EBF5FC] border border-[#D0E8F8] text-[#007ACC] mb-4">
            <Building2 className="h-6 w-6" />
          </div>
          <h3 className="font-heading text-[16px] font-semibold text-[#0F172A]">Belum Ada Data Pelanggan</h3>
          <p className="text-[13px] text-[#475569] max-w-sm mx-auto mt-2 mb-6 leading-relaxed">
            Tambahkan pelanggan manual atau migrasikan database klien lama Anda menggunakan file CSV untuk mulai menjadwalkan pekerjaan teknisi.
          </p>
          <div className="flex items-center justify-center gap-3">
            <ImportCustomersDialog />
            <CreateCustomerDialog />
          </div>
        </div>
      ) : (
        <CustomersTableView customers={list} />
      )}
    </div>
  )
}
