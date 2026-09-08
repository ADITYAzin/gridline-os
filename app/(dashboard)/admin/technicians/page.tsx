import { requireRole } from '@/lib/auth'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { InviteMemberDialog } from './invite-member-dialog'
import { ResendInviteButton } from '@/components/team/resend-invite-button'
import { TechnicianPerformanceTab } from '@/components/team/technician-performance-tab'
import { TechnicianCommissionTab } from '@/components/team/technician-commission-tab'
import { calculateAllTechniciansMetrics } from '@/lib/commission'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Mail, Phone, Clock, AlertCircle, Users, Trophy, Coins } from 'lucide-react'

interface PageProps {
  searchParams: Promise<{ tab?: string }>
}

export default async function TechniciansPage({ searchParams }: PageProps) {
  const profile = await requireRole('admin')
  const { tab: activeTab = 'members' } = await searchParams
  const supabase = await createSupabaseServerClient()

  // Fetch team members, pending invites, and jobs concurrently
  const [{ data: members }, { data: pendingInvites }, { data: jobs }] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, name, email, phone, role, created_at')
      .eq('org_id', profile.orgId)
      .order('role', { ascending: true }),
    supabase
      .from('invite_tokens')
      .select('id, email, role, expires_at, created_at')
      .eq('org_id', profile.orgId)
      .is('consumed_at', null)
      .order('created_at', { ascending: false }),
    supabase
      .from('jobs')
      .select(`
        id,
        job_number,
        service_type,
        status,
        technician_id,
        created_at,
        completed_at,
        schedules(end_at),
        job_attendance(check_in_at)
      `)
      .eq('org_id', profile.orgId),
  ])

  const list = members || []
  const invites = pendingInvites || []
  const allJobs = jobs || []

  // Filter technicians and calculate performance & commission metrics
  const technicians = list.filter((m) => m.role === 'technician')
  const metrics = calculateAllTechniciansMetrics(technicians, allJobs)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-heading-1 font-heading text-slate-900 tracking-tight">Manajemen Tim & Performa</h1>
          <p className="text-body-reg text-slate-500 mt-1">
            Kelola pekerja lapangan, pantau ketepatan SLA kerja, dan evaluasi perhitungan komisi insentif.
          </p>
        </div>
        <InviteMemberDialog />
      </div>

      <Tabs defaultValue={activeTab} className="w-full space-y-6">
        <TabsList className="grid w-full grid-cols-3 max-w-md h-9">
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

        {/* Tab 1: Members & Invitations */}
        <TabsContent value="members" className="space-y-6">
          {/* Pending Invitations Section */}
          {invites.length > 0 && (
            <Card className="border-amber-500/30 bg-amber-500/5 shadow-sm">
              <CardHeader className="py-3 px-5 border-b border-amber-500/20 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-semibold flex items-center gap-2 text-amber-700 dark:text-amber-400">
                    <Clock className="h-4 w-4" />
                    Undangan Aktivasi Tertunda ({invites.length})
                  </CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    Anggota yang telah diundang namun belum mengaktivasi akunnya.
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="text-xs">Email Penerima</TableHead>
                      <TableHead className="text-xs">Peran Ditugaskan</TableHead>
                      <TableHead className="text-xs">Masa Aktif Token</TableHead>
                      <TableHead className="text-xs text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invites.map((inv) => {
                      const isExpired = new Date(inv.expires_at) < new Date()
                      return (
                        <TableRow key={inv.id}>
                          <TableCell className="font-medium text-xs">
                            <div className="flex items-center gap-1.5">
                              <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                              <span>{inv.email}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-[11px] capitalize">
                              {inv.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {isExpired ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-destructive">
                                <AlertCircle className="h-3 w-3" /> Kedaluwarsa
                              </span>
                            ) : (
                              <span className="text-[11px] text-muted-foreground">
                                Berlaku s/d {new Date(inv.expires_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })},{' '}
                                {new Date(inv.expires_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <ResendInviteButton inviteId={inv.id} email={inv.email} />
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Active Team Members List */}
          <Card className="shadow-sm">
            <CardHeader className="py-3 px-5 border-b">
              <CardTitle className="text-sm font-semibold">Anggota Tim Aktif ({list.length})</CardTitle>
            </CardHeader>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>Peran</TableHead>
                  <TableHead>Kontak</TableHead>
                  <TableHead className="w-[140px]">Bergabung</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell>
                      <div className="font-semibold">{m.name}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Mail className="h-3 w-3" /> {m.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          m.role === 'admin'
                            ? 'default'
                            : m.role === 'owner'
                            ? 'secondary'
                            : 'outline'
                        }
                        className="capitalize text-xs font-semibold px-2.5 py-0.5"
                      >
                        {m.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs text-muted-foreground">
                        {m.phone ? (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" /> {m.phone}
                          </span>
                        ) : (
                          '-'
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(m.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Tab 2: Performance & SLA */}
        <TabsContent value="performance">
          <TechnicianPerformanceTab metrics={metrics} />
        </TabsContent>

        {/* Tab 3: Commissions & Incentives */}
        <TabsContent value="commissions">
          <TechnicianCommissionTab metrics={metrics} />
        </TabsContent>
      </Tabs>
    </div>
  )
}


