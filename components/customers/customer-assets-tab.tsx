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
    <Card className="rounded-[12px] border border-[#E2E8F0] bg-[#FFFFFF] shadow-[0_1px_3px_0_rgba(15,23,42,0.03),0_1px_2px_0_rgba(15,23,42,0.02)] overflow-hidden">
      <CardHeader className="pb-3 border-b border-[#F1F5F9]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Wrench className="h-4 w-4 text-primary" />
              Daftar Unit Mesin & Aset Pelanggan
            </CardTitle>
            <CardDescription className="text-xs mt-1">
              Kelola daftar mesin, spesifikasi pabrikan, nomor seri, dan status garansi untuk {customerName}.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs border-[#E2E8F0] text-[#475569]">
              {assets.length} Unit Terdaftar
            </Badge>
            <AssetDialog customerId={customerId} />
          </div>
        </div>
      </CardHeader>

      {assets.length === 0 ? (
        <div className="p-8 text-center">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-[8px] bg-primary/10 text-primary mb-4">
            <Wrench className="h-5 w-5" />
          </div>
          <p className="text-sm font-semibold text-foreground">Belum ada unit / mesin terdaftar</p>
          <p className="text-xs text-muted-foreground mt-2 max-w-sm mx-auto mb-6">
            Daftarkan unit pendingin, CCTV, atau kelistrikan milik customer ini untuk memudahkan pencatatan riwayat servis berkala.
          </p>
          <AssetDialog
            customerId={customerId}
            trigger={
              <Button size="sm" className="gap-2 font-medium text-xs rounded-[8px]">
                <Plus className="h-3.5 w-3.5" />
                Registrasi Unit Pertama
              </Button>
            }
          />
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow className="border-b border-[#E2E8F0] bg-[#F8FAFC] hover:bg-[#F8FAFC]">
              <TableHead className="h-11 px-4 text-[12px] font-semibold text-[#475569] uppercase tracking-[0.02em]">
                Nama Peralatan & Brand
              </TableHead>
              <TableHead className="h-11 px-4 text-[12px] font-semibold text-[#475569] uppercase tracking-[0.02em]">
                Model & Serial No.
              </TableHead>
              <TableHead className="h-11 px-4 text-[12px] font-semibold text-[#475569] uppercase tracking-[0.02em]">
                Lokasi
              </TableHead>
              <TableHead className="h-11 px-4 text-[12px] font-semibold text-[#475569] uppercase tracking-[0.02em]">
                Garansi
              </TableHead>
              <TableHead className="h-11 px-4 text-[12px] font-semibold text-[#475569] uppercase tracking-[0.02em]">
                Status
              </TableHead>
              <TableHead className="h-11 px-4 text-[12px] font-semibold text-[#475569] uppercase tracking-[0.02em] text-center">
                Aksi
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assets.map((asset) => (
              <TableRow key={asset.id} className="border-b border-[#F1F5F9] hover:bg-[#F8FAFC] transition-colors group">
                <TableCell className="px-4 py-2 align-middle">
                  <div className="font-medium text-xs text-[#0F172A]">{asset.asset_name}</div>
                  <div className="text-[11px] text-[#64748B]">
                    Merk: <span className="font-semibold text-[#0F172A]/80">{asset.brand}</span>
                  </div>
                  {asset.notes && (
                    <div className="text-[10px] text-[#94A3B8] line-clamp-1 italic mt-1">
                      {asset.notes}
                    </div>
                  )}
                </TableCell>
                <TableCell className="px-4 py-2 align-middle">
                  <div className="text-xs font-mono text-[#0F172A]">{asset.model_number || '-'}</div>
                  <div className="text-[11px] text-[#64748B] font-mono">
                    SN: {asset.serial_number || '-'}
                  </div>
                </TableCell>
                <TableCell className="px-4 py-2 align-middle text-xs">
                  {asset.location_tag ? (
                    <div className="flex items-center gap-2 text-[#64748B]">
                      <MapPin className="h-3.5 w-3.5 text-[#007ACC] shrink-0" />
                      <span>{asset.location_tag}</span>
                    </div>
                  ) : (
                    <span className="text-[#94A3B8]">-</span>
                  )}
                </TableCell>
                <TableCell className="px-4 py-2 align-middle text-xs">
                  {getWarrantyBadge(asset.warranty_expires_at)}
                </TableCell>
                <TableCell className="px-4 py-2 align-middle">{getStatusBadge(asset.status)}</TableCell>
                <TableCell className="px-4 py-2 align-middle text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Link
                      href={`/admin/jobs/new?customerId=${customerId}&assetId=${asset.id}`}
                      title="Servis Unit"
                      className="h-8 w-8 rounded-[8px] border border-[#E2E8F0] hover:bg-primary hover:text-white text-[#64748B] transition-colors flex items-center justify-center shrink-0"
                    >
                      <Wrench className="h-3.5 w-3.5" />
                    </Link>
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
