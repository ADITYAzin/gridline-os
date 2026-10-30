// Gridline OS — Progressive Web App Service Worker (High-Performance & Offline-Resilient)
const CACHE_VERSION = 'gridline-os-v2'
const STATIC_CACHE = `${CACHE_VERSION}-static`
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`

const PRECACHE_ASSETS = [
  '/',
  '/manifest.webmanifest',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon.svg',
  '/icons/apple-touch-icon.png',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.map((key) => {
            if (key !== STATIC_CACHE && key !== RUNTIME_CACHE) {
              return caches.delete(key)
            }
          })
        )
      )
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)

  // 1. Skip non-GET requests, APIs, Supabase endpoints, and Next.js Server Actions
  if (
    event.request.method !== 'GET' ||
    url.pathname.startsWith('/api/') ||
    url.origin.includes('supabase.co') ||
    event.request.headers.get('next-action')
  ) {
    return
  }

  // 2. Next.js Static Chunks, Styles, Fonts, and Icons (Stale-While-Revalidate)
  if (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/icons/') ||
    url.hostname.includes('fonts.gstatic.com') ||
    url.hostname.includes('fonts.googleapis.com')
  ) {
    event.respondWith(
      caches.open(STATIC_CACHE).then(async (cache) => {
        const cached = await cache.match(event.request)
        const fetchPromise = fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              cache.put(event.request, networkResponse.clone())
            }
            return networkResponse
          })
          .catch(() => cached)

        return cached || fetchPromise
      })
    )
    return
  }

  // 3. Navigation Requests: Network-first with runtime cache fallback
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone()
            caches.open(RUNTIME_CACHE).then((cache) => cache.put(event.request, copy))
          }
          return networkResponse
        })
        .catch(async () => {
          const cached = await caches.match(event.request)
          if (cached) return cached
          const fallback = await caches.match('/technician')
          return fallback || caches.match('/')
        })
    )
    return
  }
})
