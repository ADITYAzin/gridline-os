'use client'

import { useState, useActionState, useEffect } from 'react'
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
import { Loader2, Plus, AlertCircle, Calendar, Clock, UserCheck, UserPlus, RotateCcw, CheckCircle2, Wrench, X, Crown, Users } from 'lucide-react'
import { CreateCustomerDialog } from '@/app/(dashboard)/admin/customers/create-customer-dialog'
import { AssetDialog } from '@/components/customers/asset-dialog'
import { toast } from 'sonner'
import { CustomerSearchSelect, type CustomerOption } from './customer-select'
import { AssignTechniciansModal, type TechOption } from './assign-technicians-modal'
import { Badge } from '@/components/ui/badge'

export interface AssetOption {
  id: string
  customerId: string
  assetName: string
  brand: string
  modelNumber: string | null
  serialNumber: string | null
  locationTag: string | null
}

export interface ServiceOption {
  id: string
  name: string
  description?: string | null
  default_price?: number | null
}

interface CreateJobFormProps {
  customers: CustomerOption[]
  technicians: TechOption[]
  assets?: AssetOption[]
  defaultCustomerId?: string
  defaultAssetId?: string
  services?: ServiceOption[]
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
  technicianIds: string[]
  scheduleDate: string
  startTime: string
  endTime: string
}

const DEFAULT_SERVICE_OPTIONS = [
  'Instalasi / Pasang Baru',
  'Servis & Perawatan Berkala',
  'Perbaikan & Reparasi Kerusakan',
  'Pengecekan / Diagnosa Troubleshooting',
  'Bongkar Pasang / Relokasi Unit',
  'Penggantian Suku Cadang (Sparepart)',
]

const DRAFT_STORAGE_KEY = 'gridline_new_job_draft_v1'
const initialState: JobActionState = {}

