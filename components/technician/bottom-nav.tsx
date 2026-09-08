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
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-around border-t bg-card/95 backdrop-blur-md px-4 shadow-lg pb-safe">
      {tabs.map((tab) => {
        const Icon = tab.icon
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              'flex flex-col items-center justify-center gap-1 min-w-[72px] h-12 rounded-xl transition-all select-none',
              tab.isActive
                ? 'text-[#007ACC] font-semibold bg-[#EBF5FC]/60'
                : 'text-muted-foreground hover:text-foreground font-normal'
            )}
          >
            <Icon className={cn('h-5 w-5', tab.isActive ? 'stroke-[2.2]' : 'stroke-[1.8]')} />
            <span className="text-[11px] leading-none tracking-tight">{tab.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
