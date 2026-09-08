import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Gridline OS — Field Service Management',
    short_name: 'Gridline OS',
    description: 'Aplikasi Operasional & Pelaporan Tugas Teknisi Lapangan',
    start_url: '/technician',
    scope: '/',
    id: 'gridline-os-technician',
    display: 'standalone',
    background_color: '#0f172a',
    theme_color: '#0f172a',
    orientation: 'portrait-primary',
    categories: ['productivity', 'business', 'utilities'],
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: '/apple-icon',
        sizes: '180x180',
        type: 'image/png',
        purpose: 'any',
      },
    ],
    shortcuts: [
      {
        name: 'Tugas Lapangan',
        url: '/technician',
        description: 'Buka daftar pekerjaan servis yang ditugaskan hari ini',
      },
      {
        name: 'Profil Saya',
        url: '/technician/profile',
        description: 'Lihat profil dan pengaturan akun teknisi',
      },
    ],
  }
}
