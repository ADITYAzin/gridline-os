import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ShieldCheck,
  FileText,
  CreditCard,
  RotateCcw,
  Lock,
  Scale,
  Building2,
  ArrowRight,
  CheckCircle2,
  Mail,
  Phone,
  MapPin,
} from 'lucide-react'
import { formatRupiah, TIER_PRICING } from '@/lib/pricing'

export const metadata: Metadata = {
  title: 'Syarat & Ketentuan Layanan — Opilines',
  description:
    'Syarat dan Ketentuan Penggunaan, Kebijakan Pembayaran Midtrans (IDR), Kebijakan Pengembalian Dana (Refund Policy), dan Privasi Data Opilines.',
}

const SECTIONS = [
  { id: 'ruang-lingkup', title: '1. Ruang Lingkup Layanan', icon: FileText },
  { id: 'akun-keamanan', title: '2. Ketentuan Akun & Multi-Tenant', icon: Building2 },
  { id: 'pembayaran', title: '3. Harga & Pembayaran (IDR)', icon: CreditCard },
  { id: 'refund', title: '4. Kebijakan Pembatalan & Refund', icon: RotateCcw },
  { id: 'privacy', title: '5. Privasi & Keamanan Data', icon: Lock },
  { id: 'hukum', title: '6. Hukum & Penyelesaian Sengketa', icon: Scale },
]

