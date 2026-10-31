'use client'

import { useState, useTransition, useRef } from 'react'
import { uploadJobPhotoAction, deleteJobPhotoAction } from '@/app/actions/execution'
import { compressImage } from '@/lib/image-compress'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Camera, Image as ImageIcon, Loader2, Check, X } from 'lucide-react'
import { toast } from 'sonner'

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
  const [deletingPhotoId, setDeletingPhotoId] = useState<string | null>(null)
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
          if (res?.error) {
            setError(res.error)
            toast.error(res.error)
          } else {
            toast.success(`Foto ${activeType === 'before' ? 'Before' : 'After'} berhasil diunggah.`)
          }
        } finally {
          setIsProcessing(false)
        }
      })
    } catch {
      setIsProcessing(false)
      setError('Gagal memproses foto sebelum diunggah.')
      toast.error('Gagal memproses foto sebelum diunggah.')
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleDeletePhoto = (photoId: string, photoType: 'before' | 'after') => {
    if (disabled || deletingPhotoId) return

    setDeletingPhotoId(photoId)
    startTransition(async () => {
      try {
        const res = await deleteJobPhotoAction(jobId, photoId)
        if (res?.error) {
          toast.error(res.error)
        } else {
          toast.success(`Foto ${photoType === 'before' ? 'Before' : 'After'} berhasil dihapus.`)
        }
      } catch {
        toast.error('Gagal menghapus foto. Silakan coba lagi.')
      } finally {
        setDeletingPhotoId(null)
      }
    })
  }

  const triggerUpload = (type: 'before' | 'after') => {
    if (disabled || isUploading) return
    setActiveType(type)
    fileInputRef.current?.click()
  }

  return (
    <Card id="photo-evidence-section" className="shadow-xs rounded-xl bg-white border-[#E2E8F0] scroll-mt-14">
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
            <Camera className="h-4.5 w-4.5 text-[#007ACC]" /> Foto Bukti Pekerjaan
          </CardTitle>
          <span className="text-xs text-[#64748B] font-medium">Maks 10 foto</span>
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
          <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-2.5 text-xs text-destructive font-medium">
            {error}
          </div>
        )}

        {/* Before Photos Group */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
              <span>Foto Sebelum (Before)</span>
              {beforePhotos.length >= 1 ? (
                <Badge variant="default" className="bg-emerald-600 text-xs font-bold h-5 px-1.5 gap-0.5">
                  <Check className="h-3 w-3" /> Ada ({beforePhotos.length})
                </Badge>
              ) : (
                <Badge variant="destructive" className="text-xs font-bold h-5 px-1.5">Wajib (0)</Badge>
              )}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={disabled || isUploading || beforePhotos.length >= 10}
              onClick={() => triggerUpload('before')}
              className="h-9.5 text-xs sm:text-sm font-bold px-3 gap-1.5 rounded-lg border-[#007ACC]/50 text-[#007ACC] hover:bg-[#EBF5FC] active:bg-[#D0E8F8] touch-press cursor-pointer"
            >
              {isUploading && activeType === 'before' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Camera className="h-4 w-4" />
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
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="h-5 w-5 text-muted-foreground" />
                  </div>
                )}

                {/* Nomor Urut Foto */}
                <span className="absolute bottom-1 right-1 text-[9px] font-mono bg-black/60 text-white px-1 rounded backdrop-blur-xs z-5">
                  #{idx + 1}
                </span>

                {/* Tombol Icon Silang Hapus Foto */}
                {!disabled && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeletePhoto(p.id, 'before')
                    }}
                    disabled={deletingPhotoId === p.id}
                    title="Hapus foto ini"
                    className="absolute top-1 right-1 h-6 w-6 rounded-full bg-rose-600/90 hover:bg-rose-700 text-white flex items-center justify-center shadow-md touch-press transition-all active:scale-95 z-10 cursor-pointer"
                  >
                    {deletingPhotoId === p.id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <X className="h-3.5 w-3.5" />
                    )}
                  </button>
                )}
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
        <div className="space-y-2.5 pt-2 border-t border-[#E2E8F0]">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
              <span>Foto Sesudah (After)</span>
              {afterPhotos.length >= 1 ? (
                <Badge variant="default" className="bg-emerald-600 text-xs font-bold h-5 px-1.5 gap-0.5">
                  <Check className="h-3 w-3" /> Ada ({afterPhotos.length})
                </Badge>
              ) : (
                <Badge variant="destructive" className="text-xs font-bold h-5 px-1.5">Wajib (0)</Badge>
              )}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={disabled || isUploading || afterPhotos.length >= 10}
              onClick={() => triggerUpload('after')}
              className="h-9.5 text-xs sm:text-sm font-bold px-3 gap-1.5 rounded-lg border-[#007ACC]/50 text-[#007ACC] hover:bg-[#EBF5FC] active:bg-[#D0E8F8] touch-press cursor-pointer"
            >
              {isUploading && activeType === 'after' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Camera className="h-4 w-4" />
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
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="h-5 w-5 text-muted-foreground" />
                  </div>
                )}

                {/* Nomor Urut Foto */}
                <span className="absolute bottom-1 right-1 text-[9px] font-mono bg-black/60 text-white px-1 rounded backdrop-blur-xs z-5">
                  #{idx + 1}
                </span>

                {/* Tombol Icon Silang Hapus Foto */}
                {!disabled && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeletePhoto(p.id, 'after')
                    }}
                    disabled={deletingPhotoId === p.id}
                    title="Hapus foto ini"
                    className="absolute top-1 right-1 h-6 w-6 rounded-full bg-rose-600/90 hover:bg-rose-700 text-white flex items-center justify-center shadow-md touch-press transition-all active:scale-95 z-10 cursor-pointer"
                  >
                    {deletingPhotoId === p.id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <X className="h-3.5 w-3.5" />
                    )}
                  </button>
                )}
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
