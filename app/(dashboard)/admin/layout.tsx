import Link from 'next/link'
import Image from 'next/image'
import { requireRole } from '@/lib/auth'
import { SignOutButton } from '@/components/navigation/sign-out-button'
import { AdminSidebarNav } from '@/components/navigation/sidebar-nav'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

import { createSupabaseServerClient } from '@/lib/supabase/server'
import { CompanyOnboardingDialog } from '@/components/onboarding/company-onboarding-dialog'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const profile = await requireRole('admin')
  const supabase = await createSupabaseServerClient()

  const { data: org } = await supabase
    .from('organizations')
    .select('name, is_onboarded, address, city, phone')
    .eq('id', profile.orgId)
    .single()

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">
      {/* Sidebar Desktop with Fixed Height */}
      <aside className="hidden md:flex w-64 h-screen flex-col border-r border-[#E2E8F0] bg-[#FFFFFF] shrink-0">
        {/* Brand Header */}
        <div className="flex h-16 items-center border-b border-[#E2E8F0] px-4 shrink-0">
          <div className="flex flex-col">
            <Image
              src="/images/gridlineos-logo.png"
              alt="Gridline OS"
              width={120}
              height={22}
              className="h-auto w-[120px] object-contain"
              priority
            />
            <span className="text-[10px] text-[#94A3B8] uppercase font-semibold tracking-wider mt-2">
              Admin Console
            </span>
          </div>
        </div>

        {/* Primary Action Button */}
        <div className="px-3 pt-3 pb-3 shrink-0">
          <Button
            asChild
            className="w-full h-8 rounded-[8px] bg-[#007ACC] hover:bg-primary hover:text-white active:bg-[#004F82] text-white font-medium text-xs gap-2 shadow-[0_1px_2px_0_rgba(0,122,204,0.15)] transition-all cursor-pointer"
          >
            <Link href="/admin/jobs/new">
              <Plus className="h-3.5 w-3.5" />
              <span>Buat Job Baru</span>
            </Link>
          </Button>
        </div>

        {/* Nav Items with Active State */}
        <AdminSidebarNav />

        {/* User Footer */}
        <div className="border-t border-[#E2E8F0] p-4 bg-[#FFFFFF] flex items-center justify-between gap-2 shrink-0">
          <div className="flex flex-col min-w-0 pr-2">
            <span className="font-heading text-[13px] font-semibold truncate text-[#0F172A]">
              {profile.name}
            </span>
            <span className="text-[11.5px] text-[#94A3B8] truncate">
              {profile.email}
            </span>
          </div>
          <SignOutButton />
        </div>
      </aside>

      {/* Main Content Area with Vertical Scrolling */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="md:hidden flex h-14 items-center justify-between border-b border-[#E2E8F0] p-4 bg-[#FFFFFF] shrink-0">
          <Image
            src="/images/gridlineos-logo.png"
            alt="Gridline OS"
            width={110}
            height={20}
            className="h-auto w-[110px] object-contain"
            priority
          />
          <SignOutButton />
        </header>
        <main className="flex-1 p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
        <CompanyOnboardingDialog
          companyName={org?.name || ''}
          isOnboarded={org?.is_onboarded ?? true}
          defaultAddress={org?.address}
          defaultCity={org?.city}
          defaultPhone={org?.phone}
        />
      </div>
    </div>
  )
}
