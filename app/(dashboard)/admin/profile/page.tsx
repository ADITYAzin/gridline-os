import { requireRole } from '@/lib/auth'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { AdminProfileClient } from './admin-profile-client'

export default async function AdminProfilePage() {
  const profile = await requireRole('admin')
  const supabase = await createSupabaseServerClient()

  const [{ data: org }, { data: services }] = await Promise.all([
    supabase
      .from('organizations')
      .select('id, name, address, city, province, postal_code, phone, email, subscription_tier, is_onboarded, created_at')
      .eq('id', profile.orgId)
      .single(),
    supabase
      .from('company_services')
      .select('id, name, description, default_price, is_active, created_at')
      .eq('org_id', profile.orgId)
      .order('name', { ascending: true }),
  ])

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
      initialServices={services || []}
    />
  )
}
