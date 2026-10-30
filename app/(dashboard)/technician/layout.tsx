import { requireRole } from '@/lib/auth'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { TechnicianBottomNav } from '@/components/technician/bottom-nav'

export default async function TechnicianLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const profile = await requireRole('technician')
  const supabase = await createSupabaseServerClient()

  const { data: org } = await supabase
    .from('organizations')
    .select('commission_enabled')
    .eq('id', profile.orgId)
    .maybeSingle()

  const commissionEnabled = org?.commission_enabled ?? false

  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC] pb-24 pt-safe select-none">
      {/* Main Content Area (Mobile Viewport Optimized) */}
      <main className="flex-1 px-4 py-3 max-w-lg w-full mx-auto">{children}</main>

      {/* Mobile-First 3-Tab Bottom Navigation */}
      <TechnicianBottomNav commissionEnabled={commissionEnabled} />
    </div>
  )
}
