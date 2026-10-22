'use client'

import { useState, useTransition } from 'react'
import { toggleChecklistItemAction, markChecklistNaAction, resetChecklistItemAction } from '@/app/actions/execution'
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

interface ChecklistSectionProps {
  items: ChecklistItem[]
  disabled: boolean
}

export function ChecklistSection({ items, disabled }: ChecklistSectionProps) {
  const [checklist, setChecklist] = useState<ChecklistItem[]>(items)
  const [, startTransition] = useTransition()

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

  // --- REFERENCE MODE ---
  if (sopMode === 'reference') {
    return (
      <Card className="shadow-sm border-amber-500/20 bg-amber-500/5">
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
                <li
                  key={item.id}
                  className="p-2.5 rounded-lg border border-border/70 bg-card/60 flex items-start gap-2.5"
                >
                  <span className="h-5 w-5 rounded bg-muted text-muted-foreground font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <div className="space-y-0.5 flex-1 min-w-0">
                    <p className="font-medium text-foreground leading-snug">{item.item}</p>
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
  const handleToggle = (id: string, currentVal: boolean) => {
    if (disabled) return
    const nextVal = !currentVal

    setChecklist((prev) =>
      prev.map((i) => (i.id === id ? { ...i, is_completed: nextVal, is_na: false, na_reason: null } : i)),
    )

    startTransition(async () => {
      const res = await toggleChecklistItemAction(id, nextVal)
      if (res.error) {
        toast.error(res.error)
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
      <Card className="shadow-xs rounded-[12px] bg-white border-[#E2E8F0]">
        <CardHeader className="p-4 pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xs text-[#475569] uppercase tracking-wider font-semibold flex items-center gap-2">
              <ListChecks className="h-4 w-4 text-[#007ACC]" /> Prosedur Kerja (SOP)
            </CardTitle>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-muted">
              {completedCount} / {checklist.length} Selesai
            </span>
          </div>
        </CardHeader>

        <CardContent className="p-4 pt-2">
          <ul className="space-y-2">
            {checklist.map((item) => {
              const isDone = item.is_completed
              const isNa = item.is_na && !item.is_critical

              return (
                <li
                  key={item.id}
                  onClick={() => !isNa && handleToggle(item.id, item.is_completed)}
                  className={`p-3 rounded-[8px] border text-xs select-none transition-all touch-press min-h-[48px] flex flex-col justify-between gap-1.5 ${
                    isDone
                      ? 'bg-emerald-500/5 border-emerald-500/30 text-emerald-950 dark:text-emerald-200 cursor-pointer'
                      : isNa
                      ? 'bg-muted/50 border-border/80 text-muted-foreground'
                      : 'bg-card active:bg-muted/40 border-border/60 hover:bg-muted/30 cursor-pointer'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Checkbox indicator */}
                    <div
                      className={`h-5 w-5 rounded-[6px] border flex items-center justify-center shrink-0 mt-0.5 transition-transform ${
                        isDone
                          ? 'bg-emerald-500 border-emerald-500 text-white scale-105'
                          : isNa
                          ? 'bg-muted border-muted-foreground/30 text-muted-foreground'
                          : 'border-muted-foreground/40 bg-muted/20'
                      }`}
                    >
                      {isDone && <CheckCircle2 className="h-3.5 w-3.5" />}
                      {isNa && <span className="text-[9px] font-bold">N/A</span>}
                    </div>

                    {/* Item Description & Badges */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span
                          className={`font-medium leading-snug ${
                            isDone ? 'line-through text-muted-foreground' : isNa ? 'italic' : 'text-foreground'
                          }`}
                        >
                          {item.item}
                        </span>

                        {item.is_critical && (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[10px] font-semibold bg-rose-500/10 text-rose-600 border border-rose-500/20">
                            <AlertTriangle className="h-2.5 w-2.5" />
                            Kritis K3
                          </span>
                        )}

                        {item.requires_photo && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              const el = document.getElementById('photo-evidence-section')
                              if (el) {
                                el.scrollIntoView({ behavior: 'smooth' })
                              }
                            }}
                            className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[10px] font-semibold bg-[#007ACC]/10 text-[#007ACC] hover:bg-[#007ACC]/20 border border-[#007ACC]/20 cursor-pointer transition-colors"
                          >
                            <Camera className="h-2.5 w-2.5" />
                            Foto Bukti
                          </button>
                        )}
                      </div>

                      {/* Technical Hint */}
                      {item.hint && (
                        <p className="text-[11px] text-muted-foreground/90 flex items-center gap-1 leading-tight">
                          <Info className="h-3 w-3 text-amber-500 shrink-0" />
                          <span>{item.hint}</span>
                        </p>
                      )}

                      {/* N/A Reason label if marked */}
                      {isNa && (
                        <div className="flex items-center justify-between pt-0.5 text-[11px] text-muted-foreground bg-muted/70 px-2 py-1 rounded">
                          <span className="truncate">Alasan N/A: {item.na_reason}</span>
                          {!disabled && (
                            <button
                              type="button"
                              onClick={(e) => handleResetItem(e, item.id)}
                              className="text-[#007ACC] hover:underline font-medium ml-2 shrink-0 flex items-center gap-0.5"
                            >
                              <RotateCcw className="h-2.5 w-2.5" /> Batalkan
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
                        className="text-[10px] font-medium px-2 py-1 rounded border border-border/80 bg-background hover:bg-muted text-muted-foreground hover:text-foreground shrink-0 transition-colors"
                      >
                        Tandai N/A
                      </button>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        </CardContent>
      </Card>

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
