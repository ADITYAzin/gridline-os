import { DemoForm } from './demo-form'
import {
  CheckCircle2,
  Clock,
  MessageSquare,
  ShieldCheck,
  Zap,
  Users,
  Building2,
} from 'lucide-react'

export default function DemoPage() {
  return (
    <div className="py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Col: Explanations, Value, Direct WA */}
          <div className="lg:col-span-6 space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#D0E8F8] bg-[#EBF5FC] px-3.5 py-1.5 text-[12px] font-medium text-[#007ACC]">
                <Clock className="h-3.5 w-3.5" />
                <span>SESI DEMO INTERAKTIF 20 MENIT</span>
              </div>
              <h1 className="font-heading text-[32px] sm:text-[40px] font-bold text-[#0F172A] tracking-[-0.02em] leading-tight">
                Lihat Bagaimana GridlineOS <span className="text-[#007ACC]">Merapikan Operasional</span> Tim Anda
              </h1>
              <p className="text-[15px] text-[#475569] leading-relaxed">
                Jadwalkan sesi demo online privat bersama tim spesialis kami. Kami akan mensimulasikan alur kerja penugasan teknisi dan pembuatan BAP sesuai proses bisnis Anda.
              </p>
            </div>

            {/* What you will get */}
            <div className="rounded-[12px] border border-[#E2E8F0] bg-[#FFFFFF] p-6 space-y-4 shadow-[0_1px_3px_0_rgba(15,23,42,0.03)]">
              <h3 className="font-heading text-[15px] font-semibold text-[#0F172A]">
                Hal yang Akan Dibahas dalam Sesi Demo:
              </h3>
              <ul className="space-y-3 text-[13.5px] text-[#475569]">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-[#10B981] shrink-0 mt-0.5" />
                  <span><strong>Simulasi alur penugasan:</strong> Cara dispatcher membuat jadwal bebas bentrok dalam waktu kurang dari 1 menit.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-[#10B981] shrink-0 mt-0.5" />
                  <span><strong>Tampilan HP teknisi:</strong> Alur check-in GPS, SOP foto, dan tanda tangan digital di lapangan.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-[#10B981] shrink-0 mt-0.5" />
                  <span><strong>Format BAP & WhatsApp:</strong> Cara otomatis mengirim berita acara PDF resmi ke WhatsApp pelanggan.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-[#10B981] shrink-0 mt-0.5" />
                  <span><strong>Kalkulasi ROI & efisiensi:</strong> Hitung estimasi waktu admin yang dapat dihemat setiap bulannya.</span>
                </li>
              </ul>
            </div>

            {/* Direct WhatsApp Callout */}
            <div className="rounded-[12px] border border-[#A7F3D0] bg-[#ECFDF5] p-6 space-y-3">
              <div className="flex items-center gap-2 text-[#065F46] font-semibold text-[14px]">
                <MessageSquare className="h-5 w-5 text-[#10B981]" />
                <span>Ingin Tanya Jawab Langsung Sekarang?</span>
              </div>
              <p className="text-[13px] text-[#065F46] leading-relaxed">
                Konsultan produk kami siap merespons pertanyaan Anda secara langsung melalui chat WhatsApp resmi.
              </p>
              <div className="pt-1">
                <a
                  href="https://wa.me/6281234567890?text=Halo%20GridlineOS,%20saya%20ingin%20konsultasi%20mengenai%20kebutuhan%20manajemen%20teknisi%20lapangan."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-9 px-4 rounded-[8px] bg-[#10B981] hover:bg-[#059669] text-white font-medium text-[13px] items-center gap-2 shadow-sm transition-colors"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>Chat WhatsApp Tim Sales</span>
                </a>
              </div>
            </div>
          </div>

          {/* Right Col: Form */}
          <div className="lg:col-span-6">
            <DemoForm />
          </div>
        </div>
      </div>
    </div>
  )
}
