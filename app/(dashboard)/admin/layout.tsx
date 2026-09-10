import Link from 'next/link'
import Image from 'next/image'
import { requireRole } from '@/lib/auth'
import { SignOutButton } from '@/components/navigation/sign-out-button'
import {
  LayoutDashboard,
  Briefcase,
  CalendarDays,
  Users,
  Building2,
  User,
  PlusCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const profile = await requireRole('admin')

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/jobs', label: 'Jobs', icon: Briefcase },
    { href: '/admin/dispatch', label: 'Dispatch Board', icon: CalendarDays },
    { href: '/admin/technicians', label: 'Technicians', icon: Users },
    { href: '/admin/customers', label: 'Customers', icon: Building2 },
    { href: '/admin/profile', label: 'Pengaturan', icon: User },
  ]

  return (
    <div className="flex min-h-screen bg-muted/20">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex w-64 flex-col border-r bg-card/60 backdrop-blur">
        <div className="flex h-16 items-center gap-2.5 border-b px-6">
          <div className="flex flex-col">
            <Image
              src="/images/gridlineos-logo.png"
              alt="Gridline OS"
              width={120}
              height={22}
              className="h-auto w-[120px] object-contain"
              priority
            />
            <span className="text-micro text-slate-500 uppercase font-semibold tracking-wider">Admin Console</span>
          </div>
        </div>

        <div className="p-4">
          <Button asChild className="w-full gap-2 font-semibold shadow-sm bg-[#007ACC] hover:bg-[#0062A3]">
            <Link href="/admin/jobs/new">
              <PlusCircle className="h-4 w-4" />
              + Buat Job Baru
            </Link>
          </Button>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-2">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-body-reg font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
              >
                <Icon className="h-4 w-4 text-slate-500" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="border-t p-4 flex items-center justify-between">
          <div className="flex flex-col min-w-0 pr-2">
            <span className="font-heading text-sm font-semibold truncate text-slate-900">{profile.name}</span>
            <span className="text-caption text-slate-500 truncate">{profile.email}</span>
          </div>
          <SignOutButton />
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden flex h-14 items-center justify-between border-b px-4 bg-card">
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
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  )
}
