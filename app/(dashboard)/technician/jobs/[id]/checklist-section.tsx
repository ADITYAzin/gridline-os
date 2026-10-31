'use client'

import { useState, useTransition, useRef } from 'react'
import {
  toggleChecklistItemAction,
  markChecklistNaAction,
  resetChecklistItemAction,
  uploadJobPhotoAction,
  deleteJobPhotoAction,
} from '@/app/actions/execution'
import { compressImage } from '@/lib/image-compress'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  CheckCircle2,
  ListChecks,
  AlertTriangle,
  Camera,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Loader2,
  Info,
  RotateCcw,
  X,
} from 'lucide-react'
import { toast } from 'sonner'

export interface ChecklistItem {
  id: string
  item: string
  is_completed: boolean
  is_na?: boolean
  na_reason?: string | null
  sop_mode?: 'strict' | 'reference' | 'none'
  requires_photo?: boolean
  is_critical?: boolean
  hint?: string | null
}

export interface JobPhotoItem {
  id: string
  type: 'before' | 'after'
  file_url: string
  display_url?: string
  checklist_item_id?: string | null
  caption?: string | null
  created_at?: string
}

interface ChecklistSectionProps {
  items: ChecklistItem[]
  jobId?: string
  photos?: JobPhotoItem[]
  disabled: boolean
}

