'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Download, Loader2, ChevronDown, Check, FileText } from 'lucide-react'

export interface BapPrintButtonProps {
  jobId: string
  jobNumber: string
  checklistCount?: number
  photosCount?: number
}

export function BapPrintButton({
  jobId,
  jobNumber,
  checklistCount = 0,
  photosCount = 0,
}: BapPrintButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false)
  const [selectedFormat, setSelectedFormat] = useState<'auto' | 'f4' | 'a4'>('auto')

  // Automatic format recommendation logic
  // Documents with multiple photos or extensive checklists get F4 for optimal vertical space
  const isLongContent = checklistCount > 4 || photosCount >= 2
  const autoRecommendedFormat = isLongContent ? 'f4' : 'a4'
  const autoLabel = isLongContent ? 'F4 (Folio)' : 'A4'

  const activeFormatLabel =
    selectedFormat === 'auto'
      ? `Otomatis (${autoLabel})`
      : selectedFormat === 'f4'
      ? 'F4 (Folio)'
      : 'A4'

  const triggerDownload = (format: 'auto' | 'f4' | 'a4') => {
    setIsDownloading(true)
    const url = `/api/jobs/${jobId}/bap/pdf?format=${format}&download=1`

    // Create an invisible anchor to initiate native browser file download
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `BAP-${jobNumber}-${(format === 'auto' ? autoRecommendedFormat : format).toUpperCase()}.pdf`
    document.body.appendChild(anchor)
    anchor.click()
    document.body.removeChild(anchor)

    // Reset spinner after request initiation
    setTimeout(() => {
      setIsDownloading(false)
    }, 2800)
  }

  return (
    <div className="flex items-center shadow-xs rounded-lg overflow-hidden border border-primary/20 bg-primary">
      {/* Tombol Utama: Langsung Unduh PDF */}
      <Button
        onClick={() => triggerDownload(selectedFormat)}
        disabled={isDownloading}
        className="rounded-r-none border-r border-primary-foreground/20 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-3.5 text-xs sm:text-sm font-medium gap-2 cursor-pointer shadow-none"
      >
        {isDownloading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin shrink-0" />
            <span>Menyiapkan PDF...</span>
          </>
        ) : (
          <>
            <Download className="h-4 w-4 shrink-0" />
            <span>Unduh PDF Resmi</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/20 text-white font-semibold ml-0.5">
              {selectedFormat === 'auto' ? autoLabel : selectedFormat.toUpperCase()}
            </span>
          </>
        )}
      </Button>

      {/* Dropdown Menu: Opsi Pilihan Ukuran Kertas (A4 / F4 / Otomatis) */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            disabled={isDownloading}
            variant="default"
            size="icon"
            className="rounded-l-none bg-primary text-primary-foreground hover:bg-primary/90 h-9 w-8 p-0 cursor-pointer shadow-none"
            title="Pilih Ukuran Kertas PDF"
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 p-1 text-xs">
          <DropdownMenuLabel className="text-[11px] font-semibold text-muted-foreground px-2 py-1.5">
            Pilih Ukuran Kertas PDF
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          {/* Opsi Otomatis */}
          <DropdownMenuItem
            onClick={() => {
              setSelectedFormat('auto')
              triggerDownload('auto')
            }}
            className="flex items-center justify-between cursor-pointer py-2 px-2"
          >
            <div className="flex flex-col gap-0.5">
              <span className="font-semibold text-foreground flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-primary" />
                Otomatis (Rekomendasi)
              </span>
              <span className="text-[10.5px] text-muted-foreground">
                Cocok untuk konten ini: <strong className="text-foreground">{autoLabel}</strong>
              </span>
            </div>
            {selectedFormat === 'auto' && <Check className="h-4 w-4 text-primary shrink-0 ml-2" />}
          </DropdownMenuItem>

          {/* Opsi F4 / Folio */}
          <DropdownMenuItem
            onClick={() => {
              setSelectedFormat('f4')
              triggerDownload('f4')
            }}
            className="flex items-center justify-between cursor-pointer py-2 px-2"
          >
            <div className="flex flex-col gap-0.5">
              <span className="font-semibold text-foreground">F4 / Folio (215 × 330 mm)</span>
              <span className="text-[10.5px] text-muted-foreground">Standar resmi BAP Indonesia</span>
            </div>
            {selectedFormat === 'f4' && <Check className="h-4 w-4 text-primary shrink-0 ml-2" />}
          </DropdownMenuItem>

          {/* Opsi A4 */}
          <DropdownMenuItem
            onClick={() => {
              setSelectedFormat('a4')
              triggerDownload('a4')
            }}
            className="flex items-center justify-between cursor-pointer py-2 px-2"
          >
            <div className="flex flex-col gap-0.5">
              <span className="font-semibold text-foreground">A4 (210 × 297 mm)</span>
              <span className="text-[10.5px] text-muted-foreground">Standar umum perkantoran internasional</span>
            </div>
            {selectedFormat === 'a4' && <Check className="h-4 w-4 text-primary shrink-0 ml-2" />}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
