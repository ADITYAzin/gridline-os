'use client'

import { useState, useMemo } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { EditTechnicianDialog } from '@/components/team/edit-technician-dialog'
import { DeleteTechnicianDialog } from '@/components/team/delete-technician-dialog'
import { ResendInviteButton } from '@/components/team/resend-invite-button'
import { TechnicianPerformanceTab } from '@/components/team/technician-performance-tab'
import { TechnicianCommissionTab } from '@/components/team/technician-commission-tab'
import {
  type TechnicianPerformanceMetrics,
  type CommissionSettings,
} from '@/lib/commission'
import { type ServiceCommissionItem } from '@/components/team/commission-settings-dialog'
import {
  Mail,
  Phone,
  Clock,
  AlertCircle,
  Users,
  Trophy,
  Coins,
  Search,
  X,
} from 'lucide-react'
import { Input } from '@/components/ui/input'

export interface MemberItem {
  id: string
  name: string
  email: string
  role: 'admin' | 'technician' | 'owner'
  phone?: string | null
  created_at: string
}

export interface InviteItem {
  id: string
  email: string
  role: 'admin' | 'technician' | 'owner'
  expires_at: string
}

interface TechniciansViewProps {
  members: MemberItem[]
  invites: InviteItem[]
  metrics: TechnicianPerformanceMetrics[]
  commissionSettings: CommissionSettings
  activeServices: ServiceCommissionItem[]
  defaultTab?: string
}

