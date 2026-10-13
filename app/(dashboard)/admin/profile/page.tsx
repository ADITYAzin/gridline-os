import { requireRole } from '@/lib/auth'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { AdminProfileClient } from './admin-profile-client'

export default async function AdminProfilePage() {
  const profile = await requireRole('admin')
  const supabase = await createSupabaseServerClient()

  const { data: org } = await supabase
    .from('organizations')
    .select('id, name, subscription_tier, created_at')
    .eq('id', profile.orgId)
    .single()

  return (
    <AdminProfileClient
      initialProfile={{
        id: profile.id,
        name: profile.name,
        email: profile.email,
        role: profile.role,
        orgId: profile.orgId,
      }}
      organization={org}
    />
  )
}
