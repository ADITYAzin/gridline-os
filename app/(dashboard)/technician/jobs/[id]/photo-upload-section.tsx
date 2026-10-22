'use client'

import { useState, useTransition, useRef } from 'react'
import { uploadJobPhotoAction } from '@/app/actions/execution'
import { compressImage } from '@/lib/image-compress'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Camera, Image as ImageIcon, Loader2, Check } from 'lucide-react'

interface JobPhoto {
  id: string
  type: 'before' | 'after'
  file_url: string
  display_url?: string
  created_at: string
}

interface PhotoUploadSectionProps {
  jobId: string
  photos: JobPhoto[]
  disabled: boolean
}

export function PhotoUploadSection({ jobId, photos, disabled }: PhotoUploadSectionProps) {
  const [isPending, startTransition] = useTransition()
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [activeType, setActiveType] = useState<'before' | 'after'>('before')

  const isUploading = isPending || isProcessing
  const beforePhotos = photos.filter((p) => p.type === 'before')
  const afterPhotos = photos.filter((p) => p.type === 'after')

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawFile = e.target.files?.[0]
    if (!rawFile) return

    setError(null)
    setIsProcessing(true)

    try {
      const file = await compressImage(rawFile)
      const formData = new FormData()
      formData.append('file', file)

      startTransition(async () => {
        try {
          const res = await uploadJobPhotoAction(jobId, activeType, formData)
          if (res.error) {
            setError(res.error)
          }
        } finally {
          setIsProcessing(false)
        }
      })
    } catch {
      setIsProcessing(false)
      setError('Gagal memproses foto sebelum diunggah.')
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const triggerUpload = (type: 'before' | 'after') => {
    if (disabled || isUploading) return
    setActiveType(type)
    fileInputRef.current?.click()
  }

  return (
    <Card id="photo-evidence-section" className="shadow-xs rounded-[12px] bg-white border-[#E2E8F0] scroll-mt-14">
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xs text-[#475569] uppercase tracking-wider font-semibold flex items-center gap-2">
            <Camera className="h-4 w-4 text-[#007ACC]" /> Foto Bukti Pekerjaan
          </CardTitle>
          <span className="text-[11px] text-muted-foreground">Maks 10 foto</span>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-2 space-y-4">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          capture="environment"
          className="hidden"
          onChange={handleFileChange}
        />

        {error && (
          <div className="rounded bg-destructive/10 border border-destructive/20 p-2 text-xs text-destructive">
            {error}
          </div>
        )}

        {/* Before Photos Group */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold flex items-center gap-1.5">
              <span>Foto Sebelum Pengerjaan (Before)</span>
              {beforePhotos.length >= 1 ? (
                <Badge variant="default" className="bg-emerald-600 text-[10px] h-4 px-1 gap-0.5">
                  <Check className="h-2.5 w-2.5" /> Ada ({beforePhotos.length})
                </Badge>
              ) : (
                <Badge variant="destructive" className="text-[10px] h-4 px-1">Wajib (0)</Badge>
              )}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={disabled || isUploading || beforePhotos.length >= 10}
              onClick={() => triggerUpload('before')}
              className="h-9 text-xs font-semibold px-3 gap-1.5 rounded-[8px] border-[#007ACC]/40 text-[#007ACC] hover:bg-[#EBF5FC] active:bg-[#D0E8F8] touch-press cursor-pointer"
            >
              {isUploading && activeType === 'before' ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Camera className="h-3.5 w-3.5" />
              )}
              {isUploading && activeType === 'before' ? 'Mengunggah...' : 'Ambil Foto'}
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {beforePhotos.map((p, idx) => (
              <div key={p.id} className="aspect-square rounded-[8px] border border-[#E2E8F0] bg-muted/40 relative overflow-hidden group shadow-2xs">
                {p.display_url ? (
                  <img
                    src={p.display_url}
                    alt={`Before #${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="h-5 w-5 text-muted-foreground" />
                  </div>
                )}
                <span className="absolute bottom-1 right-1 text-[9px] font-mono bg-black/60 text-white px-1 rounded backdrop-blur-xs">#{idx + 1}</span>
              </div>
            ))}
            {isUploading && activeType === 'before' && (
              <div className="aspect-square rounded-[8px] border-2 border-dashed border-[#007ACC]/50 bg-[#EBF5FC]/60 flex flex-col items-center justify-center gap-1 animate-pulse">
                <Loader2 className="h-4 w-4 text-[#007ACC] animate-spin" />
                <span className="text-[10px] text-[#007ACC] font-medium">Proses...</span>
              </div>
            )}
          </div>
        </div>

        {/* After Photos Group */}
        <div className="space-y-2 pt-2 border-t border-[#E2E8F0]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold flex items-center gap-1.5">
              <span>Foto Sesudah Pengerjaan (After)</span>
              {afterPhotos.length >= 1 ? (
                <Badge variant="default" className="bg-emerald-600 text-[10px] h-4 px-1 gap-0.5">
                  <Check className="h-2.5 w-2.5" /> Ada ({afterPhotos.length})
                </Badge>
              ) : (
                <Badge variant="destructive" className="text-[10px] h-4 px-1">Wajib (0)</Badge>
              )}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={disabled || isUploading || afterPhotos.length >= 10}
              onClick={() => triggerUpload('after')}
              className="h-9 text-xs font-semibold px-3 gap-1.5 rounded-[8px] border-[#007ACC]/40 text-[#007ACC] hover:bg-[#EBF5FC] active:bg-[#D0E8F8] touch-press cursor-pointer"
            >
              {isUploading && activeType === 'after' ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Camera className="h-3.5 w-3.5" />
              )}
              {isUploading && activeType === 'after' ? 'Mengunggah...' : 'Ambil Foto'}
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {afterPhotos.map((p, idx) => (
              <div key={p.id} className="aspect-square rounded-[8px] border border-[#E2E8F0] bg-muted/40 relative overflow-hidden group shadow-2xs">
                {p.display_url ? (
                  <img
                    src={p.display_url}
                    alt={`After #${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="h-5 w-5 text-muted-foreground" />
                  </div>
                )}
                <span className="absolute bottom-1 right-1 text-[9px] font-mono bg-black/60 text-white px-1 rounded backdrop-blur-xs">#{idx + 1}</span>
              </div>
            ))}
            {isUploading && activeType === 'after' && (
              <div className="aspect-square rounded-[8px] border-2 border-dashed border-[#007ACC]/50 bg-[#EBF5FC]/60 flex flex-col items-center justify-center gap-1 animate-pulse">
                <Loader2 className="h-4 w-4 text-[#007ACC] animate-spin" />
                <span className="text-[10px] text-[#007ACC] font-medium">Proses...</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
