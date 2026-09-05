'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { signUpAction, type ActionState } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2, ArrowRight, Loader2, ShieldCheck, CheckCircle2 } from 'lucide-react'

const initialState: ActionState = {}

export function RegisterForm() {
  const [state, formAction, isPending] = useActionState(signUpAction, initialState)

  return (
    <Card className="w-full max-w-lg shadow-xl border-border/40 backdrop-blur">
      <CardHeader className="space-y-2 text-center pb-6">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg">
          <Building2 className="h-6 w-6" />
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight">Daftarkan Perusahaan Anda</CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          Mulai kelola operasional teknisi dan pekerjaan lapangan dalam satu sistem
        </CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="space-y-4">
          {state?.error && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm font-medium text-destructive">
              {state.error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="companyName">Nama Perusahaan / Organisasi</Label>
            <Input
              id="companyName"
              name="companyName"
              type="text"
              required
              placeholder="PT Teknik Mandiri Jaya"
              defaultValue={state?.fields?.companyName}
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Nama Lengkap Penanggung Jawab</Label>
            <Input
              id="name"
              name="name"
              type="text"
              required
              placeholder="Budi Santoso"
              defaultValue={state?.fields?.name}
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Bisnis / Kerja</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="budi@teknikmandiri.com"
              defaultValue={state?.fields?.email}
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              placeholder="Minimal 6 karakter"
              disabled={isPending}
            />
          </div>

          <div className="rounded-lg bg-muted/60 p-3 space-y-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5 font-medium text-foreground">
              <ShieldCheck className="h-4 w-4 text-primary" />
              Jaminan Keamanan & Privasi Multi-Tenant
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              Data perusahaan Anda terisolasi penuh dengan Row Level Security
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              Akun Anda otomatis menjadi Administrator pertama
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 pt-2">
          <Button type="submit" className="w-full h-10 font-semibold" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Mendaftarkan Organisasi...
              </>
            ) : (
              <>
                Buat Organisasi & Masuk
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Sudah memiliki akun?{' '}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Masuk di sini
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}
