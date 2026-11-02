'use client'

import { useState, useMemo, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search, X, Check, Users, UserCheck, AlertCircle, Crown } from 'lucide-react'

export interface TechOption {
  id: string
  name: string
  phone?: string | null
  email?: string | null
}

interface AssignTechniciansModalProps {
  technicians: TechOption[]
  selectedIds: string[]
  onSelect: (selectedIds: string[]) => void
  maxTechnicians?: number
  trigger?: React.ReactNode
}

export function AssignTechniciansModal({
  technicians,
  selectedIds,
  onSelect,
  maxTechnicians = 4,
  trigger,
}: AssignTechniciansModalProps) {
  const [open, setOpen] = useState(false)
  const [tempSelected, setTempSelected] = useState<string[]>(selectedIds)
  const [searchQuery, setSearchQuery] = useState('')

  // Sync state whenever modal is opened
  useEffect(() => {
    if (open) {
      setTempSelected(selectedIds)
      setSearchQuery('')
    }
  }, [open, selectedIds])

  // Filter technicians based on search query
  const filteredTechnicians = useMemo(() => {
    if (!searchQuery.trim()) return technicians
    const q = searchQuery.toLowerCase().trim()
    return technicians.filter((t) => {
      const matchName = t.name.toLowerCase().includes(q)
      const matchPhone = (t.phone || '').toLowerCase().includes(q)
      const matchEmail = (t.email || '').toLowerCase().includes(q)
      return matchName || matchPhone || matchEmail
    })
  }, [technicians, searchQuery])

  const isMaxReached = tempSelected.length >= maxTechnicians

  const handleToggle = (id: string) => {
    if (tempSelected.includes(id)) {
      setTempSelected((prev) => prev.filter((item) => item !== id))
    } else {
      if (tempSelected.length >= maxTechnicians) return
      setTempSelected((prev) => [...prev, id])
    }
  }

  const handleSetLead = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    // Move this technician to the first position (Lead)
    setTempSelected((prev) => [id, ...prev.filter((item) => item !== id)])
  }

  const handleApply = () => {
    onSelect(tempSelected)
    setOpen(false)
  }

  const handleClear = () => {
    setTempSelected([])
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? (
        <DialogTrigger asChild>{trigger}</DialogTrigger>
      ) : (
        <DialogTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-9 text-xs gap-1.5 font-medium border-slate-200"
          >
            <Users className="h-3.5 w-3.5 text-primary" />
            <span>Pilih Teknisi</span>
            {selectedIds.length > 0 && (
              <Badge variant="secondary" className="h-4 px-1 text-[10px] ml-1">
                {selectedIds.length}
              </Badge>
            )}
          </Button>
        </DialogTrigger>
      )}

      <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden rounded-2xl">
        {/* Header */}
        <DialogHeader className="p-5 pb-3 border-b bg-slate-50/60">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Users className="h-4 w-4" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-slate-900">
                  Pilih Teknisi Bertugas
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500 mt-0.5">
                  Tugaskan 1 hingga maksimal {maxTechnicians} teknisi.
                </DialogDescription>
              </div>
            </div>

            <Badge
              variant={isMaxReached ? 'default' : 'secondary'}
              className={`text-xs font-semibold shrink-0 px-2 py-0.5 ${
                isMaxReached
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-slate-200/80 text-slate-700'
              }`}
            >
              {tempSelected.length} / {maxTechnicians} Dipilih
            </Badge>
          </div>
        </DialogHeader>

        {/* Search Bar */}
        <div className="p-3 border-b bg-white">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama atau telepon teknisi..."
              className="pl-8.5 pr-8 h-9 text-xs bg-slate-50/70 border-slate-200 rounded-lg focus-visible:bg-white"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 rounded transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Technician Selection List */}
        <div className="p-3 max-h-[300px] overflow-y-auto space-y-1.5 scrollbar-thin">
          {filteredTechnicians.length === 0 ? (
            <div className="text-center py-8 px-4 text-xs text-muted-foreground">
              {searchQuery ? (
                <span>Tidak ada teknisi dengan kata kunci &quot;{searchQuery}&quot;.</span>
              ) : (
                <span>Belum ada data teknisi terdaftar di organisasi ini.</span>
              )}
            </div>
          ) : (
            filteredTechnicians.map((t) => {
              const selectedIndex = tempSelected.indexOf(t.id)
              const isSelected = selectedIndex !== -1
              const isLead = selectedIndex === 0
              const disabled = !isSelected && isMaxReached

              return (
                <div
                  key={t.id}
                  onClick={() => !disabled && handleToggle(t.id)}
                  className={`group flex items-center justify-between p-2.5 rounded-xl border transition-all select-none ${
                    isSelected
                      ? 'border-primary/40 bg-primary/[0.04] shadow-2xs'
                      : disabled
                      ? 'border-slate-100 bg-slate-50/50 opacity-45 cursor-not-allowed'
                      : 'border-slate-200/80 bg-white hover:border-slate-300 hover:bg-slate-50/70 cursor-pointer'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {/* Avatar Initials */}
                    <div
                      className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                        isSelected
                          ? isLead
                            ? 'bg-primary text-primary-foreground shadow-2xs'
                            : 'bg-primary/20 text-primary'
                          : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'
                      }`}
                    >
                      {t.name.substring(0, 2).toUpperCase()}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-semibold text-slate-900 truncate">
                          {t.name}
                        </span>
                        {isSelected && (
                          <span
                            className={`inline-flex items-center gap-0.5 text-[9px] font-semibold px-1.5 py-0.2 rounded-full border ${
                              isLead
                                ? 'bg-primary/10 text-primary border-primary/25'
                                : 'bg-slate-100 text-slate-600 border-slate-200'
                            }`}
                          >
                            {isLead && <Crown className="h-2.5 w-2.5 text-amber-500 fill-amber-500" />}
                            {isLead ? 'Lead' : `Anggota #${selectedIndex + 1}`}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {t.phone || t.email || 'Teknisi Lapangan'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {isSelected && !isLead && (
                      <button
                        type="button"
                        onClick={(e) => handleSetLead(t.id, e)}
                        className="text-[10px] text-slate-500 hover:text-primary font-medium px-1.5 py-0.5 rounded border border-slate-200 hover:border-primary/40 bg-white transition-colors"
                        title="Jadikan sebagai Lead Teknisi"
                      >
                        Set Lead
                      </button>
                    )}

                    <div
                      className={`h-5 w-5 rounded-md flex items-center justify-center border transition-all ${
                        isSelected
                          ? 'bg-primary border-primary text-primary-foreground'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {isSelected && <Check className="h-3.5 w-3.5 stroke-[2.5]" />}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Selected Chips Strip (if any selected) */}
        {tempSelected.length > 0 && (
          <div className="px-3.5 py-2 border-t bg-slate-50/80 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
                Tim:
              </span>
              {tempSelected.map((id, idx) => {
                const tech = technicians.find((t) => t.id === id)
                const isLead = idx === 0
                return (
                  <span
                    key={id}
                    className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md border shrink-0 ${
                      isLead
                        ? 'bg-primary/10 text-primary border-primary/20 font-semibold'
                        : 'bg-white text-slate-700 border-slate-200'
                    }`}
                  >
                    <span className="truncate max-w-[90px]">{tech?.name || 'Teknisi'}</span>
                    <button
                      type="button"
                      onClick={() => handleToggle(id)}
                      className="text-slate-400 hover:text-slate-700 p-0.5 rounded"
                      title="Hapus"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )
              })}
            </div>

            <button
              type="button"
              onClick={handleClear}
              className="text-[11px] text-muted-foreground hover:text-destructive whitespace-nowrap font-medium"
            >
              Reset
            </button>
          </div>
        )}

        {/* Footer */}
        <DialogFooter className="p-3.5 border-t bg-white flex flex-row items-center justify-between sm:justify-between gap-2">
          <p className="text-[11px] text-slate-500">
            {tempSelected.length === 0
              ? 'Tanpa teknisi (status Pending)'
              : tempSelected.length === 1
              ? '1 teknisi ditugaskan'
              : `${tempSelected.length} teknisi dalam tim`}
          </p>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setOpen(false)}
              className="h-8 text-xs"
            >
              Batal
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleApply}
              className="h-8 text-xs font-semibold px-4"
            >
              {tempSelected.length > 0 ? `Terapkan (${tempSelected.length})` : 'Simpan Kosong'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
