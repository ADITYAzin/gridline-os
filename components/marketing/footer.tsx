import Link from 'next/link'
import Image from 'next/image'

export function MarketingFooter() {
  return (
    <footer className="border-t border-[#E2E8F0] bg-[#FFFFFF]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="inline-block">
              <Image
                src="/images/opilines-logo.png"
                alt="Opilines"
                width={130}
                height={24}
                className="h-auto w-[130px] object-contain"
              />
            </Link>
            <p className="text-[13.5px] text-[#475569] leading-relaxed max-w-sm">
              Satu operating system terpusat untuk perusahaan jasa teknis di Indonesia. Dari penugasan teknisi, verifikasi SOP lapangan, hingga Berita Acara Pekerjaan (BAP) otomatis.
            </p>
            <div className="pt-2">
              <span className="inline-flex items-center gap-2 rounded-[6px] bg-[#F1F5F9] border border-[#E2E8F0] px-2.5 py-1 text-[11px] font-medium text-[#475569]">
                <span className="h-2 w-2 rounded-full bg-[#10B981]" />
                Server Lokal Indonesia (Latensi Rendah)
              </span>
            </div>
          </div>

          {/* Nav Col 1: Produk */}
          <div className="space-y-4">
            <h4 className="font-heading text-[13px] font-semibold uppercase tracking-[0.04em] text-[#0F172A]">
              Produk
            </h4>
            <ul className="space-y-2 text-[13px] text-[#475569]">
              <li>
                <Link href="/fitur#dispatch" className="hover:text-[#007ACC] transition-colors">
                  Smart Dispatching
                </Link>
              </li>
              <li>
                <Link href="/fitur#mobile" className="hover:text-[#007ACC] transition-colors">
                  Aplikasi Mobile Teknisi
                </Link>
              </li>
              <li>
                <Link href="/fitur#bap" className="hover:text-[#007ACC] transition-colors">
                  BAP Digital Otomatis
                </Link>
              </li>
              <li>
                <Link href="/fitur#assets" className="hover:text-[#007ACC] transition-colors">
                  Riwayat Servis & Aset
                </Link>
              </li>
            </ul>
          </div>

          {/* Nav Col 2: Solusi Bisnis */}
          <div className="space-y-4">
            <h4 className="font-heading text-[13px] font-semibold uppercase tracking-[0.04em] text-[#0F172A]">
              Solusi Industri
            </h4>
            <ul className="space-y-2 text-[13px] text-[#475569]">
              <li>
                <span className="text-[#64748B]">Servis AC & HVAC</span>
              </li>
              <li>
                <span className="text-[#64748B]">Maintenance Gedung</span>
              </li>
              <li>
                <span className="text-[#64748B]">Instalasi CCTV & Keamanan</span>
              </li>
              <li>
                <span className="text-[#64748B]">Elektrikal & Jaringan ISP</span>
              </li>
            </ul>
          </div>

          {/* Nav Col 3: Perusahaan & Akses */}
          <div className="space-y-4">
            <h4 className="font-heading text-[13px] font-semibold uppercase tracking-[0.04em] text-[#0F172A]">
              Bantuan & Akses
            </h4>
            <ul className="space-y-2 text-[13px] text-[#475569]">
              <li>
                <Link href="/pricing" className="hover:text-[#007ACC] transition-colors">
                  Paket & Biaya Langganan
                </Link>
              </li>
              <li>
                <Link href="/demo" className="hover:text-[#007ACC] transition-colors">
                  Jadwalkan Demo Langsung
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-[#007ACC] transition-colors">
                  Masuk ke Portal
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-[#007ACC] transition-colors font-medium text-[#007ACC]">
                  Daftar Akun Baru
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[12px] text-[#94A3B8]">
            © {new Date().getFullYear()} Opilines. All rights reserved. Dirancang untuk operasional teknisi Indonesia.
          </p>
          <div className="flex items-center gap-6 text-[12px] text-[#64748B]">
            <span>Standar Keamanan Enkripsi End-to-End</span>
            <span>•</span>
            <span>B2B Field Service Management</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