export function TechniciansView({
  members,
  invites,
  metrics,
  commissionSettings,
  activeServices,
  defaultTab = 'members',
}: TechniciansViewProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState(defaultTab)

  // Filter members by search query
  const filteredMembers = useMemo(() => {
    if (!searchQuery.trim()) return members
    const q = searchQuery.toLowerCase().trim()
    return members.filter((m) => {
      const matchName = m.name.toLowerCase().includes(q)
      const matchEmail = m.email.toLowerCase().includes(q)
      const matchPhone = (m.phone || '').toLowerCase().includes(q)
      const matchRole = (m.role === 'technician' ? 'teknisi' : m.role).toLowerCase().includes(q)
      return matchName || matchEmail || matchPhone || matchRole
    })
  }, [members, searchQuery])

  // Filter pending invites by search query
  const filteredInvites = useMemo(() => {
    if (!searchQuery.trim()) return invites
    const q = searchQuery.toLowerCase().trim()
    return invites.filter((inv) => {
      const matchEmail = inv.email.toLowerCase().includes(q)
      const matchRole = (inv.role === 'technician' ? 'teknisi' : inv.role).toLowerCase().includes(q)
      return matchEmail || matchRole
    })
  }, [invites, searchQuery])

  // Filter metrics by search query for performance & commission tabs
  const filteredMetrics = useMemo(() => {
    if (!searchQuery.trim()) return metrics
    const q = searchQuery.toLowerCase().trim()
    return metrics.filter((m) => m.name.toLowerCase().includes(q))
  }, [metrics, searchQuery])

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
      {/* Unified Search & Tab Bar - Standardized placement across all 3 pages */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3">
        {/* Search Box on the LEFT - exact same width and styling */}
        <div className="relative w-full sm:w-80 md:w-96 shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama teknisi, email, telepon, peran..."
            className="pl-8.5 pr-8 h-9 text-xs bg-white rounded-lg border-slate-200"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 rounded transition-colors"
              title="Hapus pencarian"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* TabsList on the RIGHT */}
        <TabsList className="grid grid-cols-3 w-full sm:w-80 md:w-96 h-9 p-0.5 shrink-0">
          <TabsTrigger value="members" className="text-xs font-semibold gap-1.5">
            <Users className="h-3.5 w-3.5" />
            Tim & Akses
          </TabsTrigger>
          <TabsTrigger value="performance" className="text-xs font-semibold gap-1.5">
            <Trophy className="h-3.5 w-3.5" />
            Performa & SLA
          </TabsTrigger>
          <TabsTrigger value="commissions" className="text-xs font-semibold gap-1.5">
            <Coins className="h-3.5 w-3.5" />
            Rekap Komisi
          </TabsTrigger>
        </TabsList>
      </div>

      {/* Tab 1: Members & Invitations */}
      <TabsContent value="members" className="space-y-6 mt-0">
        {/* Pending Invitations Section */}
        {filteredInvites.length > 0 && (
          <Card className="border-amber-500/30 bg-amber-500/5 shadow-sm">
            <CardHeader className="py-3 px-5 border-b border-amber-500/20 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold flex items-center gap-2 text-amber-700 dark:text-amber-400">
                  <Clock className="h-4 w-4" />
                  Undangan Aktivasi Tertunda ({filteredInvites.length})
                </CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  Anggota yang telah diundang namun belum mengaktivasi akunnya.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-[#E2E8F0] bg-[#F8FAFC] hover:bg-[#F8FAFC]">
                      <TableHead className="h-11 px-4 text-[12px] font-semibold text-[#475569] uppercase tracking-[0.02em]">
                        Email Penerima
                      </TableHead>
                      <TableHead className="h-11 px-4 text-[12px] font-semibold text-[#475569] uppercase tracking-[0.02em]">
                        Peran Ditugaskan
                      </TableHead>
                      <TableHead className="h-11 px-4 text-[12px] font-semibold text-[#475569] uppercase tracking-[0.02em]">
                        Masa Aktif Token
                      </TableHead>
                      <TableHead className="h-11 px-4 text-[12px] font-semibold text-[#475569] uppercase tracking-[0.02em] text-center">
                        Aksi
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInvites.map((inv) => {
                      const isExpired = new Date(inv.expires_at) < new Date()
                      return (
                        <TableRow key={inv.id} className="border-b border-[#F1F5F9] hover:bg-[#F8FAFC] transition-colors group">
                          <TableCell className="px-4 py-2 align-middle font-medium text-xs">
                            <div className="flex items-center gap-1.5">
                              <Mail className="h-3.5 w-3.5 text-[#64748B]" />
                              <span>{inv.email}</span>
                            </div>
                          </TableCell>
                          <TableCell className="px-4 py-2 align-middle">
                            <Badge variant="outline" className="text-[11px]">
                              {inv.role === 'technician' ? 'Teknisi' : inv.role === 'admin' ? 'Admin' : 'Owner'}
                            </Badge>
                          </TableCell>
                          <TableCell className="px-4 py-2 align-middle">
                            {isExpired ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-destructive">
                                <AlertCircle className="h-3 w-3" /> Kedaluwarsa
                              </span>
                            ) : (
                              <span className="text-[11px] text-[#64748B]">
                                Berlaku s/d {new Date(inv.expires_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })},{' '}
                                {new Date(inv.expires_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="px-4 py-2 align-middle text-center">
                            <div className="flex items-center justify-center">
                              <ResendInviteButton inviteId={inv.id} email={inv.email} />
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Active Team Members List */}
        <Card className="shadow-sm">
          <CardHeader className="py-3 px-5 border-b flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold">
              Anggota Tim Aktif ({filteredMembers.length})
            </CardTitle>
          </CardHeader>
          {filteredMembers.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-400">
                <Users className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <p className="font-heading text-sm font-semibold text-slate-900">
                  Tidak ada anggota tim yang cocok
                </p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Tidak ditemukan anggota tim atau teknisi dengan kata kunci &quot;{searchQuery}&quot;.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setSearchQuery('')}
                className="text-xs h-8"
              >
                Reset Pencarian
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-b border-[#E2E8F0] bg-[#F8FAFC] hover:bg-[#F8FAFC]">
                  <TableHead className="h-11 px-4 text-[12px] font-semibold text-[#475569] uppercase tracking-[0.02em]">
                    Nama
                  </TableHead>
                  <TableHead className="h-11 px-4 text-[12px] font-semibold text-[#475569] uppercase tracking-[0.02em]">
                    Peran
                  </TableHead>
                  <TableHead className="h-11 px-4 text-[12px] font-semibold text-[#475569] uppercase tracking-[0.02em]">
                    Kontak
                  </TableHead>
                  <TableHead className="h-11 px-4 text-[12px] font-semibold text-[#475569] uppercase tracking-[0.02em] w-[140px]">
                    Bergabung
                  </TableHead>
                  <TableHead className="h-11 px-4 text-[12px] font-semibold text-[#475569] uppercase tracking-[0.02em] text-center w-[160px]">
                    Aksi
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMembers.map((m) => (
                  <TableRow key={m.id} className="border-b border-[#F1F5F9] hover:bg-[#F8FAFC] transition-colors group">
                    <TableCell className="px-4 py-2 align-middle">
                      <div className="font-semibold text-[13px] text-[#0F172A]">{m.name}</div>
                      <div className="text-xs text-[#64748B] flex items-center gap-1">
                        <Mail className="h-3 w-3" /> {m.email}
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-2 align-middle">
                      <Badge
                        variant={
                          m.role === 'admin'
                            ? 'default'
                            : m.role === 'owner'
                            ? 'secondary'
                            : 'outline'
                        }
                        className="text-xs font-semibold px-2.5 py-0.5"
                      >
                        {m.role === 'technician' ? 'Teknisi' : m.role === 'admin' ? 'Admin' : 'Owner'}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 py-2 align-middle">
                      <div className="text-xs text-[#64748B]">
                        {m.phone ? (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" /> {m.phone}
                          </span>
                        ) : (
                          '-'
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-2 align-middle text-xs text-[#64748B]">
                      {new Date(m.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </TableCell>
                    <TableCell className="px-4 py-2 align-middle text-center">
                      {m.role === 'technician' ? (
                        <div className="flex items-center justify-center gap-1.5">
                          <EditTechnicianDialog technician={m} />
                          <DeleteTechnicianDialog
                            technicianId={m.id}
                            technicianName={m.name}
                          />
                        </div>
                      ) : (
                        <span className="text-xs text-[#94A3B8]">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      </TabsContent>

      {/* Tab 2: Performance & SLA */}
      <TabsContent value="performance" className="mt-0">
        <TechnicianPerformanceTab metrics={filteredMetrics} />
      </TabsContent>

      {/* Tab 3: Commissions & Incentives */}
      <TabsContent value="commissions" className="mt-0">
        <TechnicianCommissionTab
          metrics={filteredMetrics}
          settings={commissionSettings}
          services={activeServices}
        />
      </TabsContent>
    </Tabs>
  )
}
