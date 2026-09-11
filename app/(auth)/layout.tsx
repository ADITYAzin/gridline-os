import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'

export const metadata: Metadata = {
  title: {
    template: '%s | Gridline OS',
    default: 'Portal Operasional — Gridline OS',
  },
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative min-h-screen lg:h-screen lg:max-h-screen w-full bg-[#F8FAFC] text-[#0F172A] font-poppins flex flex-col justify-between overflow-x-hidden overflow-y-auto lg:overflow-hidden selection:bg-[#007ACC]/15 selection:text-[#007ACC]">
      {/* Background Architectural Grid Pattern */}
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-[0.035]"
        style={{
          backgroundImage: `
            linear-gradient(to right, #0F172A 1px, transparent 1px),
            linear-gradient(to bottom, #0F172A 1px, transparent 1px)
          `,
          backgroundSize: '32px 32px',
        }}
        aria-hidden="true"
      />

      {/* Subtle Ambient Radial Glow */}
      <div
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-80 w-[600px] rounded-full bg-[#007ACC]/7 blur-3xl"
        aria-hidden="true"
      />

      {/* Sleek Header Navigation */}
      <header className="relative z-10 w-full shrink-0 border-b border-[#E2E8F0] bg-[#FFFFFF]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-15 flex items-center justify-between">
          <Link
            href="/login"
            className="flex items-center gap-2.5 transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#007ACC] rounded-md"
          >
            <Image
              src="/images/gridlineos-logo.png"
              alt="Gridline OS"
              width={130}
              height={24}
              className="h-auto w-[120px] sm:w-[130px] object-contain"
              priority
            />
            <span className="hidden sm:inline-block h-3.5 w-px bg-[#E2E8F0]" />
            <span className="hidden sm:inline-block text-[11px] font-medium text-[#475569] tracking-wider uppercase">
              Field Service Management
            </span>
          </Link>
        </div>
      </header>

      {/* Main Content Area - Perfectly Centered, Zero Scroll on Desktop */}
      <main className="relative z-10 flex-1 flex items-center justify-center w-full px-4 py-4 sm:py-6 overflow-y-auto lg:overflow-visible">
        <div className="w-full flex justify-center items-center my-auto animate-in fade-in-50 duration-300">
          {children}
        </div>
      </main>

      {/* Compact Footer */}
      <footer className="relative z-10 w-full shrink-0 border-t border-[#E2E8F0] bg-[#FFFFFF]/70 py-2.5 sm:py-3 text-center text-[11.5px] text-[#94A3B8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-1.5">
          <p>© 2026 GridlineOS Technologies. Seluruh hak cipta dilindungi.</p>
          <div className="flex items-center gap-3 text-[#475569]">
            <Link href="/login" className="hover:text-[#007ACC] transition-colors">
              Pusat Bantuan
            </Link>
            <span>•</span>
            <span className="text-[#94A3B8]">Kebijakan Privasi</span>
            <span>•</span>
            <span className="text-[#94A3B8]">Ketentuan Layanan</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
