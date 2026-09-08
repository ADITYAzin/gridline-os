'use client'

import { useState, useActionState } from 'react'
import Link from 'next/link'
import { createJobAction, type JobActionState } from '@/app/actions/jobs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Plus, AlertCircle, Calendar, Clock, UserCheck, RotateCcw, CheckCircle2, Wrench } from 'lucide-react'

interface CustomerOption {
  id: string
  name: string
  address: string
}

interface TechOption {
  id: string
  name: string
}

export interface AssetOption {
  id: string
  customerId: string
  assetName: string
  brand: string
  modelNumber: string | null
  serialNumber: string | null
  locationTag: string | null
}

interface CreateJobFormProps {
  customers: CustomerOption[]
  technicians: TechOption[]
  assets?: AssetOption[]
  defaultCustomerId?: string
  defaultAssetId?: string
}

interface FormFields {
  customerId: string
  assetId: string
  serviceType: string
  priority: 'low' | 'medium' | 'high'
  issue: string
  instructions: string
  address: string
  technicianId: string
  scheduleDate: string
  startTime: string
  endTime: string
}

const DRAFT_STORAGE_KEY = 'gridline_new_job_draft_v1'
const initialState: JobActionState = {}

export function CreateJobForm({
  customers,
  technicians,
  assets = [],
  defaultCustomerId,
  defaultAssetId,
}: CreateJobFormProps) {
  const initialCustomer = defaultCustomerId ? customers.find((c) => c.id === defaultCustomerId) : undefined

  const getBlankValues = (): FormFields => ({
    customerId: defaultCustomerId || '',
    assetId: defaultAssetId || '',
    serviceType: '',
    priority: 'medium',
    issue: '',
    instructions: '',
    address: initialCustomer?.address || '',
    technicianId: '',
    scheduleDate: '',
    startTime: '09:00',
    endTime: '11:00',
  })

  const [formValues, setFormValues] = useState<FormFields>(() => {
    let savedData: Partial<FormFields> = {}
    if (typeof window !== 'undefined') {
      try {
        const saved = sessionStorage.getItem(DRAFT_STORAGE_KEY)
        if (saved) {
          savedData = JSON.parse(saved)
        }
      } catch {
        // ignore
      }
    }

    return {
      customerId: defaultCustomerId || savedData.customerId || '',
      assetId: defaultAssetId || savedData.assetId || '',
      serviceType: savedData.serviceType || '',
      priority: (savedData.priority as 'low' | 'medium' | 'high') || 'medium',
      issue: savedData.issue || '',
      instructions: savedData.instructions || '',
      address: (defaultCustomerId ? initialCustomer?.address : savedData.address) || initialCustomer?.address || '',
      technicianId: savedData.technicianId || '',
      scheduleDate: savedData.scheduleDate || '',
      startTime: savedData.startTime || '09:00',
      endTime: savedData.endTime || '11:00',
    }
  })

  const [state, formAction, isPending] = useActionState(
    async (prevState: JobActionState, formData: FormData) => {
      const res = await createJobAction(prevState, formData)
      if (res.error && res.fields) {
        setFormValues((prev) => {
          const updated: FormFields = {
            ...prev,
            customerId: res.fields?.customerId || prev.customerId,
            assetId: res.fields?.assetId ?? prev.assetId,
            serviceType: res.fields?.serviceType ?? prev.serviceType,
            priority: (res.fields?.priority as 'low' | 'medium' | 'high') || prev.priority,
            issue: res.fields?.issue ?? prev.issue,
            instructions: res.fields?.instructions ?? prev.instructions,
            address: res.fields?.address ?? prev.address,
            technicianId: res.fields?.technicianId ?? prev.technicianId,
            scheduleDate: res.fields?.scheduleDate ?? prev.scheduleDate,
            startTime: res.fields?.startTime ?? prev.startTime,
            endTime: res.fields?.endTime ?? prev.endTime,
          }
          try {
            sessionStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(updated))
          } catch {
            // ignore
          }
          return updated
        })
      } else if (res.success) {
        try {
          sessionStorage.removeItem(DRAFT_STORAGE_KEY)
        } catch {
          // ignore
        }
      }
      return res
    },
    initialState
  )

  // Helper to update specific field and auto-save draft
  const updateField = <K extends keyof FormFields>(key: K, value: FormFields[K]) => {
    setFormValues((prev) => {
      const updated = { ...prev, [key]: value }
      try {
        sessionStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(updated))
      } catch {
        // Ignore storage errors
      }
      return updated
    })
  }

  const handleCustomerChange = (customerId: string) => {
    const found = customers.find((c) => c.id === customerId)
    const isAssetStillValid = assets.some(
      (a) => a.id === formValues.assetId && a.customerId === customerId
    )
    setFormValues((prev) => {
      const updated: FormFields = {
        ...prev,
        customerId,
        assetId: isAssetStillValid ? prev.assetId : '',
        address: found ? found.address : prev.address,
      }
      try {
        sessionStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(updated))
      } catch {
        // Ignore storage errors
      }
      return updated
    })
  }

  const handleResetForm = () => {
    try {
      sessionStorage.removeItem(DRAFT_STORAGE_KEY)
    } catch {
      // Ignore storage errors
    }
    setFormValues(getBlankValues())
  }

  const availableAssets = assets.filter((a) => a.customerId === formValues.customerId)
  const selectedAsset = assets.find((a) => a.id === formValues.assetId)

  return (
    <form action={formAction}>
      <div className="grid gap-6 md:grid-cols-3">
        {/* Left 2 Cols: Main Work Order Details */}
        <div className="md:col-span-2 space-y-6">
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-lg">Detail Pekerjaan (Work Order)</CardTitle>
                <CardDescription>
                  Informasi utama kendala dan kebutuhan servis pelanggan.
                </CardDescription>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground bg-muted/60 px-2.5 py-1 rounded-md">
                <CheckCircle2 className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                <span>Draft tersimpan otomatis</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {state.error && (
                <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3.5 flex items-start gap-2.5 text-sm font-medium text-destructive">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-semibold">Periksa Kembali Input Form:</p>
                    <p className="text-xs font-normal leading-relaxed">{state.error}</p>
                    <p className="text-[11px] text-muted-foreground pt-1">
                      Data yang telah Anda isi tetap tersimpan di bawah dan tidak hilang.
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="customerId">Pilih Customer *</Label>
                  <Link href="/admin/customers" className="text-xs text-primary hover:underline font-medium">
                    + Customer Baru
                  </Link>
                </div>
                <input type="hidden" name="customerId" value={formValues.customerId} />
                <Select value={formValues.customerId} onValueChange={handleCustomerChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="-- Pilih Pelanggan --" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Pilihan Unit Mesin / Aset Pelanggan */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="assetId" className="flex items-center gap-1.5">
                    <Wrench className="h-3.5 w-3.5 text-primary" />
                    Unit Mesin / Aset Pelanggan (Equipment Asset)
                  </Label>
                  {formValues.customerId && (
                    <Link
                      href={`/admin/customers/${formValues.customerId}`}
                      target="_blank"
                      className="text-xs text-primary hover:underline font-medium"
                    >
                      + Tambah Unit Baru
                    </Link>
                  )}
                </div>
                <input type="hidden" name="assetId" value={formValues.assetId} />
                <Select
                  value={formValues.assetId || 'none'}
                  onValueChange={(val) => updateField('assetId', val === 'none' ? '' : val)}
                  disabled={!formValues.customerId}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        !formValues.customerId
                          ? 'Pilih pelanggan terlebih dahulu'
                          : availableAssets.length === 0
                          ? 'Belum ada unit terdaftar (Pekerjaan umum)'
                          : '-- Pilih Unit Mesin / Aset --'
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">-- Tanpa Unit Khusus / Servis Umum --</SelectItem>
                    {availableAssets.map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        [{a.brand}] {a.assetName} {a.modelNumber ? `(${a.modelNumber})` : ''} {a.locationTag ? `- ${a.locationTag}` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {selectedAsset && (
                  <div className="rounded-md border bg-muted/30 p-2.5 text-xs text-muted-foreground grid grid-cols-2 sm:grid-cols-4 gap-2 mt-1">
                    <div>
                      <span className="text-[10px] text-muted-foreground uppercase font-semibold">Merk:</span>
                      <div className="text-foreground font-medium">{selectedAsset.brand}</div>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground uppercase font-semibold">Model:</span>
                      <div className="text-foreground font-medium font-mono">{selectedAsset.modelNumber || '-'}</div>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground uppercase font-semibold">Serial No:</span>
                      <div className="text-foreground font-medium font-mono">{selectedAsset.serialNumber || '-'}</div>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground uppercase font-semibold">Lokasi:</span>
                      <div className="text-foreground font-medium">{selectedAsset.locationTag || '-'}</div>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="serviceType">Jenis Servis / Layanan *</Label>
                  <Input
                    id="serviceType"
                    name="serviceType"
                    required
                    value={formValues.serviceType}
                    onChange={(e) => updateField('serviceType', e.target.value)}
                    placeholder="Contoh: Servis AC, Pasang CCTV, Perbaikan Panel"
                    disabled={isPending}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="priority">Prioritas *</Label>
                  <input type="hidden" name="priority" value={formValues.priority} />
                  <Select
                    value={formValues.priority}
                    onValueChange={(v) => updateField('priority', v as 'low' | 'medium' | 'high')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Prioritas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Rendah (Low)</SelectItem>
                      <SelectItem value="medium">Normal / Sedang (Medium)</SelectItem>
                      <SelectItem value="high">Mendesak (High / Urgent)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="issue">Deskripsi Masalah / Keluhan *</Label>
                <Textarea
                  id="issue"
                  name="issue"
                  required
                  rows={3}
                  value={formValues.issue}
                  onChange={(e) => updateField('issue', e.target.value)}
                  placeholder="AC tidak dingin dan mengeluarkan air menetes di ruang server..."
                  disabled={isPending}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="instructions">Instruksi Khusus untuk Teknisi (Opsional)</Label>
                <Textarea
                  id="instructions"
                  name="instructions"
                  rows={2}
                  value={formValues.instructions}
                  onChange={(e) => updateField('instructions', e.target.value)}
                  placeholder="Temui security di lobi utama untuk minta kunci tangga..."
                  disabled={isPending}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="address">Alamat Lokasi Pengerjaan *</Label>
                <Textarea
                  id="address"
                  name="address"
                  required
                  rows={2}
                  value={formValues.address}
                  onChange={(e) => updateField('address', e.target.value)}
                  placeholder="Alamat detail lokasi..."
                  disabled={isPending}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right 1 Col: Scheduling & Assignment */}
        <div className="space-y-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-primary" />
                Penugasan & Jadwal (Opsional)
              </CardTitle>
              <CardDescription className="text-xs">
                Dapat ditentukan sekarang atau dibiarkan Pending untuk dijadwalkan nanti.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="space-y-1.5">
                <Label htmlFor="technicianId">Teknisi Bertugas</Label>
                <input type="hidden" name="technicianId" value={formValues.technicianId} />
                <Select
                  value={formValues.technicianId}
                  onValueChange={(val) => updateField('technicianId', val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="-- Belum Ditugaskan --" />
                  </SelectTrigger>
                  <SelectContent>
                    {technicians.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {formValues.technicianId && (
                <>
                  <div className="space-y-1.5">
                    <Label htmlFor="scheduleDate" className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" /> Tanggal Pengerjaan
                    </Label>
                    <Input
                      id="scheduleDate"
                      name="scheduleDate"
                      type="date"
                      value={formValues.scheduleDate}
                      onChange={(e) => updateField('scheduleDate', e.target.value)}
                      required={Boolean(formValues.technicianId)}
                      disabled={isPending}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="startTime" className="text-xs flex items-center gap-1">
                        <Clock className="h-3 w-3" /> Jam Mulai
                      </Label>
                      <Input
                        id="startTime"
                        name="startTime"
                        type="time"
                        value={formValues.startTime}
                        onChange={(e) => updateField('startTime', e.target.value)}
                        required={Boolean(formValues.technicianId)}
                        disabled={isPending}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="endTime" className="text-xs flex items-center gap-1">
                        <Clock className="h-3 w-3" /> Jam Selesai
                      </Label>
                      <Input
                        id="endTime"
                        name="endTime"
                        type="time"
                        value={formValues.endTime}
                        onChange={(e) => updateField('endTime', e.target.value)}
                        required={Boolean(formValues.technicianId)}
                        disabled={isPending}
                      />
                    </div>
                  </div>
                </>
              )}
            </CardContent>
            <CardFooter className="flex flex-col gap-2 pt-2">
              <Button type="submit" className="w-full font-semibold" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Menyimpan Job...
                  </>
                ) : (
                  <>
                    <Plus className="mr-1.5 h-4 w-4" />
                    Buat Job & Simpan
                  </>
                )}
              </Button>

              <div className="flex items-center gap-2 w-full">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleResetForm}
                  disabled={isPending}
                  className="flex-1 text-xs gap-1.5 text-muted-foreground"
                >
                  <RotateCcw className="h-3 w-3" />
                  Kosongkan Form
                </Button>
                <Button asChild variant="ghost" size="sm" className="flex-1 text-xs">
                  <Link href="/admin/jobs">Batal</Link>
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </form>
  )
}
