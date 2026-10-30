'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Settings2, Coins, Award, CheckCircle2, ShieldAlert, Loader2, Layers } from 'lucide-react'
import { formatRupiah, type CommissionSettings } from '@/lib/commission'
import { updateCommissionSettings } from '@/app/actions/commission-settings'
import { toast } from 'sonner'

export interface ServiceCommissionItem {
  id: string
  name: string
  default_price?: number | null
  commission_rate?: number | null
}

export interface CommissionSettingsDialogProps {
  settings: CommissionSettings
  services: ServiceCommissionItem[]
}

export function CommissionSettingsDialog({ settings, services }: CommissionSettingsDialogProps) {
  const [open, setOpen] = useState(false)
  const [isPending, setIsPending] = useState(false)

  // Local form state initialized from props (default Rp 0 if null/undefined)
  const [commissionEnabled, setCommissionEnabled] = useState(settings.commission_enabled)
  const [commissionType, setCommissionType] = useState<'service_based' | 'flat'>(settings.commission_type)
  const [defaultRate, setDefaultRate] = useState<number>(settings.default_commission_rate ?? 0)
  const [onTimeBonusEnabled, setOnTimeBonusEnabled] = useState(settings.on_time_bonus_enabled)
  const [onTimeBonusRate, setOnTimeBonusRate] = useState<number>(settings.on_time_bonus_rate ?? 0)

  // Map of service id -> custom commission rate
  const [serviceRates, setServiceRates] = useState<Record<string, number | null>>(() => {
    const map: Record<string, number | null> = {}
    services.forEach((s) => {
      map[s.id] = s.commission_rate != null ? s.commission_rate : null
    })
    return map
  })

  const handleServiceRateChange = (id: string, val: string) => {
    const cleanStr = val.replace(/\D/g, '')
    const num = cleanStr === '' ? null : parseInt(cleanStr, 10) || 0
    setServiceRates((prev) => ({
      ...prev,
      [id]: num,
    }))
  }

  const handleSave = async () => {
    setIsPending(true)
    try {
      const payloadServiceRates = services.map((s) => ({
        id: s.id,
        commission_rate: serviceRates[s.id] ?? null,
      }))

      const res = await updateCommissionSettings({
        commission_enabled: commissionEnabled,
        commission_type: commissionType,
        default_commission_rate: defaultRate,
        on_time_bonus_enabled: onTimeBonusEnabled,
        on_time_bonus_rate: onTimeBonusRate,
        serviceRates: payloadServiceRates,
      })

      if (res?.error) {
        toast.error(res.error)
      } else {
        toast.success(
          commissionEnabled
            ? 'Skema komisi teknisi berhasil disimpan.'
            : 'Sistem komisi dinonaktifkan (mode gaji tetap aktif).'
        )
        setOpen(false)
      }
    } catch {
      toast.error('Gagal menyimpan pengaturan komisi.')
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8.5 gap-1.5 text-xs font-semibold cursor-pointer shadow-xs border-[#E2E8F0] hover:bg-slate-50 text-[#0F172A]"
        >
          <Settings2 className="h-3.5 w-3.5 text-[#007ACC]" />
          <span>Atur Skema Komisi</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-2xl p-6 rounded-2xl max-h-[88vh] overflow-y-auto space-y-5">
        <DialogHeader className="border-b pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EBF5FC] text-[#007ACC] shrink-0 shadow-2xs">
              <Coins className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-[#0F172A]">
                Pengaturan Komisi Teknisi
              </DialogTitle>
              <DialogDescription className="text-xs text-[#64748B] mt-0.5">
                Kelola skema pembagian komisi dan bonus pengerjaan tiket teknisi.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* 1. Master Toggle: Status Komisi Organisasi */}
        <div className="p-4 rounded-xl border border-[#E2E8F0] bg-slate-50/70 flex items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Label className="text-sm font-bold text-[#0F172A] cursor-pointer">
                Status Sistem Komisi
              </Label>
              <Badge
                variant={commissionEnabled ? 'default' : 'secondary'}
                className={commissionEnabled ? 'bg-emerald-600 text-white hover:bg-emerald-600 text-[10px]' : 'text-[10px]'}
              >
                {commissionEnabled ? 'Aktif' : 'Nonaktif (Gaji Tetap)'}
              </Badge>
            </div>
            <p className="text-xs text-[#64748B] leading-relaxed">
              {commissionEnabled
                ? 'Komisi dihitung otomatis untuk setiap tiket yang berhasil diselesaikan teknisi.'
                : 'Perusahaan dalam mode gaji tetap. Teknisi hanya melihat data performa & waktu pengerjaan.'}
            </p>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={commissionEnabled}
            onClick={() => setCommissionEnabled(!commissionEnabled)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
              commissionEnabled ? 'bg-[#007ACC]' : 'bg-slate-300'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                commissionEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* 2. Form Skema Komisi (Hanya jika aktif) */}
        {commissionEnabled ? (
          <div className="space-y-5 pt-1">
            {/* Pilihan Model Skema: Per Layanan vs Flat Rate */}
            <div className="space-y-2.5">
              <Label className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
                Model Perhitungan Komisi
              </Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Opsi 1: Berdasarkan Jenis Layanan */}
                <div
                  onClick={() => setCommissionType('service_based')}
                  className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between gap-2 ${
                    commissionType === 'service_based'
                      ? 'border-[#007ACC] bg-[#EBF5FC]/40 text-[#0F172A]'
                      : 'border-[#E2E8F0] bg-white hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Layers className={`h-4 w-4 ${commissionType === 'service_based' ? 'text-[#007ACC]' : 'text-slate-400'}`} />
                      <span className="text-xs font-bold">Sesuai Jenis Layanan</span>
                    </div>
                    {commissionType === 'service_based' && (
                      <CheckCircle2 className="h-4 w-4 text-[#007ACC]" />
                    )}
                  </div>
                  <p className="text-[11px] text-[#64748B] leading-relaxed">
                    Nominal komisi diatur spesifik per jenis servis di katalog pekerjaan.
                  </p>
                </div>

                {/* Opsi 2: Tarif Rata (Flat per Tiket) */}
                <div
                  onClick={() => setCommissionType('flat')}
                  className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between gap-2 ${
                    commissionType === 'flat'
                      ? 'border-[#007ACC] bg-[#EBF5FC]/40 text-[#0F172A]'
                      : 'border-[#E2E8F0] bg-white hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Coins className={`h-4 w-4 ${commissionType === 'flat' ? 'text-[#007ACC]' : 'text-slate-400'}`} />
                      <span className="text-xs font-bold">Tarif Flat (Sama Rata)</span>
                    </div>
                    {commissionType === 'flat' && (
                      <CheckCircle2 className="h-4 w-4 text-[#007ACC]" />
                    )}
                  </div>
                  <p className="text-[11px] text-[#64748B] leading-relaxed">
                    Nominal komisi sama untuk setiap tiket yang berhasil diselesaikan.
                  </p>
                </div>
              </div>
            </div>

            {/* Input Nominal Komisi Standar */}
            <div className="p-4 rounded-xl border border-[#E2E8F0] bg-white space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-xs font-bold text-[#0F172A]">
                    {commissionType === 'flat'
                      ? 'Komisi per Tiket Selesai'
                      : 'Komisi Standar (Default)'}
                  </Label>
                  <p className="text-[11px] text-[#64748B] mt-0.5">
                    {commissionType === 'flat'
                      ? 'Diberikan ke teknisi untuk tiap tiket selesai.'
                      : 'Digunakan otomatis jika layanan belum diatur tarif khususnya.'}
                  </p>
                </div>
                <span className="text-xs font-bold text-[#007ACC] bg-[#EBF5FC] px-2.5 py-1 rounded-md">
                  {formatRupiah(defaultRate)}
                </span>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                  Rp
                </span>
                <Input
                  type="text"
                  value={defaultRate > 0 ? defaultRate.toLocaleString('id-ID') : ''}
                  onChange={(e) => {
                    const clean = e.target.value.replace(/\D/g, '')
                    const val = clean === '' ? 0 : parseInt(clean, 10) || 0
                    setDefaultRate(val)
                  }}
                  className="pl-9 h-9 text-xs font-medium"
                  placeholder="0"
                />
              </div>
            </div>

            {/* Daftar Rincian Komisi per Layanan (Hanya jika mode service_based) */}
            {commissionType === 'service_based' && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
                      Tarif Khusus per Layanan
                    </Label>
                    <p className="text-[11px] text-[#64748B]">
                      Isi nominal untuk layanan tertentu, atau kosongkan untuk memakai komisi standar ({formatRupiah(defaultRate)}).
                    </p>
                  </div>
                  <Badge variant="outline" className="text-[10px]">
                    {services.length} Layanan
                  </Badge>
                </div>

                {services.length === 0 ? (
                  <div className="p-4 rounded-xl border border-dashed border-[#E2E8F0] text-center text-xs text-[#64748B]">
                    Belum ada layanan di katalog. Seluruh tiket akan memakai komisi standar.
                  </div>
                ) : (
                  <div className="border border-[#E2E8F0] rounded-xl overflow-hidden divide-y divide-[#E2E8F0] bg-white">
                    {services.map((srv) => {
                      const currentVal = serviceRates[srv.id]
                      const placeholderText = defaultRate > 0
                        ? `Ikut standar (${formatRupiah(defaultRate)})`
                        : '0'

                      return (
                        <div key={srv.id} className="p-3 flex items-center justify-between gap-3 text-xs">
                          <div className="min-w-0 flex-1">
                            <span className="font-semibold text-[#0F172A] block truncate">{srv.name}</span>
                            <span className="text-[10.5px] text-[#64748B]">
                              Harga Konsumen: {srv.default_price ? formatRupiah(Number(srv.default_price)) : 'Tidak diset'}
                            </span>
                          </div>

                          <div className="w-44 shrink-0 relative">
                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-slate-400">
                              Rp
                            </span>
                            <Input
                              type="text"
                              value={currentVal != null ? currentVal.toLocaleString('id-ID') : ''}
                              onChange={(e) => handleServiceRateChange(srv.id, e.target.value)}
                              placeholder={placeholderText}
                              className="pl-8 h-8 text-xs text-right font-medium"
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {/* 3. Insentif Ketepatan Waktu (Bonus SLA On-Time) */}
            <div className="p-4 rounded-xl border border-[#E2E8F0] bg-white space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 shrink-0 mt-0.5">
                    <Award className="h-4 w-4" />
                  </div>
                  <div>
                    <Label className="text-xs font-bold text-[#0F172A] cursor-pointer">
                      Bonus Tepat Waktu (SLA)
                    </Label>
                    <p className="text-[11px] text-[#64748B] mt-0.5">
                      Tambahan insentif jika tiket diselesaikan sebelum batas waktu jadwal.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={onTimeBonusEnabled}
                  onClick={() => setOnTimeBonusEnabled(!onTimeBonusEnabled)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                    onTimeBonusEnabled ? 'bg-emerald-600' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                      onTimeBonusEnabled ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {onTimeBonusEnabled && (
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3">
                  <span className="text-xs text-[#475569] font-medium">Nominal Bonus SLA:</span>
                  <div className="w-44 relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                      Rp
                    </span>
                    <Input
                      type="text"
                      value={onTimeBonusRate > 0 ? onTimeBonusRate.toLocaleString('id-ID') : ''}
                      onChange={(e) => {
                        const clean = e.target.value.replace(/\D/g, '')
                        const val = clean === '' ? 0 : parseInt(clean, 10) || 0
                        setOnTimeBonusRate(val)
                      }}
                      className="pl-8 h-8 text-xs font-medium text-right"
                      placeholder="0"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Pesan Informatif Ketika Nonaktif */
          <div className="p-5 rounded-xl border border-dashed border-[#E2E8F0] bg-slate-50/50 text-center space-y-2">
            <ShieldAlert className="h-8 w-8 text-[#94A3B8] mx-auto" />
            <h4 className="text-xs font-bold text-[#0F172A]">Mode Gaji Tetap Sedang Aktif</h4>
            <p className="text-[11.5px] text-[#64748B] max-w-md mx-auto leading-relaxed">
              Teknisi tidak akan melihat nominal komisi di aplikasi mereka. Anda tetap dapat memantau produktivitas dan kepatuhan jadwal teknisi di tab Performa & SLA.
            </p>
          </div>
        )}

        <DialogFooter className="border-t pt-4 flex sm:justify-between items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setOpen(false)}
            disabled={isPending}
            className="text-xs cursor-pointer"
          >
            Batal
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={handleSave}
            disabled={isPending}
            className="text-xs bg-[#007ACC] hover:bg-[#0062A3] text-white font-semibold cursor-pointer gap-1.5 shadow-xs"
          >
            {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            <span>Simpan Pengaturan</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
