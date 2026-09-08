'use client'

import { useEffect, useState, useSyncExternalStore } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Download, Share, X, Wrench, Sparkles } from 'lucide-react'

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
    <Card className="border-primary/40 bg-gradient-to-r from-primary/10 via-card to-background shadow-md overflow-hidden relative transition-all">
      <CardContent className="p-3.5 sm:p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <Wrench className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xs sm:text-sm">Install Aplikasi Gridline OS</span>
                <span className="flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-primary/20 text-primary">
                  <Sparkles className="h-2.5 w-2.5" /> Native App
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-md">
                Pasang ke Layar Utama (Home Screen) untuk akses cepat satu sentuhan tanpa membuka browser saat bertugas di lapangan.
              </p>

              {isIOS && !deferredPrompt && (
                <div className="pt-2 text-[11px] text-foreground font-medium flex items-center gap-1.5">
                  <span>Petunjuk iOS Safari:</span>
                  <span>Tekan tombol</span>
                  <Share className="h-3.5 w-3.5 text-primary inline" />
                  <span>lalu pilih</span>
                  <span className="underline font-semibold">&ldquo;Tambah ke Layar Utama&rdquo;</span>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={handleDismiss}
            aria-label="Tutup saran instalasi"
            className="text-muted-foreground hover:text-foreground p-1 -mt-1 -mr-1"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {deferredPrompt && (
          <div className="mt-3 flex items-center justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="h-8 text-xs text-muted-foreground"
            >
              Nanti Saja
            </Button>
            <Button
              size="sm"
              onClick={handleInstallClick}
              className="h-8 text-xs font-semibold gap-1.5 shadow-sm"
            >
              <Download className="h-3.5 w-3.5" />
              Install Sekarang
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
