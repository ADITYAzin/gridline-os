'use client'

import { useTransition } from 'react'
import { signOutAction } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { LogOut, Loader2 } from 'lucide-react'

export function SignOutButton({ variant = 'ghost', className = '' }: { variant?: 'ghost' | 'outline'; className?: string }) {
  const [isPending, startTransition] = useTransition()

  return (
    <Button
      variant={variant}
      size="sm"
      className={className}
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          await signOutAction()
        })
      }}
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <>
          <LogOut className="h-4 w-4 mr-1.5" />
          Keluar
        </>
      )}
    </Button>
  )
}
