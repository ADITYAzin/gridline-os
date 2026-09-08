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
import { Plus, Edit2, Loader2, Wrench } from 'lucide-react'
import {
  createCustomerAssetAction,
  updateCustomerAssetAction,
  AssetActionState,
} from '@/app/actions/assets'
import type { Database } from '@/types/database.types'

type CustomerAsset = Database['public']['Tables']['customer_assets']['Row']

interface AssetDialogProps {
  customerId: string
  asset?: CustomerAsset
  trigger?: React.ReactNode
  onSuccess?: () => void
}

export function AssetDialog({ customerId, asset, trigger, onSuccess }: AssetDialogProps) {
  const [open, setOpen] = useState(false)
  const isEditing = Boolean(asset)

  const [createState, createAction, isCreating] = useActionState(
    createCustomerAssetAction,
    {} as AssetActionState
  )
  const [updateState, updateAction, isUpdating] = useActionState(
    updateCustomerAssetAction,
    {} as AssetActionState
  )

  const isPending = isCreating || isUpdating
  const state = isEditing ? updateState : createState

  useEffect(() => {
    if (state.success) {
      const timer = setTimeout(() => {
        setOpen(false)
        onSuccess?.()
      }, 0)
      return () => clearTimeout(timer)
    }
  }, [state.success, onSuccess])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ? (
          trigger
        ) : isEditing ? (
          <Button variant="outline" size="sm" className="h-8 gap-1 text-xs">
            <Edit2 className="h-3.5 w-3.5" />
            Edit
          </Button>
        ) : (
          <Button size="sm" className="gap-1.5 font-semibold text-xs">
            <Plus className="h-3.5 w-3.5" />
            Tambah Unit / Mesin
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wrench className="h-4 w-4 text-primary" />
            {isEditing ? 'Edit Informasi Unit / Mesin' : 'Registrasi Unit Mesin Baru'}
          </DialogTitle>
          <DialogDescription className="text-xs">
            {isEditing
              ? 'Perbarui spesifikasi atau status unit mesin pelanggan.'
              : 'Daftarkan unit peralatan pelanggan untuk pelacakan riwayat servis & garansi.'}
          </DialogDescription>
        </DialogHeader>

        <form action={isEditing ? updateAction : createAction} className="space-y-3.5 py-2 text-xs">
          <input type="hidden" name="customerId" value={customerId} />
          {isEditing && <input type="hidden" name="assetId" value={asset?.id} />}

          {state.error && (
            <div className="p-2.5 bg-destructive/10 text-destructive rounded-md text-xs font-medium">
              {state.error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5 col-span-2">
              <Label htmlFor="assetName">Nama / Tipe Peralatan *</Label>
              <Input
                id="assetName"
                name="assetName"
                placeholder="Contoh: AC Split Inverter 2 PK"
                defaultValue={asset?.asset_name || ''}
                required
                className="h-8 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="brand">Brand / Merk *</Label>
              <Input
                id="brand"
                name="brand"
                placeholder="Contoh: Daikin / Panasonic"
                defaultValue={asset?.brand || ''}
                required
                className="h-8 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="modelNumber">Nomor Model</Label>
              <Input
                id="modelNumber"
                name="modelNumber"
                placeholder="Contoh: FTKC50TVM4"
                defaultValue={asset?.model_number || ''}
                className="h-8 text-xs font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="serialNumber">Nomor Seri (S/N)</Label>
              <Input
                id="serialNumber"
                name="serialNumber"
                placeholder="Contoh: SN-88392193"
                defaultValue={asset?.serial_number || ''}
                className="h-8 text-xs font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="locationTag">Lokasi Ruangan / Lantai</Label>
              <Input
                id="locationTag"
                name="locationTag"
                placeholder="Contoh: Lt. 2 Ruang Rapat"
                defaultValue={asset?.location_tag || ''}
                className="h-8 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="installationDate">Tanggal Instalasi / Pembelian</Label>
              <Input
                id="installationDate"
                name="installationDate"
                type="date"
                defaultValue={asset?.installation_date || ''}
                className="h-8 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="warrantyExpiresAt">Masa Garansi Berakhir</Label>
              <Input
                id="warrantyExpiresAt"
                name="warrantyExpiresAt"
                type="date"
                defaultValue={asset?.warranty_expires_at || ''}
                className="h-8 text-xs"
              />
            </div>

            <div className="space-y-1.5 col-span-2">
              <Label htmlFor="status">Status Operasional Unit</Label>
              <Select name="status" defaultValue={asset?.status || 'operational'}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Pilih status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="operational">Operasional Normal</SelectItem>
                  <SelectItem value="needs_service">Perlu Servis / Maintenance</SelectItem>
                  <SelectItem value="broken">Rusak / Tidak Berfungsi</SelectItem>
                  <SelectItem value="decommissioned">Nonaktif / Decommissioned</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5 col-span-2">
              <Label htmlFor="notes">Catatan Tambahan (Opsional)</Label>
              <Textarea
                id="notes"
                name="notes"
                rows={2}
                placeholder="Keterangan kondisi unit, kapasitas pipa, freon type, dll."
                defaultValue={asset?.notes || ''}
                className="text-xs resize-none"
              />
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setOpen(false)}
              disabled={isPending}
              className="text-xs"
            >
              Batal
            </Button>
            <Button type="submit" size="sm" disabled={isPending} className="text-xs font-semibold">
              {isPending ? (
                <>
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  Menyimpan...
                </>
              ) : isEditing ? (
                'Simpan Perubahan'
              ) : (
                'Daftarkan Unit'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
