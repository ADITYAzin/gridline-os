'use client'

import { useState, useTransition, useRef } from 'react'
import { uploadJobPhotoAction } from '@/app/actions/execution'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Camera, Image as ImageIcon, Loader2, Plus, Check } from 'lucide-react'

interface JobPhoto {
  id: string
  type: 'before' | 'after'
  file_url: string
  created_at: string
}

interface PhotoUploadSectionProps {
  jobId: string
  photos: JobPhoto[]
  disabled: boolean
}

export function PhotoUploadSection({ jobId, photos, disabled }: PhotoUploadSectionProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [activeType, setActiveType] = useState<'before' | 'after'>('before')

  const beforePhotos = photos.filter((p) => p.type === 'before')
  const afterPhotos = photos.filter((p) => p.type === 'after')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)
    const formData = new FormData()
    formData.append('file', file)

    startTransition(async () => {
      const res = await uploadJobPhotoAction(jobId, activeType, formData)
      if (res.error) {
        setError(res.error)
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    })
  }

  const triggerUpload = (type: 'before' | 'after') => {
    if (disabled) return
    setActiveType(type)
    fileInputRef.current?.click()
  }

  return (
    <Card className="shadow-sm">
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Camera className="h-4 w-4 text-primary" /> Foto Bukti Evidence
          </CardTitle>
          <span className="text-[11px] text-muted-foreground">Maks 10 per tipe</span>
        </div>
        <CardDescription className="text-xs">
          Wajib melampirkan minimal 1 foto Before dan 1 foto After.
        </CardDescription>
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
              disabled={disabled || isPending || beforePhotos.length >= 10}
              onClick={() => triggerUpload('before')}
              className="h-9 text-xs font-semibold px-3 gap-1.5 rounded-[8px] border-[#007ACC]/40 text-[#007ACC] hover:bg-[#EBF5FC] active:bg-[#D0E8F8] touch-press"
            >
              {isPending && activeType === 'before' ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Camera className="h-3.5 w-3.5" />
              )}
              Ambil Foto
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {beforePhotos.map((p, idx) => (
              <div key={p.id} className="aspect-square rounded-[8px] border border-[#E2E8F0] bg-muted/40 flex items-center justify-center relative overflow-hidden">
                <ImageIcon className="h-5 w-5 text-muted-foreground" />
                <span className="absolute bottom-1 right-1 text-[9px] font-mono bg-background/80 px-1 rounded">#{idx + 1}</span>
              </div>
            ))}
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
              disabled={disabled || isPending || afterPhotos.length >= 10}
              onClick={() => triggerUpload('after')}
              className="h-9 text-xs font-semibold px-3 gap-1.5 rounded-[8px] border-[#007ACC]/40 text-[#007ACC] hover:bg-[#EBF5FC] active:bg-[#D0E8F8] touch-press"
            >
              {isPending && activeType === 'after' ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Camera className="h-3.5 w-3.5" />
              )}
              Ambil Foto
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {afterPhotos.map((p, idx) => (
              <div key={p.id} className="aspect-square rounded border bg-muted/40 flex items-center justify-center relative overflow-hidden">
                <ImageIcon className="h-5 w-5 text-muted-foreground" />
                <span className="absolute bottom-1 right-1 text-[9px] font-mono bg-background/80 px-1 rounded">#{idx + 1}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
