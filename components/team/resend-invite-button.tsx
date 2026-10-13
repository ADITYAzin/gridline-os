'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { resendInviteAction } from '@/app/actions/team'
import { toast } from 'sonner'
import { Send, Loader2 } from 'lucide-react'

interface ResendInviteButtonProps {
  inviteId: string
  email: string
}

export function ResendInviteButton({ inviteId, email }: ResendInviteButtonProps) {
  const [isPending, startTransition] = useTransition()
  const [sent, setSent] = useState(false)

  const handleResend = () => {
    startTransition(async () => {
      const result = await resendInviteAction(inviteId)
      if (result.success) {
        setSent(true)
        toast.success(`Undangan Dikirim Ulang`, {
          description: `Email aktivasi baru berhasil dikirimkan ke ${email}.`,
        })
      } else {
        toast.error(`Gagal Mengirim Ulang`, {
          description: result.error || 'Terjadi kesalahan saat memproses permintaan.',
        })
      }
    })
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className="h-8 text-xs gap-1.5"
      onClick={handleResend}
      disabled={isPending}
    >
      {isPending ? (
        <>
          <Loader2 className="h-3 w-3 animate-spin" />
          Mengirim...
        </>
      ) : (
        <>
          <Send className="h-3 w-3 text-primary" />
          {sent ? 'Kirim Lagi' : 'Kirim Ulang Email'}
        </>
      )}
    </Button>
  )
}
