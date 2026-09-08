import { requireRole } from '@/lib/auth'
import { SignOutButton } from '@/components/navigation/sign-out-button'
import { TechnicianBottomNav } from '@/components/technician/bottom-nav'
import { Wrench } from 'lucide-react'

export default async function TechnicianLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const profile = await requireRole('technician')

  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC] pb-20">
      {/* Top Header */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-[#E2E8F0] bg-white/90 backdrop-blur px-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-[#007ACC] text-white font-bold shadow-xs">
            <Wrench className="h-4 w-4" />
          </div>
          <div>
            <span className="font-heading font-bold text-sm text-[#0F172A] tracking-tight">Gridline OS</span>
            <span className="text-micro text-[#007ACC] block -mt-1 font-semibold uppercase tracking-wider">
              Field Technician
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-caption font-medium text-[#475569] hidden sm:inline">{profile.name}</span>
          <SignOutButton />
        </div>
      </header>

      {/* Main Content (Optimized Mobile Container) */}
      <main className="flex-1 p-4 max-w-lg w-full mx-auto">{children}</main>

      {/* Bottom Nav Bar (Mobile-First 3-Tab Thumb Zone) */}
      <TechnicianBottomNav />
    </div>
  )
}
