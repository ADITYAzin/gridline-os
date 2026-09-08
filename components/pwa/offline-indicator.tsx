'use client'

import { useSyncExternalStore } from 'react'
import { WifiOff } from 'lucide-react'

function subscribe(callback: () => void) {
  window.addEventListener('online', callback)
  window.addEventListener('offline', callback)
  return () => {
    window.removeEventListener('online', callback)
    window.removeEventListener('offline', callback)
  }
}

function getSnapshot() {
  return navigator.onLine
}

function getServerSnapshot() {
  return true
}

export function OfflineIndicator() {
  const isOnline = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  if (!isOnline) {
    return (
      <aside
        aria-label="Status koneksi internet"
        className="bg-amber-500 text-amber-950 px-4 py-2 text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-all"
      >
        <WifiOff className="h-3.5 w-3.5 shrink-0" />
        <span>Koneksi internet terputus (Offline). Anda tetap dapat melihat halaman yang telah dibuka.</span>
      </aside>
    )
  }

  return null
}
