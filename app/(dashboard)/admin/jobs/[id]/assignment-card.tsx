'use client'

import { useState, useTransition } from 'react'
import { assignJobAction } from '@/app/actions/jobs'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { UserCheck, Calendar, Clock, AlertTriangle, Check, Loader2 } from 'lucide-react'

interface TechOption {
  id: string
  name: string
}

interface AssignmentCardProps {
  jobId: string
  currentTechId: string | null
  currentSchedule: {
    start_at: string
    end_at: string
  } | null
  technicians: TechOption[]
  isLocked: boolean
}

export function AssignmentCard({
  jobId,
  currentTechId,
  currentSchedule,
  technicians,
  isLocked,
}: AssignmentCardProps) {
  const [techId, setTechId] = useState(currentTechId || '')
  const defaultDate = currentSchedule
    ? new Date(currentSchedule.start_at).toISOString().split('T')[0]
    : new Date().toISOString().split('T')[0]
  const defaultStart = currentSchedule
    ? new Date(currentSchedule.start_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false }).replace('.', ':')
    : '09:00'
  const defaultEnd = currentSchedule
    ? new Date(currentSchedule.end_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false }).replace('.', ':')
    : '11:00'

  const [date, setDate] = useState(defaultDate)
  const [start, setStart] = useState(defaultStart)
  const [end, setEnd] = useState(defaultEnd)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleSave = () => {
    if (!techId) {
      setError('Pilih teknisi terlebih dahulu.')
      return
    }
    setError(null)
    setSuccess(false)

    startTransition(async () => {
      const res = await assignJobAction(jobId, techId, date, start, end)
      if (res.error) {
        setError(res.error)
      } else {
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)
      }
    })
  }

  return (
    <Card className="shadow-xs">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <UserCheck className="h-4 w-4 text-primary" />
          Jadwal & Teknisi
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3.5 text-xs">
        {error && (
          <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-2.5 text-xs font-medium text-destructive flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-2.5 text-xs font-medium text-emerald-600 flex items-center gap-2">
            <Check className="h-4 w-4" />
            <span>Jadwal berhasil diperbarui.</span>
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="tech" className="text-xs font-medium">Teknisi</Label>
          <Select value={techId} onValueChange={setTechId} disabled={isLocked || isPending}>
            <SelectTrigger className="h-9 text-xs">
              <SelectValue placeholder="Pilih teknisi" />
            </SelectTrigger>
            <SelectContent>
              {technicians.map((t) => (
                <SelectItem key={t.id} value={t.id} className="text-xs">
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="date" className="text-xs font-medium flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" /> Tanggal
          </Label>
          <Input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            disabled={isLocked || isPending}
            className="h-9 text-xs"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1.5">
            <Label htmlFor="start" className="text-xs font-medium flex items-center gap-1">
              <Clock className="h-3 w-3" /> Mulai
            </Label>
            <Input
              id="start"
              type="time"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              disabled={isLocked || isPending}
              className="h-9 text-xs"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="end" className="text-xs font-medium flex items-center gap-1">
              <Clock className="h-3 w-3" /> Selesai
            </Label>
            <Input
              id="end"
              type="time"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              disabled={isLocked || isPending}
              className="h-9 text-xs"
            />
          </div>
        </div>
      </CardContent>
      {!isLocked && (
        <CardFooter className="pt-1">
          <Button onClick={handleSave} className="w-full text-xs h-9 font-medium cursor-pointer" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                Menyimpan...
              </>
            ) : (
              'Simpan Jadwal'
            )}
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}
