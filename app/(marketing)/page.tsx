import Link from 'next/link'
import {
  ArrowRight,
  Calendar,
  Smartphone,
  FileCheck2,
  Building2,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  Wrench,
  Camera,
  MessageSquare,
  Users,
  MapPin,
  ChevronRight,
} from 'lucide-react'

export default function MarketingHomePage() {
  return (
    <div className="space-y-20 pb-20">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden pt-12 md:pt-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* Top Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-[#D0E8F8] bg-[#EBF5FC] px-3.5 py-1.5 text-[12px] font-medium text-[#007ACC]">
              <span className="h-2 w-2 rounded-full bg-[#007ACC] animate-pulse" />
              <span>B2B Field Service Management • Khusus Jasa Teknis Indonesia</span>
            </div>

            {/* Headline */}
            <h1 className="font-heading text-[32px] sm:text-[44px] lg:text-[50px] font-bold text-[#0F172A] tracking-[-0.02em] leading-[1.18]">
              Tinggalkan WhatsApp yang Berantakan.{' '}
              <span className="text-[#007ACC]">Kelola Teknisi Lapangan</span> dalam Satu Sistem.
            </h1>

            {/* Sub-headline */}
            <p className="text-[15px] sm:text-[16px] text-[#475569] leading-relaxed max-w-2xl mx-auto">
              Operating system sederhana untuk perusahaan servis AC, maintenance gedung, instalasi CCTV, dan elektrikal. Dari penugasan jadwal, foto bukti kerja, hingga Berita Acara Pekerjaan (BAP) otomatis.
            </p>

            {/* Primary Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Link
                href="/register"
                className="w-full sm:w-auto h-11 px-6 rounded-[8px] bg-[#007ACC] hover:bg-[#0062A3] active:bg-[#004F82] text-white font-medium text-[14px] flex items-center justify-center gap-2 shadow-[0_2px_8px_0_rgba(0,122,204,0.25)] transition-all cursor-pointer"
              >
                <span>Mulai Coba Gratis 14 Hari</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/demo"
                className="w-full sm:w-auto h-11 px-6 rounded-[8px] border border-[#CBD5E1] bg-[#FFFFFF] hover:bg-[#F8FAFC] text-[#0F172A] font-medium text-[14px] flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <MessageSquare className="h-4 w-4 text-[#007ACC]" />
                <span>Jadwalkan Demo & Konsultasi</span>
              </Link>
            </div>

            {/* Micro reassurance */}
            <p className="text-[12px] text-[#94A3B8]">
              Tanpa kartu kredit • Siap pakai dalam 10 menit • Didampingi tim onboarding lokal
            </p>
          </div>

          {/* Hero Visual Mockup: Dispatch Board & Mobile Field Preview */}
          <div className="mt-12 lg:mt-16 rounded-[16px] border border-[#E2E8F0] bg-[#FFFFFF] shadow-[0_8px_30px_rgb(0,0,0,0.06)] overflow-hidden">
            {/* Header Mockup Bar */}
            <div className="h-10 border-b border-[#E2E8F0] bg-[#F8FAFC] px-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#EF4444]/60" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#F59E0B]/60" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#10B981]/60" />
                <span className="ml-2 text-[11px] font-mono text-[#94A3B8]">
                  app.opilines.com/admin/dispatch
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#10B981]" />
                <span className="text-[11px] font-medium text-[#475569]">
                  Live Dispatching Engine
                </span>
              </div>
            </div>

            {/* Mockup Content Grid */}
            <div className="p-4 sm:p-6 lg:p-8 bg-[#F8FAFC] grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Side: Dispatcher Schedule View (8 cols) */}
              <div className="lg:col-span-8 rounded-[12px] border border-[#E2E8F0] bg-[#FFFFFF] p-4 sm:p-6 space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
                  <div>
                    <h3 className="font-heading text-[15px] font-semibold text-[#0F172A]">
                      Jadwal Penugasan Teknisi Hari Ini
                    </h3>
                    <p className="text-[12px] text-[#64748B]">
                      3 Pekerjaan Aktif Lapangan • Terhubung Real-Time
                    </p>
                  </div>
                  <span className="text-[11px] font-medium bg-[#ECFDF5] text-[#10B981] border border-[#A7F3D0] px-2 py-0.5 rounded-[6px]">
                    Semua Terjadwal
                  </span>
                </div>

                {/* Job Cards in Dispatcher */}
                <div className="space-y-2">
                  <div className="rounded-[8px] border border-[#E2E8F0] p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FFFFFF] hover:border-[#007ACC]/40 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-[6px] bg-[#EBF5FC] text-[#007ACC] flex items-center justify-center font-bold text-[11px] shrink-0">
                        AC
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-heading text-[13px] font-semibold text-[#0F172A]">
                            PT Graha Pratama Mandiri
                          </span>
                          <span className="text-[10px] font-mono text-[#64748B] bg-[#F1F5F9] px-1.5 py-0.5 rounded">
                            #JOB-1042
                          </span>
                        </div>
                        <p className="text-[12px] text-[#475569] mt-0.5">
                          Overhaul 4 Unit AC Cassette Daikin 5 PK (Lt. 4)
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <span className="text-[11px] font-medium text-[#0F172A] block">
                          Teknisi: Budi Santoso
                        </span>
                        <span className="text-[11px] text-[#64748B] flex items-center gap-1 justify-end">
                          <Clock className="h-3 w-3" /> 09:00 - 12:00 WIB
                        </span>
                      </div>
                      <span className="text-[11px] font-medium bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A] px-2 py-1 rounded-[6px]">
                        Sedang Dikerjakan
                      </span>
                    </div>
                  </div>

                  <div className="rounded-[8px] border border-[#E2E8F0] p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FFFFFF] hover:border-[#007ACC]/40 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-[6px] bg-[#EBF5FC] text-[#007ACC] flex items-center justify-center font-bold text-[11px] shrink-0">
                        CCTV
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-heading text-[13px] font-semibold text-[#0F172A]">
                            Menara Sudirman Suites
                          </span>
                          <span className="text-[10px] font-mono text-[#64748B] bg-[#F1F5F9] px-1.5 py-0.5 rounded">
                            #JOB-1043
                          </span>
                        </div>
                        <p className="text-[12px] text-[#475569] mt-0.5">
                          Troubleshooting NVR & Penggantian 2 Unit IP Camera
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <span className="text-[11px] font-medium text-[#0F172A] block">
                          Teknisi: Agus Prasetyo
                        </span>
                        <span className="text-[11px] text-[#64748B] flex items-center gap-1 justify-end">
                          <Clock className="h-3 w-3" /> 13:00 - 15:30 WIB
                        </span>
                      </div>
                      <span className="text-[11px] font-medium bg-[#F0F9FF] text-[#0284C7] border border-[#BAE6FD] px-2 py-1 rounded-[6px]">
                        Ditugaskan
                      </span>
                    </div>
                  </div>

                  <div className="rounded-[8px] border border-[#E2E8F0] p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FFFFFF] hover:border-[#007ACC]/40 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-[6px] bg-[#ECFDF5] text-[#10B981] flex items-center justify-center font-bold text-[11px] shrink-0">
                        BAP
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-heading text-[13px] font-semibold text-[#0F172A]">
                            Hotel Santika Premiere
                          </span>
                          <span className="text-[10px] font-mono text-[#64748B] bg-[#F1F5F9] px-1.5 py-0.5 rounded">
                            #JOB-1041
                          </span>
                        </div>
                        <p className="text-[12px] text-[#475569] mt-0.5">
                          Maintenance Panel Pompa Booster Gedung B
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <span className="text-[11px] font-medium text-[#0F172A] block">
                          Teknisi: Dimas R.
                        </span>
                        <span className="text-[11px] text-[#10B981] font-medium">
                          BAP Telah Ditandatangani
                        </span>
                      </div>
                      <span className="text-[11px] font-medium bg-[#ECFDF5] text-[#10B981] border border-[#A7F3D0] px-2 py-1 rounded-[6px]">
                        Selesai
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side: Field Mobile Technician Card (4 cols) */}
              <div className="lg:col-span-4 rounded-[12px] border border-[#E2E8F0] bg-[#FFFFFF] p-4 space-y-3 shadow-sm flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-2">
                    <span className="text-[11px] font-semibold uppercase text-[#64748B] tracking-wider flex items-center gap-1.5">
                      <Smartphone className="h-3.5 w-3.5 text-[#007ACC]" />
                      Tampilan HP Teknisi
                    </span>
                    <span className="text-[10px] text-[#10B981] font-medium bg-[#ECFDF5] px-1.5 py-0.5 rounded">
                      GPS Terverifikasi
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[11px] text-[#94A3B8]">Tiket Aktif:</span>
                    <h4 className="font-heading text-[13px] font-semibold text-[#0F172A]">
                      PT Graha Pratama Mandiri
                    </h4>
                    <p className="text-[11.5px] text-[#475569] flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-[#007ACC] shrink-0" />
                      Gedung A Lt. 4, Jakarta Selatan
                    </p>
                  </div>

                  {/* SOP Checklist */}
                  <div className="rounded-[8px] bg-[#F8FAFC] border border-[#E2E8F0] p-2.5 space-y-2">
                    <span className="text-[11px] font-semibold text-[#0F172A] block">
                      Checklist SOP Wajib:
                    </span>
                    <div className="space-y-1.5 text-[11px] text-[#475569]">
                      <div className="flex items-center gap-2 text-[#10B981]">
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                        <span>Check-in Lokasi GPS (08:58 WIB)</span>
                      </div>
                      <div className="flex items-center gap-2 text-[#10B981]">
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                        <span>Foto Sebelum Servis Diunggah</span>
                      </div>
                      <div className="flex items-center gap-2 text-[#10B981]">
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                        <span>Foto Sesudah Servis Diunggah</span>
                      </div>
                      <div className="flex items-center gap-2 text-[#007ACC] font-medium">
                        <span className="h-3.5 w-3.5 rounded-full border border-[#007ACC] flex items-center justify-center text-[9px]">4</span>
                        <span>Tanda Tangan Klien di HP</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mock Sign Button */}
                <div className="pt-2 border-t border-[#F1F5F9]">
                  <div className="w-full h-8 rounded-[6px] bg-[#10B981] text-white text-[11px] font-medium flex items-center justify-center gap-1.5">
                    <FileCheck2 className="h-3.5 w-3.5" />
                    <span>Terbitkan BAP Digital Otomatis</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Supported Industries Bar */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-[12px] border border-[#E2E8F0] bg-[#FFFFFF] p-6 lg:p-8 shadow-[0_1px_3px_0_rgba(15,23,42,0.03)]">
          <p className="text-center text-[12.5px] font-semibold uppercase tracking-[0.04em] text-[#64748B] mb-6">
            Disesuaikan dengan Karakteristik Jasa & Maintenance Teknis Indonesia
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-[8px] bg-[#F8FAFC] border border-[#E2E8F0]">
              <div className="h-8 w-8 rounded-[6px] bg-[#EBF5FC] text-[#007ACC] flex items-center justify-center shrink-0">
                <Wrench className="h-4 w-4" />
              </div>
              <span className="text-[13px] font-medium text-[#0F172A]">Servis AC & HVAC</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-[8px] bg-[#F8FAFC] border border-[#E2E8F0]">
              <div className="h-8 w-8 rounded-[6px] bg-[#EBF5FC] text-[#007ACC] flex items-center justify-center shrink-0">
                <Building2 className="h-4 w-4" />
              </div>
              <span className="text-[13px] font-medium text-[#0F172A]">Building Maintenance</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-[8px] bg-[#F8FAFC] border border-[#E2E8F0]">
              <div className="h-8 w-8 rounded-[6px] bg-[#EBF5FC] text-[#007ACC] flex items-center justify-center shrink-0">
                <Camera className="h-4 w-4" />
              </div>
              <span className="text-[13px] font-medium text-[#0F172A]">Instalasi CCTV & Security</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-[8px] bg-[#F8FAFC] border border-[#E2E8F0]">
              <div className="h-8 w-8 rounded-[6px] bg-[#EBF5FC] text-[#007ACC] flex items-center justify-center shrink-0">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <span className="text-[13px] font-medium text-[#0F172A]">Elektrikal & Jaringan</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. The Big Shift: Problem vs Solution */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-10">
          <h2 className="font-heading text-[24px] sm:text-[30px] font-bold text-[#0F172A]">
            Mengapa Perusahaan Jasa Beralih dari WhatsApp & Excel?
          </h2>
          <p className="text-[14px] text-[#475569]">
            Mengandalkan grup chat membuat pekerjaan rentan terlewat, foto tercecer, dan laporan terlambat berhari-hari.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Sisi Cara Lama */}
          <div className="rounded-[12px] border border-[#EF4444]/30 bg-[#FEF2F2]/40 p-6 space-y-4">
            <div className="flex items-center gap-2 text-[#EF4444] font-semibold text-[14px]">
              <XCircle className="h-5 w-5" />
              <span>Cara Lama (WhatsApp & Spreadsheet)</span>
            </div>
            <ul className="space-y-3 text-[13px] text-[#475569]">
              <li className="flex items-start gap-2.5">
                <span className="text-[#EF4444] font-bold mt-0.5">•</span>
                <span><strong>Jadwal bentrok:</strong> Admin bingung teknisi mana yang kosong karena riwayat chat WA tertimbun.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-[#EF4444] font-bold mt-0.5">•</span>
                <span><strong>Foto tercecer:</strong> Bukti pekerjaan tersimpan di galeri HP teknisi, sulit dicari saat klien komplain.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-[#EF4444] font-bold mt-0.5">•</span>
                <span><strong>BAP manual lama:</strong> Admin butuh waktu 2-3 hari untuk mengetik ulang laporan dan minta tanda tangan.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-[#EF4444] font-bold mt-0.5">•</span>
                <span><strong>Owner buta data:</strong> Tidak tahu pasti performa teknisi, status SLA, dan riwayat kerusakan mesin klien.</span>
              </li>
            </ul>
          </div>

          {/* Sisi Opilines */}
          <div className="rounded-[12px] border border-[#10B981]/30 bg-[#ECFDF5]/40 p-6 space-y-4">
            <div className="flex items-center gap-2 text-[#10B981] font-semibold text-[14px]">
              <CheckCircle2 className="h-5 w-5" />
              <span>Dengan Opilines</span>
            </div>
            <ul className="space-y-3 text-[13px] text-[#475569]">
              <li className="flex items-start gap-2.5">
                <span className="text-[#10B981] font-bold mt-0.5">•</span>
                <span><strong>Kalender anti-bentrok:</strong> Dispatcher melihat ketersediaan teknisi dalam satu layar drag-and-drop.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-[#10B981] font-bold mt-0.5">•</span>
                <span><strong>SOP foto terikat tiket:</strong> Foto sebelum dan sesudah kerja wajib diupload dan tersimpan rapi per mesin.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-[#10B981] font-bold mt-0.5">•</span>
                <span><strong>BAP otomatis seketika:</strong> Klien tanda tangan di HP teknisi, PDF profesional terbit dan langsung kirim via WA.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-[#10B981] font-bold mt-0.5">•</span>
                <span><strong>Kontrol penuh owner:</strong> Pantau durasi servis, ketepatan jadwal teknisi, dan kepuasan klien secara live.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 4. Core Workflow (Sesuai SoT v1.0) */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-10">
          <h2 className="font-heading text-[24px] sm:text-[30px] font-bold text-[#0F172A]">
            Alur Kerja Lapangan yang Rapi & Terstruktur
          </h2>
          <p className="text-[14px] text-[#475569]">
            Enam tahapan terintegrasi untuk memastikan setiap pesanan servis tuntas tanpa miskomunikasi.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            {
              step: '01',
              title: 'Buat Job',
              desc: 'Admin input data klien, keluhan, dan unit mesin.',
            },
            {
              step: '02',
              title: 'Jadwalkan',
              desc: 'Tugaskan teknisi lewat kalender visual tanpa bentrok.',
            },
            {
              step: '03',
              title: 'Check-in GPS',
              desc: 'Teknisi tiba di lokasi dan konfirmasi kehadiran di HP.',
            },
            {
              step: '04',
              title: 'SOP & Foto',
              desc: 'Kerjakan checklist dan ambil foto sebelum/sesudah.',
            },
            {
              step: '05',
              title: 'TTD Klien',
              desc: 'Klien menandatangani bukti servis langsung di layar HP.',
            },
            {
              step: '06',
              title: 'BAP Terbit',
              desc: 'Laporan PDF resmi selesai dan terkirim otomatis.',
            },
          ].map((item) => (
            <div
              key={item.step}
              className="rounded-[12px] border border-[#E2E8F0] bg-[#FFFFFF] p-4 space-y-2 relative shadow-sm"
            >
              <span className="font-mono text-[11px] font-bold text-[#007ACC] bg-[#EBF5FC] px-2 py-0.5 rounded">
                Langkah {item.step}
              </span>
              <h4 className="font-heading text-[14px] font-semibold text-[#0F172A] pt-1">
                {item.title}
              </h4>
              <p className="text-[12px] text-[#64748B] leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Feature Highlights Summary */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-[16px] border border-[#E2E8F0] bg-[#FFFFFF] p-8 lg:p-12 shadow-sm space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#F1F5F9] pb-6">
            <div>
              <span className="text-[12px] font-bold text-[#007ACC] uppercase tracking-wider">
                Fitur Unggulan
              </span>
              <h2 className="font-heading text-[24px] sm:text-[28px] font-bold text-[#0F172A] mt-1">
                Empat Modul Operasional Tanpa Rumit
              </h2>
            </div>
            <Link
              href="/fitur"
              className="text-[13.5px] font-medium text-[#007ACC] hover:text-[#0062A3] flex items-center gap-1.5 transition-colors"
            >
              <span>Pelajari Semua Fitur Lengkap</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-3">
              <div className="h-10 w-10 rounded-[8px] bg-[#EBF5FC] text-[#007ACC] flex items-center justify-center">
                <Calendar className="h-5 w-5" />
              </div>
              <h3 className="font-heading text-[15px] font-semibold text-[#0F172A]">
                Smart Dispatching
              </h3>
              <p className="text-[13px] text-[#64748B] leading-relaxed">
                Visualisasikan distribusi kerja teknisi. Drag-and-drop jadwal dengan notifikasi otomatis ke WhatsApp teknisi.
              </p>
            </div>

            <div className="space-y-3">
              <div className="h-10 w-10 rounded-[8px] bg-[#EBF5FC] text-[#007ACC] flex items-center justify-center">
                <Smartphone className="h-5 w-5" />
              </div>
              <h3 className="font-heading text-[15px] font-semibold text-[#0F172A]">
                Aplikasi HP Teknisi
              </h3>
              <p className="text-[13px] text-[#64748B] leading-relaxed">
                Antarmuka ringan tanpa beban administrasi. Cukup buka tugas, ikuti checklist SOP, dan upload foto hasil kerja.
              </p>
            </div>

            <div className="space-y-3">
              <div className="h-10 w-10 rounded-[8px] bg-[#EBF5FC] text-[#007ACC] flex items-center justify-center">
                <FileCheck2 className="h-5 w-5" />
              </div>
              <h3 className="font-heading text-[15px] font-semibold text-[#0F172A]">
                BAP Digital 1-Klik
              </h3>
              <p className="text-[13px] text-[#64748B] leading-relaxed">
                Berita Acara Pekerjaan resmi berstandar industri dengan tanda tangan basah digital klien di layar ponsel.
              </p>
            </div>

            <div className="space-y-3">
              <div className="h-10 w-10 rounded-[8px] bg-[#EBF5FC] text-[#007ACC] flex items-center justify-center">
                <Wrench className="h-5 w-5" />
              </div>
              <h3 className="font-heading text-[15px] font-semibold text-[#0F172A]">
                Riwayat Aset Mesin
              </h3>
              <p className="text-[13px] text-[#64748B] leading-relaxed">
                Catat setiap unit AC, mesin genset, atau CCTV milik klien. Lacak nomor seri, tanggal servis terakhir, dan masa garansi.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Bottom Conversion CTA Banner */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-[16px] bg-[#0F172A] p-8 sm:p-12 text-center text-white space-y-6 relative overflow-hidden shadow-md">
          <div className="max-w-2xl mx-auto space-y-3">
            <h2 className="font-heading text-[26px] sm:text-[34px] font-bold tracking-tight">
              Siap Menata Operasional Lapangan Jadi Lebih Rapi?
            </h2>
            <p className="text-[14px] sm:text-[15px] text-[#94A3B8] leading-relaxed">
              Mulai uji coba gratis 14 hari tanpa biaya komitmen, atau diskusikan kebutuhan armada teknisi Anda bersama konsultan produk kami.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              href="/register"
              className="w-full sm:w-auto h-11 px-6 rounded-[8px] bg-[#007ACC] hover:bg-[#0062A3] text-white font-medium text-[14px] flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <span>Daftar Coba Gratis Sekarang</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/demo"
              className="w-full sm:w-auto h-11 px-6 rounded-[8px] border border-[#334155] bg-[#1E293B] hover:bg-[#334155] text-white font-medium text-[14px] flex items-center justify-center gap-2 transition-colors"
            >
              <MessageSquare className="h-4 w-4 text-[#007ACC]" />
              <span>Jadwalkan Demo Online</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
