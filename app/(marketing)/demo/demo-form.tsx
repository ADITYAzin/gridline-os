'use client'

import { useState } from 'react'
import { CheckCircle2, Loader2, ArrowRight, MessageSquare } from 'lucide-react'

export function DemoForm() {
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    industry: 'ac_hvac',
    technicians: '1_5',
    phone: '',
    notes: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate submission delay and open WhatsApp / confirmation
    setTimeout(() => {
      setIsSubmitting(false)
      setIsSubmitted(true)
    }, 600)
  }

  if (isSubmitted) {
    const waText = encodeURIComponent(
      `Halo GridlineOS, saya ${formData.name} dari ${formData.company} (${formData.industry}, ~${formData.technicians} teknisi). Saya ingin menjadwalkan demo online GridlineOS.`
    )
    const waUrl = `https://wa.me/6281234567890?text=${waText}`

    return (
      <div className="rounded-[16px] border border-[#10B981]/30 bg-[#FFFFFF] p-8 text-center space-y-5 shadow-sm">
        <div className="h-12 w-12 rounded-full bg-[#ECFDF5] text-[#10B981] flex items-center justify-center mx-auto border border-[#A7F3D0]">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <div className="space-y-2">
          <h3 className="font-heading text-[20px] font-bold text-[#0F172A]">
            Permintaan Demo Berhasil Dikirim!
          </h3>
          <p className="text-[13.5px] text-[#475569] max-w-md mx-auto leading-relaxed">
            Terima kasih, <strong>{formData.name}</strong>. Tim konsultan GridlineOS akan menghubungi Anda melalui WhatsApp di nomor <strong>{formData.phone}</strong> dalam 1×24 jam kerja untuk menyepakati jadwal demo.
          </p>
        </div>

        <div className="pt-2 border-t border-[#F1F5F9]">
          <p className="text-[12px] text-[#64748B] mb-3">
            Ingin langsung terhubung tanpa menunggu?
          </p>
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-10 px-5 rounded-[8px] bg-[#10B981] hover:bg-[#059669] text-white font-medium text-[13px] items-center gap-2 transition-colors"
          >
            <MessageSquare className="h-4 w-4" />
            <span>Buka WhatsApp Konsultan Sekarang</span>
          </a>
        </div>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[16px] border border-[#E2E8F0] bg-[#FFFFFF] p-6 sm:p-8 space-y-4 shadow-[0_1px_3px_0_rgba(15,23,42,0.03)]"
    >
      <div className="border-b border-[#F1F5F9] pb-4">
        <h3 className="font-heading text-[18px] font-bold text-[#0F172A]">
          Formulir Jadwalkan Demo
        </h3>
        <p className="text-[13px] text-[#64748B] mt-1">
          Lengkapi data perusahaan Anda untuk sesi presentasi online yang disesuaikan.
        </p>
      </div>

      <div className="space-y-4 pt-1">
        {/* Nama & Perusahaan */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="name" className="block text-[12px] font-medium text-[#475569]">
              Nama Lengkap PIC <span className="text-[#EF4444]">*</span>
            </label>
            <input
              id="name"
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Contoh: Hendra Gunawan"
              className="w-full h-10 rounded-[8px] border border-[#E2E8F0] bg-[#FFFFFF] px-3 text-[13.5px] text-[#0F172A] placeholder:text-[#94A3B8] transition-all focus:border-[#007ACC] focus:ring-4 focus:ring-[#007ACC]/15 outline-none"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="company" className="block text-[12px] font-medium text-[#475569]">
              Nama Perusahaan Jasa <span className="text-[#EF4444]">*</span>
            </label>
            <input
              id="company"
              type="text"
              required
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              placeholder="PT Graha Teknik Mandiri"
              className="w-full h-10 rounded-[8px] border border-[#E2E8F0] bg-[#FFFFFF] px-3 text-[13.5px] text-[#0F172A] placeholder:text-[#94A3B8] transition-all focus:border-[#007ACC] focus:ring-4 focus:ring-[#007ACC]/15 outline-none"
            />
          </div>
        </div>

        {/* Industri & Jumlah Teknisi */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="industry" className="block text-[12px] font-medium text-[#475569]">
              Bidang Jasa Servis <span className="text-[#EF4444]">*</span>
            </label>
            <select
              id="industry"
              value={formData.industry}
              onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
              className="w-full h-10 rounded-[8px] border border-[#E2E8F0] bg-[#FFFFFF] px-3 text-[13.5px] text-[#0F172A] transition-all focus:border-[#007ACC] focus:ring-4 focus:ring-[#007ACC]/15 outline-none"
            >
              <option value="ac_hvac">Servis AC & HVAC</option>
              <option value="building">Building Maintenance & Fasilitas</option>
              <option value="cctv">Instalasi CCTV & Security System</option>
              <option value="electrical">Elektrikal & Mekanikal</option>
              <option value="isp">Provider Internet & Jaringan</option>
              <option value="other">Jasa Teknis Lainnya</option>
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="technicians" className="block text-[12px] font-medium text-[#475569]">
              Jumlah Teknisi Lapangan <span className="text-[#EF4444]">*</span>
            </label>
            <select
              id="technicians"
              value={formData.technicians}
              onChange={(e) => setFormData({ ...formData, technicians: e.target.value })}
              className="w-full h-10 rounded-[8px] border border-[#E2E8F0] bg-[#FFFFFF] px-3 text-[13.5px] text-[#0F172A] transition-all focus:border-[#007ACC] focus:ring-4 focus:ring-[#007ACC]/15 outline-none"
            >
              <option value="1_5">1 - 5 Teknisi</option>
              <option value="6_15">6 - 15 Teknisi</option>
              <option value="16_30">16 - 30 Teknisi</option>
              <option value="30_plus">Lebih dari 30 Teknisi</option>
            </select>
          </div>
        </div>

        {/* WhatsApp Phone */}
        <div className="space-y-2">
          <label htmlFor="phone" className="block text-[12px] font-medium text-[#475569]">
            Nomor WhatsApp Aktif <span className="text-[#EF4444]">*</span>
          </label>
          <input
            id="phone"
            type="tel"
            required
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="Contoh: 081234567890"
            className="w-full h-10 rounded-[8px] border border-[#E2E8F0] bg-[#FFFFFF] px-3 text-[13.5px] text-[#0F172A] placeholder:text-[#94A3B8] transition-all focus:border-[#007ACC] focus:ring-4 focus:ring-[#007ACC]/15 outline-none"
          />
          <span className="text-[11px] text-[#94A3B8] block">
            Undangan Google Meet dan koordinasi jadwal akan dikirimkan via WhatsApp.
          </span>
        </div>

        {/* Catatan Tambahan */}
        <div className="space-y-2">
          <label htmlFor="notes" className="block text-[12px] font-medium text-[#475569]">
            Tantangan Operasional Utama (Opsional)
          </label>
          <textarea
            id="notes"
            rows={3}
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Contoh: Jadwal sering bentrok, bukti foto tercecer di grup WA, ingin laporan BAP otomatis..."
            className="w-full rounded-[8px] border border-[#E2E8F0] bg-[#FFFFFF] p-3 text-[13px] text-[#0F172A] placeholder:text-[#94A3B8] transition-all focus:border-[#007ACC] focus:ring-4 focus:ring-[#007ACC]/15 outline-none resize-none"
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-11 rounded-[8px] bg-[#007ACC] hover:bg-[#0062A3] active:bg-[#004F82] text-white font-medium text-[14px] flex items-center justify-center gap-2 shadow-[0_2px_8px_0_rgba(0,122,204,0.25)] transition-all cursor-pointer disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Memproses Permintaan...</span>
              </>
            ) : (
              <>
                <span>Kirim Permintaan Demo Online</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  )
}
