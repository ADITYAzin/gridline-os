'use client'

import { Button } from '@/components/ui/button'
import { Printer } from 'lucide-react'

export function BapPrintButton() {
  return (
    <Button
      onClick={() => window.print()}
      className="gap-2 bg-primary text-primary-foreground shadow-sm hover:opacity-95"
    >
      <Printer className="h-4 w-4" />
      Cetak / Simpan PDF
    </Button>
  )
}
