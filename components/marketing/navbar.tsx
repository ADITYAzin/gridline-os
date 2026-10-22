'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { ArrowRight, Menu, X } from 'lucide-react'

const navLinks = [
  { href: '/', label: 'Beranda' },
  { href: '/fitur', label: 'Fitur' },
  { href: '/pricing', label: 'Harga' },
  { href: '/demo', label: 'Jadwalkan Demo' },
]

export function MarketingNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#E2E8F0] bg-[#FFFFFF]/90 backdrop-blur-md transition-all">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/images/opilines-logo.png"
            alt="Opilines"
            width={120}
            height={22}
            priority
            className="h-auto w-[112px] object-contain"
          />
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => {
            const isActive = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-[13.5px] font-medium transition-colors ${
                  isActive
                    ? 'text-[#007ACC] font-semibold'
                    : 'text-[#475569] hover:text-[#0F172A]'
                }`}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>

        {/* Desktop CTA Buttons */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            href="/login"
            className="text-[13.5px] font-medium text-[#475569] hover:text-[#0F172A] px-3 py-2 transition-colors"
          >
            Masuk
          </Link>
          <Link
            href="/register"
            className="h-9 px-4 rounded-[8px] bg-[#007ACC] hover:bg-[#0062A3] active:bg-[#004F82] text-[#FFFFFF] font-medium text-[13px] flex items-center gap-2 shadow-[0_1px_2px_0_rgba(0,122,204,0.15)] transition-all cursor-pointer"
          >
            <span>Coba Gratis 14 Hari</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden flex h-9 w-9 items-center justify-center rounded-[8px] border border-[#E2E8F0] text-[#475569] hover:bg-[#F8FAFC]"
          aria-label="Toggle Menu"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#E2E8F0] bg-[#FFFFFF] px-4 py-4 space-y-4">
          <nav className="flex flex-col space-y-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`rounded-[8px] p-2 text-[14px] font-medium transition-colors ${
                    isActive
                      ? 'bg-[#EBF5FC] text-[#007ACC] font-semibold'
                      : 'text-[#475569] hover:bg-[#F8FAFC] hover:text-[#0F172A]'
                  }`}
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>
          <div className="pt-2 border-t border-[#E2E8F0] flex flex-col gap-2">
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2 text-[14px] font-medium text-[#475569] hover:text-[#0F172A]"
            >
              Masuk ke Dashboard
            </Link>
            <Link
              href="/register"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full h-10 rounded-[8px] bg-[#007ACC] hover:bg-[#0062A3] text-white font-medium text-[13.5px] flex items-center justify-center gap-2 shadow-sm"
            >
              <span>Coba Gratis 14 Hari</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
