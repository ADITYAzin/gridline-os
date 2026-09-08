'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { signInAction, type ActionState } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Wrench, ArrowRight, Loader2 } from 'lucide-react'

const initialState: ActionState = {}

export function LoginForm({ resetSuccess = false }: { resetSuccess?: boolean }) {
  const [state, formAction, isPending] = useActionState(signInAction, initialState)

  return (
    <Card className="w-full max-w-md shadow-xl border-border/40 backdrop-blur">
      <CardHeader className="space-y-2 text-center pb-6">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#007ACC] text-white shadow-sm">
          <Wrench className="h-6 w-6" />
        </div>
        <CardTitle className="text-display-1 font-heading text-slate-900 tracking-tight">Gridline OS</CardTitle>
        <CardDescription className="text-body-reg text-slate-500">
          Masuk ke sistem operasional jasa teknis Anda
        </CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="space-y-4">
          {resetSuccess && (
            <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs font-medium text-emerald-600">
              Password berhasil diperbarui! Silakan masuk menggunakan kata sandi baru Anda.
            </div>
          )}

          {state?.error && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm font-medium text-destructive">
              {state.error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Alamat Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="nama@perusahaan.com"
              defaultValue={state?.fields?.email}
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link
                href="/forgot-password"
                className="text-xs text-primary hover:underline"
              >
                Lupa password?
              </Link>
            </div>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              placeholder="••••••••"
              disabled={isPending}
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 pt-2">
          <Button type="submit" className="w-full h-10 font-semibold" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Memproses...
              </>
            ) : (
              <>
                Masuk
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Belum punya akun organisasi?{' '}
            <Link href="/register" className="font-medium text-primary hover:underline">
              Daftar Baru
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}
