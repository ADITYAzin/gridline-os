'use client'

import * as React from 'react'
import { useActionState, useTransition } from 'react'
import { toast } from 'sonner'
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
  MapPin,
  Phone,
  Briefcase,
  Plus,
  Pencil,
  Trash2,
  Power,
  Search,
  Check,
  ListChecks,
  GripVertical,
  Camera,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Clock,
  ShieldAlert,
  CreditCard,
  Copy,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SubscriptionReminderBanner } from '@/components/settings/subscription-reminder-banner'
import { SubscriptionTab } from '@/components/settings/subscription-tab'
import { ExtendSubscriptionDialog } from '@/components/settings/extend-subscription-dialog'
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
import {
  updateOrganizationDetailsAction,
  createCompanyServiceAction,
  updateCompanyServiceAction,
  deleteCompanyServiceAction,
  toggleServiceActiveAction,
  type OrgActionState,
  type SopItem,
} from '@/app/actions/organization'

export interface CompanyServiceItem {
  id: string
  name: string
  description?: string | null
  default_price?: number | null
  is_active: boolean
  created_at: string
  sop_mode: 'strict' | 'reference' | 'none'
  sop_items: SopItem[]
  sop_notes?: string | null
  estimated_duration_minutes?: number | null
  risk_level: 'low' | 'medium' | 'high'
}

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
    address?: string | null
    city?: string | null
    province?: string | null
    postal_code?: string | null
    phone?: string | null
    email?: string | null
    subscription_tier?: string | null
    is_onboarded?: boolean
    created_at?: string | null
  } | null
  initialServices: CompanyServiceItem[]
}

const initialActionState: ProfileActionState = {}
const initialOrgActionState: OrgActionState = {}

const SERVICE_PRESETS = [
  'Instalasi / Pasang Baru',
  'Servis & Perawatan Berkala',
  'Perbaikan & Reparasi Kerusakan',
  'Pengecekan / Diagnosa Troubleshooting',
  'Bongkar Pasang / Relokasi Unit',
  'Penggantian Suku Cadang (Sparepart)',
]

