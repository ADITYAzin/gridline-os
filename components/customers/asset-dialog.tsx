'use client'

import { useState, useActionState, useEffect } from 'react'
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
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Edit2, Loader2, Wrench, Building2, AlertCircle } from 'lucide-react'
import {
  createCustomerAssetAction,
  updateCustomerAssetAction,
  AssetActionState,
  AssetOption,
} from '@/app/actions/assets'
import type { Database } from '@/types/database.types'

type CustomerAsset = Database['public']['Tables']['customer_assets']['Row']

export interface CustomerSelectOption {
  id: string
  name: string
  address?: string
  phone?: string | null
}

interface AssetDialogProps {
  customerId?: string
  customers?: CustomerSelectOption[]
  asset?: CustomerAsset
  trigger?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onSuccess?: () => void
  onAssetCreated?: (asset: AssetOption) => void
}

export function AssetDialog({
  customerId = '',
  customers,
  asset,
  trigger,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  onSuccess,
  onAssetCreated,
}: AssetDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : internalOpen

  const setOpen = (val: boolean) => {
    if (!isControlled) {
      setInternalOpen(val)
    }
    controlledOnOpenChange?.(val)
  }

  const [formKey, setFormKey] = useState(0)
  const [selectedCustomerId, setSelectedCustomerId] = useState(customerId || asset?.customer_id || '')
  const isEditing = Boolean(asset)

  useEffect(() => {
    if (customerId) {
      setSelectedCustomerId(customerId)
    } else if (asset?.customer_id) {
      setSelectedCustomerId(asset.customer_id)
    }
  }, [customerId, asset?.customer_id])

  const [createState, createAction, isCreating] = useActionState(
    async (prevState: AssetActionState, fd: FormData) => {
      const activeCustId = (fd.get('customerId') as string)?.trim() || selectedCustomerId
      if (!activeCustId) {
        return {
          error: 'Pelanggan wajib dipilih sebelum mendaftarkan unit aset.',
        }
      }
      fd.set('customerId', activeCustId)

      const res = await createCustomerAssetAction(prevState, fd)
      if (res.success) {
        setOpen(false)
        if (res.asset && onAssetCreated) {
          onAssetCreated(res.asset)
        }
        onSuccess?.()
      }
      return res
    },
    {} as AssetActionState
  )

  const [updateState, updateAction, isUpdating] = useActionState(
    async (prevState: AssetActionState, fd: FormData) => {
      const res = await updateCustomerAssetAction(prevState, fd)
      if (res.success) {
        setOpen(false)
        if (res.asset && onAssetCreated) {
          onAssetCreated(res.asset)
        }
        onSuccess?.()
      }
      return res
    },
    {} as AssetActionState
  )

  const isPending = isCreating || isUpdating
  const state = isEditing ? updateState : createState

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen)
    if (isOpen) {
      setFormKey((k) => k + 1)
      setSelectedCustomerId(customerId || asset?.customer_id || '')
    }
  }

  const activeCustomer = customers?.find((c) => c.id === selectedCustomerId)

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {trigger ? (
        <DialogTrigger asChild>{trigger}</DialogTrigger>
      ) : isEditing ? (
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 gap-1 text-xs rounded-[8px]">
            <Edit2 className="h-3.5 w-3.5" />
            Edit
          </Button>
        </DialogTrigger>
      ) : (
        <DialogTrigger asChild>
          <Button className="h-8 gap-1.5 font-semibold text-xs bg-[#007ACC] hover:bg-[#0062A3] rounded-[8px]">
            <Plus className="h-3.5 w-3.5" />
            Tambah Unit Aset Pelanggan
          </Button>
        </DialogTrigger>
      )}

      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto rounded-[12px] border border-[#E2E8F0] shadow-lg p-6">
        <DialogHeader className="space-y-1.5 pb-3 border-b border-[#F1F5F9]">
          <DialogTitle className="flex items-center gap-2 text-base font-semibold text-[#0F172A]">
            <div className="p-1.5 rounded-[6px] bg-[#007ACC]/10 text-[#007ACC]">
              <Wrench className="h-4 w-4" />
            </div>
            <span>{isEditing ? 'Edit Unit Aset Pelanggan' : 'Registrasi Unit Aset Pelanggan'}</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-[#64748B]">
            {isEditing
              ? 'Perbarui data spesifikasi, lokasi penempatan, atau status unit aset pelanggan.'
              : 'Daftarkan unit aset pelanggan baru untuk pelacakan riwayat pekerjaan, servis, dan garansi.'}
          </DialogDescription>
        </DialogHeader>

        <form
          key={formKey}
          action={isEditing ? updateAction : createAction}
          className="space-y-4 pt-3 text-xs"
        >
          {/* Customer Selection or Preview */}
          {isEditing ? (
            <input type="hidden" name="customerId" value={asset?.customer_id} />
          ) : customerId ? (
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-[#475569]">Pelanggan Pemilik Unit</Label>
              <div className="flex items-center justify-between p-2.5 rounded-[8px] border border-[#E2E8F0] bg-[#F8FAFC]">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#0F172A]">
                  <Building2 className="h-3.5 w-3.5 text-[#007ACC]" />
                  <span>{activeCustomer?.name || 'Pelanggan Terpilih'}</span>
                </div>
                {activeCustomer?.phone && (
                  <span className="text-[11px] font-mono text-[#64748B]">{activeCustomer.phone}</span>
                )}
              </div>
              <input type="hidden" name="customerId" value={customerId} />
            </div>
          ) : customers && customers.length > 0 ? (
            <div className="space-y-1.5">
              <Label htmlFor="customerIdSelect" className="text-xs font-medium text-[#475569]">
                Pilih Pelanggan Pemilik Unit <span className="text-[#EF4444]">*</span>
              </Label>
              <Select
                value={selectedCustomerId}
                onValueChange={setSelectedCustomerId}
                required
              >
                <SelectTrigger id="customerIdSelect" className="h-9 text-xs">
                  <SelectValue placeholder="-- Pilih Pelanggan --" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((c) => (
                    <SelectItem key={c.id} value={c.id} className="text-xs">
                      {c.name} {c.phone ? `(${c.phone})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <input type="hidden" name="customerId" value={selectedCustomerId} />
            </div>
          ) : (
            <div className="p-3 rounded-[8px] bg-amber-500/10 border border-amber-500/20 text-amber-700 text-xs flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>Harap pilih atau daftarkan pelanggan terlebih dahulu di formulir utama.</span>
            </div>
          )}

          {isEditing && <input type="hidden" name="assetId" value={asset?.id} />}

          {state.error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-[8px] text-xs font-medium flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{state.error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="assetName" className="text-xs font-medium text-[#475569]">
                Nama Unit Aset Pelanggan <span className="text-[#EF4444]">*</span>
              </Label>
              <Input
                id="assetName"
                name="assetName"
                placeholder="Contoh: AC Split Daikin 1.5 PK / CCTV Lobby / Mesin Espresso"
                defaultValue={asset?.asset_name || ''}
                required
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="brand" className="text-xs font-medium text-[#475569]">
                Brand / Merk <span className="text-[#EF4444]">*</span>
              </Label>
              <Input
                id="brand"
                name="brand"
                placeholder="Contoh: Daikin, Panasonic, Hikvision"
                defaultValue={asset?.brand || ''}
                required
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="modelNumber" className="text-xs font-medium text-[#475569]">
                Nomor Model
              </Label>
              <Input
                id="modelNumber"
                name="modelNumber"
                placeholder="Contoh: FTKC35TVM4"
                defaultValue={asset?.model_number || ''}
                className="h-9 text-xs font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="serialNumber" className="text-xs font-medium text-[#475569]">
                Nomor Seri (S/N)
              </Label>
              <Input
                id="serialNumber"
                name="serialNumber"
                placeholder="Contoh: SN-92817364"
                defaultValue={asset?.serial_number || ''}
                className="h-9 text-xs font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="locationTag" className="text-xs font-medium text-[#475569]">
                Lokasi Ruangan / Lantai
              </Label>
              <Input
                id="locationTag"
                name="locationTag"
                placeholder="Contoh: Lantai 2 - Ruang Rapat Direksi"
                defaultValue={asset?.location_tag || ''}
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="installationDate" className="text-xs font-medium text-[#475569]">
                Tanggal Instalasi / Pembelian
              </Label>
              <Input
                id="installationDate"
                name="installationDate"
                type="date"
                defaultValue={asset?.installation_date || ''}
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="warrantyExpiresAt" className="text-xs font-medium text-[#475569]">
                Masa Garansi Berakhir
              </Label>
              <Input
                id="warrantyExpiresAt"
                name="warrantyExpiresAt"
                type="date"
                defaultValue={asset?.warranty_expires_at || ''}
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="status" className="text-xs font-medium text-[#475569]">
                Status Operasional Aset
              </Label>
              <Select name="status" defaultValue={asset?.status || 'operational'}>
                <SelectTrigger id="status" className="h-9 text-xs">
                  <SelectValue placeholder="Pilih status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="operational" className="text-xs">Operasional Normal</SelectItem>
                  <SelectItem value="needs_service" className="text-xs">Perlu Servis / Maintenance</SelectItem>
                  <SelectItem value="broken" className="text-xs">Rusak / Tidak Berfungsi</SelectItem>
                  <SelectItem value="decommissioned" className="text-xs">Nonaktif / Decommissioned</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="notes" className="text-xs font-medium text-[#475569]">
                Catatan Tambahan (Opsional)
              </Label>
              <Textarea
                id="notes"
                name="notes"
                rows={2}
                placeholder="Catatan kondisi fisik, riwayat perbaikan sebelumnya, atau spesifikasi khusus unit..."
                defaultValue={asset?.notes || ''}
                className="text-xs resize-none"
              />
            </div>
          </div>

          <DialogFooter className="pt-3 border-t border-[#F1F5F9] gap-2 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
              className="h-9 text-xs rounded-[8px]"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isPending || (!selectedCustomerId && !isEditing)}
              className="h-9 text-xs font-semibold bg-[#007ACC] hover:bg-[#0062A3] rounded-[8px] text-white flex items-center gap-1.5"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : isEditing ? (
                'Simpan Perubahan'
              ) : (
                'Daftarkan Unit Aset'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
