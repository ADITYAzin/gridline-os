import { requireRole } from '@/lib/auth'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { User } from 'lucide-react'

export default async function OwnerJobsPage() {
  const profile = await requireRole('owner')
  const supabase = await createSupabaseServerClient()

  const { data: jobs } = await supabase
    .from('jobs')
    .select(`
      id,
      job_number,
      service_type,
      issue,
      priority,
      status,
      address,
      created_at,
      completed_at,
      customers(name),
      profiles!jobs_technician_id_fkey(name)
    `)
    .eq('org_id', profile.orgId)
    .order('created_at', { ascending: false })

  const list = jobs || []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Monitoring Jobs (Owner View)</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Pantauan status seluruh pekerjaan teknisi di lapangan secara real-time.
        </p>
      </div>

      <Card className="shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[110px]">No. Job</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Layanan</TableHead>
              <TableHead>Teknisi</TableHead>
              <TableHead>Prioritas</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Tanggal</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.map((j) => {
              const customer = j.customers as unknown as { name: string } | null
              const technician = j.profiles as unknown as { name: string } | null

              return (
                <TableRow key={j.id}>
                  <TableCell className="font-mono font-bold text-xs text-primary">{j.job_number}</TableCell>
                  <TableCell>
                    <span className="font-semibold text-sm">
                      {Array.isArray(customer) ? customer[0]?.name : customer?.name}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-medium">{j.service_type}</span>
                  </TableCell>
                  <TableCell>
                    {technician?.name || Array.isArray(technician) && technician[0]?.name ? (
                      <span className="text-xs font-medium flex items-center gap-1">
                        <User className="h-3 w-3 text-muted-foreground" />
                        {Array.isArray(technician) ? technician[0]?.name : technician.name}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">Belum ada</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize text-[10px]">
                      {j.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={j.status === 'completed' ? 'default' : 'secondary'}
                      className="capitalize text-[10px]"
                    >
                      {j.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-xs text-muted-foreground">
                    {new Date(j.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
