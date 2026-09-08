'use client'

import Link from 'next/link'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { AssetDialog } from '@/components/customers/asset-dialog'
import {
  Wrench,
  ShieldCheck,
  ShieldAlert,
  MapPin,
  Plus,
} from 'lucide-react'
import type { Database } from '@/types/database.types'

type CustomerAsset = Database['public']['Tables']['customer_assets']['Row']

interface CustomerAssetsTabProps {
  customerId: string
  customerName: string
  assets: CustomerAsset[]
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'operational':
      return (
        <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-200 hover:bg-emerald-500/20 text-[11px]">
          Operasional
        </Badge>
      )
    case 'needs_service':
      return (
        <Badge className="bg-amber-500/10 text-amber-600 border-amber-200 hover:bg-amber-500/20 text-[11px]">
          Perlu Servis
        </Badge>
      )
    case 'broken':
      return (
        <Badge className="bg-rose-500/10 text-rose-600 border-rose-200 hover:bg-rose-500/20 text-[11px]">
          Rusak
        </Badge>
      )
    case 'decommissioned':
      return (
        <Badge variant="outline" className="text-muted-foreground text-[11px]">
          Nonaktif
        </Badge>
      )
    default:
      return (
        <Badge variant="secondary" className="text-[11px]">
          {status}
        </Badge>
      )
  }
}

function getWarrantyBadge(warrantyExpiresAt: string | null) {
  if (!warrantyExpiresAt) {
    return <span className="text-muted-foreground text-[11px]">-</span>
  }

  const now = new Date()
  const expDate = new Date(warrantyExpiresAt)
  const isExpired = expDate < now

  return isExpired ? (
    <div className="flex items-center gap-1 text-[11px] text-rose-600">
      <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
      <span>Habis ({expDate.toLocaleDateString('id-ID')})</span>
    </div>
  ) : (
    <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
      <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
      <span>Aktif ({expDate.toLocaleDateString('id-ID')})</span>
    </div>
  )
}

export function CustomerAssetsTab({
  customerId,
  customerName,
  assets,
}: CustomerAssetsTabProps) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Wrench className="h-4 w-4 text-primary" />
              Daftar Unit Mesin & Aset Pelanggan
            </CardTitle>
            <CardDescription className="text-xs mt-0.5">
              Kelola daftar mesin, spesifikasi pabrikan, nomor seri, dan status garansi untuk {customerName}.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {assets.length} Unit Terdaftar
            </Badge>
            <AssetDialog customerId={customerId} />
          </div>
        </div>
      </CardHeader>

      {assets.length === 0 ? (
        <div className="p-8 text-center border-t border-dashed">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary mb-3">
            <Wrench className="h-5 w-5" />
          </div>
          <p className="text-sm font-semibold text-foreground">Belum ada unit / mesin terdaftar</p>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto mb-4">
            Daftarkan unit pendingin, CCTV, atau kelistrikan milik customer ini untuk memudahkan pencatatan riwayat servis berkala.
          </p>
          <AssetDialog
            customerId={customerId}
            trigger={
              <Button size="sm" className="gap-1.5 font-semibold text-xs">
                <Plus className="h-3.5 w-3.5" />
                Registrasi Unit Pertama
              </Button>
            }
          />
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama Peralatan & Brand</TableHead>
              <TableHead>Model & Serial No.</TableHead>
              <TableHead>Lokasi</TableHead>
              <TableHead>Garansi</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assets.map((asset) => (
              <TableRow key={asset.id}>
                <TableCell>
                  <div className="font-medium text-xs text-foreground">{asset.asset_name}</div>
                  <div className="text-[11px] text-muted-foreground">
                    Merk: <span className="font-semibold text-foreground/80">{asset.brand}</span>
                  </div>
                  {asset.notes && (
                    <div className="text-[10px] text-muted-foreground line-clamp-1 italic mt-0.5">
                      {asset.notes}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <div className="text-xs font-mono">{asset.model_number || '-'}</div>
                  <div className="text-[11px] text-muted-foreground font-mono">
                    SN: {asset.serial_number || '-'}
                  </div>
                </TableCell>
                <TableCell className="text-xs">
                  {asset.location_tag ? (
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <MapPin className="h-3 w-3 text-primary shrink-0" />
                      <span>{asset.location_tag}</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell className="text-xs">
                  {getWarrantyBadge(asset.warranty_expires_at)}
                </TableCell>
                <TableCell>{getStatusBadge(asset.status)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <Button asChild size="sm" variant="outline" className="h-7 px-2 text-[11px] gap-1">
                      <Link href={`/admin/jobs/new?customerId=${customerId}&assetId=${asset.id}`}>
                        <Wrench className="h-3 w-3 text-primary" />
                        Servis
                      </Link>
                    </Button>
                    <AssetDialog customerId={customerId} asset={asset} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Card>
  )
}
