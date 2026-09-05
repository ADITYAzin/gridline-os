'use client'

import { useState, useActionState } from 'react'
import Link from 'next/link'
import { createJobAction, type JobActionState } from '@/app/actions/jobs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Plus, AlertCircle, Calendar, Clock, UserCheck } from 'lucide-react'

interface CustomerOption {
  id: string
  name: string
  address: string
}

interface TechOption {
  id: string
  name: string
}

interface CreateJobFormProps {
  customers: CustomerOption[]
  technicians: TechOption[]
}

const initialState: JobActionState = {}

export function CreateJobForm({ customers, technicians }: CreateJobFormProps) {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('')
  const [address, setAddress] = useState<string>('')
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium')
  const [technicianId, setTechnicianId] = useState<string>('')

  const [state, formAction, isPending] = useActionState(createJobAction, initialState)

  const handleCustomerChange = (customerId: string) => {
    setSelectedCustomerId(customerId)
    const found = customers.find((c) => c.id === customerId)
    if (found) {
      setAddress(found.address)
    }
  }

  return (
    <form action={formAction}>
      <div className="grid gap-6 md:grid-cols-3">
        {/* Left 2 Cols: Main Work Order Details */}
        <div className="md:col-span-2 space-y-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Detail Pekerjaan (Work Order)</CardTitle>
              <CardDescription>
                Informasi utama kendala dan kebutuhan servis pelanggan.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {state.error && (
                <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3.5 flex items-start gap-2.5 text-sm font-medium text-destructive">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{state.error}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="customerId">Pilih Customer *</Label>
                  <Link href="/admin/customers" className="text-xs text-primary hover:underline font-medium">
                    + Customer Baru
                  </Link>
                </div>
                <input type="hidden" name="customerId" value={selectedCustomerId} />
                <Select value={selectedCustomerId} onValueChange={handleCustomerChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="-- Pilih Pelanggan --" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="serviceType">Jenis Servis / Layanan *</Label>
                  <Input
                    id="serviceType"
                    name="serviceType"
                    required
                    placeholder="Contoh: Servis AC, Pasang CCTV, Perbaikan Panel"
                    disabled={isPending}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="priority">Prioritas *</Label>
                  <input type="hidden" name="priority" value={priority} />
                  <Select value={priority} onValueChange={(v) => setPriority(v as 'low' | 'medium' | 'high')}>
                    <SelectTrigger>
                      <SelectValue placeholder="Prioritas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Rendah (Low)</SelectItem>
                      <SelectItem value="medium">Normal / Sedang (Medium)</SelectItem>
                      <SelectItem value="high">Mendesak (High / Urgent)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="issue">Deskripsi Masalah / Keluhan *</Label>
                <Textarea
                  id="issue"
                  name="issue"
                  required
                  rows={3}
                  placeholder="AC tidak dingin dan mengeluarkan air menetes di ruang server..."
                  disabled={isPending}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="instructions">Instruksi Khusus untuk Teknisi (Opsional)</Label>
                <Textarea
                  id="instructions"
                  name="instructions"
                  rows={2}
                  placeholder="Temui security di lobi utama untuk minta kunci tangga..."
                  disabled={isPending}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="address">Alamat Lokasi Pengerjaan *</Label>
                <Textarea
                  id="address"
                  name="address"
                  required
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Alamat detail lokasi..."
                  disabled={isPending}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right 1 Col: Scheduling & Assignment */}
        <div className="space-y-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-primary" />
                Penugasan & Jadwal (Opsional)
              </CardTitle>
              <CardDescription className="text-xs">
                Dapat ditentukan sekarang atau dibiarkan Pending untuk dijadwalkan nanti.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="space-y-1.5">
                <Label htmlFor="technicianId">Teknisi Bertugas</Label>
                <input type="hidden" name="technicianId" value={technicianId} />
                <Select value={technicianId} onValueChange={setTechnicianId}>
                  <SelectTrigger>
                    <SelectValue placeholder="-- Belum Ditugaskan --" />
                  </SelectTrigger>
                  <SelectContent>
                    {technicians.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {technicianId && (
                <>
                  <div className="space-y-1.5">
                    <Label htmlFor="scheduleDate" className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" /> Tanggal Pengerjaan
                    </Label>
                    <Input
                      id="scheduleDate"
                      name="scheduleDate"
                      type="date"
                      required={Boolean(technicianId)}
                      disabled={isPending}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="startTime" className="text-xs flex items-center gap-1">
                        <Clock className="h-3 w-3" /> Jam Mulai
                      </Label>
                      <Input
                        id="startTime"
                        name="startTime"
                        type="time"
                        defaultValue="09:00"
                        required={Boolean(technicianId)}
                        disabled={isPending}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="endTime" className="text-xs flex items-center gap-1">
                        <Clock className="h-3 w-3" /> Jam Selesai
                      </Label>
                      <Input
                        id="endTime"
                        name="endTime"
                        type="time"
                        defaultValue="11:00"
                        required={Boolean(technicianId)}
                        disabled={isPending}
                      />
                    </div>
                  </div>
                </>
              )}
            </CardContent>
            <CardFooter className="flex flex-col gap-2 pt-2">
              <Button type="submit" className="w-full font-semibold" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Menyimpan Job...
                  </>
                ) : (
                  <>
                    <Plus className="mr-1.5 h-4 w-4" />
                    Buat Job & Simpan
                  </>
                )}
              </Button>
              <Button asChild variant="ghost" size="sm" className="w-full">
                <Link href="/admin/jobs">Batal</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </form>
  )
}
