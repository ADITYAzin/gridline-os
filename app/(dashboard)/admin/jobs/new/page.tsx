import Link from 'next/link'
import { requireRole } from '@/lib/auth'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { CreateJobForm } from './create-job-form'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default async function NewJobPage() {
  const profile = await requireRole('admin')
  const supabase = await createSupabaseServerClient()

  // Fetch customers and technicians in parallel
  const [{ data: customers }, { data: techs }] = await Promise.all([
    supabase.from('customers').select('id, name, address').eq('org_id', profile.orgId).order('name'),
    supabase.from('profiles').select('id, name').eq('org_id', profile.orgId).eq('role', 'technician').order('name'),
  ])

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center gap-3">
        <Button asChild variant="outline" size="sm" className="h-8 w-8 p-0">
          <Link href="/admin/jobs">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Buat Job Baru</h1>
          <p className="text-xs text-muted-foreground">
            Nomor job unik berurutan (GL-XXXX) akan dibangkitkan otomatis untuk organisasi Anda.
          </p>
        </div>
      </div>

      <CreateJobForm
        customers={customers || []}
        technicians={techs || []}
      />
    </div>
  )
}
