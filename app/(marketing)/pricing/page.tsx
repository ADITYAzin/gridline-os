import Link from 'next/link'
import { Check, HelpCircle, ArrowRight, MessageSquare, ShieldCheck, Zap } from 'lucide-react'

export default function PricingPage() {
  return (
    <div className="space-y-20 py-12 md:py-16">
      {/* Header */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#D0E8F8] bg-[#EBF5FC] px-3.5 py-1.5 text-[12px] font-medium text-[#007ACC]">
            <Zap className="h-3.5 w-3.5" />
            <span>TRANSPARAN & INVESTASI TERUKUR</span>
          </div>
          <h1 className="font-heading text-[32px] sm:text-[44px] font-bold text-[#0F172A] tracking-[-0.02em] leading-tight">
            Pilihan Paket Berlangganan yang <span className="text-[#007ACC]">Tumbuh Bersama Armada</span> Anda
          </h1>
          <p className="text-[15px] sm:text-[16px] text-[#475569] leading-relaxed">
            Semua paket sudah mencakup akses aplikasi mobile teknisi tanpa batasan jumlah tiket servis. Coba gratis 14 hari tanpa perlu kartu kredit.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {/* Plan 1: Starter */}
          <div className="rounded-[16px] border border-[#E2E8F0] bg-[#FFFFFF] p-8 space-y-6 flex flex-col justify-between shadow-[0_1px_3px_0_rgba(15,23,42,0.03)]">
            <div className="space-y-4">
              <div>
                <h3 className="font-heading text-[18px] font-semibold text-[#0F172A]">
                  Starter
                </h3>
                <p className="text-[13px] text-[#64748B] mt-1">
                  Untuk bengkel servis atau usaha jasa teknis pemula.
                </p>
              </div>

              <div className="pt-2">
                <div className="flex items-baseline gap-1">
                  <span className="text-[14px] font-semibold text-[#64748B]">Rp</span>
                  <span className="font-heading text-[36px] font-bold text-[#0F172A]">249.000</span>
                  <span className="text-[13px] text-[#64748B]">/ bulan</span>
                </div>
                <span className="text-[11px] text-[#94A3B8] block mt-1">
                  Ditagih tahunan atau Rp 299.000 bulanan
                </span>
              </div>

              <div className="border-t border-[#F1F5F9] pt-6 space-y-3">
                <span className="text-[12px] font-semibold uppercase tracking-wider text-[#0F172A] block">
                  Cakupan Paket:
                </span>
                <ul className="space-y-2.5 text-[13px] text-[#475569]">
                  <li className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 text-[#10B981] shrink-0" />
                    <span>Hingga <strong>3 Teknisi Lapangan</strong></span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 text-[#10B981] shrink-0" />
                    <span>1 Akun Admin / Dispatcher</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 text-[#10B981] shrink-0" />
                    <span>Tiket Pekerjaan (Jobs) Tanpa Batas</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 text-[#10B981] shrink-0" />
                    <span>SOP Foto Before & After</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 text-[#10B981] shrink-0" />
                    <span>BAP Digital & Tanda Tangan Klien</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="pt-6">
              <Link
                href="/register?plan=starter"
                className="w-full h-11 rounded-[8px] border border-[#CBD5E1] bg-[#FFFFFF] hover:bg-[#F8FAFC] text-[#0F172A] font-medium text-[13.5px] flex items-center justify-center transition-colors"
              >
                Coba 14 Hari Gratis
              </Link>
            </div>
          </div>

          {/* Plan 2: Pro (Featured) */}
          <div className="rounded-[16px] border-2 border-[#007ACC] bg-[#FFFFFF] p-8 space-y-6 flex flex-col justify-between shadow-[0_8px_30px_rgb(0,122,204,0.08)] relative">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
              <span className="bg-[#007ACC] text-white text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-sm">
                Paling Direkomendasikan
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-heading text-[18px] font-semibold text-[#0F172A]">
                  Professional
                </h3>
                <p className="text-[13px] text-[#64748B] mt-1">
                  Pilihan utama perusahaan jasa dengan tim 4–10 teknisi.
                </p>
              </div>

              <div className="pt-2">
                <div className="flex items-baseline gap-1">
                  <span className="text-[14px] font-semibold text-[#64748B]">Rp</span>
                  <span className="font-heading text-[36px] font-bold text-[#007ACC]">599.000</span>
                  <span className="text-[13px] text-[#64748B]">/ bulan</span>
                </div>
                <span className="text-[11px] text-[#94A3B8] block mt-1">
                  Ditagih tahunan atau Rp 699.000 bulanan
                </span>
              </div>

              <div className="border-t border-[#F1F5F9] pt-6 space-y-3">
                <span className="text-[12px] font-semibold uppercase tracking-wider text-[#0F172A] block">
                  Semua Fitur Starter, Ditambah:
                </span>
                <ul className="space-y-2.5 text-[13px] text-[#475569]">
                  <li className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 text-[#007ACC] shrink-0 font-bold" />
                    <span>Hingga <strong>10 Teknisi Lapangan</strong></span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 text-[#007ACC] shrink-0 font-bold" />
                    <span>3 Akun Admin / Dispatcher</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 text-[#007ACC] shrink-0 font-bold" />
                    <span><strong>WhatsApp Notification 1-Klik</strong></span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 text-[#007ACC] shrink-0 font-bold" />
                    <span>Database Riwayat Mesin Klien & Garansi</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 text-[#007ACC] shrink-0 font-bold" />
                    <span>Export Rekap Excel & Laporan SLA</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 text-[#007ACC] shrink-0 font-bold" />
                    <span>Bantuan Onboarding Tim via Video Call</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="pt-6">
              <Link
                href="/register?plan=pro"
                className="w-full h-11 rounded-[8px] bg-[#007ACC] hover:bg-[#0062A3] text-white font-medium text-[13.5px] flex items-center justify-center gap-2 shadow-[0_2px_8px_0_rgba(0,122,204,0.25)] transition-all"
              >
                <span>Mulai Coba 14 Hari Gratis</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Plan 3: Enterprise */}
          <div className="rounded-[16px] border border-[#E2E8F0] bg-[#FFFFFF] p-8 space-y-6 flex flex-col justify-between shadow-[0_1px_3px_0_rgba(15,23,42,0.03)]">
            <div className="space-y-4">
              <div>
                <h3 className="font-heading text-[18px] font-semibold text-[#0F172A]">
                  Enterprise
                </h3>
                <p className="text-[13px] text-[#64748B] mt-1">
                  Untuk kontraktor besar dengan armada lebih dari 10 teknisi.
                </p>
              </div>

              <div className="pt-2">
                <div className="flex items-baseline gap-1">
                  <span className="font-heading text-[32px] font-bold text-[#0F172A]">Kustom</span>
                </div>
                <span className="text-[11px] text-[#94A3B8] block mt-1">
                  Penyesuaian kuota teknisi & integrasi khusus
                </span>
              </div>

              <div className="border-t border-[#F1F5F9] pt-6 space-y-3">
                <span className="text-[12px] font-semibold uppercase tracking-wider text-[#0F172A] block">
                  Layanan Khusus:
                </span>
                <ul className="space-y-2.5 text-[13px] text-[#475569]">
                  <li className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 text-[#10B981] shrink-0" />
                    <span>Kuota Teknisi & Admin Tidak Terbatas</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 text-[#10B981] shrink-0" />
                    <span>Kustom Format Kop Surat & Logo BAP</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 text-[#10B981] shrink-0" />
                    <span>Dedicated Account Manager</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 text-[#10B981] shrink-0" />
                    <span>Pendampingan Training On-Site / Khusus</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 text-[#10B981] shrink-0" />
                    <span>Jaminan SLA Ketersediaan Server 99.9%</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="pt-6">
              <Link
                href="/demo"
                className="w-full h-11 rounded-[8px] border border-[#CBD5E1] bg-[#FFFFFF] hover:bg-[#F8FAFC] text-[#0F172A] font-medium text-[13.5px] flex items-center justify-center gap-2 transition-colors"
              >
                <MessageSquare className="h-4 w-4 text-[#007ACC]" />
                <span>Konsultasi Paket Khusus</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-10">
          <h2 className="font-heading text-[24px] sm:text-[30px] font-bold text-[#0F172A]">
            Pertanyaan yang Sering Diajukan (FAQ)
          </h2>
          <p className="text-[14px] text-[#475569]">
            Jawaban praktis untuk hal-hal yang sering ditanyakan oleh pemilik usaha jasa teknis.
          </p>
        </div>

        <div className="space-y-4">
          {[
            {
              q: 'Apakah ada biaya instalasi awal (setup fee)?',
              a: 'Sama sekali tidak ada. Opilines adalah cloud SaaS yang langsung aktif saat Anda membuat akun. Anda bisa langsung menginput teknisi pertama dan membuat jadwal dalam hitungan menit.',
            },
            {
              q: 'Bagaimana jika teknisi saya kurang mengerti teknologi?',
              a: 'Aplikasi mobile kami dirancang khusus sangat sederhana untuk pekerja lapangan. Tampilan dibuat bersih dengan tombol besar: cukup buka tugas, check-in lokasi, ikuti checklist, ambil foto, dan minta tanda tangan klien.',
            },
            {
              q: 'Apakah saya bisa menambah kuota teknisi sewaktu-waktu?',
              a: 'Tentu. Anda dapat meng-upgrade paket kapan saja seiring bertambahnya armada teknisi Anda tanpa kehilangan riwayat data pekerjaan sebelumnya.',
            },
            {
              q: 'Apakah BAP digital Opilines sah diterima oleh klien perusahaan?',
              a: 'Sangat sah. Format PDF kami memuat stempel waktu digital, rincian pekerjaan terverifikasi, lampiran foto before-after, serta tanda tangan digital perwakilan klien yang dapat diaudit.',
            },
            {
              q: 'Apakah data pelanggan dan foto kami aman?',
              a: 'Data Anda disimpan di server cloud lokal Indonesia dengan enkripsi standar industri. Data sepenuhnya menjadi milik perusahaan Anda dan dicadangkan secara berkala.',
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="rounded-[12px] border border-[#E2E8F0] bg-[#FFFFFF] p-6 space-y-2 shadow-[0_1px_2px_0_rgba(15,23,42,0.02)]"
            >
              <h3 className="font-heading text-[15px] font-semibold text-[#0F172A] flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-[#007ACC] shrink-0" />
                <span>{item.q}</span>
              </h3>
              <p className="text-[13.5px] text-[#475569] leading-relaxed pl-6">
                {item.a}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-[16px] bg-[#F1F5F9] border border-[#E2E8F0] p-8 text-center space-y-4">
          <h3 className="font-heading text-[18px] font-semibold text-[#0F172A]">
            Butuh penawaran resmi atau presentasi untuk manajemen perusahaan?
          </h3>
          <p className="text-[13.5px] text-[#64748B] max-w-xl mx-auto">
            Tim konsultan produk kami siap membantu simulasi implementasi alur kerja Opilines sesuai SOP perusahaan Anda.
          </p>
          <div className="pt-2">
            <Link
              href="/demo"
              className="inline-flex h-10 px-5 rounded-[8px] bg-[#007ACC] hover:bg-[#0062A3] text-white font-medium text-[13.5px] items-center gap-2 transition-all shadow-sm"
            >
              <MessageSquare className="h-4 w-4" />
              <span>Hubungi Tim Konsultan Kami</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
