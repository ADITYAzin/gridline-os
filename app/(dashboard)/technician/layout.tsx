import { requireRole } from '@/lib/auth'
import { TechnicianBottomNav } from '@/components/technician/bottom-nav'

export default async function TechnicianLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireRole('technician')

  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC] pb-24 pt-safe select-none">
      {/* Main Content Area (Mobile Viewport Optimized) */}
      <main className="flex-1 px-4 py-3 max-w-lg w-full mx-auto">{children}</main>

      {/* Mobile-First 3-Tab Bottom Navigation */}
      <TechnicianBottomNav />
    </div>
  )
}
