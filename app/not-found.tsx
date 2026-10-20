import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { FileQuestion, ArrowLeft, LayoutDashboard } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#F8FAFC] text-center select-none">
      <div className="max-w-md w-full bg-white rounded-[16px] border border-[#E2E8F0] shadow-sm p-8 space-y-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#EBF5FC] text-[#007ACC]">
          <FileQuestion className="h-8 w-8 stroke-[1.8]" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#F1F5F9] text-[#475569]">
            Error 404
          </div>
          <h1 className="text-xl font-bold font-heading text-[#0F172A] tracking-tight">
            Halaman Tidak Ditemukan
          </h1>
          <p className="text-xs text-[#64748B] leading-relaxed">
            Halaman, tiket pekerjaan, atau data yang Anda tuju tidak ditemukan, telah dipindahkan, atau akun Anda tidak memiliki hak akses ke data ini.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center gap-2 justify-center">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="w-full sm:w-auto h-9 text-xs rounded-[8px] gap-1.5 border-[#E2E8F0] text-[#475569] hover:text-[#0F172A]"
          >
            <Link href="/login">
              <ArrowLeft className="h-3.5 w-3.5" />
              Ke Halaman Login
            </Link>
          </Button>

          <Button
            asChild
            size="sm"
            className="w-full sm:w-auto h-9 text-xs rounded-[8px] gap-1.5 bg-[#007ACC] hover:bg-[#0062A3] text-white font-medium"
          >
            <Link href="/admin">
              <LayoutDashboard className="h-3.5 w-3.5" />
              Dashboard Utama
            </Link>
          </Button>
        </div>
      </div>

      <p className="text-[11px] text-[#94A3B8] mt-6">
        Gridline OS • Operasional Servis & Lapangan
      </p>
    </div>
  )
}
