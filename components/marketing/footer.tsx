import Link from 'next/link'
import Image from 'next/image'

export function MarketingFooter() {
  return (
    <footer className="border-t border-[#E2E8F0] bg-[#FFFFFF]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-8">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-3.5">
            <Link href="/" className="inline-block">
              <Image
                src="/images/opilines-logo.png"
                alt="Opilines"
                width={130}
                height={24}
                className="h-auto w-[130px] object-contain"
              />
            </Link>
            <p className="text-[13px] text-[#475569] leading-relaxed max-w-sm">
              Satu operating system terpusat untuk perusahaan jasa teknis di Indonesia. Dari penugasan teknisi, verifikasi SOP lapangan, hingga Berita Acara Pekerjaan (BAP) otomatis.
            </p>
            <div className="pt-1 text-[12px] text-[#64748B] space-y-1">
              <p>Email Resmi: <span className="font-medium text-[#0F172A]">billing@opilines.id</span></p>
              <p>Layanan Pelanggan: <span className="font-medium text-[#0F172A]">+62 888-777-1117</span></p>
            </div>
          </div>

          {/* Nav Col 1: Produk */}
          <div className="space-y-3.5">
            <h4 className="font-heading text-[12.5px] font-semibold uppercase tracking-[0.04em] text-[#0F172A]">
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
                  Riwayat Servis &amp; Aset
                </Link>
              </li>
            </ul>
          </div>

          {/* Nav Col 2: Solusi Bisnis */}
          <div className="space-y-3.5">
            <h4 className="font-heading text-[12.5px] font-semibold uppercase tracking-[0.04em] text-[#0F172A]">
              Solusi Industri
            </h4>
            <ul className="space-y-2 text-[13px] text-[#475569]">
              <li>
                <span className="text-[#64748B]">Servis AC &amp; HVAC</span>
              </li>
              <li>
                <span className="text-[#64748B]">Maintenance Gedung</span>
              </li>
              <li>
                <span className="text-[#64748B]">Instalasi CCTV &amp; Keamanan</span>
              </li>
              <li>
                <span className="text-[#64748B]">Elektrikal &amp; Jaringan ISP</span>
              </li>
            </ul>
          </div>

          {/* Nav Col 3: Langganan & Akses */}
          <div className="space-y-3.5">
            <h4 className="font-heading text-[12.5px] font-semibold uppercase tracking-[0.04em] text-[#0F172A]">
              Langganan &amp; Akses
            </h4>
            <ul className="space-y-2 text-[13px] text-[#475569]">
              <li>
                <Link href="/pricing" className="hover:text-[#007ACC] transition-colors">
                  Harga Paket (IDR)
                </Link>
              </li>
              <li>
                <Link href="/checkout" className="hover:text-[#007ACC] transition-colors">
                  Halaman Checkout
                </Link>
              </li>
              <li>
                <Link href="/demo" className="hover:text-[#007ACC] transition-colors">
                  Jadwalkan Demo
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-[#007ACC] transition-colors">
                  Masuk ke Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Nav Col 4: Legal & Kepatuhan */}
          <div className="space-y-3.5">
            <h4 className="font-heading text-[12.5px] font-semibold uppercase tracking-[0.04em] text-[#0F172A]">
              Legal &amp; Kebijakan
            </h4>
            <ul className="space-y-2 text-[13px] text-[#475569]">
              <li>
                <Link href="/terms" className="hover:text-[#007ACC] transition-colors">
                  Syarat &amp; Ketentuan
                </Link>
              </li>
              <li>
                <Link href="/terms#refund" className="hover:text-[#007ACC] transition-colors">
                  Kebijakan Refund &amp; Batal
                </Link>
              </li>
              <li>
                <Link href="/terms#privacy" className="hover:text-[#007ACC] transition-colors">
                  Privasi &amp; Keamanan Data
                </Link>
              </li>
              <li>
                <Link href="/terms#pembayaran" className="hover:text-[#007ACC] transition-colors">
                  Informasi Pembayaran
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[12px] text-[#94A3B8]">
            © {new Date().getFullYear()} Opilines Indonesia. All rights reserved. Transaksi resmi dalam Rupiah (IDR).
          </p>
          <div className="flex flex-wrap items-center gap-4 text-[12px] text-[#64748B]">
            <span>Enkripsi TLS 256-Bit</span>
            <span>•</span>
            <span>Midtrans PCI-DSS Level 1</span>
            <span>•</span>
            <Link href="/terms" className="hover:text-[#007ACC] transition-colors">
              Syarat &amp; Ketentuan
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
