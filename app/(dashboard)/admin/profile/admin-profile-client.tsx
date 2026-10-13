'use client'

import * as React from 'react'
import { useActionState } from 'react'
import {
  User,
  Mail,
  Shield,
  ShieldCheck,
  Building2,
  Sparkles,
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Info,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  updateAdminNameAction,
  updateAdminPasswordAction,
  type ProfileActionState,
} from '@/app/actions/profile'

interface AdminProfileClientProps {
  initialProfile: {
    id: string
    name: string
    email: string
    role: string
    orgId: string
  }
  organization: {
    id: string
    name: string
    subscription_tier?: string | null
    created_at?: string | null
  } | null
}

const initialActionState: ProfileActionState = {}

export function AdminProfileClient({
  initialProfile,
  organization,
}: AdminProfileClientProps) {
  // State for display name form
  const [displayName, setDisplayName] = React.useState(initialProfile.name)
  const [nameState, nameFormAction, isNamePending] = useActionState(
    updateAdminNameAction,
    initialActionState
  )

  // State for password form
  const [showNewPassword, setShowNewPassword] = React.useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false)
  const [newPassword, setNewPassword] = React.useState('')
  const [confirmPassword, setConfirmPassword] = React.useState('')
  const [passwordState, passwordFormAction, isPasswordPending] = useActionState(
    async (prev: ProfileActionState, fd: FormData) => {
      const res = await updateAdminPasswordAction(prev, fd)
      if (res.success) {
        setNewPassword('')
        setConfirmPassword('')
      }
      return res
    },
    initialActionState
  )

  // State for Google connection modal (front-end only)
  const [isGoogleModalOpen, setIsGoogleModalOpen] = React.useState(false)

  // Sync display name if updated successfully
  React.useEffect(() => {
    if (nameState.success) {
      // Name was updated
    }
  }, [nameState.success])

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
          Pengaturan & Profil
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Kelola profil akun, informasi perusahaan, dan keamanan akun Anda.
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="bg-muted/80 p-0.5 rounded-lg h-8">
          <TabsTrigger value="profile" className="gap-2 text-xs font-medium">
            <User className="h-3.5 w-3.5" />
            Profil & Organisasi
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2 text-xs font-medium">
            <KeyRound className="h-3.5 w-3.5" />
            Keamanan & Akses
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: PROFIL & ORGANISASI */}
        <TabsContent value="profile" className="space-y-6 focus-visible:outline-none">
          <div className="grid gap-6 md:grid-cols-2">
            {/* User Profile Card */}
            <Card className="shadow-sm border-border bg-card">
              <CardHeader className="pb-3 border-b border-border/50">
                <CardTitle className="text-base flex items-center gap-2">
                  <User className="h-4 w-4 text-[#007ACC]" />
                  Profil Pengguna
                </CardTitle>
                <CardDescription className="text-xs">
                  Perbarui nama dan lihat detail akun Anda.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4 space-y-4 text-xs">
                {/* Header Avatar preview */}
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/40 border border-border/60">
                  <div className="h-11 w-11 rounded-full bg-[#EBF5FC] text-[#007ACC] border border-[#D0E8F8] flex items-center justify-center font-bold text-sm shrink-0">
                    {displayName.trim() ? displayName.slice(0, 2).toUpperCase() : 'AD'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm text-foreground truncate">
                      {displayName || 'Administrator'}
                    </p>
                    <p className="text-muted-foreground text-[11px] truncate">{initialProfile.email}</p>
                  </div>
                  <Badge variant="default" className="gap-1 font-semibold text-[11px] bg-[#007ACC] shrink-0">
                    <ShieldCheck className="h-3 w-3" />
                    Admin
                  </Badge>
                </div>

                {/* Feedback Alerts */}
                {nameState.error && (
                  <div className="flex items-center gap-2 p-2.5 rounded-lg bg-destructive/10 text-destructive text-xs border border-destructive/20">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{nameState.error}</span>
                  </div>
                )}
                {nameState.success && (
                  <div className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-500/10 text-emerald-600 text-xs border border-emerald-500/20">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span>{nameState.message}</span>
                  </div>
                )}

                {/* Form Update Display Name */}
                <form action={nameFormAction} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="display-name" className="text-xs font-medium text-foreground">
                      Nama Lengkap
                    </Label>
                    <Input
                      id="display-name"
                      name="name"
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Masukkan nama lengkap Anda"
                      required
                      className="h-8 text-xs bg-background"
                    />
                    <p className="text-[11px] text-muted-foreground">
                      Nama ini akan terlihat oleh tim di tugas servis dan laporan.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="email-display" className="text-xs font-medium text-foreground flex items-center gap-1.5">
                      <span>Alamat Email</span>
                      <Lock className="h-3 w-3 text-muted-foreground" />
                    </Label>
                    <Input
                      id="email-display"
                      type="email"
                      value={initialProfile.email}
                      disabled
                      className="h-8 text-xs bg-muted/50 cursor-not-allowed text-muted-foreground"
                    />
                    <p className="text-[11px] text-muted-foreground">
                      Email utama untuk masuk ke aplikasi. Tidak dapat diubah langsung.
                    </p>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <Button
                      type="submit"
                      disabled={isNamePending || displayName.trim() === initialProfile.name}
                      className="h-8 text-xs font-medium bg-[#007ACC] hover:bg-[#0062A3] text-white gap-2 shadow-xs"
                    >
                      {isNamePending ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          Menyimpan...
                        </>
                      ) : (
                        'Simpan Perubahan'
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Organization Info Card */}
            <Card className="shadow-sm border-border bg-card">
              <CardHeader className="pb-3 border-b border-border/50">
                <CardTitle className="text-base flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-[#007ACC]" />
                  Informasi Perusahaan
                </CardTitle>
                <CardDescription className="text-xs">
                  Data perusahaan dan paket langganan yang sedang aktif.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4 space-y-4 text-xs">
                <div>
                  <span className="text-muted-foreground block font-medium">Nama Perusahaan:</span>
                  <span className="font-bold text-base text-foreground mt-0.5 block">
                    {organization?.name || 'Organisasi'}
                  </span>
                </div>

                <div>
                  <span className="text-muted-foreground block font-medium">ID Perusahaan:</span>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="font-mono text-[11px] bg-muted px-2 py-1 rounded text-muted-foreground select-all border border-border/50">
                      {organization?.id}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-muted-foreground block font-medium">Paket Langganan:</span>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="capitalize font-semibold gap-1 text-xs">
                      <Sparkles className="h-3 w-3 text-amber-500" />
                      {organization?.subscription_tier || 'Trial'}
                    </Badge>
                    <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      Aktif
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-muted-foreground block font-medium">Terdaftar Sejak:</span>
                  <span className="text-foreground mt-0.5 block">
                    {organization?.created_at
                      ? new Date(organization.created_at).toLocaleDateString('id-ID', {
                          dateStyle: 'long',
                        })
                      : '-'}
                  </span>
                </div>

                <div className="pt-3 border-t border-border text-[11px] text-muted-foreground flex items-start gap-1.5">
                  <Shield className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>
                    Seluruh data operasional Anda tersimpan aman dan terpisah dari perusahaan lain.
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* TAB 2: KEAMANAN & AKSES */}
        <TabsContent value="security" className="space-y-6 focus-visible:outline-none">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Password Management Card */}
            <Card className="shadow-sm border-border bg-card">
              <CardHeader className="pb-3 border-b border-border/50">
                <CardTitle className="text-base flex items-center gap-2">
                  <Lock className="h-4 w-4 text-[#007ACC]" />
                  Ubah Kata Sandi
                </CardTitle>
                <CardDescription className="text-xs">
                  Ganti kata sandi secara berkala agar akun Anda tetap aman.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4 space-y-4 text-xs">
                {/* Feedback Alerts */}
                {passwordState.error && (
                  <div className="flex items-center gap-2 p-2.5 rounded-lg bg-destructive/10 text-destructive text-xs border border-destructive/20">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{passwordState.error}</span>
                  </div>
                )}
                {passwordState.success && (
                  <div className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-500/10 text-emerald-600 text-xs border border-emerald-500/20">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span>{passwordState.message}</span>
                  </div>
                )}

                <form action={passwordFormAction} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="new-password" className="text-xs font-medium text-foreground">
                      Kata Sandi Baru
                    </Label>
                    <div className="relative">
                      <Input
                        id="new-password"
                        name="newPassword"
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Minimal 6 karakter"
                        required
                        className="h-8 text-xs pr-8 bg-background"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showNewPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="confirm-password" className="text-xs font-medium text-foreground">
                      Konfirmasi Kata Sandi Baru
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirm-password"
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Ketik ulang kata sandi baru"
                        required
                        className="h-8 text-xs pr-8 bg-background"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showConfirmPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Password helper hints */}
                  <div className="p-2.5 rounded-lg bg-muted/40 border border-border/50 space-y-1 text-[11px] text-muted-foreground">
                    <p className="font-medium text-foreground">Syarat kata sandi:</p>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          newPassword.length >= 6 ? 'bg-emerald-500' : 'bg-muted-foreground'
                        }`}
                      />
                      <span>Minimal 6 karakter</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          newPassword && newPassword === confirmPassword
                            ? 'bg-emerald-500'
                            : 'bg-muted-foreground'
                        }`}
                      />
                      <span>Kata sandi cocok</span>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <Button
                      type="submit"
                      disabled={isPasswordPending || !newPassword || !confirmPassword}
                      className="h-8 text-xs font-medium bg-[#007ACC] hover:bg-[#0062A3] text-white gap-2 shadow-xs"
                    >
                      {isPasswordPending ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          Menyimpan...
                        </>
                      ) : (
                        'Simpan Kata Sandi'
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Google Account Connection Card */}
            <Card className="shadow-sm border-border bg-card flex flex-col justify-between">
              <div>
                <CardHeader className="pb-3 border-b border-border/50">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      {/* Google 4-Color SVG Icon */}
                      <svg className="h-4 w-4" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        />
                      </svg>
                      Masuk dengan Google
                    </CardTitle>
                    <Badge variant="outline" className="text-[11px] font-normal text-muted-foreground border-border">
                      Belum Terhubung
                    </Badge>
                  </div>
                  <CardDescription className="text-xs">
                    Tautkan akun Google agar bisa masuk ke aplikasi dengan lebih cepat.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4 space-y-4 text-xs">
                  <div className="p-3 rounded-lg bg-muted/40 border border-border/60 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-foreground">Status:</span>
                      <span className="text-[11px] text-amber-600 font-medium flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                        Belum Terhubung
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      Setelah terhubung, Anda dapat masuk ke Gridline OS langsung dengan satu klik tanpa perlu mengetik kata sandi.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <p className="font-medium text-foreground text-xs">Keuntungan:</p>
                    <ul className="space-y-1.5 text-[11px] text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                        <span>Masuk cepat dengan 1 kali klik</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                        <span>Aman dengan proteksi verifikasi akun Google</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                        <span>Terhubung langsung dengan email kerja Anda</span>
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </div>

              <div className="p-4 pt-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsGoogleModalOpen(true)}
                  className="w-full h-8 text-xs font-medium gap-2 border-border hover:bg-muted"
                >
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  Hubungkan Akun Google
                </Button>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Google SSO Information Dialog */}
      <Dialog open={isGoogleModalOpen} onOpenChange={setIsGoogleModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              Koneksi Akun Google
            </DialogTitle>
            <DialogDescription className="text-xs pt-1">
              Informasi fitur masuk praktis menggunakan akun Google.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 text-blue-900 dark:text-blue-200 flex items-start gap-2.5">
              <Info className="h-4 w-4 text-[#007ACC] shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold text-xs">Fitur Segera Tersedia</p>
                <p className="text-[11px] leading-relaxed">
                  Fitur masuk dengan Google sedang dalam tahap persiapan. Setelah aktif, Anda dapat langsung menggunakannya untuk masuk dengan mudah dan aman.
                </p>
              </div>
            </div>

            <div className="space-y-1.5 p-3 rounded-lg bg-muted/40 border border-border/60">
              <span className="font-medium text-foreground text-xs block">Email yang akan dihubungkan:</span>
              <div className="flex items-center gap-2 text-muted-foreground text-xs">
                <Mail className="h-3.5 w-3.5 text-primary" />
                <span className="font-mono text-[11px] text-foreground">{initialProfile.email}</span>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsGoogleModalOpen(false)}
              className="h-8 text-xs"
            >
              Tutup
            </Button>
            <Button
              type="button"
              onClick={() => setIsGoogleModalOpen(false)}
              className="h-8 text-xs bg-[#007ACC] hover:bg-[#0062A3] text-white"
            >
              Mengerti
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
