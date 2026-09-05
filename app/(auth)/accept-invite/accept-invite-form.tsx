'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { acceptInviteAction, type ActionState } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { UserCheck, ArrowRight, Loader2, KeyRound } from 'lucide-react'

const initialState: ActionState = {}

interface AcceptInviteFormProps {
  token: string
  email: string
  role: string
  orgName: string
}

export function AcceptInviteForm({ token, email, role, orgName }: AcceptInviteFormProps) {
  const [state, formAction, isPending] = useActionState(acceptInviteAction, initialState)

  return (
    <Card className="w-full max-w-md shadow-xl border-border/40 backdrop-blur">
      <CardHeader className="space-y-2 text-center pb-6">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg">
          <UserCheck className="h-6 w-6" />
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight">Undangan Bergabung</CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          Anda diundang bergabung ke organisasi <span className="font-semibold text-foreground">{orgName}</span>
        </CardDescription>
        <div className="pt-2 flex justify-center gap-2">
          <Badge variant="secondary" className="capitalize text-xs font-semibold px-3 py-1">
            Peran: {role}
          </Badge>
        </div>
      </CardHeader>
      <form action={formAction}>
        <input type="hidden" name="token" value={token} />

        <CardContent className="space-y-4">
          {state?.error && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm font-medium text-destructive">
              {state.error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email Terdaftar</Label>
            <Input
              id="email"
              type="email"
              value={email}
              disabled
              className="bg-muted cursor-not-allowed"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Nama Lengkap Anda</Label>
            <Input
              id="name"
              name="name"
              type="text"
              required
              placeholder="Masukkan nama lengkap"
              defaultValue={state?.fields?.name}
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Tentukan Password Baru</Label>
            </div>
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

          <div className="rounded-lg bg-muted/60 p-3 text-xs text-muted-foreground flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-primary shrink-0" />
            <span>Password Anda bersifat pribadi dan tidak pernah dapat dilihat oleh Administrator.</span>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 pt-2">
          <Button type="submit" className="w-full h-10 font-semibold" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Mengaktifkan Akun...
              </>
            ) : (
              <>
                Aktifkan Akun & Masuk
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Bukan akun Anda?{' '}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Kembali ke Login
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}
