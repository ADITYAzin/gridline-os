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
  } | null
  disabled: boolean
}

export function SignaturePadModal({ jobId, existingSignature, disabled }: SignaturePadModalProps) {
  const [open, setOpen] = useState(false)
  const [customerName, setCustomerName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const canvasRef = useRef<HTMLCanvasElement>(null)
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

  // Auto-fit canvas to mobile container width on open
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        const canvas = canvasRef.current
        if (canvas) {
          const rect = canvas.getBoundingClientRect()
          if (rect.width > 0) {
            canvas.width = rect.width
            canvas.height = 180
          }
        }
      }, 60)
      return () => clearTimeout(timer)
    }
  }, [open])

  // Touch & Mouse Drawing Handlers
  const startDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY

    ctx.beginPath()
    ctx.moveTo(clientX - rect.left, clientY - rect.top)
    ctx.strokeStyle = '#0f172a'
    ctx.lineWidth = 2.5
    ctx.lineCap = 'round'
    setIsDrawing(true)
    setHasDrawn(true)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
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
    <Card className="shadow-sm">
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <PenTool className="h-4 w-4 text-primary" /> Tanda Tangan Pelanggan
          </CardTitle>
          {existingSignature ? (
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" /> Ditandatangani
            </span>
          ) : (
            <span className="text-[10px] font-bold text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded">
              Belum Ditandatangani
            </span>
          )}
        </div>
        <CardDescription className="text-xs">
          Konfirmasi penyelesaian pekerjaan oleh pemilik tempat / customer.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        {existingSignature ? (
          <div className="p-3 bg-muted/40 rounded-lg border text-xs space-y-1">
            <span className="text-muted-foreground block text-[11px]">Nama Penandatangan:</span>
            <span className="font-semibold text-sm text-foreground block">{existingSignature.customer_name}</span>
            <span className="text-[10px] text-muted-foreground block">
              Ditandatangani: {new Date(existingSignature.signed_at).toLocaleString('id-ID')}
            </span>
          </div>
        ) : (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="w-full h-11 gap-2 font-semibold text-xs rounded-[8px] border-[#007ACC]/40 text-[#007ACC] hover:bg-[#EBF5FC] active:bg-[#D0E8F8] touch-press"
                disabled={disabled}
              >
                <PenTool className="h-4 w-4" /> Buka Kanvas Tanda Tangan
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md rounded-[14px] p-5">
              <DialogHeader>
                <DialogTitle className="font-heading text-base font-bold text-[#0F172A]">Tanda Tangan Digital Customer</DialogTitle>
                <DialogDescription className="text-xs text-[#475569]">
                  Minta pelanggan untuk membubuhkan tanda tangan langsung di layar smartphone Anda.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3 pt-2">
                {error && (
                  <div className="rounded-[8px] bg-rose-50 border border-rose-200 p-2.5 text-xs text-rose-600 font-medium">
                    {error}
                  </div>
                )}

                <div className="space-y-1">
                  <Label htmlFor="custName" className="text-xs font-medium text-[#475569]">Nama Lengkap Pelanggan *</Label>
                  <Input
                    id="custName"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Nama jelas yang menandatangani"
                    disabled={isPending}
                    className="h-10 text-sm rounded-[8px] border-[#E2E8F0] focus-visible:ring-[#007ACC]"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-medium text-[#475569]">Goreskan Tanda Tangan di Kotak Ini</Label>
                    <Button type="button" variant="ghost" size="sm" onClick={clearCanvas} className="h-7 text-xs px-2 text-rose-600 hover:bg-rose-50 rounded-[6px] touch-press">
                      <RotateCcw className="h-3 w-3 mr-1" /> Hapus
                    </Button>
                  </div>
                  <div className="border-2 border-dashed border-[#CBD5E1] rounded-[10px] bg-white overflow-hidden touch-none flex items-center justify-center">
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
                      className="cursor-crosshair w-full h-[180px]"
                    />
                  </div>
                </div>
              </div>

              <DialogFooter className="pt-3 flex flex-row gap-2 sm:justify-end">
                <Button variant="outline" onClick={() => setOpen(false)} disabled={isPending} className="flex-1 h-11 text-xs font-semibold rounded-[8px] touch-press">
                  Batal
                </Button>
                <Button onClick={handleSave} disabled={isPending} className="flex-1 h-11 text-xs font-semibold bg-[#007ACC] hover:bg-[#0062A3] active:bg-[#004F82] text-white rounded-[8px] shadow-xs touch-press">
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Menyimpan...
                    </>
                  ) : (
                    'Simpan Tanda Tangan'
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
