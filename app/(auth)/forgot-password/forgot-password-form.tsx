'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { requestPasswordResetAction, type ActionState } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { KeyRound, ArrowLeft, Loader2, CheckCircle2, Mail } from 'lucide-react'

const initialState: ActionState = {}

export function ForgotPasswordForm() {
  const [state, formAction, isPending] = useActionState(requestPasswordResetAction, initialState)

  return (
    <Card className="w-full max-w-md shadow-xl border-border/40 backdrop-blur">
      <CardHeader className="space-y-2 text-center pb-6">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <KeyRound className="h-6 w-6" />
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight">Lupa Kata Sandi?</CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          Masukkan alamat email Anda untuk menerima tautan reset kata sandi resmi.
        </CardDescription>
      </CardHeader>

      {state.success ? (
        <CardContent className="space-y-4 text-center">
          <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-4 space-y-2">
            <div className="flex items-center justify-center gap-2 text-emerald-600 font-semibold text-sm">
              <CheckCircle2 className="h-4 w-4" /> Instruksi Terkirim
            </div>
            <p className="text-xs text-muted-foreground">
              {state.message ||
                'Jika email Anda terdaftar, tautan reset kata sandi telah dikirimkan ke kotak masuk email Anda.'}
            </p>
          </div>
          <div className="pt-2">
            <Button asChild variant="outline" className="w-full gap-2">
              <Link href="/login">
                <ArrowLeft className="h-4 w-4" />
                Kembali ke Halaman Masuk
              </Link>
            </Button>
          </div>
        </CardContent>
      ) : (
        <form action={formAction}>
          <CardContent className="space-y-4">
            {state?.error && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-xs font-medium text-destructive">
                {state.error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Alamat Email Terdaftar</Label>
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
          </CardContent>

          <CardFooter className="flex flex-col space-y-4 pt-2">
            <Button type="submit" className="w-full h-10 font-semibold gap-2" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Mengirimkan Email...
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4" />
                  Kirim Tautan Reset
                </>
              )}
            </Button>

            <div className="text-center text-xs text-muted-foreground">
              Ingat kata sandi Anda?{' '}
              <Link href="/login" className="text-primary hover:underline font-semibold">
                Masuk di sini
              </Link>
            </div>
          </CardFooter>
        </form>
      )}
    </Card>
  )
}
