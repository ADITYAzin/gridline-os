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
      .select('id, name, description, default_price, is_active, created_at, sop_mode, sop_items, sop_notes, estimated_duration_minutes, risk_level')
      .eq('org_id', profile.orgId)
      .order('name', { ascending: true }),
  ])

  const formattedServices = (services || []).map((s) => ({
    ...s,
    sop_mode: (s.sop_mode || 'none') as 'strict' | 'reference' | 'none',
    sop_items: (Array.isArray(s.sop_items) ? s.sop_items : []) as any,
    risk_level: (s.risk_level || 'low') as 'low' | 'medium' | 'high',
  }))

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
      initialServices={formattedServices}
    />
  )
}
