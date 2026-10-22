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
        className="sm:max-w-xl w-[94vw] p-0 gap-0 overflow-hidden rounded-2xl border shadow-xl bg-background max-h-[90vh] flex flex-col"
      >
        {/* Header: Clean with Primary Blue accents */}
        <div className="px-6 pt-6 pb-4 border-b bg-card shrink-0">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shrink-0">
              <Building2 className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <DialogTitle className="font-heading text-base font-semibold leading-tight">
                  Lengkapi Profil Perusahaan
                </DialogTitle>
                <Badge
                  variant="outline"
                  className="bg-primary/10 text-primary border-primary/30 text-[10px] font-semibold px-2 py-0.5"
                >
                  {companyName || 'Organisasi Baru'}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Lengkapi lokasi operasional dan katalog layanan utama Anda.
              </p>
            </div>
          </div>

          {/* Stepper Tabs */}
          <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t">
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                step === 1
                  ? 'bg-primary/10 text-primary border-primary/30'
                  : 'bg-muted/40 text-muted-foreground border-transparent'
              }`}
            >
              <span
                className={`h-4 w-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  step === 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}
              >
                1
              </span>
              <span>Lokasi & Kontak</span>
            </div>

            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                step === 2
                  ? 'bg-primary/10 text-primary border-primary/30'
                  : 'bg-muted/40 text-muted-foreground border-transparent'
              }`}
            >
              <span
                className={`h-4 w-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  step === 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}
              >
                2
              </span>
              <span>Katalog Layanan</span>
            </div>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {errorMessage && (
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span className="leading-snug">{errorMessage}</span>
            </div>
          )}

          {step === 1 ? (
            /* STEP 1: Lokasi & Kontak */
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="onboarding-address" className="text-xs font-medium flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-primary" />
                  <span>Alamat Workshop / Kantor Utama <span className="text-destructive">*</span></span>
                </Label>
                <Textarea
                  id="onboarding-address"
                  rows={3}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Masukkan alamat lengkap workshop atau kantor operasional"
                  className="text-xs rounded-lg resize-none leading-relaxed"
                  autoFocus
                />
                <p className="text-[11px] text-muted-foreground">
                  Digunakan untuk titik dispatch dan dokumen BAP pelanggan.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <Label htmlFor="onboarding-city" className="text-xs font-medium">
                    Kota / Kabupaten <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="onboarding-city"
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Contoh: Jakarta Selatan"
                    className="h-9 text-xs rounded-lg"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="onboarding-phone" className="text-xs font-medium flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>WhatsApp / Telepon Kantor</span>
                  </Label>
                  <Input
                    id="onboarding-phone"
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Contoh: 08123456789 (opsional)"
                    className="h-9 text-xs rounded-lg"
                  />
                </div>
              </div>
            </div>
          ) : (
            /* STEP 2: Layanan Perusahaan */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-xs font-semibold flex items-center gap-1.5">
                    <Briefcase className="h-3.5 w-3.5 text-primary" />
                    <span>Katalog Layanan Perusahaan <span className="text-destructive">*</span></span>
                  </Label>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Pilih layanan yang Anda sediakan atau tambahkan baru.
                  </p>
                </div>
                <Badge
                  variant="secondary"
                  className="text-[10px] font-semibold bg-primary/10 text-primary border border-primary/20 shrink-0"
                >
                  {selectedServices.length} Dipilih
                </Badge>
              </div>

              {/* Rekomendasi Layanan Umum */}
              <div className="space-y-2">
                <span className="text-[11px] font-medium text-muted-foreground block">
                  Pilihan Layanan Umum:
                </span>
                <div className="flex flex-wrap gap-2">
                  {GENERAL_SERVICE_RECOMMENDATIONS.map((srv) => {
                    const isSelected = selectedServices.includes(srv)
                    return (
                      <button
                        key={srv}
                        type="button"
                        onClick={() => toggleService(srv)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-primary/10 text-primary border-primary shadow-xs'
                            : 'bg-background text-muted-foreground border-border hover:border-primary/40 hover:bg-muted/40'
                        }`}
                      >
                        {isSelected ? (
                          <Check className="h-3.5 w-3.5 text-primary" />
                        ) : (
                          <Plus className="h-3.5 w-3.5 text-muted-foreground" />
                        )}
                        <span>{srv}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Opsi Mandiri: Tambah Layanan Kustom */}
              <div className="space-y-2 pt-3 border-t">
                <Label htmlFor="custom-service-input" className="text-[11px] font-medium text-muted-foreground block">
                  Tambah Layanan Kustom
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="custom-service-input"
                    type="text"
                    value={customServiceInput}
                    onChange={(e) => setCustomServiceInput(e.target.value)}
                    onKeyDown={handleAddCustomService}
                    placeholder="Nama layanan baru..."
                    className="h-9 text-xs rounded-lg flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddCustomService}
                    disabled={!customServiceInput.trim()}
                    className="h-9 px-3 text-xs rounded-lg shrink-0 cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    Tambah
                  </Button>
                </div>

                {/* Display custom services */}
                {selectedServices.some((s) => !GENERAL_SERVICE_RECOMMENDATIONS.includes(s)) && (
                  <div className="pt-1.5 space-y-1.5">
                    <span className="text-[10px] font-medium text-muted-foreground block uppercase tracking-wider">
                      Layanan Mandiri:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedServices
                        .filter((s) => !GENERAL_SERVICE_RECOMMENDATIONS.includes(s))
                        .map((srv) => (
                          <div
                            key={srv}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-primary/10 text-primary border border-primary/30"
                          >
                            <span>{srv}</span>
                            <button
                              type="button"
                              onClick={() => removeService(srv)}
                              className="hover:bg-primary/20 rounded p-0.5 text-primary cursor-pointer"
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

        {/* Footer */}
        <div className="px-6 py-3.5 bg-muted/30 border-t flex items-center justify-between shrink-0">
          <div>
            {step === 1 ? (
              <Button
                type="button"
                variant="ghost"
                onClick={handleDismiss}
                disabled={isPending}
                className="h-9 px-3 text-xs text-muted-foreground hover:text-foreground rounded-lg cursor-pointer"
              >
                Lewati Dulu
              </Button>
            ) : (
              <Button
                type="button"
                variant="ghost"
                onClick={() => setStep(1)}
                disabled={isPending}
                className="h-9 px-3 text-xs rounded-lg gap-1.5 cursor-pointer"
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
                className="h-9 px-4 text-xs font-medium rounded-lg gap-1.5 cursor-pointer"
              >
                <span>Lanjut</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={isPending}
                className="h-9 px-4 text-xs font-medium rounded-lg gap-1.5 cursor-pointer"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    Simpan Profil
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
