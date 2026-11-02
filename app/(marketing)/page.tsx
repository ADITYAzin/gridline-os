import Link from 'next/link'
import {
  ArrowRight,
  Calendar,
  Smartphone,
  Building2,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Wrench,
  Camera,
  Layers,
  ChevronRight,
  TrendingUp,
  History,
  Check,
  Zap,
} from 'lucide-react'

export default function MarketingHomePage() {
  return (
    <div className="space-y-24 md:space-y-32 pb-24">
      {/* 1. Hero Section */}
      <section className="relative pt-12 md:pt-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* Kicker Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-[#D0E8F8] bg-[#EBF5FC] px-3.5 py-1.5 text-[12px] font-semibold text-[#007ACC]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#007ACC]" />
              <span>Platform Operasional Lapangan B2B</span>
            </div>

            {/* Headline */}
            <h1 className="font-heading text-[32px] sm:text-[44px] lg:text-[52px] font-bold text-[#0F172A] tracking-[-0.025em] leading-[1.16]">
              Kelola Operasional Layanan Lapangan dalam{' '}
              <span className="text-[#007ACC]">Satu Platform Terintegrasi.</span>
            </h1>

            {/* Sub-headline */}
            <p className="text-[15px] sm:text-[17px] text-[#475569] leading-relaxed max-w-2xl mx-auto">
              Opilines menyederhanakan penjadwalan teknisi, pelaksanaan pekerjaan lapangan, verifikasi dokumen, hingga pemantauan performa layanan secara real-time.
            </p>

            {/* Primary CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
              <Link
                href="/register"
                className="w-full sm:w-auto h-11 px-6 rounded-[8px] bg-[#007ACC] hover:bg-[#0062A3] active:bg-[#004F82] text-white font-medium text-[14px] flex items-center justify-center gap-2 shadow-[0_1px_3px_0_rgba(0,122,204,0.3)] transition-all cursor-pointer"
              >
                <span>Coba Gratis Sekarang</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/demo"
                className="w-full sm:w-auto h-11 px-6 rounded-[8px] border border-[#CBD5E1] bg-[#FFFFFF] hover:bg-[#F8FAFC] text-[#0F172A] font-medium text-[14px] flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <span>Jadwalkan Demo</span>
              </Link>
            </div>

            {/* Reassurance */}
            <p className="text-[12.5px] text-[#64748B]">
              Uji coba gratis 14 hari • Tanpa kartu kredit • Onboarding terpandu
            </p>
          </div>
        </div>
      </section>

      {/* 2. Kami Menyesuaikan dengan Perusahaan Jasa Teknisi */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-[12px] font-bold text-[#007ACC] uppercase tracking-wider">
              Solusi Industri
            </span>
            <h2 className="font-heading text-[24px] sm:text-[30px] font-bold text-[#0F172A] tracking-tight">
              Kami Menyesuaikan dengan Perusahaan Jasa Teknisi
            </h2>
            <p className="text-[14px] text-[#475569]">
              Disesuaikan untuk berbagai sektor operasional teknis dan kontraktor pemeliharaan.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                icon: Wrench,
                title: 'Servis AC & HVAC',
              },
              {
                icon: Building2,
                title: 'Building Maintenance',
              },
              {
                icon: Camera,
                title: 'CCTV & Keamanan',
              },
              {
                icon: ShieldCheck,
                title: 'Elektrikal & Jaringan',
              },
            ].map((sector) => {
              const Icon = sector.icon
              return (
                <div
                  key={sector.title}
                  className="rounded-[10px] border border-[#E2E8F0] bg-[#FFFFFF] p-4 flex items-center gap-3 shadow-sm hover:border-[#007ACC]/40 transition-colors"
                >
                  <div className="h-9 w-9 rounded-[8px] bg-[#EBF5FC] text-[#007ACC] flex items-center justify-center shrink-0">
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                  <h3 className="font-heading text-[13.5px] font-semibold text-[#0F172A]">
                    {sector.title}
                  </h3>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* 3. Mengapa Bisnis Anda Membutuhkan Kami? (3 Pilar Solusi) */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-[12px] font-bold text-[#007ACC] uppercase tracking-wider">
              Tiga Pilar Solusi
            </span>
            <h2 className="font-heading text-[24px] sm:text-[30px] font-bold text-[#0F172A] tracking-tight">
              Mengapa Bisnis Anda Membutuhkan Opilines?
            </h2>
            <p className="text-[14px] text-[#475569]">
              Satu sistem terintegrasi untuk menyatukan kendali kantor dan teknisi lapangan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Pilar 1 */}
            <div className="rounded-[14px] border border-[#E2E8F0] bg-[#FFFFFF] p-6 lg:p-7 space-y-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="h-10 w-10 rounded-[8px] bg-[#EBF5FC] text-[#007ACC] flex items-center justify-center">
                <Layers className="h-5 w-5" />
              </div>
              <div className="space-y-2">
                <h3 className="font-heading text-[16px] font-semibold text-[#0F172A]">
                  Centralized Job Management
                </h3>
                <p className="text-[13.5px] text-[#475569] leading-relaxed">
                  Kelola data pelanggan, tiket tugas, dan dokumen servis dalam satu sistem terpusat tanpa risiko data hilang.
                </p>
              </div>
              <div className="pt-2 border-t border-[#F1F5F9] flex items-center gap-2 text-[12px] font-medium text-[#007ACC]">
                <Check className="h-3.5 w-3.5" />
                <span>Database operasional terintegrasi</span>
              </div>
            </div>

            {/* Pilar 2 */}
            <div className="rounded-[14px] border border-[#E2E8F0] bg-[#FFFFFF] p-6 lg:p-7 space-y-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="h-10 w-10 rounded-[8px] bg-[#EBF5FC] text-[#007ACC] flex items-center justify-center">
                <Calendar className="h-5 w-5" />
              </div>
              <div className="space-y-2">
                <h3 className="font-heading text-[16px] font-semibold text-[#0F172A]">
                  Smart Scheduling & Dispatch
                </h3>
                <p className="text-[13.5px] text-[#475569] leading-relaxed">
                  Atur penugasan teknisi lewat kalender visual interaktif yang otomatis mencegah jadwal ganda.
                </p>
              </div>
              <div className="pt-2 border-t border-[#F1F5F9] flex items-center gap-2 text-[12px] font-medium text-[#007ACC]">
                <Check className="h-3.5 w-3.5" />
                <span>Pencegah bentrok jadwal otomatis</span>
              </div>
            </div>

            {/* Pilar 3 */}
            <div className="rounded-[14px] border border-[#E2E8F0] bg-[#FFFFFF] p-6 lg:p-7 space-y-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="h-10 w-10 rounded-[8px] bg-[#EBF5FC] text-[#007ACC] flex items-center justify-center">
                <Smartphone className="h-5 w-5" />
              </div>
              <div className="space-y-2">
                <h3 className="font-heading text-[16px] font-semibold text-[#0F172A]">
                  Digital Field Execution & Verification
                </h3>
                <p className="text-[13.5px] text-[#475569] leading-relaxed">
                  Instruksi tugas jelas di HP teknisi, lengkap dengan validasi presensi GPS, SOP digital, dan foto bukti.
                </p>
              </div>
              <div className="pt-2 border-t border-[#F1F5F9] flex items-center gap-2 text-[12px] font-medium text-[#007ACC]">
                <Check className="h-3.5 w-3.5" />
                <span>Akuntabilitas teknisi terjamin</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Permasalahan yang Anda Hadapi Saat Ini (Cara Lama vs Cara Opilines) */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-[12px] font-bold text-[#007ACC] uppercase tracking-wider">
              Perbandingan Operasional
            </span>
            <h2 className="font-heading text-[24px] sm:text-[30px] font-bold text-[#0F172A] tracking-tight">
              Permasalahan yang Anda Hadapi Saat Ini
            </h2>
            <p className="text-[14px] text-[#475569]">
              Bandingkan risiko cara manual dengan kepastian operasional Opilines.
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                title: '1. Jadwal Bentrok & Miskomunikasi Tim',
                oldWay:
                  'Instruksi tertimbun di chat WhatsApp, teknisi tumpang tindih jadwal, dan rentan salah jam tugas.',
                newWay:
                  'Kalender visual otomatis mendeteksi bentrok jadwal dan mengirim detail tugas langsung ke HP teknisi.',
              },
              {
                title: '2. Bukti Kerja & Foto Tercecer',
                oldWay:
                  'Foto tersimpan di galeri pribadi teknisi, hilang atau sulit dicari saat klien mengajukan komplain.',
                newWay:
                  'Teknisi wajib unggah foto sebelum/sesudah dan checklist SOP yang langsung terkunci di tiket.',
              },
              {
                title: '3. Laporan BAP & Penagihan Lambat',
                oldWay:
                  'Ketik ulang laporan manual 2–3 hari dan tunggu tanda tangan susulan, menunda pengiriman invoice.',
                newWay:
                  'Klien tanda tangan digital di lokasi, BAP PDF resmi terbit seketika untuk mempercepat penagihan.',
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="rounded-[14px] border border-[#E2E8F0] bg-[#FFFFFF] p-6 shadow-sm space-y-4"
              >
                <h3 className="font-heading text-[15px] font-semibold text-[#0F172A]">
                  {item.title}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Cara Lama */}
                  <div className="rounded-[10px] border border-[#F1F5F9] bg-[#FAFAFA] p-4 space-y-2">
                    <div className="flex items-center gap-1.5 text-[#EF4444] text-[12px] font-semibold">
                      <XCircle className="h-4 w-4 shrink-0" />
                      <span>Cara Lama (WhatsApp & Spreadsheet)</span>
                    </div>
                    <p className="text-[13px] text-[#64748B] leading-relaxed">
                      {item.oldWay}
                    </p>
                  </div>

                  {/* Cara Opilines */}
                  <div className="rounded-[10px] border border-[#D0E8F8] bg-[#F8FBFE] p-4 space-y-2">
                    <div className="flex items-center gap-1.5 text-[#007ACC] text-[12px] font-semibold">
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                      <span>Dengan Opilines</span>
                    </div>
                    <p className="text-[13px] text-[#334155] leading-relaxed">
                      {item.newWay}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. 5 Fitur Unggulan Kami */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-[16px] border border-[#E2E8F0] bg-[#FFFFFF] p-8 lg:p-12 shadow-sm space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#F1F5F9] pb-6">
            <div className="space-y-1">
              <span className="text-[12px] font-bold text-[#007ACC] uppercase tracking-wider">
                Kapabilitas Platform
              </span>
              <h2 className="font-heading text-[24px] sm:text-[28px] font-bold text-[#0F172A] tracking-tight">
                5 Fitur Unggulan Kami
              </h2>
              <p className="text-[14px] text-[#64748B]">
                Solusi menyeluruh dari penjadwalan hingga pemantauan performa layanan.
              </p>
            </div>
            <Link
              href="/fitur"
              className="text-[13.5px] font-medium text-[#007ACC] hover:text-[#0062A3] flex items-center gap-1.5 transition-colors shrink-0"
            >
              <span>Lihat Detail Fitur Lengkap</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="space-y-2.5 p-4 rounded-[10px] bg-[#F8FAFC] border border-[#E2E8F0]/80">
              <div className="h-9 w-9 rounded-[8px] bg-[#EBF5FC] text-[#007ACC] flex items-center justify-center">
                <Calendar className="h-4.5 w-4.5" />
              </div>
              <h3 className="font-heading text-[14.5px] font-semibold text-[#0F172A]">
                Visual Dispatch & Smart Scheduling
              </h3>
              <p className="text-[13px] text-[#64748B] leading-relaxed">
                Kalender visual pintar untuk delegasi tugas harian cepat tanpa risiko jadwal bentrok.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="space-y-2.5 p-4 rounded-[10px] bg-[#F8FAFC] border border-[#E2E8F0]/80">
              <div className="h-9 w-9 rounded-[8px] bg-[#EBF5FC] text-[#007ACC] flex items-center justify-center">
                <Zap className="h-4.5 w-4.5" />
              </div>
              <h3 className="font-heading text-[14.5px] font-semibold text-[#0F172A]">
                End-to-End Job Management
              </h3>
              <p className="text-[13px] text-[#64748B] leading-relaxed">
                Pantau siklus pekerjaan penuh dari tiket masuk, penugasan teknisi, hingga penerbitan laporan.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="space-y-2.5 p-4 rounded-[10px] bg-[#F8FAFC] border border-[#E2E8F0]/80">
              <div className="h-9 w-9 rounded-[8px] bg-[#EBF5FC] text-[#007ACC] flex items-center justify-center">
                <ShieldCheck className="h-4.5 w-4.5" />
              </div>
              <h3 className="font-heading text-[14.5px] font-semibold text-[#0F172A]">
                Verified Field Execution
              </h3>
              <p className="text-[13px] text-[#64748B] leading-relaxed">
                Pastikan kepatuhan kerja di lokasi dengan validasi GPS, checklist SOP, foto bukti, dan TTD digital.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="space-y-2.5 p-4 rounded-[10px] bg-[#F8FAFC] border border-[#E2E8F0]/80">
              <div className="h-9 w-9 rounded-[8px] bg-[#EBF5FC] text-[#007ACC] flex items-center justify-center">
                <History className="h-4.5 w-4.5" />
              </div>
              <h3 className="font-heading text-[14.5px] font-semibold text-[#0F172A]">
                Asset & Service History
              </h3>
              <p className="text-[13px] text-[#64748B] leading-relaxed">
                Rekam jejak servis dan pergantian suku cadang per unit mesin untuk diagnosa perbaikan presisi.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="space-y-2.5 p-4 rounded-[10px] bg-[#F8FAFC] border border-[#E2E8F0]/80">
              <div className="h-9 w-9 rounded-[8px] bg-[#EBF5FC] text-[#007ACC] flex items-center justify-center">
                <TrendingUp className="h-4.5 w-4.5" />
              </div>
              <h3 className="font-heading text-[14.5px] font-semibold text-[#0F172A]">
                Performance & SLA Monitoring
              </h3>
              <p className="text-[13px] text-[#64748B] leading-relaxed">
                Pantau batas waktu SLA dan performa tim teknisi secara real-time guna menjaga kepuasan klien.
              </p>
            </div>

            {/* Feature Card CTA */}
            <div className="rounded-[10px] border border-dashed border-[#CBD5E1] p-5 flex flex-col justify-between space-y-4 bg-[#FFFFFF]">
              <div className="space-y-1.5">
                <h4 className="font-heading text-[14px] font-semibold text-[#0F172A]">
                  Ingin melihat fitur secara detail?
                </h4>
                <p className="text-[12.5px] text-[#64748B]">
                  Pelajari alur kerja lengkap setiap modul untuk armada teknisi Anda.
                </p>
              </div>
              <Link
                href="/fitur"
                className="h-9 px-4 rounded-[6px] bg-[#007ACC] hover:bg-[#0062A3] text-white font-medium text-[12.5px] flex items-center justify-center gap-1.5 transition-colors self-start"
              >
                <span>Eksplorasi Halaman Fitur</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Final Banner CTA */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-[16px] bg-[#0F172A] p-8 sm:p-12 text-center text-white space-y-6 relative overflow-hidden shadow-md">
          <div className="max-w-2xl mx-auto space-y-3">
            <h2 className="font-heading text-[26px] sm:text-[34px] font-bold tracking-tight">
              Siap Menata Operasional Lapangan Jadi Lebih Rapi?
            </h2>
            <p className="text-[14px] sm:text-[15px] text-[#94A3B8] leading-relaxed">
              Jadwalkan demo untuk melihat kesesuaian sistem dengan bisnis Anda, atau mulai coba gratis hari ini.
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
            Implementasi cepat • Dukungan langsung tim ahli Opilines
          </p>
        </div>
      </section>
    </div>
  )
}
