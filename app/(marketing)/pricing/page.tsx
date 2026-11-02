import Link from 'next/link'
import { Check, X, HelpCircle, ArrowRight, MessageSquare, Zap } from 'lucide-react'

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
                  Fitur yang Didapatkan:
                </span>
                <ul className="space-y-2.5 text-[13px]">
                  <li className="flex items-center gap-2.5 text-[#475569]">
                    <Check className="h-4 w-4 text-[#10B981] shrink-0 font-bold" />
                    <span>Akses <strong>5 Teknisi Lapangan</strong> dan <strong>1 Akun Admin</strong></span>
                  </li>
                  <li className="flex items-center gap-2.5 text-[#475569]">
                    <Check className="h-4 w-4 text-[#10B981] shrink-0 font-bold" />
                    <span>Manajemen tiket kerja <em>(Work Order)</em> tanpa batas</span>
                  </li>
                  <li className="flex items-center gap-2.5 text-[#475569]">
                    <Check className="h-4 w-4 text-[#10B981] shrink-0 font-bold" />
                    <span>Presensi kehadiran teknisi berbasis <strong>GPS & Foto Selfie</strong></span>
                  </li>
                  <li className="flex items-center gap-2.5 text-[#475569]">
                    <Check className="h-4 w-4 text-[#10B981] shrink-0 font-bold" />
                    <span>Checklist <strong>SOP operasional standar</strong> bawaan</span>
                  </li>
                  <li className="flex items-center gap-2.5 text-[#475569]">
                    <Check className="h-4 w-4 text-[#10B981] shrink-0 font-bold" />
                    <span>Dokumentasi bukti kerja (hingga <strong>5 Foto per tiket</strong>)</span>
                  </li>
                  <li className="flex items-center gap-2.5 text-[#475569]">
                    <Check className="h-4 w-4 text-[#10B981] shrink-0 font-bold" />
                    <span><strong>BAP digital</strong> & tanda tangan digital pelanggan</span>
                  </li>
                  <li className="flex items-center gap-2.5 text-[#475569]">
                    <Check className="h-4 w-4 text-[#10B981] shrink-0 font-bold" />
                    <span>Riwayat servis kontak pelanggan</span>
                  </li>
                  <li className="flex items-center gap-2.5 text-[#475569]">
                    <Check className="h-4 w-4 text-[#10B981] shrink-0 font-bold" />
                    <span>Monitoring <strong>SLA & performa tim teknisi</strong></span>
                  </li>

                  {/* Fitur Pro yang belum ada di Starter */}
                  <li className="pt-2 border-t border-[#F1F5F9]/80">
                    <span className="text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider block mb-2">
                      Belum Termasuk di Starter:
                    </span>
                  </li>
                  <li className="flex items-center gap-2.5 text-[#94A3B8]">
                    <X className="h-4 w-4 text-[#CBD5E1] shrink-0" />
                    <span>Peta pemantauan lokasi teknisi <em>(Live Map)</em></span>
                  </li>
                  <li className="flex items-center gap-2.5 text-[#94A3B8]">
                    <X className="h-4 w-4 text-[#CBD5E1] shrink-0" />
                    <span>Manajemen cuti & perizinan presensi</span>
                  </li>
                  <li className="flex items-center gap-2.5 text-[#94A3B8]">
                    <X className="h-4 w-4 text-[#CBD5E1] shrink-0" />
                    <span>Custom SOP Builder <em>(Buat checklist bebas)</em></span>
                  </li>
                  <li className="flex items-center gap-2.5 text-[#94A3B8]">
                    <X className="h-4 w-4 text-[#CBD5E1] shrink-0" />
                    <span>Riwayat servis unit aset pelanggan <em>(No. Seri / Mesin)</em></span>
                  </li>
                  <li className="flex items-center gap-2.5 text-[#94A3B8]">
                    <X className="h-4 w-4 text-[#CBD5E1] shrink-0" />
                    <span>Pesan kabar pelanggan via WhatsApp <em>(1-Klik)</em></span>
                  </li>
                  <li className="flex items-center gap-2.5 text-[#94A3B8]">
                    <X className="h-4 w-4 text-[#CBD5E1] shrink-0" />
                    <span>Manajemen & kalkulasi komisi teknisi otomatis</span>
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
            <div className="absolute -top-3.5 left-[48%] -translate-x-[46%]">
              <span className="w-full bg-[#007ACC] text-white text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-sm">
                Paling Direkomendasikan
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-heading text-[18px] font-semibold text-[#0F172A]">
                  Professional
                </h3>
                <p className="text-[13px] text-[#64748B] mt-1">
                  Pilihan utama perusahaan jasa dengan tim armada hingga 12 teknisi.
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
                  Seluruh Fitur Paket Pro:
                </span>
                <ul className="space-y-2.5 text-[13px] text-[#475569]">
                  <li className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 text-[#007ACC] shrink-0 font-bold" />
                    <span>Akses <strong>12 Teknisi Lapangan</strong>, <strong>1 Admin</strong>, & <strong>1 Owner</strong></span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 text-[#007ACC] shrink-0 font-bold" />
                    <span>Manajemen tiket kerja <em>(Work Order)</em> tanpa batas</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 text-[#007ACC] shrink-0 font-bold" />
                    <span>Presensi kehadiran (Selfie + GPS) <strong>dan perizinan cuti</strong></span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 text-[#007ACC] shrink-0 font-bold" />
                    <span><strong>Peta pemantauan lokasi teknisi</strong> secara real-time <em>(Live Map)</em></span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 text-[#007ACC] shrink-0 font-bold" />
                    <span><strong>Custom SOP Builder</strong> (Bebas buat checklist per jenis servis)</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 text-[#007ACC] shrink-0 font-bold" />
                    <span>Dokumentasi bukti kerja hingga <strong>10 Foto per tiket</strong></span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 text-[#007ACC] shrink-0 font-bold" />
                    <span><strong>BAP digital</strong> & tanda tangan digital pelanggan</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 text-[#007ACC] shrink-0 font-bold" />
                    <span>Riwayat servis <strong>unit aset pelanggan</strong> <em>(No. Seri / Mesin)</em></span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 text-[#007ACC] shrink-0 font-bold" />
                    <span>Monitoring <strong>SLA & performa tim teknisi</strong></span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 text-[#007ACC] shrink-0 font-bold" />
                    <span><strong>Pesan kabar WhatsApp</strong> ke pelanggan <em>(1-Klik)</em></span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 text-[#007ACC] shrink-0 font-bold" />
                    <span><strong>Manajemen komisi teknisi</strong> & kalkulasi otomatis</span>
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
                  Untuk kontraktor besar dengan armada lebih dari 12 teknisi.
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
                  Fitur Paket:
                </span>
                <ul className="space-y-2.5 text-[13px] text-[#475569]">
                  <li className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 text-[#10B981] shrink-0" />
                    <span>Akses kustom teknisi, admin, dan owner</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 text-[#10B981] shrink-0" />
                    <span>Monitoring SLA & performa tim teknisi</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 text-[#10B981] shrink-0" />
                    <span>Manajemen tiket kerja</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 text-[#10B981] shrink-0" />
                    <span>Presensi kehadiran (Selfie + GPS) dan perizinan</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 text-[#10B981] shrink-0" />
                    <span>Peta pemantauan teknisi</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 text-[#10B981] shrink-0" />
                    <span>Custom SOP Builder</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 text-[#10B981] shrink-0" />
                    <span>Dokumentasi kerja tanpa batasan foto</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 text-[#10B981] shrink-0" />
                    <span>BAP & tanda tangan digital</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 text-[#10B981] shrink-0" />
                    <span>Riwayat servis unit aset pelanggan</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 text-[#10B981] shrink-0" />
                    <span>Pesan kabar WhatsApp</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 text-[#10B981] shrink-0" />
                    <span>Manajemen komisi teknisi</span>
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

      {/* Plan Comparison Table */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-10">
          <h2 className="font-heading text-[24px] sm:text-[32px] font-bold text-[#0F172A] tracking-tight">
            Perbandingan Fitur Lengkap
          </h2>
          <p className="text-[14px] sm:text-[15px] text-[#475569]">
            Perbandingan fitur antara paket Starter, Professional, dan Enterprise.
          </p>
        </div>

        <div className="overflow-x-auto rounded-[16px] border border-[#E2E8F0] bg-white shadow-xs">
          <table className="w-full text-left border-collapse text-[13px]">
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                <th className="p-4 sm:p-5 font-semibold text-[#0F172A] w-2/5">Fitur</th>
                <th className="p-4 sm:p-5 font-semibold text-[#0F172A] text-center w-1/5">Starter</th>
                <th className="p-4 sm:p-5 font-bold text-[#007ACC] text-center w-1/5 bg-[#007ACC]/5 border-x border-[#007ACC]/20">
                  Professional
                </th>
                <th className="p-4 sm:p-5 font-semibold text-[#0F172A] text-center w-1/5">Enterprise</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9] text-[#334155]">
              <tr>
                <td className="px-4 sm:px-5 py-3.5 font-medium text-[#0F172A]">Akses pengguna</td>
                <td className="px-4 sm:px-5 py-3.5 text-center font-medium">5 teknisi dan 1 admin</td>
                <td className="px-4 sm:px-5 py-3.5 text-center font-bold text-[#007ACC] bg-[#007ACC]/5 border-x border-[#007ACC]/20">
                  12 teknisi, 1 admin, dan 1 owner
                </td>
                <td className="px-4 sm:px-5 py-3.5 text-center font-medium">Kustom</td>
              </tr>
              <tr>
                <td className="px-4 sm:px-5 py-3.5 font-medium text-[#0F172A]">Monitoring SLA & performa tim teknisi</td>
                <td className="px-4 sm:px-5 py-3.5 text-center"><Check className="h-4 w-4 text-[#10B981] mx-auto" /></td>
                <td className="px-4 sm:px-5 py-3.5 text-center bg-[#007ACC]/5 border-x border-[#007ACC]/20">
                  <Check className="h-4 w-4 text-[#007ACC] mx-auto stroke-[3]" />
                </td>
                <td className="px-4 sm:px-5 py-3.5 text-center"><Check className="h-4 w-4 text-[#10B981] mx-auto" /></td>
              </tr>
              <tr>
                <td className="px-4 sm:px-5 py-3.5 font-medium text-[#0F172A]">Manajemen tiket kerja</td>
                <td className="px-4 sm:px-5 py-3.5 text-center"><Check className="h-4 w-4 text-[#10B981] mx-auto" /></td>
                <td className="px-4 sm:px-5 py-3.5 text-center bg-[#007ACC]/5 border-x border-[#007ACC]/20">
                  <Check className="h-4 w-4 text-[#007ACC] mx-auto stroke-[3]" />
                </td>
                <td className="px-4 sm:px-5 py-3.5 text-center"><Check className="h-4 w-4 text-[#10B981] mx-auto" /></td>
              </tr>
              <tr>
                <td className="px-4 sm:px-5 py-3.5 font-medium text-[#0F172A]">Presensi kehadiran (Selfie + GPS)</td>
                <td className="px-4 sm:px-5 py-3.5 text-center"><Check className="h-4 w-4 text-[#10B981] mx-auto" /></td>
                <td className="px-4 sm:px-5 py-3.5 text-center bg-[#007ACC]/5 border-x border-[#007ACC]/20">
                  <Check className="h-4 w-4 text-[#007ACC] mx-auto stroke-[3]" />
                </td>
                <td className="px-4 sm:px-5 py-3.5 text-center"><Check className="h-4 w-4 text-[#10B981] mx-auto" /></td>
              </tr>
              <tr>
                <td className="px-4 sm:px-5 py-3.5 font-medium text-[#0F172A]">Presensi perizinan</td>
                <td className="px-4 sm:px-5 py-3.5 text-center"><X className="h-4 w-4 text-[#CBD5E1] mx-auto" /></td>
                <td className="px-4 sm:px-5 py-3.5 text-center font-bold text-[#007ACC] bg-[#007ACC]/5 border-x border-[#007ACC]/20">
                  <Check className="h-4 w-4 text-[#007ACC] mx-auto stroke-[3]" />
                </td>
                <td className="px-4 sm:px-5 py-3.5 text-center"><Check className="h-4 w-4 text-[#10B981] mx-auto" /></td>
              </tr>
              <tr>
                <td className="px-4 sm:px-5 py-3.5 font-medium text-[#0F172A]">Peta pemantauan teknisi</td>
                <td className="px-4 sm:px-5 py-3.5 text-center"><X className="h-4 w-4 text-[#CBD5E1] mx-auto" /></td>
                <td className="px-4 sm:px-5 py-3.5 text-center font-bold text-[#007ACC] bg-[#007ACC]/5 border-x border-[#007ACC]/20">
                  <Check className="h-4 w-4 text-[#007ACC] mx-auto stroke-[3]" />
                </td>
                <td className="px-4 sm:px-5 py-3.5 text-center"><Check className="h-4 w-4 text-[#10B981] mx-auto" /></td>
              </tr>
              <tr>
                <td className="px-4 sm:px-5 py-3.5 font-medium text-[#0F172A]">SOP standar</td>
                <td className="px-4 sm:px-5 py-3.5 text-center"><Check className="h-4 w-4 text-[#10B981] mx-auto" /></td>
                <td className="px-4 sm:px-5 py-3.5 text-center bg-[#007ACC]/5 border-x border-[#007ACC]/20">
                  <Check className="h-4 w-4 text-[#007ACC] mx-auto stroke-[3]" />
                </td>
                <td className="px-4 sm:px-5 py-3.5 text-center"><Check className="h-4 w-4 text-[#10B981] mx-auto" /></td>
              </tr>
              <tr>
                <td className="px-4 sm:px-5 py-3.5 font-medium text-[#0F172A]">Custom SOP Builder</td>
                <td className="px-4 sm:px-5 py-3.5 text-center"><X className="h-4 w-4 text-[#CBD5E1] mx-auto" /></td>
                <td className="px-4 sm:px-5 py-3.5 text-center font-bold text-[#007ACC] bg-[#007ACC]/5 border-x border-[#007ACC]/20">
                  <Check className="h-4 w-4 text-[#007ACC] mx-auto stroke-[3]" />
                </td>
                <td className="px-4 sm:px-5 py-3.5 text-center"><Check className="h-4 w-4 text-[#10B981] mx-auto" /></td>
              </tr>
              <tr>
                <td className="px-4 sm:px-5 py-3.5 font-medium text-[#0F172A]">Dokumentasi kerja (Foto per tiket)</td>
                <td className="px-4 sm:px-5 py-3.5 text-center font-medium">5 Foto per tiket</td>
                <td className="px-4 sm:px-5 py-3.5 text-center font-bold text-[#007ACC] bg-[#007ACC]/5 border-x border-[#007ACC]/20">
                  10 Foto per tiket
                </td>
                <td className="px-4 sm:px-5 py-3.5 text-center font-medium">Tanpa batas foto</td>
              </tr>
              <tr>
                <td className="px-4 sm:px-5 py-3.5 font-medium text-[#0F172A]">BAP & tanda tangan digital</td>
                <td className="px-4 sm:px-5 py-3.5 text-center"><Check className="h-4 w-4 text-[#10B981] mx-auto" /></td>
                <td className="px-4 sm:px-5 py-3.5 text-center bg-[#007ACC]/5 border-x border-[#007ACC]/20">
                  <Check className="h-4 w-4 text-[#007ACC] mx-auto stroke-[3]" />
                </td>
                <td className="px-4 sm:px-5 py-3.5 text-center"><Check className="h-4 w-4 text-[#10B981] mx-auto" /></td>
              </tr>
              <tr>
                <td className="px-4 sm:px-5 py-3.5 font-medium text-[#0F172A]">Riwayat servis pelanggan</td>
                <td className="px-4 sm:px-5 py-3.5 text-center"><Check className="h-4 w-4 text-[#10B981] mx-auto" /></td>
                <td className="px-4 sm:px-5 py-3.5 text-center bg-[#007ACC]/5 border-x border-[#007ACC]/20">
                  <Check className="h-4 w-4 text-[#007ACC] mx-auto stroke-[3]" />
                </td>
                <td className="px-4 sm:px-5 py-3.5 text-center"><Check className="h-4 w-4 text-[#10B981] mx-auto" /></td>
              </tr>
              <tr>
                <td className="px-4 sm:px-5 py-3.5 font-medium text-[#0F172A]">Riwayat servis unit aset pelanggan</td>
                <td className="px-4 sm:px-5 py-3.5 text-center"><X className="h-4 w-4 text-[#CBD5E1] mx-auto" /></td>
                <td className="px-4 sm:px-5 py-3.5 text-center font-bold text-[#007ACC] bg-[#007ACC]/5 border-x border-[#007ACC]/20">
                  <Check className="h-4 w-4 text-[#007ACC] mx-auto stroke-[3]" />
                </td>
                <td className="px-4 sm:px-5 py-3.5 text-center"><Check className="h-4 w-4 text-[#10B981] mx-auto" /></td>
              </tr>
              <tr>
                <td className="px-4 sm:px-5 py-3.5 font-medium text-[#0F172A]">Pesan kabar WhatsApp</td>
                <td className="px-4 sm:px-5 py-3.5 text-center"><X className="h-4 w-4 text-[#CBD5E1] mx-auto" /></td>
                <td className="px-4 sm:px-5 py-3.5 text-center font-bold text-[#007ACC] bg-[#007ACC]/5 border-x border-[#007ACC]/20">
                  <Check className="h-4 w-4 text-[#007ACC] mx-auto stroke-[3]" />
                </td>
                <td className="px-4 sm:px-5 py-3.5 text-center"><Check className="h-4 w-4 text-[#10B981] mx-auto" /></td>
              </tr>
              <tr>
                <td className="px-4 sm:px-5 py-3.5 font-medium text-[#0F172A]">Manajemen komisi teknisi</td>
                <td className="px-4 sm:px-5 py-3.5 text-center"><X className="h-4 w-4 text-[#CBD5E1] mx-auto" /></td>
                <td className="px-4 sm:px-5 py-3.5 text-center font-bold text-[#007ACC] bg-[#007ACC]/5 border-x border-[#007ACC]/20">
                  <Check className="h-4 w-4 text-[#007ACC] mx-auto stroke-[3]" />
                </td>
                <td className="px-4 sm:px-5 py-3.5 text-center"><Check className="h-4 w-4 text-[#10B981] mx-auto" /></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
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
