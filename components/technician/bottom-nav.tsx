'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Briefcase, Coins, User } from 'lucide-react'
import { cn } from '@/lib/utils'

export function TechnicianBottomNav() {
  const pathname = usePathname()

  const tabs = [
    {
      label: 'Tugas Saya',
      href: '/technician',
      icon: Briefcase,
      isActive: pathname === '/technician' || pathname.startsWith('/technician/jobs'),
    },
    {
      label: 'Komisi Saya',
      href: '/technician/commissions',
      icon: Coins,
      isActive: pathname === '/technician/commissions',
    },
    {
      label: 'Profil',
      href: '/technician/profile',
      icon: User,
      isActive: pathname === '/technician/profile',
    },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-[68px] items-center justify-around border-t border-[#E2E8F0] bg-white/95 backdrop-blur-md px-3 shadow-[0_-4px_12px_rgba(0,0,0,0.04)] pb-safe select-none">
      {tabs.map((tab) => {
        const Icon = tab.icon
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              'flex flex-col items-center justify-center gap-1 min-w-[76px] h-12 rounded-[10px] transition-all touch-press',
              tab.isActive
                ? 'text-[#007ACC] font-semibold bg-[#EBF5FC]'
                : 'text-[#475569] hover:text-[#0F172A] font-medium'
            )}
          >
            <Icon className={cn('h-5 w-5', tab.isActive ? 'stroke-[2.2]' : 'stroke-[1.7]')} />
            <span className="text-[11px] leading-none tracking-tight">{tab.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
