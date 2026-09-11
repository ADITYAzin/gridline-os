'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Briefcase,
  CalendarDays,
  Users,
  Building2,
  User,
} from 'lucide-react'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/jobs', label: 'Jobs', icon: Briefcase },
  { href: '/admin/dispatch', label: 'Dispatch Board', icon: CalendarDays },
  { href: '/admin/technicians', label: 'Technicians', icon: Users },
  { href: '/admin/customers', label: 'Customers', icon: Building2 },
  { href: '/admin/profile', label: 'Pengaturan', icon: User },
]

export function AdminSidebarNav() {
  const pathname = usePathname()

  return (
    <nav className="flex-1 space-y-1 p-3">
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive =
          item.href === '/admin'
            ? pathname === '/admin'
            : pathname.startsWith(item.href)

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-2 rounded-[8px] p-2 text-[13.5px] font-medium border transition-colors ${
              isActive
                ? 'bg-[#EBF5FC] text-[#007ACC] border-[#007ACC]/20'
                : 'text-[#475569] hover:bg-[#F8FAFC] hover:text-[#0F172A] border-transparent hover:border-[#E2E8F0]'
            }`}
          >
            <Icon
              className={`h-4 w-4 shrink-0 ${
                isActive ? 'text-[#007ACC]' : 'text-[#64748B]'
              }`}
            />
            <span>{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
