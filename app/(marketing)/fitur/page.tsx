import Link from 'next/link'
import {
  Calendar,
  Smartphone,
  Wrench,
  CheckCircle2,
  ArrowRight,
  Clock,
  ShieldCheck,
  Zap,
  Layers,
  TrendingUp,
  History,
  Check,
  HelpCircle,
  AlertTriangle,
  FileCheck2,
} from 'lucide-react'

export default function FiturPage() {
  return (
    <div className="space-y-24 md:space-y-32 py-12 md:py-16">
      {/* 1. Page Header */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#D0E8F8] bg-[#EBF5FC] px-3.5 py-1.5 text-[12px] font-semibold text-[#007ACC]">
            <Zap className="h-3.5 w-3.5" />
            <span>KAPABILITAS SISTEM OPILINES</span>
          </div>
          <h1 className="font-heading text-[32px] sm:text-[44px] font-bold text-[#0F172A] tracking-[-0.025em] leading-[1.18]">
            Fitur Lengkap untuk <span className="text-[#007ACC]">Efisiensi Operasional</span> Lapangan
          </h1>
          <p className="text-[15px] sm:text-[17px] text-[#475569] leading-relaxed max-w-2xl mx-auto">
            Dirancang khusus untuk mempermudah koordinasi kantor dengan tim teknis di lokasi kerja, meminimalkan miskomunikasi, dan mempercepat penerbitan laporan.
          </p>
        </div>
      </section>

      {/* 2. Feature 1: Visual Dispatch & Smart Scheduling */}
      <section id="dispatch" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-[16px] border border-[#E2E8F0] bg-[#FFFFFF] p-6 sm:p-10 shadow-[0_1px_3px_0_rgba(15,23,42,0.03)] grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6 space-y-5">
            <div className="inline-flex items-center gap-2 rounded-[6px] bg-[#EBF5FC] text-[#007ACC] px-3 py-1 text-[12px] font-semibold">
              <Calendar className="h-4 w-4" />
              <span>Fitur 01 • Penjadwalan & Dispatch</span>
            </div>
            <h2 className="font-heading text-[24px] sm:text-[28px] font-bold text-[#0F172A] tracking-tight">
              Visual Dispatch & Smart Scheduling
            </h2>
            <p className="text-[14.5px] text-[#475569] leading-relaxed">
              Atur penugasan teknisi melalui tampilan kalender visual yang intuitif. Kurangi risiko jadwal ganda (<em>overlap</em>) dan optimalkan distribusi pekerjaan harian tim teknis.
            </p>
            <ul className="space-y-2.5 text-[13.5px] text-[#475569] pt-1">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-[#007ACC] shrink-0" />
                <span>Deteksi otomatis saat terjadi jadwal bentrok antar pekerjaan</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-[#007ACC] shrink-0" />
                <span>Pemerataan beban tugas harian setiap teknisi</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-[#007ACC] shrink-0" />
                <span>Pelacakan status penugasan secara langsung dari satu layar</span>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-6 rounded-[12px] border border-[#E2E8F0] bg-[#F8FAFC] p-4 sm:p-6 space-y-3">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2 text-[12px]">
              <span className="font-semibold text-[#0F172A]">Kalender Visual Teknisi</span>
              <span className="text-[11px] font-medium bg-[#ECFDF5] text-[#10B981] px-2 py-0.5 rounded">
                Sinkron Otomatis
              </span>
            </div>
            <div className="space-y-2.5">
              <div className="p-3 bg-white rounded-[8px] border border-[#E2E8F0] space-y-1">
                <div className="flex justify-between items-center text-[12px]">
                  <span className="font-semibold text-[#0F172A]">Budi Santoso (Teknisi AC)</span>
                  <span className="text-[11px] bg-[#FFFBEB] text-[#D97706] px-2 py-0.5 rounded font-medium">Sedang Dikerjakan</span>
                </div>
                <p className="text-[11.5px] text-[#64748B]">09:00 - 12:00 • PT Graha Pratama (4 Unit AC Cassette)</p>
              </div>
              <div className="p-3 bg-white rounded-[8px] border border-[#E2E8F0] space-y-1">
                <div className="flex justify-between items-center text-[12px]">
                  <span className="font-semibold text-[#0F172A]">Agus Pratama (Teknisi CCTV)</span>
                  <span className="text-[11px] bg-[#F0F9FF] text-[#0284C7] px-2 py-0.5 rounded font-medium">Ditugaskan</span>
                </div>
                <p className="text-[11.5px] text-[#64748B]">13:00 - 15:30 • Menara Sudirman (Instalasi IP Camera)</p>
              </div>
              <div className="p-2.5 bg-[#FFFBEB] rounded-[8px] border border-[#FDE68A] flex items-center gap-2 text-[11.5px] text-[#92400E]">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>Peringatan instan jika ada waktu pekerjaan yang saling tumpang tindih</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Feature 2: End-to-End Job Management */}
      <section id="job-management" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-[16px] border border-[#E2E8F0] bg-[#FFFFFF] p-6 sm:p-10 shadow-[0_1px_3px_0_rgba(15,23,42,0.03)] grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6 order-2 lg:order-1 rounded-[12px] border border-[#E2E8F0] bg-[#F8FAFC] p-4 sm:p-6 space-y-3">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2 text-[12px]">
              <span className="font-semibold text-[#0F172A] flex items-center gap-1.5">
                <Layers className="h-4 w-4 text-[#007ACC]" />
                Alur Kerja Tiket Pekerjaan
              </span>
              <span className="text-[11px] font-mono text-[#64748B]">#JOB-1042</span>
            </div>
            <div className="bg-white p-4 rounded-[8px] border border-[#E2E8F0] space-y-3">
              <div className="space-y-2">
                {[
                  { step: '1', title: 'Request Masuk', desc: 'Keluhan pelanggan dicatat sistem', done: true },
                  { step: '2', title: 'Penerbitan SPK', desc: 'Instruksi kerja dan teknisi ditentukan', done: true },
                  { step: '3', title: 'Eksekusi Lapangan', desc: 'Pengerjaan SOP dan bukti foto', current: true },
                  { step: '4', title: 'BAP & Penutupan', desc: 'Laporan tervalidasi dan siap tagih' },
                ].map((item) => (
                  <div key={item.step} className="flex items-center justify-between text-[12px] p-2 rounded-[6px] bg-[#F8FAFC]">
                    <div className="flex items-center gap-2.5">
                      <span className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        item.done
                          ? 'bg-[#10B981] text-white'
                          : item.current
                          ? 'bg-[#007ACC] text-white'
                          : 'bg-[#E2E8F0] text-[#64748B]'
                      }`}>
                        {item.step}
                      </span>
                      <div>
                        <span className="font-semibold text-[#0F172A] block">{item.title}</span>
                        <span className="text-[11px] text-[#64748B]">{item.desc}</span>
                      </div>
                    </div>
                    {item.done && <CheckCircle2 className="h-4 w-4 text-[#10B981]" />}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 order-1 lg:order-2 space-y-5">
            <div className="inline-flex items-center gap-2 rounded-[6px] bg-[#EBF5FC] text-[#007ACC] px-3 py-1 text-[12px] font-semibold">
              <Layers className="h-4 w-4" />
              <span>Fitur 02 • Manajemen Pekerjaan</span>
            </div>
            <h2 className="font-heading text-[24px] sm:text-[28px] font-bold text-[#0F172A] tracking-tight">
              End-to-End Job Management
            </h2>
            <p className="text-[14.5px] text-[#475569] leading-relaxed">
              Satukan alur kerja operasional secara menyeluruh—mulai dari <em>request</em> pelanggan, pembuatan SPK/tiket, delegasi tugas ke teknisi, hingga penerbitan laporan pekerjaan selesai.
            </p>
            <ul className="space-y-2.5 text-[13.5px] text-[#475569] pt-1">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-[#007ACC] shrink-0" />
                <span>Pencatatan data pelanggan dan riwayat tiket terpusat</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-[#007ACC] shrink-0" />
                <span>Instruksi kerja detail langsung tersampaikan ke teknisi</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-[#007ACC] shrink-0" />
                <span>Transparansi tahapan pekerjaan bagi admin maupun owner</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 4. Feature 3: Verified Field Execution */}
      <section id="mobile" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div id="field-execution" className="rounded-[16px] border border-[#E2E8F0] bg-[#FFFFFF] p-6 sm:p-10 shadow-[0_1px_3px_0_rgba(15,23,42,0.03)] grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6 space-y-5">
            <div className="inline-flex items-center gap-2 rounded-[6px] bg-[#EBF5FC] text-[#007ACC] px-3 py-1 text-[12px] font-semibold">
              <Smartphone className="h-4 w-4" />
              <span>Fitur 03 • Eksekusi Lapangan</span>
            </div>
            <h2 className="font-heading text-[24px] sm:text-[28px] font-bold text-[#0F172A] tracking-tight">
              Verified Field Execution
            </h2>
            <p className="text-[14.5px] text-[#475569] leading-relaxed">
              Pastikan akuntabilitas teknisi di lokasi dengan fitur validasi GPS <em>check-in/out</em>, checklist SOP interaktif, dokumentasi foto lapangan, dan penandatanganan digital (<em>digital signature</em>).
            </p>
            <ul className="space-y-2.5 text-[13.5px] text-[#475569] pt-1">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-[#007ACC] shrink-0" />
                <span>Presensi lokasi berbasis GPS saat teknisi tiba dan selesai</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-[#007ACC] shrink-0" />
                <span>Wajib unggah bukti foto sebelum dan sesudah pekerjaan</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-[#007ACC] shrink-0" />
                <span>Tanda tangan digital klien langsung di layar ponsel teknisi</span>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-6 rounded-[12px] border border-[#E2E8F0] bg-[#F8FAFC] p-4 sm:p-6 space-y-3">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2 text-[12px]">
              <span className="font-semibold text-[#0F172A]">Aplikasi Teknisi Lapangan</span>
              <span className="text-[11px] text-[#10B981] font-mono font-medium">GPS Valid</span>
            </div>
            <div className="bg-white p-4 rounded-[8px] border border-[#E2E8F0] space-y-3">
              <div className="p-2.5 rounded-[6px] bg-[#F8FAFC] border border-[#E2E8F0] text-[12px] space-y-1">
                <p><strong>Lokasi:</strong> Gedung Cyber Lt. 3, Jakarta Selatan</p>
                <p><strong>Check-in:</strong> 08:58 WIB (Terekam dalam radius 15 meter)</p>
              </div>
              <div className="space-y-2 text-[11.5px]">
                <div className="flex items-center gap-2 text-[#10B981]">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>Checklist Prosedur Kerja SOP Terisi</span>
                </div>
                <div className="flex items-center gap-2 text-[#10B981]">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>Foto Sebelum & Sesudah Servis Terverifikasi</span>
                </div>
                <div className="flex items-center gap-2 text-[#10B981]">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>Tanda Tangan Digital Klien Tersimpan</span>
                </div>
              </div>
              <div className="pt-2 border-t border-[#F1F5F9] flex items-center justify-between text-[11px]">
                <span className="text-[#64748B]">BAP Otomatis</span>
                <span className="font-medium text-[#007ACC] flex items-center gap-1">
                  <FileCheck2 className="h-3.5 w-3.5" /> PDF Terbit
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Feature 4: Asset & Service History */}
      <section id="assets" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-[16px] border border-[#E2E8F0] bg-[#FFFFFF] p-6 sm:p-10 shadow-[0_1px_3px_0_rgba(15,23,42,0.03)] grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6 order-2 lg:order-1 rounded-[12px] border border-[#E2E8F0] bg-[#F8FAFC] p-4 sm:p-6 space-y-3">
            <div className="bg-white rounded-[8px] border border-[#E2E8F0] p-4 space-y-3 shadow-sm">
              <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-2">
                <span className="text-[12px] font-semibold text-[#0F172A]">Profil Unit Mesin Klien</span>
                <span className="text-[10px] text-[#10B981] bg-[#ECFDF5] px-2 py-0.5 rounded font-medium">Garansi Aktif</span>
              </div>
              <div className="text-[12px] text-[#475569] space-y-1">
                <p><strong>Nama Aset:</strong> Daikin VRV IV 10 PK</p>
                <p><strong>Nomor Seri:</strong> DKN-VRV-2024-8842</p>
                <p><strong>Penempatan:</strong> Ruang Server Lt. 2</p>
              </div>
              <div className="pt-2 border-t border-[#F1F5F9] text-[11.5px] text-[#64748B] space-y-1">
                <p className="font-semibold text-[#0F172A]">Jejak Servis Sebelumnya:</p>
                <p>• 12 Jan: Penggantian Thermistor Suhu (Teknisi: Agus)</p>
                <p>• 15 Mar: Cuci Kompresor & Cek Freon (Teknisi: Budi)</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 order-1 lg:order-2 space-y-5">
            <div className="inline-flex items-center gap-2 rounded-[6px] bg-[#EBF5FC] text-[#007ACC] px-3 py-1 text-[12px] font-semibold">
              <History className="h-4 w-4" />
              <span>Fitur 04 • Riwayat Aset & Servis</span>
            </div>
            <h2 className="font-heading text-[24px] sm:text-[28px] font-bold text-[#0F172A] tracking-tight">
              Asset & Service History
            </h2>
            <p className="text-[14.5px] text-[#475569] leading-relaxed">
              Rekam seluruh jejak servis, pergantian suku cadang, dan perbaikan sebelumnya per pelanggan atau unit aset untuk mempermudah diagnosa masalah di masa mendatang.
            </p>
            <ul className="space-y-2.5 text-[13.5px] text-[#475569] pt-1">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-[#007ACC] shrink-0" />
                <span>Pencatatan nomor seri, tipe mesin, dan lokasi fisik unit</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-[#007ACC] shrink-0" />
                <span>Histori lengkap pergantian suku cadang tiap penanganan</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-[#007ACC] shrink-0" />
                <span>Kemudahan diagnosa kerusakan berulang secara akurat</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 6. Feature 5: Performance & SLA Monitoring */}
      <section id="monitoring" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-[16px] border border-[#E2E8F0] bg-[#FFFFFF] p-6 sm:p-10 shadow-[0_1px_3px_0_rgba(15,23,42,0.03)] grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6 space-y-5">
            <div className="inline-flex items-center gap-2 rounded-[6px] bg-[#EBF5FC] text-[#007ACC] px-3 py-1 text-[12px] font-semibold">
              <TrendingUp className="h-4 w-4" />
              <span>Fitur 05 • Pemantauan Performa & SLA</span>
            </div>
            <h2 className="font-heading text-[24px] sm:text-[28px] font-bold text-[#0F172A] tracking-tight">
              Performance & SLA Monitoring
            </h2>
            <p className="text-[14.5px] text-[#475569] leading-relaxed">
              Pantau kepatuhan batas waktu layanan (<em>Service Level Agreement</em>), progres tiket secara <em>live</em>, dan metrik performa individu teknisi guna menjaga kepuasan klien.
            </p>
            <ul className="space-y-2.5 text-[13.5px] text-[#475569] pt-1">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-[#007ACC] shrink-0" />
                <span>Indikator peringatan batas waktu penyelesaian tiket (SLA)</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-[#007ACC] shrink-0" />
                <span>Pemantauan progres teknisi aktif secara real-time</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-[#007ACC] shrink-0" />
                <span>Evaluasi ketepatan waktu dan jumlah pekerjaan terselesaikan</span>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-6 rounded-[12px] border border-[#E2E8F0] bg-[#F8FAFC] p-4 sm:p-6 space-y-3">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2 text-[12px]">
              <span className="font-semibold text-[#0F172A]">Metrik Kepatuhan Layanan</span>
              <span className="text-[11px] font-medium text-[#10B981]">Status Real-time</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-white rounded-[8px] border border-[#E2E8F0] space-y-1">
                <span className="text-[11px] text-[#64748B] block">Tingkat Kepatuhan SLA</span>
                <span className="text-[20px] font-bold text-[#0F172A]">98.4%</span>
                <span className="text-[10px] text-[#10B981] block">Sesuai batas waktu kontrak</span>
              </div>
              <div className="p-3 bg-white rounded-[8px] border border-[#E2E8F0] space-y-1">
                <span className="text-[11px] text-[#64748B] block">Rata-rata Respon</span>
                <span className="text-[20px] font-bold text-[#0F172A]">24 mnt</span>
                <span className="text-[10px] text-[#007ACC] block">Dari tiket dibuat</span>
              </div>
            </div>
            <div className="p-3 bg-white rounded-[8px] border border-[#E2E8F0] space-y-1 text-[12px]">
              <div className="flex justify-between">
                <span className="font-medium text-[#0F172A]">Pekerjaan Selesai Hari Ini</span>
                <span className="font-bold text-[#10B981]">14 / 15 Tiket</span>
              </div>
              <div className="w-full bg-[#F1F5F9] h-2 rounded-full overflow-hidden">
                <div className="bg-[#10B981] h-full rounded-full" style={{ width: '93%' }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FAQ Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-[16px] border border-[#E2E8F0] bg-[#FFFFFF] p-8 lg:p-12 shadow-sm space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-[12px] font-bold text-[#007ACC] uppercase tracking-wider flex items-center justify-center gap-1.5">
              <HelpCircle className="h-4 w-4" />
              Pertanyaan yang Sering Diajukan
            </span>
            <h2 className="font-heading text-[24px] sm:text-[28px] font-bold text-[#0F172A] tracking-tight">
              Seputar Pertanyaan Terkait Produk Kami
            </h2>
            <p className="text-[14px] text-[#64748B]">
              Jawaban ringkas seputar implementasi dan penggunaan platform Opilines.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="p-5 rounded-[10px] bg-[#F8FAFC] border border-[#E2E8F0] space-y-2">
              <h3 className="font-heading text-[14.5px] font-semibold text-[#0F172A]">
                Apakah teknisi membutuhkan ponsel dengan spesifikasi khusus?
              </h3>
              <p className="text-[13px] text-[#475569] leading-relaxed">
                Tidak. Aplikasi teknisi Opilines berbasis Progressive Web App (PWA) yang ringan, hemat memori, dan dapat berjalan lancar di browser ponsel pintar Android maupun iOS.
              </p>
            </div>

            <div className="p-5 rounded-[10px] bg-[#F8FAFC] border border-[#E2E8F0] space-y-2">
              <h3 className="font-heading text-[14.5px] font-semibold text-[#0F172A]">
                Bagaimana jika teknisi berada di area dengan sinyal internet minim?
              </h3>
              <p className="text-[13px] text-[#475569] leading-relaxed">
                Data tiket yang telah dimuat tetap dapat diakses. Teknisi dapat mengisi checklist dan mengambil foto bukti, lalu data akan tersinkronisasi otomatis saat terhubung kembali ke internet.
              </p>
            </div>

            <div className="p-5 rounded-[10px] bg-[#F8FAFC] border border-[#E2E8F0] space-y-2">
              <h3 className="font-heading text-[14.5px] font-semibold text-[#0F172A]">
                Apakah data riwayat aset dan pelanggan perusahaan kami aman?
              </h3>
              <p className="text-[13px] text-[#475569] leading-relaxed">
                Sangat aman. Setiap data operasional dienkripsi dan dipisahkan secara ketat per organisasi, serta tersimpan di infrastruktur server lokal berkecepatan tinggi.
              </p>
            </div>

            <div className="p-5 rounded-[10px] bg-[#F8FAFC] border border-[#E2E8F0] space-y-2">
              <h3 className="font-heading text-[14.5px] font-semibold text-[#0F172A]">
                Berapa lama waktu implementasi hingga sistem siap digunakan?
              </h3>
              <p className="text-[13px] text-[#475569] leading-relaxed">
                Opilines siap pakai langsung setelah pendaftaran. Admin dan teknisi Anda dapat mengoperasikannya dalam hitungan jam dengan panduan onboarding praktis.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Bottom CTA / Final Banner */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-[16px] bg-[#0F172A] p-8 sm:p-12 text-center text-white space-y-6 relative overflow-hidden shadow-md">
          <div className="max-w-2xl mx-auto space-y-3">
            <h2 className="font-heading text-[26px] sm:text-[34px] font-bold tracking-tight">
              Siap Menerapkan Sistem Ini di Armada Teknisi Anda?
            </h2>
            <p className="text-[14px] sm:text-[15px] text-[#94A3B8] leading-relaxed">
              Jadwalkan demo untuk konsultasi kebutuhan armada Anda, atau mulai uji coba gratis 14 hari tanpa biaya komitmen.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
            <Link
              href="/demo"
              className="w-full sm:w-auto h-11 px-6 rounded-[8px] bg-[#007ACC] hover:bg-[#0062A3] text-white font-medium text-[14px] flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <span>Jadwalkan Demo</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/register"
              className="w-full sm:w-auto h-11 px-6 rounded-[8px] border border-[#334155] bg-[#1E293B] hover:bg-[#334155] text-white font-medium text-[14px] flex items-center justify-center gap-2 transition-colors"
            >
              <span>Coba Gratis Sekarang</span>
            </Link>
          </div>

          <p className="text-[12px] text-[#64748B]">
            Tanpa instalasi perangkat rumit • Tim support lokal siap mendampingi
          </p>
        </div>
      </section>
    </div>
  )
}
