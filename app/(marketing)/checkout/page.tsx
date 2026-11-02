import type { Metadata } from 'next'
import { Suspense } from 'react'
import { CheckoutClient } from './checkout-client'

export const metadata: Metadata = {
  title: 'Checkout Langganan (IDR) — Opilines',
  description:
    'Halaman pembayaran resmi berlangganan Opilines menggunakan Rupiah (IDR) melalui gerbang pembayaran Midtrans.',
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="py-20 text-center text-sm text-[#64748B]">
          Memuat halaman checkout aman...
        </div>
      }
    >
      <CheckoutClient />
    </Suspense>
  )
}