export function ChecklistSection({ items, jobId, photos = [], disabled }: ChecklistSectionProps) {
  const [checklist, setChecklist] = useState<ChecklistItem[]>(items)
  const [, startTransition] = useTransition()

  // 1-Tap Photo Upload State
  const [uploadingItemId, setUploadingItemId] = useState<string | null>(null)
  const [activeUploadTarget, setActiveUploadTarget] = useState<{ item: ChecklistItem; index: number } | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  // Lightbox Preview State
  const [previewPhoto, setPreviewPhoto] = useState<{ url: string; caption: string } | null>(null)

  // N/A Modal State
  const [naTargetItem, setNaTargetItem] = useState<ChecklistItem | null>(null)
  const [naReason, setNaReason] = useState('')
  const [isSubmittingNa, setIsSubmittingNa] = useState(false)

  // Reference mode collapse state
  const [isReferenceOpen, setIsReferenceOpen] = useState(true)

  if (items.length === 0) {
    return null
  }

  const sopMode = checklist[0]?.sop_mode || 'strict'
  const requiresPhotoCount = checklist.filter((i) => i.requires_photo).length

  // Trigger camera directly for specific checklist item
  const handleTriggerCamera = (e: React.MouseEvent, item: ChecklistItem, index: number) => {
    e.stopPropagation()
    if (disabled) return
    setActiveUploadTarget({ item, index })
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
      fileInputRef.current.click()
    }
  }

  // Handle photo captured from file input
  const handlePhotoCaptured = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawFile = e.target.files?.[0]
    if (!rawFile || !jobId || !activeUploadTarget) return

    const { item, index } = activeUploadTarget
    setUploadingItemId(item.id)

    try {
      // Compress image client-side to save mobile bandwidth & accelerate upload up to 15x
      const compressedFile = await compressImage(rawFile, 1200, 0.8)

      const formData = new FormData()
      formData.append('file', compressedFile)
      formData.append('checklistItemId', item.id)
      formData.append('caption', item.item)

      // First item or preparation steps default to 'before', others to 'after'
      const photoType: 'before' | 'after' = index === 0 ? 'before' : 'after'
      const res = await uploadJobPhotoAction(jobId, photoType, formData)

      if (res?.error) {
        toast.error(res.error)
      } else {
        toast.success(`Foto bukti tersimpan & langkah "${item.item}" otomatis selesai!`)
        // Optimistically update checklist state
        setChecklist((prev) =>
          prev.map((i) => (i.id === item.id ? { ...i, is_completed: true, is_na: false } : i))
        )
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Kesalahan jaringan'
      toast.error('Gagal mengunggah foto bukti: ' + msg)
    } finally {
      setUploadingItemId(null)
      setActiveUploadTarget(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  // Handle removing a photo attached to a checklist item
  const handleDeletePhoto = async (e: React.MouseEvent, photoId: string, itemId: string) => {
    e.stopPropagation()
    if (disabled || !jobId) return

    const confirmed = window.confirm('Hapus foto bukti ini? Langkah SOP akan kembali berstatus belum selesai.')
    if (!confirmed) return

    try {
      const res = await deleteJobPhotoAction(jobId, photoId)
      if (res?.error) {
        toast.error(res.error)
      } else {
        toast.success('Foto bukti dihapus.')
        setChecklist((prev) =>
          prev.map((i) => (i.id === itemId ? { ...i, is_completed: false } : i))
        )
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Kesalahan jaringan'
      toast.error('Gagal menghapus foto: ' + msg)
    }
  }

  // --- REFERENCE MODE ---
  if (sopMode === 'reference') {
    return (
      <Card className="shadow-xs rounded-[12px] border-amber-500/20 bg-amber-500/5">
        <CardHeader
          className="p-4 pb-2 cursor-pointer select-none"
          onClick={() => setIsReferenceOpen(!isReferenceOpen)}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-foreground">
              <ListChecks className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              Panduan Prosedur SOP (Referensi)
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30 font-normal">
                Non-Blocking · Panduan
              </Badge>
              {isReferenceOpen ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          </div>
          <CardDescription className="text-xs">
            Standar acuan pengerjaan dari perusahaan sebagai referensi teknisi di lapangan.
          </CardDescription>
        </CardHeader>

        {isReferenceOpen && (
          <CardContent className="p-4 pt-2 space-y-2.5">
            <ol className="space-y-2 text-xs">
              {checklist.map((item, idx) => (
                <li key={item.id} className="flex items-start gap-2.5 p-2 rounded-lg bg-background/60 border border-border/50">
                  <span className="font-mono text-muted-foreground font-semibold text-[11px] pt-0.5">
                    {idx + 1}.
                  </span>
                  <div className="space-y-0.5 flex-1">
                    <span className="font-medium text-foreground">{item.item}</span>
                    {item.hint && (
                      <p className="text-[11px] text-muted-foreground leading-relaxed flex items-center gap-1">
                        <Info className="h-3 w-3 text-amber-500 shrink-0" />
                        {item.hint}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ol>
            <p className="text-[11px] text-muted-foreground italic pt-1">
              * Mode referensi: Tidak membatasi penutupan tiket kerja.
            </p>
          </CardContent>
        )}
      </Card>
    )
  }

  // --- STRICT MODE ---
  const handleToggle = (item: ChecklistItem, idx: number) => {
    if (disabled) return
    const nextVal = !item.is_completed

    // If item requires photo and has no photo, trigger camera directly (Praktis!)
    if (nextVal && item.requires_photo) {
      const itemPhotos = photos.filter((p) => p.checklist_item_id === item.id)
      if (itemPhotos.length === 0) {
        handleTriggerCamera({ stopPropagation: () => {} } as React.MouseEvent, item, idx)
        return
      }
    }

    setChecklist((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, is_completed: nextVal, is_na: false, na_reason: null } : i)),
    )

    startTransition(async () => {
      const res = await toggleChecklistItemAction(item.id, nextVal)
      if (res.error) {
        toast.error(res.error)
        // Revert local state on error
        setChecklist((prev) =>
          prev.map((i) => (i.id === item.id ? { ...i, is_completed: item.is_completed } : i)),
        )
      }
    })
  }

  const handleOpenNaModal = (e: React.MouseEvent, item: ChecklistItem) => {
    e.stopPropagation()
    if (disabled) return
    if (item.is_critical) {
      toast.error('Item keselamatan kritis tidak dapat ditandai N/A.')
      return
    }
    setNaTargetItem(item)
    setNaReason(item.na_reason || '')
  }

  const handleConfirmNa = async () => {
    if (!naTargetItem) return
    if (!naReason.trim()) {
      toast.error('Alasan N/A wajib diisi.')
      return
    }

    setIsSubmittingNa(true)
    const res = await markChecklistNaAction(naTargetItem.id, naReason.trim())
    setIsSubmittingNa(false)

    if (res.error) {
      toast.error(res.error)
    } else {
      setChecklist((prev) =>
        prev.map((i) =>
          i.id === naTargetItem.id
            ? { ...i, is_na: true, na_reason: naReason.trim(), is_completed: false }
            : i,
        ),
      )
      toast.success('Item ditandai N/A')
      setNaTargetItem(null)
      setNaReason('')
    }
  }

  const handleResetItem = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    if (disabled) return

    setChecklist((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, is_na: false, na_reason: null, is_completed: false } : i,
      ),
    )

    const res = await resetChecklistItemAction(id)
    if (res.error) {
      toast.error(res.error)
    }
  }

  const completedCount = checklist.filter(
    (i) => i.is_completed || (i.is_na && !i.is_critical),
  ).length

  return (
    <>
      {/* Hidden File Input for Direct 1-Tap Camera Capture */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handlePhotoCaptured}
      />

      <Card className="shadow-xs rounded-xl bg-white border-[#E2E8F0]">
        <CardHeader className="p-4 pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
              <ListChecks className="h-4.5 w-4.5 text-[#007ACC]" /> Prosedur Kerja (SOP)
            </CardTitle>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-[#0F172A] border border-slate-200">
              {completedCount} / {checklist.length} Selesai
            </span>
          </div>
        </CardHeader>

        <CardContent className="p-4 pt-2">
          <ul className="space-y-2.5">
            {checklist.map((item, idx) => {
              const isDone = item.is_completed
              const isNa = item.is_na && !item.is_critical
              const isUploadingThis = uploadingItemId === item.id
              const itemPhotos = photos.filter((p) => p.checklist_item_id === item.id)

              return (
                <li
                  key={item.id}
                  onClick={() => !isNa && handleToggle(item, idx)}
                  className={`p-3.5 rounded-xl border text-sm select-none transition-all touch-press flex flex-col justify-between gap-2.5 ${
                    isDone
                      ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950 cursor-pointer'
                      : isNa
                      ? 'bg-slate-50 border-slate-200 text-slate-500'
                      : 'bg-white active:bg-slate-50 border-slate-200 hover:bg-slate-50/60 cursor-pointer'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Checkbox indicator (Enlarged for touch target & visibility) */}
                    <div
                      className={`h-6 w-6 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                        isDone
                          ? 'bg-emerald-600 border-emerald-600 text-white scale-105'
                          : isNa
                          ? 'bg-slate-100 border-slate-300 text-slate-500'
                          : item.requires_photo
                          ? 'border-[#007ACC] bg-[#007ACC]/10 text-[#007ACC] hover:scale-105'
                          : 'border-slate-300 bg-slate-50'
                      }`}
                    >
                      {isDone && <CheckCircle2 className="h-4 w-4" />}
                      {isNa && <span className="text-[10px] font-bold">N/A</span>}
                      {!isDone && !isNa && item.requires_photo && (
                        <Camera className="h-3.5 w-3.5 text-[#007ACC]" />
                      )}
                    </div>

                    {/* Item Description & Badges */}
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span
                          className={`font-semibold text-sm leading-snug ${
                            isDone ? 'line-through text-slate-400 font-normal' : isNa ? 'italic text-slate-500' : 'text-[#0F172A]'
                          }`}
                        >
                          {item.item}
                        </span>

                        {item.is_critical && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300 shrink-0">
                            <AlertTriangle className="h-3 w-3" />
                            Kritis K3
                          </span>
                        )}

                        {item.requires_photo && itemPhotos.length === 0 && !isUploadingThis && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold bg-[#007ACC]/15 text-[#007ACC] border border-[#007ACC]/30 shrink-0">
                            <Camera className="h-3 w-3" />
                            Wajib Foto
                          </span>
                        )}

                        {/* Inline Uploading Indicator */}
                        {isUploadingThis && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold bg-[#007ACC]/15 text-[#007ACC] animate-pulse shrink-0">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            Mengunggah...
                          </span>
                        )}

                        {/* Minimalist Inline Evidence Chip(s) */}
                        {itemPhotos.map((photo, pIdx) => (
                          <div
                            key={photo.id}
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 pl-0.5 pr-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-[10px] font-medium shrink-0"
                          >
                            {photo.display_url ? (
                              <button
                                type="button"
                                onClick={() => setPreviewPhoto({ url: photo.display_url!, caption: item.item })}
                                className="flex items-center gap-1 cursor-pointer group"
                                title="Klik untuk memperbesar foto bukti"
                              >
                                <img
                                  src={photo.display_url}
                                  alt="Bukti SOP"
                                  loading="lazy"
                                  decoding="async"
                                  className="h-4.5 w-4.5 rounded-full object-cover ring-1 ring-emerald-500/40 group-hover:scale-110 transition-transform"
                                />
                                <span className="underline-offset-2 group-hover:underline">
                                  {itemPhotos.length > 1 ? `Bukti #${pIdx + 1}` : 'Bukti Foto'}
                                </span>
                              </button>
                            ) : (
                              <span className="flex items-center gap-1">
                                <Camera className="h-3 w-3 text-emerald-600" />
                                {itemPhotos.length > 1 ? `Bukti #${pIdx + 1}` : 'Bukti Foto'}
                              </span>
                            )}

                            {!disabled && (
                              <button
                                type="button"
                                onClick={(e) => handleDeletePhoto(e, photo.id, item.id)}
                                className="text-muted-foreground/60 hover:text-destructive hover:bg-destructive/10 rounded-full p-0.5 transition-colors ml-0.5 cursor-pointer"
                                title="Hapus foto bukti"
                              >
                                <X className="h-2.5 w-2.5" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Technical Hint */}
                      {item.hint && (
                        <p className="text-xs text-[#475569] flex items-center gap-1.5 leading-snug">
                          <Info className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                          <span>{item.hint}</span>
                        </p>
                      )}

                      {/* N/A Reason label if marked */}
                      {isNa && (
                        <div className="flex items-center justify-between pt-0.5 text-xs text-[#334155] bg-slate-100 p-2 rounded-md">
                          <span className="truncate">Alasan N/A: {item.na_reason}</span>
                          {!disabled && (
                            <button
                              type="button"
                              onClick={(e) => handleResetItem(e, item.id)}
                              className="text-[#007ACC] hover:underline font-bold ml-2 shrink-0 flex items-center gap-1"
                            >
                              <RotateCcw className="h-3 w-3" /> Batalkan
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* N/A Action button (for non-critical, incomplete items) */}
                    {!disabled && !isDone && !isNa && !item.is_critical && (
                      <button
                        type="button"
                        onClick={(e) => handleOpenNaModal(e, item)}
                        className="text-xs font-bold px-2.5 py-1 rounded-md border border-slate-300 bg-white hover:bg-slate-50 text-[#475569] hover:text-[#0F172A] shrink-0 transition-colors cursor-pointer"
                      >
                        N/A
                      </button>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        </CardContent>
      </Card>

      {/* Lightbox Modal for Photo Preview */}
      <Dialog open={!!previewPhoto} onOpenChange={(open) => !open && setPreviewPhoto(null)}>
        <DialogContent className="sm:max-w-md p-4 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-sm font-semibold flex items-center gap-2">
              <Camera className="h-4 w-4 text-[#007ACC]" />
              Bukti Foto SOP
            </DialogTitle>
            <DialogDescription className="text-xs">
              {previewPhoto?.caption}
            </DialogDescription>
          </DialogHeader>
          {previewPhoto?.url && (
            <div className="relative aspect-4/3 w-full rounded-xl overflow-hidden bg-black/5 border border-border/60">
              <img
                src={previewPhoto.url}
                alt={previewPhoto.caption}
                className="w-full h-full object-contain"
              />
            </div>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setPreviewPhoto(null)}
              className="text-xs"
            >
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Tandai N/A */}
      <Dialog open={!!naTargetItem} onOpenChange={(open) => !open && setNaTargetItem(null)}>
        <DialogContent className="sm:max-w-md p-6 space-y-4 rounded-2xl">
          <DialogHeader className="space-y-1">
            <DialogTitle className="flex items-center gap-2 text-base font-semibold text-foreground">
              <HelpCircle className="h-4 w-4 text-amber-500" />
              Tandai Langkah N/A
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Gunakan jika prosedur ini tidak dapat dijalankan karena kendala di lokasi.
            </DialogDescription>
          </DialogHeader>

          {naTargetItem && (
            <div className="space-y-4 py-1 text-xs">
              <div className="p-3 rounded-xl bg-muted/40 border border-border/60 space-y-0.5">
                <span className="text-[11px] text-muted-foreground block">Langkah SOP:</span>
                <span className="font-semibold text-foreground text-xs leading-snug">{naTargetItem.item}</span>
              </div>

              <div className="space-y-2">
                <Label htmlFor="na-reason-input" className="text-xs font-medium text-foreground">
                  Alasan Kendala <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="na-reason-input"
                  value={naReason}
                  onChange={(e) => setNaReason(e.target.value)}
                  placeholder="Misal: Akses unit terhalang kanopi"
                  className="h-9 text-xs bg-background rounded-lg"
                  autoFocus
                />
              </div>

              {/* Quick Preset Reasons */}
              <div className="space-y-1.5">
                <span className="text-[11px] text-muted-foreground block font-medium">Pilihan Cepat:</span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'Akses unit terhalang / tidak aman',
                    'Komponen/part tidak tersedia',
                    'Permintaan khusus pelanggan',
                    'Unit tipe berbeda / fitur tidak ada',
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setNaReason(preset)}
                      className="text-[11px] px-2.5 py-1 rounded-lg border border-border/70 bg-muted/30 hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-2 pt-3 border-t border-border/50">
            <Button
              type="button"
              variant="outline"
              onClick={() => setNaTargetItem(null)}
              className="h-9 text-xs px-4 rounded-lg cursor-pointer"
            >
              Batal
            </Button>
            <Button
              type="button"
              disabled={isSubmittingNa || !naReason.trim()}
              onClick={handleConfirmNa}
              className="h-9 text-xs px-4 bg-[#007ACC] hover:bg-[#0062A3] text-white rounded-lg gap-2 cursor-pointer shadow-xs"
            >
              {isSubmittingNa ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                'Simpan Status N/A'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