export function AdminProfileClient({
  initialProfile,
  organization,
  initialServices,
}: AdminProfileClientProps) {
  // --- Profile State ---
  const [displayName, setDisplayName] = React.useState(initialProfile.name)
  const [nameState, nameFormAction, isNamePending] = useActionState(
    updateAdminNameAction,
    initialActionState
  )

  // --- Password State ---
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

  // --- Organization & Location State ---
  const [orgState, orgFormAction, isOrgPending] = useActionState(
    updateOrganizationDetailsAction,
    initialOrgActionState
  )

  // --- Subscription & Navigation State ---
  const [activeTab, setActiveTab] = React.useState<string>('company')
  const [isExtendModalOpen, setIsExtendModalOpen] = React.useState<boolean>(false)
  const [copiedOrgId, setCopiedOrgId] = React.useState<boolean>(false)
  const [reminderDismissed, setReminderDismissed] = React.useState<boolean>(false)
  const [currentTier, setCurrentTier] = React.useState<string>(
    organization?.subscription_tier || 'trial'
  )
  const [targetTier, setTargetTier] = React.useState<string>('pro')

  // Default initial expiry date: 3 days from now (to demonstrate upcoming expiration reminder)
  const [expiryDate, setExpiryDate] = React.useState<Date>(() => {
    const d = new Date()
    d.setDate(d.getDate() + 3)
    d.setHours(23, 59, 59, 0)
    return d
  })

  const now = new Date()
  const daysLeft = Math.max(0, Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
  const isExpiringSoon = daysLeft <= 7 && daysLeft > 0
  const isExpired = daysLeft === 0

  const handleCopyOrgId = () => {
    if (organization?.id) {
      navigator.clipboard.writeText(organization.id)
      setCopiedOrgId(true)
      toast.success('ID Organisasi disalin ke clipboard')
      setTimeout(() => setCopiedOrgId(false), 2000)
    }
  }

  const handleOpenExtendDialog = (tierToUpscale?: string) => {
    if (tierToUpscale) {
      setTargetTier(tierToUpscale)
    } else {
      setTargetTier(currentTier === 'trial' ? 'pro' : currentTier)
    }
    setIsExtendModalOpen(true)
  }

  const handleExtendSuccess = (newExpiry: Date, monthsAdded: number, appliedTier?: string) => {
    setExpiryDate(newExpiry)
    setReminderDismissed(false)
    if (appliedTier) {
      setCurrentTier(appliedTier)
    } else if (currentTier === 'trial') {
      setCurrentTier('pro')
    }
  }

  // --- Services Management State ---
  const [services, setServices] = React.useState<CompanyServiceItem[]>(initialServices)
  const [serviceSearch, setServiceSearch] = React.useState('')
  const [isAddServiceOpen, setIsAddServiceOpen] = React.useState(false)
  const [editingService, setEditingService] = React.useState<CompanyServiceItem | null>(null)
  const [deletingServiceId, setDeletingServiceId] = React.useState<string | null>(null)
  const [serviceActionError, setServiceActionError] = React.useState<string | null>(null)
  const [isPendingService, startServiceTransition] = useTransition()

  // --- SOP Builder State (shared between Add & Edit dialogs) ---
  const [sopMode, setSopMode] = React.useState<'none' | 'strict' | 'reference'>('none')
  const [sopItems, setSopItems] = React.useState<SopItem[]>([])
  const [newSopItemText, setNewSopItemText] = React.useState('')
  const [expandedHintId, setExpandedHintId] = React.useState<string | null>(null)

  const resetSopBuilder = React.useCallback((service?: CompanyServiceItem | null) => {
    setSopMode(service?.sop_mode ?? 'none')
    setSopItems(Array.isArray(service?.sop_items) ? service.sop_items : [])
    setNewSopItemText('')
    setExpandedHintId(null)
  }, [])

  const handleAddSopItem = () => {
    if (!newSopItemText.trim()) return
    setSopItems((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        item: newSopItemText.trim(),
        order: prev.length + 1,
        requires_photo: false,
        is_critical: false,
        hint: '',
      },
    ])
    setNewSopItemText('')
  }

  const handleRemoveSopItem = (id: string) => {
    setSopItems((prev) =>
      prev.filter((i) => i.id !== id).map((i, idx) => ({ ...i, order: idx + 1 }))
    )
  }

  const handleToggleSopItemField = (id: string, field: 'requires_photo' | 'is_critical') => {
    setSopItems((prev) => prev.map((i) => (i.id === id ? { ...i, [field]: !i[field] } : i)))
  }

  const handleSopItemHintChange = (id: string, hint: string) => {
    setSopItems((prev) => prev.map((i) => (i.id === id ? { ...i, hint } : i)))
  }

  // Google modal state
  const [isGoogleModalOpen, setIsGoogleModalOpen] = React.useState(false)

  // Sync services when initialServices prop updates (e.g. after server revalidation)
  React.useEffect(() => {
    setServices(initialServices)
  }, [initialServices])

  const filteredServices = React.useMemo(() => {
    if (!serviceSearch.trim()) return services
    const q = serviceSearch.toLowerCase()
    return services.filter(
      (s) => s.name.toLowerCase().includes(q) || (s.description && s.description.toLowerCase().includes(q))
    )
  }, [services, serviceSearch])

  // Handler for adding a service
  const handleAddService = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setServiceActionError(null)
    const fd = new FormData(e.currentTarget)
    const newName = ((fd.get('name') as string) || '').trim()
    // Inject SOP builder fields
    fd.set('sopMode', sopMode)
    fd.set('sopItems', JSON.stringify(sopItems))
    startServiceTransition(async () => {
      const res = await createCompanyServiceAction(initialOrgActionState, fd)
      if (res.error) {
        setServiceActionError(res.error)
        toast.error(res.error)
      } else {
        setIsAddServiceOpen(false)
        resetSopBuilder()
        if (res.service) {
          setServices((prev) => [...prev, res.service!])
        } else {
          const newDesc = (fd.get('description') as string)?.trim() || null
          const newPrice = Number(fd.get('defaultPrice')) || 0
          setServices((prev) => [
            ...prev,
            {
              id: crypto.randomUUID(),
              name: newName,
              description: newDesc,
              default_price: newPrice,
              is_active: true,
              created_at: new Date().toISOString(),
              sop_mode: sopMode,
              sop_items: sopItems,
              sop_notes: null,
              estimated_duration_minutes: null,
              risk_level: 'low',
            },
          ])
        }
        toast.success(`Layanan "${newName}" berhasil ditambahkan`)
      }
    })
  }

  // Handler for updating a service
  const handleUpdateService = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editingService) return
    setServiceActionError(null)
    const fd = new FormData(e.currentTarget)
    const updatedName = (fd.get('name') as string).trim()
    // Inject SOP builder fields
    fd.set('sopMode', sopMode)
    fd.set('sopItems', JSON.stringify(sopItems))
    startServiceTransition(async () => {
      const res = await updateCompanyServiceAction(initialOrgActionState, fd)
      if (res.error) {
        setServiceActionError(res.error)
        toast.error(res.error)
      } else {
        const updatedDesc = (fd.get('description') as string)?.trim() || null
        const updatedPrice = Number(fd.get('defaultPrice')) || 0
        setServices((prev) =>
          prev.map((s) =>
            s.id === editingService.id
              ? {
                  ...s,
                  name: updatedName,
                  description: updatedDesc,
                  default_price: updatedPrice,
                  sop_mode: sopMode,
                  sop_items: sopItems,
                }
              : s
          )
        )
        setEditingService(null)
        resetSopBuilder()
        toast.success(`Layanan "${updatedName}" berhasil diperbarui`)
      }
    })
  }

  // Handler for toggle active
  const handleToggleActive = (service: CompanyServiceItem) => {
    startServiceTransition(async () => {
      // Optimistic update
      setServices((prev) =>
        prev.map((s) => (s.id === service.id ? { ...s, is_active: !s.is_active } : s))
      )
      const res = await toggleServiceActiveAction(service.id, service.is_active)
      if (res.error) {
        // Rollback
        setServices((prev) =>
          prev.map((s) => (s.id === service.id ? { ...s, is_active: service.is_active } : s))
        )
        toast.error(res.error)
      } else {
        toast.success(
          service.is_active
            ? `Layanan "${service.name}" dinonaktifkan`
            : `Layanan "${service.name}" diaktifkan`
        )
      }
    })
  }

  // Handler for deleting a service
  const handleDeleteService = (id: string) => {
    const srvName = services.find((s) => s.id === id)?.name
    startServiceTransition(async () => {
      setServices((prev) => prev.filter((s) => s.id !== id))
      setDeletingServiceId(null)
      const res = await deleteCompanyServiceAction(id)
      if (res.error) {
        toast.error(res.error)
      } else {
        toast.success(srvName ? `Layanan "${srvName}" berhasil dihapus` : 'Layanan berhasil dihapus')
      }
    })
  }

  // Preset click handler
  const handleAddPreset = (presetName: string) => {
    if (services.some((s) => s.name.toLowerCase() === presetName.toLowerCase())) {
      toast.info(`Layanan "${presetName}" sudah ada dalam daftar perusahaan.`)
      return
    }

    setServiceActionError(null)
    startServiceTransition(async () => {
      const fd = new FormData()
      fd.append('name', presetName)
      fd.append('description', '')
      fd.append('defaultPrice', '0')
      fd.append('sopMode', 'none')
      fd.append('sopItems', '[]')
      const res = await createCompanyServiceAction(initialOrgActionState, fd)
      if (res.error) {
        setServiceActionError(res.error)
        toast.error(res.error)
      } else if (res.service) {
        setServices((prev) => [...prev, res.service!])
        toast.success(`Layanan "${presetName}" berhasil ditambahkan`)
      } else {
        setServices((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            name: presetName,
            description: null,
            default_price: 0,
            is_active: true,
            created_at: new Date().toISOString(),
            sop_mode: 'none' as const,
            sop_items: [],
            sop_notes: null,
            estimated_duration_minutes: null,
            risk_level: 'low' as const,
          },
        ])
        toast.success(`Layanan "${presetName}" berhasil ditambahkan`)
      }
    })
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground font-heading">
            Pengaturan
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Kelola profil perusahaan, paket langganan, dan operasional tim.
          </p>
        </div>

        {/* Quick Plan Badge & Status */}
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="text-xs py-1 px-2.5 font-semibold border-[#007ACC]/30 bg-[#EBF5FC] text-[#007ACC] gap-1.5"
          >
            <Sparkles className="h-3 w-3 text-[#007ACC]" />
            <span className="capitalize">Paket {currentTier}</span>
          </Badge>
          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
              isExpired
                ? 'bg-destructive/10 text-destructive border-destructive/20'
                : isExpiringSoon
                ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20'
                : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
            }`}
          >
            {isExpired ? 'Kadaluarsa' : `${daysLeft} Hari Tersisa`}
          </span>
        </div>
      </div>

      {/* Subscription Reminder Banner (Shown if expiring soon or expired) */}
      <SubscriptionReminderBanner
        daysLeft={daysLeft}
        expiryDate={expiryDate}
        currentTier={currentTier}
        isDismissed={reminderDismissed}
        onDismiss={() => setReminderDismissed(true)}
        onExtendClick={() => {
          setActiveTab('subscription')
          handleOpenExtendDialog('pro')
        }}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-muted/80 p-0.5 rounded-lg h-9">
          <TabsTrigger value="company" className="gap-2 text-xs font-medium cursor-pointer">
            <Building2 className="h-3.5 w-3.5 text-[#007ACC]" />
            Profil Perusahaan
          </TabsTrigger>
          <TabsTrigger value="subscription" className="gap-2 text-xs font-medium cursor-pointer">
            <CreditCard className="h-3.5 w-3.5 text-[#007ACC]" />
            Paket & Langganan
            {isExpiringSoon && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                {daysLeft}h
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="services" className="gap-2 text-xs font-medium cursor-pointer">
            <Briefcase className="h-3.5 w-3.5 text-[#007ACC]" />
            Layanan & SOP
            <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-[10px] h-4">
              {services.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="profile" className="gap-2 text-xs font-medium cursor-pointer">
            <User className="h-3.5 w-3.5 text-[#007ACC]" />
            Profil Admin
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2 text-xs font-medium cursor-pointer">
            <KeyRound className="h-3.5 w-3.5 text-[#007ACC]" />
            Keamanan Akun
          </TabsTrigger>
        </TabsList>

        {/* ========================================================================= */}
        {/* TAB 1: INFORMASI PERUSAHAAN & LOKASI */}
        {/* ========================================================================= */}
        <TabsContent value="company" className="space-y-6 focus-visible:outline-none">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main Form: Company Details & Location */}
            <Card className="shadow-sm border-border bg-card lg:col-span-2">
              <CardHeader className="pb-3 border-b border-border/50">
                <CardTitle className="text-base flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-[#007ACC]" />
                  Informasi & Lokasi Perusahaan
                </CardTitle>
                <CardDescription className="text-xs">
                  Perbarui data identitas kantor, workshop, dan alamat operasional resmi perusahaan Anda.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4 space-y-4 text-xs">
                {/* Feedback Alerts */}
                {orgState.error && (
                  <div className="flex items-center gap-2 p-2.5 rounded-lg bg-destructive/10 text-destructive text-xs border border-destructive/20">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{orgState.error}</span>
                  </div>
                )}
                {orgState.success && (
                  <div className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-500/10 text-emerald-600 text-xs border border-emerald-500/20">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span>{orgState.message}</span>
                  </div>
                )}

                <form action={orgFormAction} className="space-y-4">
                  {/* Nama Perusahaan */}
                  <div className="space-y-1.5">
                    <Label htmlFor="org-name" className="text-xs font-medium text-foreground">
                      Nama Perusahaan / Organisasi *
                    </Label>
                    <Input
                      id="org-name"
                      name="name"
                      type="text"
                      defaultValue={organization?.name || ''}
                      placeholder="Masukkan nama perusahaan"
                      required
                      className="h-8 text-xs bg-background"
                    />
                  </div>

                  {/* Kontak Operasional (Telepon & Email) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="org-phone" className="text-xs font-medium text-foreground flex items-center gap-1.5">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        <span>Telepon / WhatsApp Kantor</span>
                      </Label>
                      <Input
                        id="org-phone"
                        name="phone"
                        type="text"
                        defaultValue={organization?.phone || ''}
                        placeholder="Masukkan nomor telepon atau WhatsApp kantor"
                        className="h-8 text-xs bg-background"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="org-email" className="text-xs font-medium text-foreground flex items-center gap-1.5">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        <span>Email Resmi Perusahaan</span>
                      </Label>
                      <Input
                        id="org-email"
                        name="email"
                        type="email"
                        defaultValue={organization?.email || ''}
                        placeholder="Masukkan alamat email resmi perusahaan"
                        className="h-8 text-xs bg-background"
                      />
                    </div>
                  </div>

                  {/* Alamat Lengkap Workshop / Kantor */}
                  <div className="space-y-1.5">
                    <Label htmlFor="org-address" className="text-xs font-medium text-foreground flex items-center gap-1.5">
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                      <span>Alamat Lengkap Workshop / Kantor</span>
                    </Label>
                    <Textarea
                      id="org-address"
                      name="address"
                      rows={3}
                      defaultValue={organization?.address || ''}
                      placeholder="Masukkan nama jalan, nomor bangunan, dan wilayah kantor"
                      className="text-xs bg-background resize-none"
                    />
                  </div>

                  {/* Kota, Provinsi, Kode Pos */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="org-city" className="text-xs font-medium text-foreground">
                        Kota / Kabupaten
                      </Label>
                      <Input
                        id="org-city"
                        name="city"
                        type="text"
                        defaultValue={organization?.city || ''}
                        placeholder="Masukkan nama kota atau kabupaten"
                        className="h-8 text-xs bg-background"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="org-province" className="text-xs font-medium text-foreground">
                        Provinsi
                      </Label>
                      <Input
                        id="org-province"
                        name="province"
                        type="text"
                        defaultValue={organization?.province || ''}
                        placeholder="Masukkan nama provinsi"
                        className="h-8 text-xs bg-background"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="org-postalCode" className="text-xs font-medium text-foreground">
                        Kode Pos
                      </Label>
                      <Input
                        id="org-postalCode"
                        name="postalCode"
                        type="text"
                        defaultValue={organization?.postal_code || ''}
                        placeholder="Masukkan kode pos"
                        className="h-8 text-xs bg-background"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <Button
                      type="submit"
                      disabled={isOrgPending}
                      className="h-8 text-xs font-medium bg-[#007ACC] hover:bg-[#0062A3] text-white gap-2 shadow-xs cursor-pointer"
                    >
                      {isOrgPending ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          Menyimpan...
                        </>
                      ) : (
                        'Simpan Informasi Perusahaan'
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Sidebar: Identitas Organisasi & Keamanan */}
            <Card className="shadow-sm border-border bg-card h-fit">
              <CardHeader className="pb-3 border-b border-border/50">
                <CardTitle className="text-base flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-[#007ACC]" />
                  Identitas Organisasi
                </CardTitle>
                <CardDescription className="text-xs">
                  ID sistem dan parameter keamanan tenant akun Anda.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4 space-y-4 text-xs">
                <div>
                  <span className="text-muted-foreground block font-medium">ID Organisasi (UUID):</span>
                  <div className="mt-1 flex items-center gap-1.5">
                    <span className="font-mono text-[11px] bg-muted px-2 py-1 rounded text-muted-foreground select-all border border-border/50 block truncate flex-1">
                      {organization?.id}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleCopyOrgId}
                      className="h-7 px-2 shrink-0 cursor-pointer"
                      title="Salin ID Organisasi"
                    >
                      {copiedOrgId ? (
                        <Check className="h-3 w-3 text-emerald-600" />
                      ) : (
                        <Copy className="h-3 w-3 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>

                <div>
                  <span className="text-muted-foreground block font-medium">Paket Langganan:</span>
                  <div className="flex items-center justify-between mt-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="capitalize font-semibold gap-1 text-xs">
                        <Sparkles className="h-3 w-3 text-amber-500" />
                        {currentTier}
                      </Badge>
                      <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        Aktif
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveTab('subscription')}
                      className="text-[11px] text-[#007ACC] hover:underline font-medium cursor-pointer"
                    >
                      Kelola Paket &rarr;
                    </button>
                  </div>
                </div>

                <div>
                  <span className="text-muted-foreground block font-medium">Tanggal Dibuat:</span>
                  <span className="text-foreground mt-0.5 block">
                    {organization?.created_at
                      ? new Date(organization.created_at).toLocaleDateString('id-ID', {
                          dateStyle: 'long',
                        })
                      : '-'}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-[#EBF5FC]/60 border border-[#D0E8F8] text-[11px] text-[#475569] space-y-1.5">
                  <div className="flex items-center gap-1.5 font-semibold text-[#0F172A]">
                    <Shield className="h-3.5 w-3.5 text-[#007ACC]" />
                    <span>Multi-Tenant Guard</span>
                  </div>
                  <p className="leading-relaxed">
                    Data lokasi, tiket kerja teknisi, dan SOP perusahaan Anda terenkripsi dan terisolasi ketat di bawah organisasi ini.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ========================================================================= */}
        {/* TAB 2: PAKET & LANGGANAN (SUBSCRIPTION & BILLING) */}
        {/* ========================================================================= */}
        <TabsContent value="subscription" className="space-y-6 focus-visible:outline-none">
          <SubscriptionTab
            currentTier={currentTier}
            expiryDate={expiryDate}
            daysLeft={daysLeft}
            isExpiringSoon={isExpiringSoon}
            isExpired={isExpired}
            onOpenExtendDialog={handleOpenExtendDialog}
          />
        </TabsContent>

        {/* ========================================================================= */}
        {/* TAB 3: LAYANAN PERUSAHAAN (SERVICES CATALOG) */}
        {/* ========================================================================= */}
        <TabsContent value="services" className="space-y-6 focus-visible:outline-none">
          <Card className="shadow-sm border-border bg-card">
            <CardHeader className="pb-3 border-b border-border/50">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-[#007ACC]" />
                    Katalog Layanan Perusahaan
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Tambahkan dan kelola jenis layanan perusahaan.
                  </CardDescription>
                </div>
                <Button
                  type="button"
                  onClick={() => {
                    setServiceActionError(null)
                    resetSopBuilder()
                    setIsAddServiceOpen(true)
                  }}
                  className="h-8 text-xs font-medium bg-[#007ACC] hover:bg-[#0062A3] text-white gap-1.5 shrink-0 cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Tambah Layanan
                </Button>
              </div>
            </CardHeader>

            <CardContent className="pt-4 space-y-4 text-xs">
              {/* Quick Preset Recommendations Bar (Always accessible for remaining general services) */}
              {SERVICE_PRESETS.some((p) => !services.some((s) => s.name.toLowerCase() === p.toLowerCase())) && (
                <div className="p-3 rounded-lg bg-[#EBF5FC]/50 border border-[#007ACC]/20 flex flex-col items-start justify-between gap-2.5">
                  <div className="space-y-0.5">
                    <span className="text-[11px] font-semibold text-[#007ACC] flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5" />
                      Rekomendasi Cepat (Klik untuk menambah langsung)
                    </span>
                    <p className="text-[11px] text-muted-foreground">
                      Pilihan layanan umum siap pakai untuk katalog perusahaan Anda:
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {SERVICE_PRESETS.filter(
                      (p) => !services.some((s) => s.name.toLowerCase() === p.toLowerCase())
                    ).map((preset) => (
                      <Button
                        key={preset}
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={isPendingService}
                        onClick={() => handleAddPreset(preset)}
                        className="h-7 text-[11px] rounded-full border-border/80 hover:bg-[#EBF5FC] hover:text-[#007ACC] hover:border-[#007ACC]/40 transition-colors cursor-pointer"
                      >
                        <Plus className="h-2.5 w-2.5 mr-1" />
                        {preset}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Search & Filter Bar */}
              <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-sm">
                  <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Cari layanan berdasarkan nama atau deskripsi..."
                    value={serviceSearch}
                    onChange={(e) => setServiceSearch(e.target.value)}
                    className="h-8 text-xs pl-8 bg-background"
                  />
                </div>
                <span className="text-[11px] text-muted-foreground ml-auto">
                  Menampilkan <strong>{filteredServices.length}</strong> dari <strong>{services.length}</strong> layanan
                </span>
              </div>

              {/* Service List / Cards */}
              {filteredServices.length === 0 ? (
                <div className="py-8 px-4 text-center rounded-lg border border-dashed border-border/70 space-y-3 bg-muted/20">
                  <div className="h-10 w-10 mx-auto rounded-full bg-[#EBF5FC] text-[#007ACC] flex items-center justify-center">
                    <Briefcase className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-semibold text-sm text-foreground">
                      {serviceSearch ? 'Tidak ada layanan yang cocok' : 'Belum Ada Layanan Tersimpan'}
                    </p>
                    <p className="text-xs text-muted-foreground max-w-md mx-auto">
                      {serviceSearch
                        ? 'Coba ganti kata kunci pencarian Anda.'
                        : 'Tambahkan layanan pertama Anda atau pilih dari rekomendasi preset cepat di atas.'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredServices.map((service) => (
                    <div
                      key={service.id}
                      className={`p-3.5 rounded-lg border transition-all flex flex-col justify-between ${
                        service.is_active
                          ? 'bg-card border-border shadow-xs hover:border-[#007ACC]/40'
                          : 'bg-muted/30 border-border/50 opacity-75'
                      }`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-semibold text-xs text-foreground leading-snug">
                            {service.name}
                          </h4>
                          <Badge
                            variant={service.is_active ? 'default' : 'secondary'}
                            className={`text-[10px] px-1.5 py-0 font-normal shrink-0 ${
                              service.is_active ? 'bg-emerald-600 hover:bg-emerald-700' : ''
                            }`}
                          >
                            {service.is_active ? 'Aktif' : 'Nonaktif'}
                          </Badge>
                        </div>

                        {service.description ? (
                          <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                            {service.description}
                          </p>
                        ) : (
                          <p className="text-[11px] text-muted-foreground italic">Tidak ada deskripsi</p>
                        )}

                        {/* Badges: SOP Mode, Durasi, Tingkat Risiko */}
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          {service.sop_mode === 'strict' ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#007ACC]/10 text-[#007ACC] border border-[#007ACC]/20">
                              <ListChecks className="h-2.5 w-2.5" />
                              Strict ({Array.isArray(service.sop_items) ? service.sop_items.length : 0} langkah)
                            </span>
                          ) : service.sop_mode === 'reference' ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                              <ListChecks className="h-2.5 w-2.5" />
                              Panduan SOP ({Array.isArray(service.sop_items) ? service.sop_items.length : 0})
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                              Tanpa SOP
                            </span>
                          )}

                          {service.estimated_duration_minutes ? (
                            <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground px-1.5 py-0.5 rounded bg-muted/60">
                              <Clock className="h-2.5 w-2.5" />
                              {service.estimated_duration_minutes} mnt
                            </span>
                          ) : null}

                          {service.risk_level && service.risk_level !== 'low' ? (
                            <span
                              className={`inline-flex items-center gap-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded ${
                                service.risk_level === 'high'
                                  ? 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                                  : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                              }`}
                            >
                              <ShieldAlert className="h-2.5 w-2.5" />
                              {service.risk_level === 'high' ? 'Risiko Tinggi' : 'Risiko Sedang'}
                            </span>
                          ) : null}
                        </div>
                      </div>

                      <div className="pt-3 mt-2 border-t border-border/50 flex items-center justify-between">
                        <div>
                          {service.default_price && service.default_price > 0 ? (
                            <span className="font-semibold text-xs text-foreground">
                              Rp {Number(service.default_price).toLocaleString('id-ID')}
                            </span>
                          ) : (
                            <span className="text-[11px] text-muted-foreground">Harga Fleksibel</span>
                          )}
                        </div>

                        <div className="flex items-center gap-1">
                          {/* Toggle Active */}
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            title={service.is_active ? 'Nonaktifkan layanan' : 'Aktifkan layanan'}
                            onClick={() => handleToggleActive(service)}
                            className="h-7 w-7 text-muted-foreground hover:text-foreground"
                          >
                            <Power className={`h-3.5 w-3.5 ${service.is_active ? 'text-emerald-500' : ''}`} />
                          </Button>

                          {/* Edit */}
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            title="Edit layanan"
                            onClick={() => {
                              setServiceActionError(null)
                              resetSopBuilder(service)
                              setEditingService(service)
                            }}
                            className="h-7 w-7 text-muted-foreground hover:text-[#007ACC]"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>

                          {/* Delete */}
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            title="Hapus layanan"
                            onClick={() => setDeletingServiceId(service.id)}
                            className="h-7 w-7 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ========================================================================= */}
        {/* TAB 3: PROFIL PENGGUNA */}
        {/* ========================================================================= */}
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
                      className="h-8 text-xs font-medium bg-[#007ACC] hover:bg-[#0062A3] text-white gap-2 shadow-xs cursor-pointer"
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
          </div>
        </TabsContent>

        {/* ========================================================================= */}
        {/* TAB 4: KEAMANAN & AKSES */}
        {/* ========================================================================= */}
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
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
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
                        placeholder="Ulangi kata sandi baru"
                        required
                        className="h-8 text-xs pr-8 bg-background"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        {showConfirmPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <Button
                      type="submit"
                      disabled={isPasswordPending || !newPassword || !confirmPassword}
                      className="h-8 text-xs font-medium bg-[#007ACC] hover:bg-[#0062A3] text-white gap-2 shadow-xs cursor-pointer"
                    >
                      {isPasswordPending ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          Menyimpan...
                        </>
                      ) : (
                        'Perbarui Kata Sandi'
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Google Account SSO Card */}
            <Card className="shadow-sm border-border bg-card flex flex-col justify-between">
              <div>
                <CardHeader className="pb-3 border-b border-border/50">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <KeyRound className="h-4 w-4 text-[#007ACC]" />
                      Login Akun Google
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
                      Setelah terhubung, Anda dapat masuk ke Opilines langsung dengan satu klik tanpa perlu mengetik kata sandi.
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
                    </ul>
                  </div>
                </CardContent>
              </div>

              <div className="p-4 pt-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsGoogleModalOpen(true)}
                  className="w-full h-8 text-xs font-medium gap-2 border-border hover:bg-muted cursor-pointer"
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

      {/* ========================================================================= */}
      {/* DIALOG: TAMBAH LAYANAN */}
      {/* ========================================================================= */}
      <Dialog open={isAddServiceOpen} onOpenChange={setIsAddServiceOpen}>
        <DialogContent className="sm:max-w-xl max-h-[88vh] overflow-y-auto p-6">
          <form onSubmit={handleAddService} className="space-y-5">
            <DialogHeader className="space-y-1">
              <DialogTitle className="flex items-center gap-2 text-base font-semibold text-foreground">
                <Briefcase className="h-4 w-4 text-[#007ACC]" />
                Tambah Layanan Baru
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Atur informasi katalog layanan dan prosedur SOP teknisi.
              </DialogDescription>
            </DialogHeader>

            {serviceActionError && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 text-destructive text-xs border border-destructive/20">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{serviceActionError}</span>
              </div>
            )}

            {/* Bagian 1: Data Dasar Layanan */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="service-name-add" className="text-xs font-medium text-foreground">
                  Nama Layanan <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="service-name-add"
                  name="name"
                  required
                  placeholder="Contoh: Servis AC Split Berkala"
                  className="h-9 text-xs bg-background"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="service-price-add" className="text-xs font-medium text-foreground">
                    Tarif Standar (Rp)
                  </Label>
                  <Input
                    id="service-price-add"
                    name="defaultPrice"
                    type="number"
                    min="0"
                    step="1000"
                    placeholder="0"
                    className="h-9 text-xs bg-background"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="service-duration-add" className="text-xs font-medium text-foreground flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    Durasi Kerja (Menit)
                  </Label>
                  <Input
                    id="service-duration-add"
                    name="estimatedDurationMinutes"
                    type="number"
                    min="5"
                    max="1440"
                    step="5"
                    placeholder="60"
                    className="h-9 text-xs bg-background"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="service-risk-add" className="text-xs font-medium text-foreground flex items-center gap-1.5">
                    <ShieldAlert className="h-3.5 w-3.5 text-muted-foreground" />
                    Tingkat Risiko
                  </Label>
                  <select
                    id="service-risk-add"
                    name="riskLevel"
                    defaultValue="low"
                    className="w-full h-9 px-3 text-xs rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="low">Rendah (Standar)</option>
                    <option value="medium">Sedang (Alat Khusus)</option>
                    <option value="high">Tinggi (K3 / Kelistrikan)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="service-desc-add" className="text-xs font-medium text-foreground">
                    Deskripsi Layanan
                  </Label>
                  <Input
                    id="service-desc-add"
                    name="description"
                    placeholder="Ringkasan cakupan pekerjaan"
                    className="h-9 text-xs bg-background"
                  />
                </div>
              </div>
            </div>

            {/* Pemisah Halus */}
            <div className="border-t border-border/60 pt-1" />

            {/* Bagian 2: Pengaturan SOP */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <ListChecks className="h-4 w-4 text-[#007ACC]" />
                  Mode Prosedur Kerja (SOP)
                </Label>

                {/* Segmented Control Modern */}
                <div className="grid grid-cols-3 p-1 rounded-xl bg-muted/60 border border-border/50 text-xs font-medium gap-1">
                  <button
                    type="button"
                    onClick={() => setSopMode('none')}
                    className={`py-2 px-3 rounded-lg text-center transition-all cursor-pointer ${
                      sopMode === 'none'
                        ? 'bg-background text-foreground shadow-xs font-semibold'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Tanpa SOP
                  </button>
                  <button
                    type="button"
                    onClick={() => setSopMode('strict')}
                    className={`py-2 px-3 rounded-lg text-center transition-all cursor-pointer ${
                      sopMode === 'strict'
                        ? 'bg-[#007ACC] text-white shadow-xs font-semibold'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Wajib (Strict)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSopMode('reference')}
                    className={`py-2 px-3 rounded-lg text-center transition-all cursor-pointer ${
                      sopMode === 'reference'
                        ? 'bg-amber-600 text-white shadow-xs font-semibold'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Panduan Saja
                  </button>
                </div>
              </div>

              {/* Detail Langkah SOP */}
              {sopMode !== 'none' && (
                <div className="space-y-4 pt-1">
                  <div className="space-y-1.5">
                    <Label htmlFor="service-sop-notes-add" className="text-xs font-medium text-foreground">
                      Catatan Petunjuk Teknisi
                    </Label>
                    <Textarea
                      id="service-sop-notes-add"
                      name="sopNotes"
                      rows={2}
                      placeholder="Instruksi awal sebelum pekerjaan dimulai..."
                      className="text-xs bg-background resize-none rounded-lg"
                    />
                  </div>

                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-foreground flex items-center gap-2">
                        Langkah Prosedur
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 font-normal">
                          {sopItems.length}
                        </Badge>
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        {sopMode === 'strict' ? 'Wajib dicentang atau di-N/A' : 'Referensi informatif'}
                      </span>
                    </div>

                    {/* Daftar Langkah */}
                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                      {sopItems.length === 0 ? (
                        <div className="p-4 text-center rounded-xl border border-dashed border-border/80 text-muted-foreground text-xs bg-muted/20">
                          Belum ada langkah SOP. Tambahkan langkah pertama di bawah.
                        </div>
                      ) : (
                        sopItems.map((item, idx) => (
                          <div
                            key={item.id}
                            className={`p-3 rounded-xl border transition-all space-y-2 ${
                              item.is_critical
                                ? 'border-rose-400/40 bg-rose-500/5'
                                : 'border-border/60 bg-card/60 hover:border-border'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <span className="h-5 w-5 rounded-md bg-muted text-muted-foreground text-[10px] font-bold flex items-center justify-center shrink-0">
                                {idx + 1}
                              </span>
                              <span className="flex-1 text-xs font-medium text-foreground leading-snug">
                                {item.item}
                              </span>

                              {/* Action Toggles */}
                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  type="button"
                                  title={item.requires_photo ? 'Wajib foto bukti: Aktif' : 'Wajibkan foto bukti'}
                                  onClick={() => handleToggleSopItemField(item.id, 'requires_photo')}
                                  className={`h-6 px-2 rounded-md text-[10px] font-medium flex items-center gap-1 transition-all cursor-pointer ${
                                    item.requires_photo
                                      ? 'bg-[#007ACC] text-white shadow-2xs'
                                      : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
                                  }`}
                                >
                                  <Camera className="h-3 w-3" />
                                  <span>Foto</span>
                                </button>

                                <button
                                  type="button"
                                  title={item.is_critical ? 'Kritis K3: Aktif (Tidak dapat di-N/A)' : 'Tandai Kritis K3'}
                                  onClick={() => handleToggleSopItemField(item.id, 'is_critical')}
                                  className={`h-6 px-2 rounded-md text-[10px] font-medium flex items-center gap-1 transition-all cursor-pointer ${
                                    item.is_critical
                                      ? 'bg-rose-600 text-white shadow-2xs'
                                      : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
                                  }`}
                                >
                                  <AlertTriangle className="h-3 w-3" />
                                  <span>Kritis</span>
                                </button>

                                <button
                                  type="button"
                                  title="Tambah catatan/acuan teknis"
                                  onClick={() => setExpandedHintId(expandedHintId === item.id ? null : item.id)}
                                  className={`h-6 px-2 rounded-md text-[10px] font-medium flex items-center gap-1 transition-all cursor-pointer ${
                                    item.hint
                                      ? 'bg-amber-500/20 text-amber-800 dark:text-amber-200 border border-amber-500/30'
                                      : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
                                  }`}
                                >
                                  Hint
                                </button>

                                <button
                                  type="button"
                                  title="Hapus langkah"
                                  onClick={() => handleRemoveSopItem(item.id)}
                                  className="h-6 w-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                            </div>

                            {/* Hint Input */}
                            {(expandedHintId === item.id || item.hint) && (
                              <div className="pl-7 pr-1">
                                <Input
                                  value={item.hint || ''}
                                  onChange={(e) => handleSopItemHintChange(item.id, e.target.value)}
                                  placeholder="Acuan teknis (misal: tekanan 65–80 PSI / tegangan 220V)"
                                  className="h-7 text-[11px] bg-background"
                                />
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>

                    {/* Input Tambah Langkah */}
                    <div className="flex items-center gap-2 pt-1">
                      <Input
                        value={newSopItemText}
                        onChange={(e) => setNewSopItemText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            handleAddSopItem()
                          }
                        }}
                        placeholder="Tulis langkah SOP lalu tekan Enter..."
                        className="h-9 text-xs bg-background flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleAddSopItem}
                        disabled={!newSopItemText.trim()}
                        className="h-9 px-3 text-xs shrink-0 gap-1.5 border-border hover:bg-muted cursor-pointer"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Tambah
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter className="gap-2 sm:gap-2 pt-4 border-t border-border/50">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddServiceOpen(false)}
                className="h-9 text-xs cursor-pointer px-4"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isPendingService}
                className="h-9 text-xs bg-[#007ACC] hover:bg-[#0062A3] text-white gap-2 cursor-pointer px-4 shadow-xs"
              >
                {isPendingService ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  'Simpan Layanan'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* DIALOG: EDIT LAYANAN */}
      {/* ========================================================================= */}
      <Dialog open={!!editingService} onOpenChange={(open) => !open && setEditingService(null)}>
        <DialogContent className="sm:max-w-xl max-h-[88vh] overflow-y-auto p-6">
          {editingService && (
            <form onSubmit={handleUpdateService} className="space-y-5">
              <input type="hidden" name="id" value={editingService.id} />
              <DialogHeader className="space-y-1">
                <DialogTitle className="flex items-center gap-2 text-base font-semibold text-foreground">
                  <Pencil className="h-4 w-4 text-[#007ACC]" />
                  Ubah Layanan & SOP
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Perbarui informasi layanan dan prosedur kerja teknisi.
                </DialogDescription>
              </DialogHeader>

              {serviceActionError && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 text-destructive text-xs border border-destructive/20">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{serviceActionError}</span>
                </div>
              )}

              {/* Bagian 1: Data Dasar Layanan */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="service-name-edit" className="text-xs font-medium text-foreground">
                    Nama Layanan <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="service-name-edit"
                    name="name"
                    required
                    defaultValue={editingService.name}
                    placeholder="Contoh: Servis AC Split Berkala"
                    className="h-9 text-xs bg-background"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="service-price-edit" className="text-xs font-medium text-foreground">
                      Tarif Standar (Rp)
                    </Label>
                    <Input
                      id="service-price-edit"
                      name="defaultPrice"
                      type="number"
                      min="0"
                      step="1000"
                      defaultValue={editingService.default_price || 0}
                      placeholder="0"
                      className="h-9 text-xs bg-background"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="service-duration-edit" className="text-xs font-medium text-foreground flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                      Durasi Kerja (Menit)
                    </Label>
                    <Input
                      id="service-duration-edit"
                      name="estimatedDurationMinutes"
                      type="number"
                      min="5"
                      max="1440"
                      step="5"
                      defaultValue={editingService.estimated_duration_minutes || ''}
                      placeholder="60"
                      className="h-9 text-xs bg-background"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="service-risk-edit" className="text-xs font-medium text-foreground flex items-center gap-1.5">
                      <ShieldAlert className="h-3.5 w-3.5 text-muted-foreground" />
                      Tingkat Risiko
                    </Label>
                    <select
                      id="service-risk-edit"
                      name="riskLevel"
                      defaultValue={editingService.risk_level || 'low'}
                      className="w-full h-9 px-3 text-xs rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="low">Rendah (Standar)</option>
                      <option value="medium">Sedang (Alat Khusus)</option>
                      <option value="high">Tinggi (K3 / Kelistrikan)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="service-desc-edit" className="text-xs font-medium text-foreground">
                      Deskripsi Layanan
                    </Label>
                    <Input
                      id="service-desc-edit"
                      name="description"
                      defaultValue={editingService.description || ''}
                      placeholder="Ringkasan cakupan pekerjaan"
                      className="h-9 text-xs bg-background"
                    />
                  </div>
                </div>
              </div>

              {/* Pemisah Halus */}
              <div className="border-t border-border/60 pt-1" />

              {/* Bagian 2: Pengaturan SOP */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <ListChecks className="h-4 w-4 text-[#007ACC]" />
                    Mode Prosedur Kerja (SOP)
                  </Label>

                  {/* Segmented Control Modern */}
                  <div className="grid grid-cols-3 p-1 rounded-xl bg-muted/60 border border-border/50 text-xs font-medium gap-1">
                    <button
                      type="button"
                      onClick={() => setSopMode('none')}
                      className={`py-2 px-3 rounded-lg text-center transition-all cursor-pointer ${
                        sopMode === 'none'
                          ? 'bg-background text-foreground shadow-xs font-semibold'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      Tanpa SOP
                    </button>
                    <button
                      type="button"
                      onClick={() => setSopMode('strict')}
                      className={`py-2 px-3 rounded-lg text-center transition-all cursor-pointer ${
                        sopMode === 'strict'
                          ? 'bg-[#007ACC] text-white shadow-xs font-semibold'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      Wajib (Strict)
                    </button>
                    <button
                      type="button"
                      onClick={() => setSopMode('reference')}
                      className={`py-2 px-3 rounded-lg text-center transition-all cursor-pointer ${
                        sopMode === 'reference'
                          ? 'bg-amber-600 text-white shadow-xs font-semibold'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      Panduan Saja
                    </button>
                  </div>
                </div>

                {/* Detail Langkah SOP */}
                {sopMode !== 'none' && (
                  <div className="space-y-4 pt-1">
                    <div className="space-y-1.5">
                      <Label htmlFor="service-sop-notes-edit" className="text-xs font-medium text-foreground">
                        Catatan Petunjuk Teknisi
                      </Label>
                      <Textarea
                        id="service-sop-notes-edit"
                        name="sopNotes"
                        rows={2}
                        defaultValue={editingService.sop_notes || ''}
                        placeholder="Instruksi awal sebelum pekerjaan dimulai..."
                        className="text-xs bg-background resize-none rounded-lg"
                      />
                    </div>

                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-foreground flex items-center gap-2">
                          Langkah Prosedur
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 font-normal">
                            {sopItems.length}
                          </Badge>
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          {sopMode === 'strict' ? 'Wajib dicentang atau di-N/A' : 'Referensi informatif'}
                        </span>
                      </div>

                      {/* Daftar Langkah */}
                      <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                        {sopItems.length === 0 ? (
                          <div className="p-4 text-center rounded-xl border border-dashed border-border/80 text-muted-foreground text-xs bg-muted/20">
                            Belum ada langkah SOP. Tambahkan langkah pertama di bawah.
                          </div>
                        ) : (
                          sopItems.map((item, idx) => (
                            <div
                              key={item.id}
                              className={`p-3 rounded-xl border transition-all space-y-2 ${
                                item.is_critical
                                ? 'border-rose-400/40 bg-rose-500/5'
                                : 'border-border/60 bg-card/60 hover:border-border'
                              }`}
                            >
                              <div className="flex items-center gap-2.5">
                                <span className="h-5 w-5 rounded-md bg-muted text-muted-foreground text-[10px] font-bold flex items-center justify-center shrink-0">
                                  {idx + 1}
                                </span>
                                <span className="flex-1 text-xs font-medium text-foreground leading-snug">
                                  {item.item}
                                </span>

                                {/* Action Toggles */}
                                <div className="flex items-center gap-1 shrink-0">
                                  <button
                                    type="button"
                                    title={item.requires_photo ? 'Wajib foto bukti: Aktif' : 'Wajibkan foto bukti'}
                                    onClick={() => handleToggleSopItemField(item.id, 'requires_photo')}
                                    className={`h-6 px-2 rounded-md text-[10px] font-medium flex items-center gap-1 transition-all cursor-pointer ${
                                      item.requires_photo
                                        ? 'bg-[#007ACC] text-white shadow-2xs'
                                        : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
                                    }`}
                                  >
                                    <Camera className="h-3 w-3" />
                                    <span>Foto</span>
                                  </button>

                                  <button
                                    type="button"
                                    title={item.is_critical ? 'Kritis K3: Aktif (Tidak dapat di-N/A)' : 'Tandai Kritis K3'}
                                    onClick={() => handleToggleSopItemField(item.id, 'is_critical')}
                                    className={`h-6 px-2 rounded-md text-[10px] font-medium flex items-center gap-1 transition-all cursor-pointer ${
                                      item.is_critical
                                        ? 'bg-rose-600 text-white shadow-2xs'
                                        : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
                                    }`}
                                  >
                                    <AlertTriangle className="h-3 w-3" />
                                    <span>Kritis</span>
                                  </button>

                                  <button
                                    type="button"
                                    title="Tambah catatan/acuan teknis"
                                    onClick={() => setExpandedHintId(expandedHintId === item.id ? null : item.id)}
                                    className={`h-6 px-2 rounded-md text-[10px] font-medium flex items-center gap-1 transition-all cursor-pointer ${
                                      item.hint
                                        ? 'bg-amber-500/20 text-amber-800 dark:text-amber-200 border border-amber-500/30'
                                        : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
                                    }`}
                                  >
                                    Hint
                                  </button>

                                  <button
                                    type="button"
                                    title="Hapus langkah"
                                    onClick={() => handleRemoveSopItem(item.id)}
                                    className="h-6 w-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                </div>
                              </div>

                              {/* Hint Input */}
                              {(expandedHintId === item.id || item.hint) && (
                                <div className="pl-7 pr-1">
                                  <Input
                                    value={item.hint || ''}
                                    onChange={(e) => handleSopItemHintChange(item.id, e.target.value)}
                                    placeholder="Acuan teknis (misal: tekanan 65–80 PSI / tegangan 220V)"
                                    className="h-7 text-[11px] bg-background"
                                  />
                                </div>
                              )}
                            </div>
                          ))
                        )}
                      </div>

                      {/* Input Tambah Langkah */}
                      <div className="flex items-center gap-2 pt-1">
                        <Input
                          value={newSopItemText}
                          onChange={(e) => setNewSopItemText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              handleAddSopItem()
                            }
                          }}
                          placeholder="Tulis langkah SOP lalu tekan Enter..."
                          className="h-9 text-xs bg-background flex-1"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleAddSopItem}
                          disabled={!newSopItemText.trim()}
                          className="h-9 px-3 text-xs shrink-0 gap-1.5 border-border hover:bg-muted cursor-pointer"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          Tambah
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter className="gap-2 sm:gap-2 pt-4 border-t border-border/50">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingService(null)}
                  className="h-9 text-xs cursor-pointer px-4"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={isPendingService}
                  className="h-9 text-xs bg-[#007ACC] hover:bg-[#0062A3] text-white gap-2 cursor-pointer px-4 shadow-xs"
                >
                  {isPendingService ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    'Perbarui Layanan'
                  )}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* DIALOG: KONFIRMASI HAPUS LAYANAN */}
      {/* ========================================================================= */}
      <Dialog open={!!deletingServiceId} onOpenChange={(open) => !open && setDeletingServiceId(null)}>
        <DialogContent className="sm:max-w-md p-6 space-y-4 rounded-2xl">
          <DialogHeader className="space-y-1">
            <DialogTitle className="flex items-center gap-2 text-base font-semibold text-destructive">
              <Trash2 className="h-4 w-4" />
              Hapus Layanan
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Layanan ini akan dihapus dari katalog. Riwayat tiket kerja sebelumnya tidak akan terpengaruh.
            </DialogDescription>
          </DialogHeader>

          {deletingServiceId && (
            <div className="p-3.5 rounded-xl bg-destructive/5 border border-destructive/20 text-xs font-medium text-foreground">
              {services.find((s) => s.id === deletingServiceId)?.name || 'Layanan Terpilih'}
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-2 pt-2 flex items-center justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeletingServiceId(null)}
              className="h-9 text-xs px-4 rounded-lg cursor-pointer"
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={isPendingService}
              onClick={() => deletingServiceId && handleDeleteService(deletingServiceId)}
              className="h-9 text-xs px-4 rounded-lg cursor-pointer"
            >
              {isPendingService ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                  Menghapus...
                </>
              ) : (
                'Hapus Layanan'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* GOOGLE SSO DIALOG */}
      {/* ========================================================================= */}
      <Dialog open={isGoogleModalOpen} onOpenChange={setIsGoogleModalOpen}>
        <DialogContent className="sm:max-w-md p-6 space-y-4 rounded-2xl">
          <DialogHeader className="space-y-1">
            <DialogTitle className="flex items-center gap-2 text-base font-semibold text-foreground">
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
              Login Akun Google
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Integrasi masuk cepat dan aman menggunakan satu akun Google.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-1 text-xs">
            <div className="p-3.5 rounded-xl bg-primary/5 border border-primary/20 flex items-start gap-3">
              <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="font-semibold text-foreground text-xs">Segera Hadir</p>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Fitur Single Sign-On (SSO) Google sedang disiapkan untuk rilis versi mendatang.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-muted/40 border border-border/60 flex items-center justify-between">
              <span className="text-muted-foreground text-xs">Email Terdaftar:</span>
              <span className="font-mono text-xs font-semibold text-foreground">{initialProfile.email}</span>
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              onClick={() => setIsGoogleModalOpen(false)}
              className="h-9 text-xs px-5 bg-[#007ACC] hover:bg-[#0062A3] text-white rounded-lg cursor-pointer"
            >
              Mengerti
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* POPUP PERIODE CHOICE: EXTEND SUBSCRIPTION MODAL */}
      {/* ========================================================================= */}
      <ExtendSubscriptionDialog
        open={isExtendModalOpen}
        onOpenChange={setIsExtendModalOpen}
        currentTier={currentTier}
        targetTier={targetTier}
        currentExpiryDate={expiryDate}
        onExtendSuccess={handleExtendSuccess}
      />
    </div>
  )
}
