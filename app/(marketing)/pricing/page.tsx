import type { Metadata } from 'next'
import { PricingClient } from './pricing-client'

export const metadata: Metadata = {
  title: 'Harga & Paket Berlangganan (IDR) — Opilines',
  description:
    'Pilihan paket berlangganan Opilines dalam mata uang Rupiah (IDR). Mendukung pembayaran instan Midtrans Virtual Account, QRIS, dan Kartu Kredit.',
}

export default function PricingPage() {
  return <PricingClient />
}
