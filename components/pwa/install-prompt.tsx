'use client'

import { useEffect, useState, useSyncExternalStore } from 'react'
import { Button } from '@/components/ui/button'
import { Download, Share, X, Wrench } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

function subscribeStandalone(callback: () => void) {
  const mql = window.matchMedia('(display-mode: standalone)')
  mql.addEventListener('change', callback)
  return () => mql.removeEventListener('change', callback)
}

function getStandaloneSnapshot() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    Boolean((navigator as unknown as { standalone?: boolean }).standalone)
  )
}

function getServerStandaloneSnapshot() {
  return false
}

export function InstallPrompt() {
  const isStandalone = useSyncExternalStore(
    subscribeStandalone,
    getStandaloneSnapshot,
    getServerStandaloneSnapshot
  )

  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isIOS, setIsIOS] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Check if dismissed in localStorage
    if (localStorage.getItem('gridline_pwa_dismissed') === 'true') {
      return
    }

    const userAgent = window.navigator.userAgent.toLowerCase()
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent)

    // Listen to standard beforeinstallprompt (Android / Chrome)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // If iOS Safari, schedule the banner asynchronously
    let timer: NodeJS.Timeout
    if (isIosDevice) {
      timer = setTimeout(() => {
        setIsIOS(true)
      }, 500)
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      if (timer) clearTimeout(timer)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    await deferredPrompt.prompt()
    const choice = await deferredPrompt.userChoice
    if (choice.outcome === 'accepted') {
      setDismissed(true)
      localStorage.setItem('gridline_pwa_dismissed', 'true')
    }
    setDeferredPrompt(null)
  }

  const handleDismiss = () => {
    setDismissed(true)
    localStorage.setItem('gridline_pwa_dismissed', 'true')
  }

  // Do not render if standalone mode or dismissed or neither prompt nor iOS
  if (isStandalone || dismissed || (!deferredPrompt && !isIOS)) {
    return null
  }

  return (
    <div className="rounded-xl border border-[#007ACC]/30 bg-[#EBF5FC] px-3.5 py-2.5 flex items-center justify-between gap-3 shadow-2xs">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="h-9 w-9 rounded-lg bg-[#007ACC] text-white flex items-center justify-center shrink-0">
          <Wrench className="h-4.5 w-4.5" />
        </div>
        <div className="min-w-0">
          <p className="text-xs sm:text-sm font-bold text-[#0F172A] truncate">
            Pasang Aplikasi Opilines
          </p>
          <p className="text-xs text-[#475569] truncate">
            Akses instan di layar HP
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        {deferredPrompt ? (
          <Button
            size="sm"
            onClick={handleInstallClick}
            className="h-8.5 px-3 text-xs font-bold bg-[#007ACC] hover:bg-[#0062A3] text-white rounded-lg gap-1 shadow-xs cursor-pointer touch-press"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Pasang</span>
          </Button>
        ) : isIOS ? (
          <span className="text-xs font-semibold text-[#007ACC] bg-white px-2 py-1 rounded-md border border-[#007ACC]/20">
            Share <Share className="h-3 w-3 inline mx-0.5" /> ➔ Layar Utama
          </span>
        ) : null}
        <button
          onClick={handleDismiss}
          aria-label="Tutup saran instalasi"
          className="text-[#64748B] hover:text-[#0F172A] p-1.5 rounded-lg active:bg-black/5 cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
