import Link from 'next/link'
import Image from 'next/image'
import { requireRole } from '@/lib/auth'
import { SignOutButton } from '@/components/navigation/sign-out-button'
import {
  LayoutDashboard,
  Briefcase,
  Users,
  User,
  Eye,
} from 'lucide-react'

export default async function OwnerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const profile = await requireRole('owner')

  const navItems = [
    { href: '/owner', label: 'Executive Overview', icon: LayoutDashboard },
    { href: '/owner/jobs', label: 'Daftar Jobs', icon: Briefcase },
    { href: '/owner/technicians', label: 'Monitoring Teknisi', icon: Users },
    { href: '/owner/profile', label: 'Akun Saya', icon: User },
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
            <span className="text-micro text-emerald-600 uppercase font-semibold tracking-wider flex items-center gap-1">
              <Eye className="h-3 w-3" /> Owner Hub
            </span>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
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
