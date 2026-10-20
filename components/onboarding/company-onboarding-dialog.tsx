'use client'

import * as React from 'react'
import { useTransition } from 'react'
import {
  Building2,
  MapPin,
  Phone,
  Briefcase,
  Check,
  Plus,
  Loader2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  X,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  completeOnboardingAction,
  dismissOnboardingAction,
} from '@/app/actions/organization'

interface CompanyOnboardingDialogProps {
  companyName: string
  isOnboarded: boolean
  defaultAddress?: string | null
  defaultCity?: string | null
  defaultPhone?: string | null
}

const GENERAL_SERVICE_RECOMMENDATIONS = [
  'Instalasi / Pasang Baru',
  'Servis & Perawatan Berkala',
  'Perbaikan & Reparasi Kerusakan',
  'Pengecekan / Diagnosa Troubleshooting',
  'Bongkar Pasang / Relokasi Unit',
  'Penggantian Suku Cadang (Sparepart)',
]

export function CompanyOnboardingDialog({
  companyName,
  isOnboarded,
  defaultAddress = '',
  defaultCity = '',
  defaultPhone = '',
}: CompanyOnboardingDialogProps) {
  const [open, setOpen] = React.useState(!isOnboarded)
  const [step, setStep] = React.useState<1 | 2>(1)
  const [isPending, startTransition] = useTransition()
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)

  // Step 1: Location & contact
  const [address, setAddress] = React.useState(defaultAddress || '')
  const [city, setCity] = React.useState(defaultCity || '')
  const [phone, setPhone] = React.useState(defaultPhone || '')

  // Step 2: Services
  const [selectedServices, setSelectedServices] = React.useState<string[]>([
    'Instalasi / Pasang Baru',
    'Servis & Perawatan Berkala',
    'Perbaikan & Reparasi Kerusakan',
  ])
  const [customServiceInput, setCustomServiceInput] = React.useState('')

  // Sync state if isOnboarded changes
  React.useEffect(() => {
    setOpen(!isOnboarded)
  }, [isOnboarded])

  const toggleService = (service: string) => {
    setSelectedServices((prev) =>
      prev.includes(service) ? prev.filter((s) => s !== service) : [...prev, service]
    )
  }

  const removeService = (serviceToRemove: string) => {
    setSelectedServices((prev) => prev.filter((s) => s !== serviceToRemove))
  }

  const handleAddCustomService = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return
    e.preventDefault()
    const trimmed = customServiceInput.trim()
    if (!trimmed) return
    if (!selectedServices.includes(trimmed)) {
      setSelectedServices((prev) => [...prev, trimmed])
    }
    setCustomServiceInput('')
  }

  const handleNext = () => {
    setErrorMessage(null)
    if (!address.trim() || address.trim().length < 3) {
      setErrorMessage('Silakan masukkan alamat kantor atau workshop (minimal 3 karakter).')
      return
    }
    if (!city.trim() || city.trim().length < 2) {
      setErrorMessage('Silakan masukkan kota atau kabupaten operasional.')
      return
    }
    setStep(2)
  }

  const handleSubmit = () => {
    setErrorMessage(null)
    if (selectedServices.length === 0) {
      setErrorMessage('Pilih minimal 1 jenis layanan perusahaan Anda.')
      return
    }

    startTransition(async () => {
      const res = await completeOnboardingAction({
        address: address.trim(),
        city: city.trim(),
        phone: phone.trim() || undefined,
        services: selectedServices,
      })

      if (res.error) {
        setErrorMessage(res.error)
      } else {
        setOpen(false)
      }
    })
  }

  const handleDismiss = () => {
    startTransition(async () => {
      await dismissOnboardingAction()
      setOpen(false)
    })
  }

  if (isOnboarded && !open) return null

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-xl w-[94vw] p-0 gap-0 overflow-hidden rounded-[14px] border border-[#E2E8F0] shadow-2xl bg-white max-h-[92vh] flex flex-col"
      >
        {/* Header: Clean, white with Primary Blue accents */}
        <div className="px-6 pt-6 pb-4 border-b border-[#E2E8F0] bg-white shrink-0">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-[10px] bg-[#EBF5FC] text-[#007ACC] border border-[#D0E8F8] flex items-center justify-center shrink-0">
              <Building2 className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <DialogTitle className="font-heading text-base font-semibold text-[#0F172A] leading-tight">
                  Lengkapi Profil Perusahaan
                </DialogTitle>
                <Badge
                  variant="outline"
                  className="bg-[#EBF5FC] text-[#007ACC] border-[#007ACC]/30 text-[10px] font-semibold px-2 py-0.5"
                >
                  {companyName || 'Organisasi Baru'}
                </Badge>
              </div>
              <p className="text-xs text-[#475569] mt-1 leading-relaxed">
                Tambahkan alamat dan layanan agar sistem siap menerbitkan tiket servis serta Berita Acara Pekerjaan (BAP).
              </p>
            </div>
          </div>

          {/* Stepper Tabs */}
          <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-[#F1F5F9]">
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-[8px] text-xs font-medium border transition-colors ${
                step === 1
                  ? 'bg-[#EBF5FC] text-[#007ACC] border-[#007ACC]/40'
                  : 'bg-[#F8FAFC] text-[#94A3B8] border-[#E2E8F0]'
              }`}
            >
              <span
                className={`h-4 w-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  step === 1 ? 'bg-[#007ACC] text-white' : 'bg-[#E2E8F0] text-[#64748B]'
                }`}
              >
                1
              </span>
              <span>Lokasi & Kontak</span>
            </div>

            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-[8px] text-xs font-medium border transition-colors ${
                step === 2
                  ? 'bg-[#EBF5FC] text-[#007ACC] border-[#007ACC]/40'
                  : 'bg-[#F8FAFC] text-[#94A3B8] border-[#E2E8F0]'
              }`}
            >
              <span
                className={`h-4 w-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  step === 2 ? 'bg-[#007ACC] text-white' : 'bg-[#E2E8F0] text-[#64748B]'
                }`}
              >
                2
              </span>
              <span>Katalog Layanan</span>
            </div>
          </div>
        </div>

        {/* Scrollable Body: Breathing room, no cutoffs */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {errorMessage && (
            <div className="flex items-center gap-2.5 p-3 rounded-[8px] bg-[#FEF2F2] border border-[#EF4444]/30 text-[#B91C1C] text-xs font-medium">
              <AlertCircle className="h-4 w-4 shrink-0 text-[#EF4444]" />
              <span className="leading-snug">{errorMessage}</span>
            </div>
          )}

          {step === 1 ? (
            /* STEP 1: Lokasi & Kontak */
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="onboarding-address" className="text-xs font-medium text-[#475569] flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-[#007ACC]" />
                  <span>Alamat Lengkap Workshop / Kantor Utama <span className="text-[#EF4444]">*</span></span>
                </Label>
                <Textarea
                  id="onboarding-address"
                  rows={3}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Masukkan alamat lengkap workshop atau kantor operasional"
                  className="text-xs bg-white border-[#E2E8F0] rounded-[8px] focus:border-[#007ACC] focus:ring-2 focus:ring-[#007ACC]/15 resize-none leading-relaxed"
                  autoFocus
                />
                <p className="text-[11px] text-[#94A3B8]">
                  Digunakan sebagai titik dispatch teknisi dan tertera pada dokumen BAP pelanggan.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <Label htmlFor="onboarding-city" className="text-xs font-medium text-[#475569]">
                    Kota / Kabupaten <span className="text-[#EF4444]">*</span>
                  </Label>
                  <Input
                    id="onboarding-city"
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Masukkan kota operasional"
                    className="h-9 text-xs bg-white border-[#E2E8F0] rounded-[8px] focus:border-[#007ACC] focus:ring-2 focus:ring-[#007ACC]/15"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="onboarding-phone" className="text-xs font-medium text-[#475569] flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-[#94A3B8]" />
                    <span>WhatsApp / Telepon Kantor</span>
                  </Label>
                  <Input
                    id="onboarding-phone"
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Nomor kontak kantor atau WhatsApp (opsional)"
                    className="h-9 text-xs bg-white border-[#E2E8F0] rounded-[8px] focus:border-[#007ACC] focus:ring-2 focus:ring-[#007ACC]/15"
                  />
                </div>
              </div>
            </div>
          ) : (
            /* STEP 2: Layanan Perusahaan */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-xs font-semibold text-[#0F172A] flex items-center gap-1.5">
                    <Briefcase className="h-3.5 w-3.5 text-[#007ACC]" />
                    <span>Katalog Layanan Perusahaan <span className="text-[#EF4444]">*</span></span>
                  </Label>
                  <p className="text-[11px] text-[#64748B] mt-0.5">
                    Pilih kategori layanan umum di bawah, atau tambahkan layanan mandiri.
                  </p>
                </div>
                <Badge
                  variant="secondary"
                  className="text-[10px] font-semibold bg-[#EBF5FC] text-[#007ACC] border border-[#007ACC]/20 shrink-0"
                >
                  {selectedServices.length} Dipilih
                </Badge>
              </div>

              {/* Rekomendasi Layanan Umum (General) */}
              <div className="space-y-2">
                <span className="text-[11px] font-medium text-[#475569] block">
                  Rekomendasi Layanan Umum:
                </span>
                <div className="flex flex-wrap gap-2">
                  {GENERAL_SERVICE_RECOMMENDATIONS.map((srv) => {
                    const isSelected = selectedServices.includes(srv)
                    return (
                      <button
                        key={srv}
                        type="button"
                        onClick={() => toggleService(srv)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-xs font-medium border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#EBF5FC] text-[#007ACC] border-[#007ACC] shadow-xs'
                            : 'bg-white text-[#475569] border-[#E2E8F0] hover:border-[#007ACC]/40 hover:bg-[#F8FAFC]'
                        }`}
                      >
                        {isSelected ? (
                          <Check className="h-3.5 w-3.5 text-[#007ACC]" />
                        ) : (
                          <Plus className="h-3.5 w-3.5 text-[#94A3B8]" />
                        )}
                        <span>{srv}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Opsi Mandiri: Tambah Layanan Kustom */}
              <div className="space-y-2 pt-3 border-t border-[#F1F5F9]">
                <Label htmlFor="custom-service-input" className="text-[11px] font-medium text-[#475569] block">
                  Opsi Mandiri: Tambahkan Layanan Khusus / Kustom
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="custom-service-input"
                    type="text"
                    value={customServiceInput}
                    onChange={(e) => setCustomServiceInput(e.target.value)}
                    onKeyDown={handleAddCustomService}
                    placeholder="Ketik nama layanan kustom lalu tekan Enter atau Tambah"
                    className="h-9 text-xs bg-white border-[#E2E8F0] rounded-[8px] focus:border-[#007ACC] focus:ring-2 focus:ring-[#007ACC]/15 flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddCustomService}
                    disabled={!customServiceInput.trim()}
                    className="h-9 px-3 text-xs border-[#E2E8F0] rounded-[8px] hover:bg-[#EBF5FC] hover:text-[#007ACC] hover:border-[#007ACC]/40 shrink-0 cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    Tambah
                  </Button>
                </div>

                {/* Display any custom services with easy delete (x) button */}
                {selectedServices.some((s) => !GENERAL_SERVICE_RECOMMENDATIONS.includes(s)) && (
                  <div className="pt-1.5 space-y-1.5">
                    <span className="text-[10px] font-medium text-[#94A3B8] block uppercase tracking-wider">
                      Layanan Mandiri Ditambahkan:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedServices
                        .filter((s) => !GENERAL_SERVICE_RECOMMENDATIONS.includes(s))
                        .map((srv) => (
                          <div
                            key={srv}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] text-xs font-medium bg-[#EBF5FC] text-[#007ACC] border border-[#007ACC]/30"
                          >
                            <span>{srv}</span>
                            <button
                              type="button"
                              onClick={() => removeService(srv)}
                              className="hover:bg-[#007ACC]/15 rounded p-0.5 text-[#007ACC] cursor-pointer"
                              title="Hapus layanan ini"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer: Fixed at bottom, clean spacing */}
        <div className="px-6 py-3.5 bg-[#F8FAFC] border-t border-[#E2E8F0] flex items-center justify-between shrink-0">
          <div>
            {step === 1 ? (
              <Button
                type="button"
                variant="ghost"
                onClick={handleDismiss}
                disabled={isPending}
                className="h-9 px-3 text-xs text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] rounded-[8px] cursor-pointer"
              >
                Lewati Dulu
              </Button>
            ) : (
              <Button
                type="button"
                variant="ghost"
                onClick={() => setStep(1)}
                disabled={isPending}
                className="h-9 px-3 text-xs text-[#475569] hover:text-[#0F172A] hover:bg-[#F1F5F9] rounded-[8px] gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Kembali
              </Button>
            )}
          </div>

          <div>
            {step === 1 ? (
              <Button
                type="button"
                onClick={handleNext}
                className="h-9 px-4 text-xs font-medium bg-[#007ACC] hover:bg-[#0062A3] active:bg-[#004F82] text-white rounded-[8px] gap-1.5 cursor-pointer shadow-[0_1px_2px_0_rgba(0,122,204,0.15)] transition-all"
              >
                <span>Lanjut ke Layanan</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={isPending}
                className="h-9 px-4 text-xs font-medium bg-[#007ACC] hover:bg-[#0062A3] active:bg-[#004F82] text-white rounded-[8px] gap-2 cursor-pointer shadow-[0_1px_2px_0_rgba(0,122,204,0.15)] transition-all"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    Simpan & Mulai Gunakan
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