export function CreateJobForm({
  customers,
  technicians,
  assets = [],
  defaultCustomerId,
  defaultAssetId,
  services = [],
}: CreateJobFormProps) {
  const [customerList, setCustomerList] = useState<CustomerOption[]>(customers)
  const [serviceList, setServiceList] = useState<ServiceOption[]>(services)
  const [assetList, setAssetList] = useState<AssetOption[]>(assets)

  useEffect(() => {
    setServiceList(services)
  }, [services])

  useEffect(() => {
    setAssetList(assets)
  }, [assets])

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
    technicianIds: [],
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

    const techIds: string[] = Array.isArray(savedData.technicianIds)
      ? savedData.technicianIds
      : savedData.technicianId
      ? [savedData.technicianId]
      : []

    return {
      customerId: defaultCustomerId || savedData.customerId || '',
      assetId: defaultAssetId || savedData.assetId || '',
      serviceType: savedData.serviceType || '',
      priority: (savedData.priority as 'low' | 'medium' | 'high') || 'medium',
      issue: savedData.issue || '',
      instructions: savedData.instructions || '',
      address: (defaultCustomerId ? initialCustomer?.address : savedData.address) || initialCustomer?.address || '',
      technicianId: techIds[0] || '',
      technicianIds: techIds,
      scheduleDate: savedData.scheduleDate || '',
      startTime: savedData.startTime || '09:00',
      endTime: savedData.endTime || '11:00',
    }
  })

  const isPredefined = (val: string) => {
    if (!val) return true
    if (services.some((s) => s.name === val)) return true
    if (DEFAULT_SERVICE_OPTIONS.includes(val)) return true
    return false
  }

  const [isCustomService, setIsCustomService] = useState<boolean>(() => {
    const st = formValues.serviceType || ''
    if (!st) return false
    return !isPredefined(st)
  })
  const [customServiceText, setCustomServiceText] = useState<string>(() => {
    const st = formValues.serviceType || ''
    if (!st) return ''
    return !isPredefined(st) ? st : ''
  })

  const [state, formAction, isPending] = useActionState(
    async (prevState: JobActionState, formData: FormData) => {
      const res = await createJobAction(prevState, formData)
      if (res.error && res.fields) {
        setFormValues((prev) => {
          let updatedTechIds = prev.technicianIds
          if (res.fields?.technicianIds) {
            try {
              const parsed = JSON.parse(res.fields.technicianIds)
              if (Array.isArray(parsed)) updatedTechIds = parsed
            } catch {
              // ignore
            }
          } else if (res.fields?.technicianId) {
            updatedTechIds = [res.fields.technicianId]
          }

          const updated: FormFields = {
            ...prev,
            customerId: res.fields?.customerId || prev.customerId,
            assetId: res.fields?.assetId ?? prev.assetId,
            serviceType: res.fields?.serviceType ?? prev.serviceType,
            priority: (res.fields?.priority as 'low' | 'medium' | 'high') || prev.priority,
            issue: res.fields?.issue ?? prev.issue,
            instructions: res.fields?.instructions ?? prev.instructions,
            address: res.fields?.address ?? prev.address,
            technicianId: updatedTechIds[0] || '',
            technicianIds: updatedTechIds,
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

  const handleTechniciansChange = (ids: string[]) => {
    const limitedIds = ids.slice(0, 4)
    setFormValues((prev) => {
      const updated: FormFields = {
        ...prev,
        technicianId: limitedIds[0] || '',
        technicianIds: limitedIds,
      }
      try {
        sessionStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(updated))
      } catch {
        // ignore
      }
      return updated
    })
  }

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

  const handleCustomerChange = (customerId: string, fallbackCustomer?: CustomerOption) => {
    if (!customerId) {
      setFormValues((prev) => {
        const updated: FormFields = {
          ...prev,
          customerId: '',
          assetId: '',
        }
        try {
          sessionStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(updated))
        } catch {
          // Ignore
        }
        return updated
      })
      return
    }

    const found =
      customerList.find((c) => c.id === customerId) ||
      fallbackCustomer ||
      customers.find((c) => c.id === customerId)
    const isAssetStillValid = assetList.some(
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

  const handleCustomerCreated = (newCustomer: CustomerOption) => {
    const newOption: CustomerOption = {
      id: newCustomer.id,
      name: newCustomer.name,
      address: newCustomer.address,
      phone: newCustomer.phone,
    }
    setCustomerList((prev) => {
      if (prev.some((c) => c.id === newOption.id)) return prev
      return [newOption, ...prev].sort((a, b) => a.name.localeCompare(b.name))
    })
    handleCustomerChange(newOption.id, newOption)
    toast.success(`Customer "${newOption.name}" berhasil dibuat dan otomatis dipilih`)
  }

  const handleAssetCreated = (newAsset: AssetOption) => {
    setAssetList((prev) => {
      if (prev.some((a) => a.id === newAsset.id)) return prev
      return [newAsset, ...prev]
    })
    if (!formValues.customerId || formValues.customerId !== newAsset.customerId) {
      handleCustomerChange(newAsset.customerId)
    }
    updateField('assetId', newAsset.id)
    toast.success(`Unit aset "${newAsset.assetName}" berhasil didaftarkan dan dipilih`)
  }

  const handleResetForm = () => {
    try {
      sessionStorage.removeItem(DRAFT_STORAGE_KEY)
    } catch {
      // Ignore storage errors
    }
    setFormValues(getBlankValues())
  }

  const availableAssets = assetList.filter((a) => a.customerId === formValues.customerId)
  const selectedAsset = assetList.find((a) => a.id === formValues.assetId)

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
                  <Label htmlFor="customerId" className="text-xs font-medium text-[#475569]">Pilih Pelanggan *</Label>
                  <CreateCustomerDialog
                    onCustomerCreated={handleCustomerCreated}
                    trigger={
                      <button
                        type="button"
                        className="text-xs text-primary hover:underline font-medium flex items-center gap-1 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 rounded-sm"
                      >
                        <Plus className="h-3 w-3" />
                        Customer Baru
                      </button>
                    }
                  />
                </div>
                <input type="hidden" name="customerId" value={formValues.customerId} />
                <CustomerSearchSelect
                  customers={customerList}
                  selectedCustomerId={formValues.customerId}
                  onSelectCustomer={(id, customer) => handleCustomerChange(id, customer)}
                  onCustomerCreated={handleCustomerCreated}
                  disabled={isPending}
                />
              </div>

              {/* Pilihan Unit Aset Pelanggan */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="assetId" className="flex items-center gap-1.5 text-xs font-medium text-[#475569]">
                    <Wrench className="h-3.5 w-3.5 text-primary" />
                    Unit Aset Pelanggan
                  </Label>
                  <AssetDialog
                    customerId={formValues.customerId}
                    customers={customerList}
                    onAssetCreated={handleAssetCreated}
                    trigger={
                      <button
                        type="button"
                        className="text-xs text-primary hover:underline font-medium flex items-center gap-1 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 rounded-sm"
                      >
                        <Plus className="h-3 w-3" />
                        Tambah Unit Aset Baru
                      </button>
                    }
                  />
                </div>
                <input type="hidden" name="assetId" value={formValues.assetId} />
                <Select
                  value={formValues.assetId || 'none'}
                  onValueChange={(val) => updateField('assetId', val === 'none' ? '' : val)}
                  disabled={!formValues.customerId}
                >
                  <SelectTrigger className="h-9 text-xs w-full">
                    <SelectValue
                      placeholder={
                        !formValues.customerId
                          ? 'Pilih pelanggan terlebih dahulu'
                          : availableAssets.length === 0
                          ? 'Belum ada unit aset terdaftar (Servis umum)'
                          : 'Pilih unit aset pelanggan'
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none" className="text-xs">Tanpa unit aset khusus (Servis umum)</SelectItem>
                    {availableAssets.map((a) => (
                      <SelectItem key={a.id} value={a.id} className="text-xs">
                        [{a.brand}] {a.assetName} {a.modelNumber ? `(${a.modelNumber})` : ''} {a.locationTag ? `- ${a.locationTag}` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {selectedAsset && (
                  <div className="rounded-md border bg-muted/30 p-2.5 text-xs text-muted-foreground grid grid-cols-2 sm:grid-cols-4 gap-2 mt-1">
                    <div>
                      <span className="text-[10px] text-muted-foreground uppercase font-semibold">Merk:</span>
                      <div className="text-foreground font-medium text-xs">{selectedAsset.brand}</div>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground uppercase font-semibold">Model:</span>
                      <div className="text-foreground font-medium font-mono text-xs">{selectedAsset.modelNumber || '-'}</div>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground uppercase font-semibold">Serial No:</span>
                      <div className="text-foreground font-medium font-mono text-xs">{selectedAsset.serialNumber || '-'}</div>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground uppercase font-semibold">Lokasi:</span>
                      <div className="text-foreground font-medium text-xs">{selectedAsset.locationTag || '-'}</div>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="serviceType" className="text-xs font-medium text-[#475569]">
                      Jenis Servis / Layanan *
                    </Label>
                    <Link
                      href="/admin/profile"
                      target="_blank"
                      className="text-[11px] text-[#007ACC] hover:underline"
                    >
                      Kelola Layanan
                    </Link>
                  </div>
                  <input type="hidden" name="serviceType" value={formValues.serviceType} />

                  <div className="space-y-1.5">
                    <Select
                      value={isCustomService ? '__custom__' : formValues.serviceType || undefined}
                      onValueChange={(val) => {
                        if (val === '__custom__') {
                          setIsCustomService(true)
                          updateField('serviceType', customServiceText)
                        } else {
                          setIsCustomService(false)
                          updateField('serviceType', val)
                        }
                      }}
                      disabled={isPending}
                    >
                      <SelectTrigger className="h-9 text-xs w-full bg-background">
                        <SelectValue placeholder="Pilih jenis layanan" />
                      </SelectTrigger>
                      <SelectContent>
                        {serviceList.length > 0 ? (
                          serviceList.map((srv) => (
                            <SelectItem key={srv.id} value={srv.name} className="text-xs">
                              <div className="flex items-center justify-between w-full gap-2">
                                <span>{srv.name}</span>
                                {srv.default_price && srv.default_price > 0 ? (
                                  <span className="text-[10px] text-muted-foreground">
                                    (Rp {Number(srv.default_price).toLocaleString('id-ID')})
                                  </span>
                                ) : null}
                              </div>
                            </SelectItem>
                          ))
                        ) : (
                          DEFAULT_SERVICE_OPTIONS.map((name) => (
                            <SelectItem key={name} value={name} className="text-xs">
                              {name}
                            </SelectItem>
                          ))
                        )}
                        <SelectItem value="__custom__" className="text-xs text-[#007ACC] font-medium border-t mt-1 pt-1">
                          + Ketik Layanan Lainnya...
                        </SelectItem>
                      </SelectContent>
                    </Select>

                    {isCustomService && (
                      <Input
                        type="text"
                        required
                        placeholder="Masukkan nama layanan"
                        value={customServiceText}
                        onChange={(e) => {
                          setCustomServiceText(e.target.value)
                          updateField('serviceType', e.target.value)
                        }}
                        className="h-8 text-xs bg-background"
                        autoFocus
                      />
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="priority" className="text-xs font-medium text-[#475569]">Prioritas *</Label>
                  <input type="hidden" name="priority" value={formValues.priority} />
                  <Select
                    value={formValues.priority}
                    onValueChange={(v) => updateField('priority', v as 'low' | 'medium' | 'high')}
                  >
                    <SelectTrigger className="h-9 text-xs w-full">
                      <SelectValue placeholder="Pilih tingkat prioritas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low" className="text-xs">Rendah (Low)</SelectItem>
                      <SelectItem value="medium" className="text-xs">Normal (Medium)</SelectItem>
                      <SelectItem value="high" className="text-xs">Mendesak (High)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="issue" className="text-xs font-medium text-[#475569]">Deskripsi Masalah / Keluhan *</Label>
                <Textarea
                  id="issue"
                  name="issue"
                  required
                  rows={3}
                  value={formValues.issue}
                  onChange={(e) => updateField('issue', e.target.value)}
                  placeholder="Masukkan deskripsi masalah atau keluhan pelanggan"
                  disabled={isPending}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="instructions" className="text-xs font-medium text-[#475569]">Instruksi Khusus untuk Teknisi (Opsional)</Label>
                <Textarea
                  id="instructions"
                  name="instructions"
                  rows={2}
                  value={formValues.instructions}
                  onChange={(e) => updateField('instructions', e.target.value)}
                  placeholder="Masukkan instruksi khusus atau catatan untuk teknisi"
                  disabled={isPending}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="address" className="text-xs font-medium text-[#475569]">Alamat Lokasi Pengerjaan *</Label>
                <Textarea
                  id="address"
                  name="address"
                  required
                  rows={2}
                  value={formValues.address}
                  onChange={(e) => updateField('address', e.target.value)}
                  placeholder="Masukkan alamat lengkap lokasi pengerjaan"
                  disabled={isPending}
                  className="text-xs"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right 1 Col: Scheduling & Assignment */}
        <div className="space-y-6">
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-primary" />
                  Penugasan Teknisi
                </CardTitle>
                {formValues.technicianIds.length > 0 && (
                  <Badge variant="secondary" className="text-[11px] font-semibold">
                    {formValues.technicianIds.length}/4 Teknisi
                  </Badge>
                )}
              </div>
              <CardDescription className="text-xs">
                Tugaskan 1 hingga maksimal 4 teknisi lapangan untuk tiket ini.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <input type="hidden" name="technicianId" value={formValues.technicianId} />
              <input type="hidden" name="technicianIds" value={JSON.stringify(formValues.technicianIds)} />

              {/* Technician Assignment Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium text-[#475569]">
                    Teknisi Bertugas (Maks. 4)
                  </Label>
                  <AssignTechniciansModal
                    technicians={technicians}
                    selectedIds={formValues.technicianIds}
                    onSelect={handleTechniciansChange}
                    maxTechnicians={4}
                    trigger={
                      <button
                        type="button"
                        className="text-xs text-primary hover:underline font-medium flex items-center gap-1 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 rounded-sm"
                      >
                        <Plus className="h-3 w-3" />
                        {formValues.technicianIds.length === 0 ? 'Pilih Teknisi' : 'Ubah Tim'}
                      </button>
                    }
                  />
                </div>

                {formValues.technicianIds.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/70 p-4 text-center space-y-2.5">
                    <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                      <UserPlus className="h-4 w-4" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-xs font-semibold text-slate-700">Belum Ada Teknisi Ditugaskan</p>
                      <p className="text-[11px] text-slate-500">
                        Tiket dapat dibuat tanpa teknisi (status Pending) atau pilih hingga 4 teknisi.
                      </p>
                    </div>
                    <AssignTechniciansModal
                      technicians={technicians}
                      selectedIds={formValues.technicianIds}
                      onSelect={handleTechniciansChange}
                      maxTechnicians={4}
                      trigger={
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-8 text-xs gap-1.5 font-medium border-slate-300 hover:border-primary hover:text-primary"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          Pilih Teknisi (Maks. 4)
                        </Button>
                      }
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="space-y-1.5">
                      {formValues.technicianIds.map((id, index) => {
                        const tech = technicians.find((t) => t.id === id)
                        const isLead = index === 0
                        return (
                          <div
                            key={id}
                            className="flex items-center justify-between p-2 rounded-xl border border-slate-200/80 bg-white hover:border-slate-300 transition-colors gap-2"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div
                                className={`h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                                  isLead
                                    ? 'bg-primary/10 text-primary border border-primary/25'
                                    : 'bg-slate-100 text-slate-600'
                                }`}
                              >
                                {tech?.name ? tech.name.substring(0, 2).toUpperCase() : 'TK'}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs font-semibold text-slate-900 truncate">
                                    {tech?.name || 'Teknisi'}
                                  </span>
                                  {isLead ? (
                                    <Badge className="h-4 px-1 text-[9px] font-semibold bg-primary/10 text-primary border-primary/20 hover:bg-primary/10 flex items-center gap-0.5">
                                      <Crown className="h-2.5 w-2.5 text-amber-500 fill-amber-500" />
                                      Lead
                                    </Badge>
                                  ) : (
                                    <Badge
                                      variant="outline"
                                      className="h-4 px-1 text-[9px] text-slate-500 border-slate-200"
                                    >
                                      Anggota #{index + 1}
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-[10.5px] text-slate-500 truncate mt-0.5">
                                  {tech?.phone || tech?.email || 'Teknisi Lapangan'}
                                </p>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                const newIds = formValues.technicianIds.filter((tId) => tId !== id)
                                handleTechniciansChange(newIds)
                              }}
                              className="h-6 w-6 rounded-md flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors shrink-0"
                              title="Hapus teknisi ini"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        )
                      })}
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-slate-500">
                        {formValues.technicianIds.length < 4
                          ? `Bisa tambah ${4 - formValues.technicianIds.length} teknisi lagi`
                          : 'Maksimal 4 teknisi tercapai'}
                      </span>

                      {formValues.technicianIds.length < 4 && (
                        <AssignTechniciansModal
                          technicians={technicians}
                          selectedIds={formValues.technicianIds}
                          onSelect={handleTechniciansChange}
                          maxTechnicians={4}
                          trigger={
                            <button
                              type="button"
                              className="text-[11px] font-medium text-primary hover:underline flex items-center gap-1"
                            >
                              + Tambah Teknisi
                            </button>
                          }
                        />
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Schedule Section appears if at least 1 technician is assigned */}
              {formValues.technicianIds.length > 0 && (
                <div className="pt-3 border-t space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                    <Calendar className="h-3.5 w-3.5 text-primary" />
                    <span>Jadwal Pengerjaan</span>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="scheduleDate" className="text-xs font-medium text-[#475569]">
                      Tanggal Pengerjaan *
                    </Label>
                    <Input
                      id="scheduleDate"
                      name="scheduleDate"
                      type="date"
                      value={formValues.scheduleDate}
                      onChange={(e) => updateField('scheduleDate', e.target.value)}
                      required={formValues.technicianIds.length > 0}
                      disabled={isPending}
                      className="h-9 text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="startTime" className="text-xs flex items-center gap-1 font-medium text-[#475569]">
                        <Clock className="h-3 w-3" /> Jam Mulai *
                      </Label>
                      <Input
                        id="startTime"
                        name="startTime"
                        type="time"
                        value={formValues.startTime}
                        onChange={(e) => updateField('startTime', e.target.value)}
                        required={formValues.technicianIds.length > 0}
                        disabled={isPending}
                        className="h-9 text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="endTime" className="text-xs flex items-center gap-1 font-medium text-[#475569]">
                        <Clock className="h-3 w-3" /> Jam Selesai *
                      </Label>
                      <Input
                        id="endTime"
                        name="endTime"
                        type="time"
                        value={formValues.endTime}
                        onChange={(e) => updateField('endTime', e.target.value)}
                        required={formValues.technicianIds.length > 0}
                        disabled={isPending}
                        className="h-9 text-xs"
                      />
                    </div>
                  </div>
                </div>
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
