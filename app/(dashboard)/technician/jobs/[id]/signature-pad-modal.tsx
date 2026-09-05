'use client'

import { useState, useRef, useTransition } from 'react'
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
              <Button variant="outline" className="w-full gap-2 font-semibold text-xs" disabled={disabled}>
                <PenTool className="h-3.5 w-3.5" /> Buka Kanvas Tanda Tangan
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Tanda Tangan Digital Customer</DialogTitle>
                <DialogDescription className="text-xs">
                  Minta pelanggan untuk membubuhkan tanda tangan langsung di layar smartphone Anda.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3 pt-2">
                {error && (
                  <div className="rounded bg-destructive/10 border border-destructive/20 p-2 text-xs text-destructive">
                    {error}
                  </div>
                )}

                <div className="space-y-1">
                  <Label htmlFor="custName" className="text-xs">Nama Lengkap Pelanggan *</Label>
                  <Input
                    id="custName"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Nama jelas yang menandatangani"
                    disabled={isPending}
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Goreskan Tanda Tangan di Kotak Ini</Label>
                    <Button type="button" variant="ghost" size="sm" onClick={clearCanvas} className="h-6 text-[11px] px-2 gap-1 text-muted-foreground">
                      <RotateCcw className="h-3 w-3" /> Hapus
                    </Button>
                  </div>
                  <div className="border-2 border-dashed rounded-lg bg-white overflow-hidden touch-none flex items-center justify-center">
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

              <DialogFooter className="pt-2">
                <Button variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
                  Batal
                </Button>
                <Button onClick={handleSave} disabled={isPending}>
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