export default function TermsAndConditionsPage() {
  return (
    <div className="py-12 md:py-16">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Header */}
        <div className="rounded-[16px] border border-[#E2E8F0] bg-[#FFFFFF] p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#D0E8F8] bg-[#EBF5FC] px-3 py-1 text-[11.5px] font-semibold text-[#007ACC]">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>DOKUMEN LEGAL & KEPATUHAN TRANSAKSI</span>
            </div>
            <span className="text-[12px] text-[#64748B]">
              Berlaku Efektif: 1 November 2026 • Mata Uang Transaksi: IDR (Rupiah)
            </span>
          </div>

          <div className="space-y-2">
            <h1 className="font-heading text-[26px] sm:text-[34px] font-bold text-[#0F172A] tracking-tight">
              Syarat & Ketentuan Layanan Opilines
            </h1>
            <p className="text-[14px] sm:text-[15px] text-[#475569] leading-relaxed max-w-3xl">
              Ketentuan penggunaan platform manajemen operasional teknisi lapangan Opilines, termasuk kebijakan tagihan berlangganan dalam Rupiah (IDR), pemrosesan pembayaran melalui gerbang pembayaran resmi Midtrans, serta kebijakan pembatalan dan pengembalian dana.
            </p>
          </div>

          {/* Quick Jump Pills */}
          <div className="pt-2 flex flex-wrap gap-2">
            {SECTIONS.map((s) => {
              const Icon = s.icon
              return (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className="inline-flex items-center gap-1.5 rounded-[8px] border border-[#E2E8F0] bg-[#F8FAFC] hover:border-[#007ACC]/40 hover:bg-[#EBF5FC]/50 px-3 py-1.5 text-[12px] font-medium text-[#334155] hover:text-[#007ACC] transition-colors"
                >
                  <Icon className="h-3.5 w-3.5 text-[#007ACC]" />
                  <span>{s.title}</span>
                </a>
              )
            })}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Legal Sections */}
          <div className="lg:col-span-8 space-y-6">
            {/* Section 1 */}
            <section
              id="ruang-lingkup"
              className="scroll-mt-24 rounded-[14px] border border-[#E2E8F0] bg-[#FFFFFF] p-6 sm:p-7 space-y-3 shadow-xs"
            >
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-[8px] bg-[#EBF5FC] text-[#007ACC] flex items-center justify-center shrink-0">
                  <FileText className="h-4 w-4" />
                </div>
                <h2 className="font-heading text-[17px] font-bold text-[#0F172A]">
                  1. Definisi & Ruang Lingkup Layanan
                </h2>
              </div>
              <p className="text-[13.5px] text-[#475569] leading-relaxed">
                <strong>Opilines</strong> adalah perangkat lunak berbasis komputasi awan <em>(Software-as-a-Service / B2B Field Service Management)</em> yang menyediakan fitur penjadwalan teknisi, manajemen tiket kerja <em>(Work Order)</em>, verifikasi SOP & presensi GPS lapangan, riwayat aset pelanggan, serta penerbitan Berita Acara Pekerjaan (BAP) digital.
              </p>
              <ul className="space-y-2 text-[13px] text-[#475569] pt-1">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#10B981] shrink-0 mt-0.5" />
                  <span>Layanan disediakan secara berlangganan <em>(subscription)</em> sesuai kapasitas kuota paket yang dipilih oleh Pelanggan (Organisasi/Perusahaan).</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#10B981] shrink-0 mt-0.5" />
                  <span>Aktivasi layanan dilakukan secara instan setelah pembayaran terverifikasi otomatis oleh sistem pembayaran atau saat masa uji coba <em>(Trial 14 Hari)</em> diaktifkan.</span>
                </li>
              </ul>
            </section>

            {/* Section 2 */}
            <section
              id="akun-keamanan"
              className="scroll-mt-24 rounded-[14px] border border-[#E2E8F0] bg-[#FFFFFF] p-6 sm:p-7 space-y-3 shadow-xs"
            >
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-[8px] bg-[#EBF5FC] text-[#007ACC] flex items-center justify-center shrink-0">
                  <Building2 className="h-4 w-4" />
                </div>
                <h2 className="font-heading text-[17px] font-bold text-[#0F172A]">
                  2. Ketentuan Akun, Kuota & Keamanan Multi-Tenant
                </h2>
              </div>
              <p className="text-[13.5px] text-[#475569] leading-relaxed">
                Setiap organisasi mendapatkan lingkungan data terisolasi <em>(Multi-Tenant Guard)</em>. Penanggung jawab akun (Admin/Owner) bertanggung jawab atas kerahasiaan kredensial akses dan manajemen anggota tim teknisi di bawah organisasinya.
              </p>
              <div className="rounded-[10px] bg-[#F8FAFC] border border-[#E2E8F0] p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-[12.5px]">
                <div>
                  <span className="font-semibold text-[#0F172A] block">Paket Starter</span>
                  <span className="text-[#64748B]">Maksimal 5 Teknisi Lapangan & 1 Akun Admin, 5 foto dokumentasi per tiket.</span>
                </div>
                <div>
                  <span className="font-semibold text-[#007ACC] block">Paket Professional</span>
                  <span className="text-[#64748B]">Maksimal 12 Teknisi Lapangan, 1 Admin & 1 Owner, 10 foto per tiket, Live Map & Custom SOP.</span>
                </div>
              </div>
            </section>

            {/* Section 3 */}
            <section
              id="pembayaran"
              className="scroll-mt-24 rounded-[14px] border border-[#E2E8F0] bg-[#FFFFFF] p-6 sm:p-7 space-y-3 shadow-xs"
            >
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-[8px] bg-[#EBF5FC] text-[#007ACC] flex items-center justify-center shrink-0">
                  <CreditCard className="h-4 w-4" />
                </div>
                <h2 className="font-heading text-[17px] font-bold text-[#0F172A]">
                  3. Harga, Mata Uang (IDR) & Pemrosesan Pembayaran Midtrans
                </h2>
              </div>
              <p className="text-[13.5px] text-[#475569] leading-relaxed">
                Seluruh harga layanan yang tertera pada halaman Harga dan Pengaturan Langganan dinyatakan dalam mata uang resmi <strong>Rupiah Indonesia (IDR / Rp)</strong>.
              </p>
              <ul className="space-y-2 text-[13px] text-[#475569]">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#007ACC] shrink-0 mt-0.5" />
                  <span>
                    <strong>Rincian Tarif Resmi:</strong> Paket Starter mulai dari <strong>{formatRupiah(TIER_PRICING.starter.annual)}/bulan</strong> (tahunan) atau <strong>{formatRupiah(TIER_PRICING.starter.monthly)}/bulan</strong> (bulanan). Paket Professional mulai dari <strong>{formatRupiah(TIER_PRICING.pro.annual)}/bulan</strong> (tahunan) atau <strong>{formatRupiah(TIER_PRICING.pro.monthly)}/bulan</strong> (bulanan). Tersedia diskon untuk periode 3 bulan (5%), 6 bulan (10%), dan 12 bulan (20%).
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#007ACC] shrink-0 mt-0.5" />
                  <span>
                    <strong>Payment Gateway Resmi:</strong> Pemrosesan transaksi online difasilitasi secara aman melalui <strong>Midtrans</strong> (PT Midtrans / GoTo Financial) yang telah tersertifikasi <strong>PCI-DSS Level 1</strong> dan diawasi oleh Bank Indonesia.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#007ACC] shrink-0 mt-0.5" />
                  <span>
                    <strong>Saluran Pembayaran:</strong> Mendukung Virtual Account Bank (BCA, Mandiri, BNI, BRI), QRIS, GoPay, serta Kartu Kredit/Debit berlogo Visa, Mastercard, dan JCB dengan otentikasi 3D Secure 2.0. Opilines tidak menyimpan nomor kartu kredit atau PIN perbankan pelanggan di server kami.
                  </span>
                </li>
              </ul>
            </section>

            {/* Section 4: Refund & Cancellation Policy (Midtrans Mandatory) */}
            <section
              id="refund"
              className="scroll-mt-24 rounded-[14px] border-2 border-[#007ACC]/25 bg-[#FFFFFF] p-6 sm:p-7 space-y-3 shadow-xs"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-[8px] bg-[#EBF5FC] text-[#007ACC] flex items-center justify-center shrink-0">
                    <RotateCcw className="h-4 w-4" />
                  </div>
                  <h2 className="font-heading text-[17px] font-bold text-[#0F172A]">
                    4. Kebijakan Pembatalan & Pengembalian Dana (Refund Policy)
                  </h2>
                </div>
                <span className="text-[11px] font-semibold bg-[#EBF5FC] text-[#007ACC] px-2.5 py-0.5 rounded-full">
                  Jaminan Transaksi
                </span>
              </div>
              <p className="text-[13.5px] text-[#475569] leading-relaxed">
                Opilines berkomitmen memberikan transparansi penuh atas setiap transaksi berlangganan:
              </p>
              <ul className="space-y-2.5 text-[13px] text-[#475569]">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#10B981] shrink-0 mt-0.5" />
                  <span>
                    <strong>Pembatalan Langganan (Cancellation):</strong> Pelanggan dapat membatalkan perpanjangan paket kapan saja melalui menu <em>Pengaturan &gt; Paket &amp; Langganan</em> atau menghubungi dukungan resmi sebelum tanggal jatuh tempo periode berikutnya. Akses paket tetap aktif hingga masa berlangganan berjalan berakhir.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#10B981] shrink-0 mt-0.5" />
                  <span>
                    <strong>Ketentuan Pengembalian Dana (Refund):</strong> Pengajuan pengembalian dana (refund 100%) dapat dilakukan dalam waktu <strong>maksimal 7 (tujuh) hari kalender</strong> sejak pembayaran pertama apabila terjadi: (a) pendebetan ganda <em>(double charge)</em> atas transaksi yang sama, atau (b) kegagalan teknis sistem Opilines yang menyebabkan akun sama sekali tidak dapat diaktifkan dan tidak terselesaikan dalam 3×24 jam kerja.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#10B981] shrink-0 mt-0.5" />
                  <span>
                    <strong>Prosedur & Durasi Refund:</strong> Permohonan dikirimkan ke email resmi <strong>billing@opilines.id</strong> dengan melampirkan Nomor Order (contoh: <code>OPL-PRO-...</code>) dan bukti bayar. Dana akan dikembalikan ke metode pembayaran awal atau rekening resmi perusahaan pemesan dalam waktu <strong>5–14 hari kerja bank</strong>.
                  </span>
                </li>
              </ul>
            </section>

            {/* Section 5: Privacy & Data Security */}
            <section
              id="privacy"
              className="scroll-mt-24 rounded-[14px] border border-[#E2E8F0] bg-[#FFFFFF] p-6 sm:p-7 space-y-3 shadow-xs"
            >
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-[8px] bg-[#EBF5FC] text-[#007ACC] flex items-center justify-center shrink-0">
                  <Lock className="h-4 w-4" />
                </div>
                <h2 className="font-heading text-[17px] font-bold text-[#0F172A]">
                  5. Privasi Data & Standar Keamanan Informasi
                </h2>
              </div>
              <p className="text-[13.5px] text-[#475569] leading-relaxed">
                Seluruh data operasional yang diunggah ke Opilines—termasuk database pelanggan, titik koordinat GPS teknisi, foto pekerjaan, dan dokumen BAP—sepenuhnya merupakan hak milik Pelanggan.
              </p>
              <ul className="space-y-2 text-[13px] text-[#475569]">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#10B981] shrink-0 mt-0.5" />
                  <span>Komunikasi data antara perangkat pengguna, server Opilines, dan API Midtrans dienkripsi penuh menggunakan protokol <strong>TLS 1.3 / HTTPS (SSL 256-bit)</strong> serta verifikasi tanda tangan kriptografi <strong>SHA-512</strong>.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#10B981] shrink-0 mt-0.5" />
                  <span>Kami mematuhi ketentuan Undang-Undang Pelindungan Data Pribadi (UU No. 27 Tahun 2022 Republik Indonesia) dan tidak pernah memperjualbelikan data pelanggan kepada pihak ketiga.</span>
                </li>
              </ul>
            </section>

            {/* Section 6: Governing Law */}
            <section
              id="hukum"
              className="scroll-mt-24 rounded-[14px] border border-[#E2E8F0] bg-[#FFFFFF] p-6 sm:p-7 space-y-3 shadow-xs"
            >
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-[8px] bg-[#EBF5FC] text-[#007ACC] flex items-center justify-center shrink-0">
                  <Scale className="h-4 w-4" />
                </div>
                <h2 className="font-heading text-[17px] font-bold text-[#0F172A]">
                  6. Hukum yang Berlaku & Penyelesaian Sengketa
                </h2>
              </div>
              <p className="text-[13.5px] text-[#475569] leading-relaxed">
                Syarat dan Ketentuan ini diatur dan ditafsirkan berdasarkan hukum yang berlaku di <strong>Negara Kesatuan Republik Indonesia</strong>. Apabila timbul perselisihan terkait layanan atau transaksi pembayaran, para pihak sepakat untuk menyelesaikannya terlebih dahulu secara musyawarah untuk mufakat dalam waktu 30 hari kalender.
              </p>
            </section>
          </div>

          {/* Right Sticky Contact & Action Card */}
          <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-4">
            <div className="rounded-[14px] border border-[#E2E8F0] bg-[#FFFFFF] p-6 space-y-4 shadow-xs">
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#007ACC]">
                  Identitas & Kontak Resmi
                </span>
                <h3 className="font-heading text-[16px] font-bold text-[#0F172A]">
                  Layanan Pelanggan & Billing
                </h3>
                <p className="text-[12.5px] text-[#64748B]">
                  Hubungi tim kami untuk pertanyaan seputar tagihan, faktur pajak, atau bantuan teknis pembayaran.
                </p>
              </div>

              <div className="space-y-3 pt-2 border-t border-[#F1F5F9] text-[13px] text-[#334155]">
                <div className="flex items-start gap-2.5">
                  <Building2 className="h-4 w-4 text-[#007ACC] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-[#0F172A] block">Opilines Indonesia (Gridline OS)</span>
                    <span className="text-[12px] text-[#64748B]">Platform SaaS Manajemen Teknisi B2B</span>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <Mail className="h-4 w-4 text-[#007ACC] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-medium text-[#0F172A] block">billing@opilines.id</span>
                    <span className="text-[12px] text-[#64748B]">Dukungan Transaksi & Refund (Senin–Jumat, 09.00–18.00 WIB)</span>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <Phone className="h-4 w-4 text-[#007ACC] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-medium text-[#0F172A] block">+62 812-3456-7890</span>
                    <span className="text-[12px] text-[#64748B]">WhatsApp Resmi Customer Care</span>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <MapPin className="h-4 w-4 text-[#007ACC] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-medium text-[#0F172A] block">Jakarta Selatan, DKI Jakarta</span>
                    <span className="text-[12px] text-[#64748B]">Indonesia</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[#F1F5F9] space-y-2">
                <Link
                  href="/checkout?plan=pro&months=12"
                  className="w-full h-10 rounded-[8px] bg-[#007ACC] hover:bg-[#0062A3] text-white font-medium text-[13px] flex items-center justify-center gap-2 transition-colors shadow-xs"
                >
                  <span>Lanjut ke Halaman Checkout</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/pricing"
                  className="w-full h-9 rounded-[8px] border border-[#E2E8F0] bg-[#F8FAFC] hover:bg-[#F1F5F9] text-[#334155] font-medium text-[12.5px] flex items-center justify-center transition-colors"
                >
                  Kembali ke Halaman Harga
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
