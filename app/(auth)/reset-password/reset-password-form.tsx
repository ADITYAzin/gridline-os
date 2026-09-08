'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { updatePasswordAction, type ActionState } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Lock, Loader2, Check } from 'lucide-react'

const initialState: ActionState = {}

export function ResetPasswordForm() {
  const [state, formAction, isPending] = useActionState(updatePasswordAction, initialState)

  return (
    <Card className="w-full max-w-md shadow-xl border-border/40 backdrop-blur">
      <CardHeader className="space-y-2 text-center pb-6">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Lock className="h-6 w-6" />
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight">Atur Kata Sandi Baru</CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          Masukkan kata sandi baru untuk akun Gridline OS Anda (minimal 6 karakter).
        </CardDescription>
      </CardHeader>

      <form action={formAction}>
        <CardContent className="space-y-4">
          {state?.error && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-xs font-medium text-destructive">
              {state.error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="password">Kata Sandi Baru</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              placeholder="••••••••"
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Konfirmasi Kata Sandi Baru</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              placeholder="••••••••"
              disabled={isPending}
            />
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4 pt-2">
          <Button type="submit" className="w-full h-10 font-semibold gap-2" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Menyimpan Sandi Baru...
              </>
            ) : (
              <>
                <Check className="h-4 w-4" />
                Simpan Kata Sandi & Masuk
              </>
            )}
          </Button>

          <div className="text-center text-xs text-muted-foreground">
            Batal mengubah?{' '}
            <Link href="/login" className="text-primary hover:underline font-semibold">
              Kembali ke Login
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  )
}
