import Link from 'next/link'
import {
  Calendar,
  Smartphone,
  FileCheck2,
  Wrench,
  CheckCircle2,
  ArrowRight,
  Clock,
  MapPin,
  Camera,
  MessageSquare,
  ShieldCheck,
  Zap,
} from 'lucide-react'

export default function FiturPage() {
  return (
    <div className="space-y-20 py-12 md:py-16">
      {/* Page Header */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#D0E8F8] bg-[#EBF5FC] px-3.5 py-1.5 text-[12px] font-medium text-[#007ACC]">
            <Zap className="h-3.5 w-3.5" />
            <span>KAPABILITAS SISTEM GRIDLINEOS</span>
          </div>
          <h1 className="font-heading text-[32px] sm:text-[44px] font-bold text-[#0F172A] tracking-[-0.02em] leading-tight">
            Fitur Praktis untuk <span className="text-[#007ACC]">Menghilangkan Masalah Harian</span> Teknisi
          </h1>
          <p className="text-[15px] sm:text-[16px] text-[#475569] leading-relaxed">
            Tidak ada fitur berbelit-belit. Seluruh modul didesain berdasarkan alur kerja nyata perusahaan jasa teknis di Indonesia agar mudah digunakan oleh admin maupun teknisi di lapangan.
          </p>
        </div>
      </section>

      {/* Feature 1: Smart Dispatching */}
      <section id="dispatch" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-[16px] border border-[#E2E8F0] bg-[#FFFFFF] p-6 sm:p-10 shadow-[0_1px_3px_0_rgba(15,23,42,0.03)] grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6 space-y-4">
            <div className="inline-flex items-center gap-2 rounded-[6px] bg-[#EBF5FC] text-[#007ACC] px-3 py-1 text-[12px] font-semibold">
              <Calendar className="h-4 w-4" />
              <span>Modul 01 • Penjadwalan & Dispatch</span>
            </div>
            <h2 className="font-heading text-[24px] sm:text-[28px] font-bold text-[#0F172A]">
              Smart Dispatching & Kalender Teknisi Anti-Bentrok
            </h2>
            <p className="text-[14px] text-[#475569] leading-relaxed">
              Dispatcher dapat melihat ketersediaan waktu seluruh teknisi dalam satu kalender visual. Hindari situasi memalukan di mana dua pekerjaan dijadwalkan pada teknisi yang sama di jam yang sama.
            </p>
            <ul className="space-y-3 text-[13.5px] text-[#475569] pt-2">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-[#10B981] shrink-0 mt-0.5" />
                <span><strong>Deteksi bentrok otomatis:</strong> Peringatan visual jika teknisi sudah memiliki tiket aktif pada slot waktu tersebut.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-[#10B981] shrink-0 mt-0.5" />
                <span><strong>Notifikasi instan ke WhatsApp teknisi:</strong> Cukup 1 klik, rincian alamat dan kontak klien langsung terkirim ke WA teknisi.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-[#10B981] shrink-0 mt-0.5" />
                <span><strong>Filter status transparan:</strong> Pantau siapa yang sedang menuju lokasi, mengerjakan unit, atau siap ditugaskan kembali.</span>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-6 rounded-[12px] border border-[#E2E8F0] bg-[#F8FAFC] p-4 sm:p-6 space-y-3">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2 text-[12px]">
              <span className="font-semibold text-[#0F172A]">Kalender Penugasan Tim Servis</span>
              <span className="text-[#10B981] font-medium">Auto-Sync</span>
            </div>
            <div className="space-y-2">
              <div className="p-3 bg-white rounded-[8px] border border-[#E2E8F0] space-y-1">
                <div className="flex justify-between items-center text-[12px]">
                  <span className="font-semibold text-[#0F172A]">Budi Santoso (Teknisi Senior)</span>
                  <span className="text-[11px] bg-[#FFFBEB] text-[#D97706] px-2 py-0.5 rounded font-medium">On Progress</span>
                </div>
                <p className="text-[11.5px] text-[#64748B]">09:00 - 12:00 • PT Graha Pratama (AC 5 PK)</p>
              </div>
              <div className="p-3 bg-white rounded-[8px] border border-[#E2E8F0] space-y-1">
                <div className="flex justify-between items-center text-[12px]">
                  <span className="font-semibold text-[#0F172A]">Dimas Kurnia (Teknisi Mekanikal)</span>
                  <span className="text-[11px] bg-[#ECFDF5] text-[#10B981] px-2 py-0.5 rounded font-medium">Tersedia (Siap Tugas)</span>
                </div>
                <p className="text-[11.5px] text-[#64748B]">Slot Siang Kosong • Rekomendasi untuk job baru area Barat</p>
              </div>
              <div className="p-3 bg-white rounded-[8px] border border-[#E2E8F0] space-y-1">
                <div className="flex justify-between items-center text-[12px]">
                  <span className="font-semibold text-[#0F172A]">Agus Pratama (Teknisi Listrik)</span>
                  <span className="text-[11px] bg-[#F0F9FF] text-[#0284C7] px-2 py-0.5 rounded font-medium">Ditugaskan</span>
                </div>
                <p className="text-[11.5px] text-[#64748B]">13:30 - 16:00 • Menara Sudirman (Panel Pompa)</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature 2: Mobile Field Execution & SOP */}
      <section id="mobile" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-[16px] border border-[#E2E8F0] bg-[#FFFFFF] p-6 sm:p-10 shadow-[0_1px_3px_0_rgba(15,23,42,0.03)] grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6 order-2 lg:order-1 rounded-[12px] border border-[#E2E8F0] bg-[#F8FAFC] p-4 sm:p-6 space-y-3">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2 text-[12px]">
              <span className="font-semibold text-[#0F172A] flex items-center gap-1.5">
                <Smartphone className="h-4 w-4 text-[#007ACC]" />
                Alur Kerja HP Teknisi
              </span>
              <span className="text-[11px] text-[#64748B]">PWA Ready</span>
            </div>
            <div className="bg-white p-4 rounded-[8px] border border-[#E2E8F0] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-bold text-[#0F172A]">Job #1042 • Cuci AC Cassette</span>
                <span className="text-[11px] text-[#10B981] font-mono font-medium">GPS Valid</span>
              </div>
              <div className="p-2.5 rounded-[6px] bg-[#F1F5F9] text-[11.5px] text-[#475569] space-y-1">
                <p><strong>Alamat:</strong> Jl. Gatot Subroto No. 45, Lt. 3</p>
                <p><strong>PIC Klien:</strong> Ibu Maya (0812-3456-7890)</p>
              </div>
              <div className="space-y-2 text-[11px]">
                <div className="flex items-center gap-2 text-[#10B981] font-medium">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>Teknisi Check-in Lokasi (09:02 WIB)</span>
                </div>
                <div className="flex items-center gap-2 text-[#10B981] font-medium">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>Foto Sebelum Pengerjaan (Filter Kotor)</span>
                </div>
                <div className="flex items-center gap-2 text-[#10B981] font-medium">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>Foto Sesudah Pengerjaan (Hasil Bersih & Tekanan Freon)</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 order-1 lg:order-2 space-y-4">
            <div className="inline-flex items-center gap-2 rounded-[6px] bg-[#EBF5FC] text-[#007ACC] px-3 py-1 text-[12px] font-semibold">
              <Smartphone className="h-4 w-4" />
              <span>Modul 02 • Eksekusi Lapangan</span>
            </div>
            <h2 className="font-heading text-[24px] sm:text-[28px] font-bold text-[#0F172A]">
              Aplikasi Mobile Teknisi: Praktis & Wajib Ikuti SOP
            </h2>
            <p className="text-[14px] text-[#475569] leading-relaxed">
              Teknisi tidak perlu menulis laporan fisik yang memakan waktu. Mereka cukup membuka tiket lewat ponsel, melakukan verifikasi lokasi kedatangan, dan mengambil foto bukti kerja sesuai standar yang ditentukan perusahaan.
            </p>
            <ul className="space-y-3 text-[13.5px] text-[#475569] pt-2">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-[#10B981] shrink-0 mt-0.5" />
                <span><strong>Verifikasi Check-in GPS:</strong> Memastikan teknisi benar-benar sudah tiba di lokasi klien sebelum memulai pekerjaan.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-[#10B981] shrink-0 mt-0.5" />
                <span><strong>Wajib Foto Before & After:</strong> Mengamankan perusahaan Anda dari tuduhan kerusakan sebelumnya atau hasil kerja yang tidak sesuai.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-[#10B981] shrink-0 mt-0.5" />
                <span><strong>Ringan & Hemat Kuota:</strong> Dirancang dengan teknologi PWA modern yang cepat dibuka di berbagai merk ponsel Android & iOS.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Feature 3: Digital BAP */}
      <section id="bap" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-[16px] border border-[#E2E8F0] bg-[#FFFFFF] p-6 sm:p-10 shadow-[0_1px_3px_0_rgba(15,23,42,0.03)] grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6 space-y-4">
            <div className="inline-flex items-center gap-2 rounded-[6px] bg-[#EBF5FC] text-[#007ACC] px-3 py-1 text-[12px] font-semibold">
              <FileCheck2 className="h-4 w-4" />
              <span>Modul 03 • Berita Acara Pekerjaan</span>
            </div>
            <h2 className="font-heading text-[24px] sm:text-[28px] font-bold text-[#0F172A]">
              BAP Digital Otomatis dengan Tanda Tangan Klien di Layar
            </h2>
            <p className="text-[14px] text-[#475569] leading-relaxed">
              Ucapkan selamat tinggal pada surat jalan kertas yang basah, sobek, atau hilang. Setelah pekerjaan tuntas, pelanggan menandatangani berita acara langsung di layar HP teknisi, dan dokumen resmi PDF diterbitkan saat itu juga.
            </p>
            <ul className="space-y-3 text-[13.5px] text-[#475569] pt-2">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-[#10B981] shrink-0 mt-0.5" />
                <span><strong>Tanda tangan digital sah:</strong> Terekam rapi lengkap dengan nama terang perwakilan klien dan cap waktu pengerjaan.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-[#10B981] shrink-0 mt-0.5" />
                <span><strong>Format PDF resmi berlogo perusahaan:</strong> Lengkap memuat rincian tindakan, penggantian suku cadang, dan lampiran foto before/after.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-[#10B981] shrink-0 mt-0.5" />
                <span><strong>Langsung terkirim ke WhatsApp klien:</strong> Dispatcher dapat mengirimkan salinan BAP ke klien dalam hitungan detik untuk proses invoice cepat.</span>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-6 rounded-[12px] border border-[#E2E8F0] bg-[#F8FAFC] p-4 sm:p-6 space-y-3">
            <div className="bg-white rounded-[8px] border border-[#E2E8F0] p-4 space-y-3 shadow-sm">
              <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-2">
                <span className="font-heading text-[12px] font-bold text-[#0F172A]">
                  BERITA ACARA PEKERJAAN (BAP)
                </span>
                <span className="text-[10px] font-mono text-[#007ACC] bg-[#EBF5FC] px-2 py-0.5 rounded font-bold">
                  TERVERIFIKASI
                </span>
              </div>
              <div className="text-[11.5px] text-[#475569] space-y-1">
                <p><strong>Customer:</strong> PT Graha Pratama Mandiri</p>
                <p><strong>Pekerjaan:</strong> Maintenance AC Cassette 5 PK (Unit 02)</p>
                <p><strong>Hasil:</strong> Suhu outlet normal 19°C, pembersihan drainase selesai.</p>
              </div>
              {/* Mock Signature box */}
              <div className="pt-2 border-t border-[#F1F5F9] flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-[#94A3B8] block">Ditandatangani oleh Klien:</span>
                  <span className="text-[12px] font-semibold text-[#0F172A]">Hendra Gunawan</span>
                  <span className="text-[10px] text-[#10B981] block">10 Sep 2026 • 11:42 WIB</span>
                </div>
                <div className="h-10 w-24 border border-dashed border-[#CBD5E1] rounded bg-[#F8FAFC] flex items-center justify-center text-[10px] text-[#64748B] italic">
                  [Tanda Tangan]
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature 4: Assets & History */}
      <section id="assets" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-[16px] border border-[#E2E8F0] bg-[#FFFFFF] p-6 sm:p-10 shadow-[0_1px_3px_0_rgba(15,23,42,0.03)] grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6 order-2 lg:order-1 rounded-[12px] border border-[#E2E8F0] bg-[#F8FAFC] p-4 sm:p-6 space-y-3">
            <div className="bg-white rounded-[8px] border border-[#E2E8F0] p-4 space-y-3 shadow-sm">
              <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-2">
                <span className="text-[12px] font-semibold text-[#0F172A]">Kartu Mesin Pelanggan</span>
                <span className="text-[10px] text-[#10B981] bg-[#ECFDF5] px-2 py-0.5 rounded font-medium">Garansi Aktif</span>
              </div>
              <div className="text-[11.5px] text-[#475569] space-y-1">
                <p><strong>Nama Unit:</strong> AC Split Duct Daikin 10 PK</p>
                <p><strong>Serial Number:</strong> SN-DKN-2024-9981</p>
                <p><strong>Lokasi Penempatan:</strong> Ruang Server Gedung B Lt. 2</p>
              </div>
              <div className="pt-2 border-t border-[#F1F5F9] text-[11px] text-[#64748B]">
                <p className="font-medium text-[#0F172A]">Riwayat Servis Terakhir:</p>
                <p>• 15 Jan: Penggantian Kontaktor Listrik (Teknisi: Agus)</p>
                <p>• 10 Mar: Cuci Berkala & Pengecekan Tekanan Freon (Teknisi: Budi)</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 order-1 lg:order-2 space-y-4">
            <div className="inline-flex items-center gap-2 rounded-[6px] bg-[#EBF5FC] text-[#007ACC] px-3 py-1 text-[12px] font-semibold">
              <Wrench className="h-4 w-4" />
              <span>Modul 04 • Manajemen Aset</span>
            </div>
            <h2 className="font-heading text-[24px] sm:text-[28px] font-bold text-[#0F172A]">
              Riwayat Servis & Catatan Mesin Pelanggan Lengkap
            </h2>
            <p className="text-[14px] text-[#475569] leading-relaxed">
              Beri tahu teknisi Anda riwayat kerusakan mesin sebelum mereka berangkat ke lokasi. Tidak ada lagi teknisi yang bingung mencari riwayat servis lama atau suku cadang apa yang pernah diganti sebelumnya.
            </p>
            <ul className="space-y-3 text-[13.5px] text-[#475569] pt-2">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-[#10B981] shrink-0 mt-0.5" />
                <span><strong>Database unit per klien:</strong> Catat merk, model, nomor seri, dan tag lokasi fisik setiap unit peralatan.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-[#10B981] shrink-0 mt-0.5" />
                <span><strong>Monitoring masa garansi:</strong> Ketahui apakah perbaikan masih ditanggung garansi servis perusahaan atau garansi pabrikan.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-[#10B981] shrink-0 mt-0.5" />
                <span><strong>Pencegahan kerusakan berulang:</strong> Analisis unit mana yang sering rusak untuk menawarkan peremajaan mesin ke klien.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-[16px] bg-[#0F172A] p-8 sm:p-12 text-center text-white space-y-6">
          <div className="max-w-2xl mx-auto space-y-3">
            <h2 className="font-heading text-[26px] sm:text-[32px] font-bold">
              Siap Menerapkan Sistem Ini di Tim Anda?
            </h2>
            <p className="text-[14px] text-[#94A3B8]">
              Coba seluruh modul operasional GridlineOS secara gratis selama 14 hari tanpa biaya komitmen.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              href="/register"
              className="w-full sm:w-auto h-11 px-6 rounded-[8px] bg-[#007ACC] hover:bg-[#0062A3] text-white font-medium text-[14px] flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <span>Mulai Coba Gratis</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/demo"
              className="w-full sm:w-auto h-11 px-6 rounded-[8px] border border-[#334155] bg-[#1E293B] hover:bg-[#334155] text-white font-medium text-[14px] flex items-center justify-center gap-2 transition-colors"
            >
              <span>Konsultasikan Kebutuhan</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
