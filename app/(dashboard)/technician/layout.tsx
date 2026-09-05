import Link from 'next/link'
import { requireRole } from '@/lib/auth'
import { SignOutButton } from '@/components/navigation/sign-out-button'
import { Briefcase, User, Wrench } from 'lucide-react'

export default async function TechnicianLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const profile = await requireRole('technician')

  return (
    <div className="flex flex-col min-h-screen bg-muted/20 pb-16 md:pb-0">
      {/* Top Header */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-card/80 backdrop-blur px-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold shadow">
            <Wrench className="h-4 w-4" />
          </div>
          <div>
            <span className="font-bold text-sm">Gridline OS</span>
            <span className="text-[10px] text-muted-foreground block -mt-1 font-medium">Field Technician</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium hidden sm:inline">{profile.name}</span>
          <SignOutButton />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 max-w-lg w-full mx-auto">{children}</main>

      {/* Bottom Nav Bar (Mobile-First) */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 flex h-14 items-center justify-around border-t bg-card/95 backdrop-blur px-6 shadow-lg">
        <Link
          href="/technician"
          className="flex flex-col items-center gap-1 text-xs font-semibold text-primary"
        >
          <Briefcase className="h-5 w-5" />
          <span>My Jobs</span>
        </Link>
        <Link
          href="/technician/profile"
          className="flex flex-col items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          <User className="h-5 w-5" />
          <span>Profil</span>
        </Link>
      </nav>
    </div>
  )
}
