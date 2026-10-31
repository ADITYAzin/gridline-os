'use client'

import { useState, useRef, useTransition, useEffect } from 'react'
import { submitSignatureAction } from '@/app/actions/execution'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { PenTool, CheckCircle2, Loader2, RotateCcw } from 'lucide-react'

interface SignaturePadModalProps {
  jobId: string
  existingSignature: {
    customer_name: string
    signed_at: string
    display_url?: string
  } | null
  disabled: boolean
}

export function SignaturePadModal({ jobId, existingSignature, disabled }: SignaturePadModalProps) {
  const [open, setOpen] = useState(false)
  const [customerName, setCustomerName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const canvasRectRef = useRef<DOMRect | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasDrawn, setHasDrawn] = useState(false)

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setHasDrawn(false)
  }

  // Auto-fit canvas to mobile container width on open & cache initial bounding rect
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        const canvas = canvasRef.current
        if (canvas) {
          const rect = canvas.getBoundingClientRect()
          if (rect.width > 0) {
            canvas.width = rect.width
            canvas.height = 180
            canvasRectRef.current = canvas.getBoundingClientRect()
          }
        }
      }, 60)
      return () => clearTimeout(timer)
    } else {
      canvasRectRef.current = null
    }
  }, [open])

  // Touch & Mouse Drawing Handlers (Optimized: No forced reflow / getBoundingClientRect thrashing)
  const startDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Cache the bounding rect once on touch/mouse start
    const rect = canvas.getBoundingClientRect()
    canvasRectRef.current = rect

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY

    ctx.beginPath()
    ctx.moveTo(clientX - rect.left, clientY - rect.top)
    ctx.strokeStyle = '#0f172a'
    ctx.lineWidth = 2.5
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    setIsDrawing(true)
    setHasDrawn(true)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Use cached rect to avoid forced synchronous layout recalculation on every touch frame
    const rect = canvasRectRef.current || canvas.getBoundingClientRect()
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY

    ctx.lineTo(clientX - rect.left, clientY - rect.top)
    ctx.stroke()
  }

  const stopDraw = () => {
    setIsDrawing(false)
  }

  const handleSave = () => {
    if (!customerName.trim()) {
      setError('Nama pelanggan wajib diisi.')
      return
    }
    if (!hasDrawn) {
      setError('Harap bubuhkan tanda tangan di atas kanvas.')
      return
    }

    const canvas = canvasRef.current
    if (!canvas) return
    const base64 = canvas.toDataURL('image/png')

    setError(null)
    startTransition(async () => {
      const res = await submitSignatureAction(jobId, customerName, base64)
      if (res.error) {
        setError(res.error)
      } else {
        setOpen(false)
      }
    })
  }

  return (
    <Card className="shadow-xs rounded-xl bg-white border-[#E2E8F0]">
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
            <PenTool className="h-4.5 w-4.5 text-[#007ACC]" /> Tanda Tangan Pelanggan
          </CardTitle>
          {existingSignature ? (
            <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Ditandatangani
            </span>
          ) : (
            <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full">
              Belum Ditandatangani
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        {existingSignature ? (
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2.5">
            {existingSignature.display_url && (
              <div className="w-full h-28 rounded-lg bg-white border p-2 flex items-center justify-center shadow-2xs">
                <img
                  src={existingSignature.display_url}
                  alt={`Tanda tangan ${existingSignature.customer_name}`}
                  className="h-full w-auto max-w-full object-contain filter contrast-125 select-none"
                />
              </div>
            )}
            <div className="space-y-0.5">
              <span className="text-[#64748B] block text-xs font-medium">Penandatangan:</span>
              <span className="font-bold text-sm text-[#0F172A] block">{existingSignature.customer_name}</span>
              <span className="text-xs text-[#64748B] block">
                Ditandatangani: {new Date(existingSignature.signed_at).toLocaleString('id-ID')}
              </span>
            </div>
          </div>
        ) : (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="w-full h-12 gap-2 font-bold text-sm rounded-lg border-[#007ACC]/50 text-[#007ACC] hover:bg-[#EBF5FC] active:bg-[#D0E8F8] touch-press cursor-pointer"
                disabled={disabled}
              >
                <PenTool className="h-4.5 w-4.5" /> Buka Kanvas Tanda Tangan
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md rounded-2xl p-5 space-y-3">
              <DialogHeader className="space-y-0.5">
                <DialogTitle className="font-heading text-base font-bold text-[#0F172A]">
                  Tanda Tangan Pelanggan
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-3.5 pt-1">
                {error && (
                  <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive font-bold">
                    {error}
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label htmlFor="custName" className="text-sm font-bold text-[#0F172A]">
                    Nama Pelanggan <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="custName"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Nama jelas yang menandatangani"
                    disabled={isPending}
                    className="h-11 text-sm rounded-lg font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-bold text-[#0F172A]">Kanvas Tanda Tangan</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={clearCanvas}
                      className="h-7 text-xs font-bold px-2 text-rose-600 hover:bg-rose-50 rounded-md cursor-pointer"
                    >
                      <RotateCcw className="h-3.5 w-3.5 mr-1" /> Bersihkan
                    </Button>
                  </div>
                  <div className="border-2 border-dashed border-slate-300 rounded-xl bg-white overflow-hidden touch-none flex items-center justify-center">
                    <canvas
                      ref={canvasRef}
                      width={340}
                      height={180}
                      onMouseDown={startDraw}
                      onMouseMove={draw}
                      onMouseUp={stopDraw}
                      onMouseLeave={stopDraw}
                      onTouchStart={startDraw}
                      onTouchMove={draw}
                      onTouchEnd={stopDraw}
                      style={{ touchAction: 'none' }}
                      className="cursor-crosshair w-full h-[180px] touch-none"
                    />
                  </div>
                </div>
              </div>

              <DialogFooter className="pt-2 flex flex-row gap-2.5 sm:justify-end">
                <Button
                  variant="outline"
                  onClick={() => setOpen(false)}
                  disabled={isPending}
                  className="flex-1 h-11 text-sm font-bold rounded-lg cursor-pointer"
                >
                  Batal
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isPending}
                  className="flex-1 h-11 text-sm font-bold bg-[#007ACC] hover:bg-[#0062A3] text-white rounded-lg shadow-xs cursor-pointer"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Menyimpan...
                    </>
                  ) : (
                    'Simpan'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
    </Card>
  )
}
