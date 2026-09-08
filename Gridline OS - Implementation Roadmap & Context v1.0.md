# Gridline OS — Implementation Roadmap & Context v1.0

> Tujuan dokumen ini: **mencegah kehilangan konteks** antar sesi kerja.
> Bacaan wajib sebelum lanjut implementasi: dokumen berikut + file ini.
> Konteks project: B2B SaaS Field Service Management, multi-tenant.

---

## 1. Status umum

| Fase | Status |
|---|---|
| Fase 1 — Audit dokumen & keputusan produk | ✅ SELESAI |
| Fase 2 — Scaffolding project (Next.js + deps + shadcn + fondasi) | ✅ SELESAI (build & lint hijau) |
| Fase 3 — Database: migrasi schema + RLS + trigger + storage | ✅ SELESAI (Terverifikasi live via MCP Supabase) |
| Fase 4 — Auth: signup org, login, invite, RBAC UI | ✅ SELESAI (Semua route & actions lolos build) |
| Fase 5 — Job lifecycle inti | ✅ SELESAI (CRUD customer, job numbering GL-XXXX, scheduling, dispatch) |
| Fase 6 — Completion & evidence (foto/ttd/report) | ✅ SELESAI (Check-in GPS, SOP checklist, storage bukti, e-signature, 5-gate completion) |
| Fase 7 — Dashboard/reporting, production hardening | ✅ SELESAI (Recharts executive dashboard, profile & monitoring, 100% build & lint clean) |
| Fase 8 — E2E Verification & Demo Seeding | ✅ SELESAI (10 jobs, 5-gate trigger live tested, storage evidence, sample accounts) |
| Fase 9 — Fitur Operasional v1.1 (BAP, WhatsApp, History, Export, SLA, Form Draft) | ✅ SELESAI (PDF BAP, wa.me actions, customer detail, CSV UTF-8, SLA badge, state auto-save) |
| Fase 10.1 — Supabase Realtime (Dispatch & Monitoring) | ✅ SELESAI (Publikasi Postgres, live indicator, auto-sync, toast alert, filter) |
| Fase 10.2 — Transactional Email Provider (Resend Integration) | ✅ SELESAI (Resend SDK, template HTML responsif, auto invite, resend token, forgot/reset password, dev sandbox) |
| Fase 10.3 — PWA Mobile Teknisi Lapangan | ✅ SELESAI (Web App Manifest, standalone mode, dynamic icons, install banner prompt, offline detection, service worker) |
| Fase 10.4 — Modul Performa & Komisi Teknisi | ✅ SELESAI (Leaderboard, KPI on-time rate, durasi lapangan, skema komisi & bonus SLA, modal rincian per tiket, kartu teknisi) |
| Fase 10.5 — Customer Asset & Equipment Tracking | ✅ SELESAI (Serial number, garansi, relasi tiket servis, spec banner, BAP PDF integration) |
| Fase 10.6 — Desain UI/UX Interface Teknisi & Tool Lapangan | ✅ SELESAI (Gridline Blue #007ACC design token, BottomNav 3-tab, FiveGate visual tracker, Quick Action tray Maps/Call, modul Komisi Saya, hero job card, mobile-first Fitts's law touch targets) |





**Aturan emas:** tidak sekaligus besar — migrasi bertahap, direview per langkah;
uji isolasi 2 tenant WAJIB sebelum bangun UI besar.

---

## 2. Dokumen sumber (source of truth — jangan diubah tanpa approval)

| File | Isi | Peran |
|---|---|---|
| `Gridline OS - Decision Log v1.0.md` | 9 keputusan final | **Source of truth teknis** |
| `Gridline OS - ERD - Database Schema v1.0.md` | Schema v1.1 multi-tenant | Dasar migrations SQL |
| `Gridline OS - PRD v1.0.md` | Requirement produk | Sumber persyaratan |
| `Gridline OS - MVP v1.0 - Feature Description.md` | Scope MVP | Batas scope |
| `Gridline OS - MoSCoW Framework - All Version.md` | Prioritas fitur | Panduan urutan |
| `Gridline OS - IA & User Flow v1.1 - Onboarding & Provisioning Appendix.md` | Alur signup/invite | Lampiran (tidak ubah IA v1.0) |
| `Gridline OS - Information Architecture & User Flow v1.0.md` | Struktur halaman/navigasi | Panduan route |
| Prinsip desain di `GridlineOS - DesignGuidelines.md` | Visual/UX | Panduan UI |

Catatan audit: dokumen lama menyebut brand "FieldOps"/"GridlineOS"/"GRIDLINE" —
**brand resmi = Gridline OS**.

---

## 3. Keputusan kunci (ringkasan dari Decision Log v1.0)

1. **Brand**: Gridline OS.
2. **Provisioning**: self-serve signup (buat org + admin pertama) + invite-by-email
   (admin buat user: email + role → token **24 jam single-use** → user set password
   sendiri; admin tidak pernah tahu password). Token: `INVITE.expiresInHours = 24`.
3. **job_number** per-org, format `GL-0001`, `UNIQUE(org_id, job_number)`.
4. **Completion gate** = 4 syarat PRD: checklist + before photo + after photo +
   signature + report; **check-out BUKAN gate**.
5. **Teknisi hanya melihat customer** dalam konteks job yang ditugaskan.
6. **Cancellation**: admin saja + wajib alasan (`cancelled_at`, `cancelled_by`,
   `cancellation_reason`).
7. **Edit job**: hanya status Pending/Assigned/On Progress.
8. **Foto evidence**: banyak per tipe, min 1 each, cap **10/tipe/job**
   (`PHOTO.maxPerTypePerJob`).
9. **Route**: role-specific area (admin/technician/owner) + login terpisah.

---

## 4. Arsitektur keamanan (ringkasan teknis — wajib diikuti)

- **RLS role-aware** dengan helper SQL: `get_user_org_id()` & `get_user_role()`
  (SECURITY DEFINER).
- Technician: SELECT hanya job dengan `technician_id = auth.uid()` + org sama.
- Admin/owner: CRUD dalam org sendiri, `WITH CHECK`.
- **TIDAK ada** policy DELETE untuk data operasional.
- Trigger kesamaan org parent–child: `fn_assert_child_org`.
- Overlap jadwal technician: `EXCLUDE USING gist` (extension `btree_gist`).
- Status transition dibatasi trigger + completion gate.
- **Storage**: bucket private `job-files`, path
  `{org_id}/{job_id}/before|after|signature/`; DB simpan **path** (bukan URL);
  baca via **signed URL server-side**.
- **Error handling**: 401 → redirect `/login`; role salah / resource di luar akses
  → `notFound()` (404, anti-enumeration); 400/422 dari Zod.

---

## 5. Stack & struktur yang sudah terpasang

- Next.js **16.3.4** (App Router, Turbopack), React **19**, TypeScript, Tailwind **v4**,
  shadcn/ui (Radix), ESLint. Node v26, pnpm 11.
- Deps: `@supabase/supabase-js`, `@supabase/ssr`, TanStack Query, Zustand,
  react-hook-form, zod, @hookform/resolvers, date-fns, lucide-react, framer-motion,
  recharts, `server-only`.
- Struktur fondasi (sudah dibuat, build & lint sukses):

```
proxy.ts                    session refresh + redirect unauthenticated (optimistic saja)
lib/supabase/env.ts         guard env wajib (requireEnv)
lib/supabase/client.ts      browser client (anon key)
lib/supabase/server.ts      server client berbasis cookies (RSC / server actions)
lib/supabase/admin.ts       service-role client (server-only, tidak pernah ke browser)
lib/auth.ts                 DAL: getSessionProfile / requireUser / requireRole (react cache)
lib/rbac.ts                 role: owner | admin | technician, roleHome
lib/constants.ts            STORAGE / PHOTO / JOB_NUMBER / INVITE
app/page.tsx                "/" → redirect ke role home atau /login
.env.example                template (secret tidak pernah masuk git)
supabase/migrations/        placeholder (SQL diisi di Fase 3)
```

---

## 6. Konvensi kode yang diadopsi (Next.js 16)

1. **Middleware → `proxy.ts`** (Next 16 menghapus nama `middleware`). Proxy hanya
   cek optimistik (cookie/session), **jangan** query DB di proxy.
2. **Otorisasi ketat** dilakukan di DAL/server component/action dekat sumber data.
3. **Server Actions wajib re-check autorisasi** (tidak percaya UI).
4. DAL pakai `cache()` dari `react` (pola Next docs, lihat
   `node_modules/next/dist/docs/`).
5. Mutasi selalu lewat validation Zod di server; secret hanya di server.
6. Sebelum menulis kode Next: **baca guide relevan di `node_modules/next/dist/docs/`**
   (diwajibkan `AGENTS.md`).

---

## 7. Roadmap (urutan eksekusi)

### Fase 3 — Database (berikutnya)
1. Migrasi `0001_schema.sql`: extension, enums, tabel (organizations, profiles,
   customers, jobs, job_photos, completion, cancellation fields, invite_tokens,
   job_sequence) + index + constraint sesuai ERD v1.1.
2. Migrasi `0002_rls.sql`: helper `get_user_org_id`/`get_user_role`, seluruh policy
   role-aware, `fn_assert_child_org`, check constraint, trigger status gate.
3. Migrasi `0003_storage.sql`: bucket private `job-files` + aturan path.
4. Uji isolasi 2 tenant + status transition (SQL test file) — WAJIB hijau dulu.

### Fase 4 — Auth & onboarding
1. `.env.local` real (URL, anon key, service role key dari Supabase).
2. Halaman `/login`, `/register` (self-serve org), `accept-invite`.
3. Server actions: `signUp`, `signIn`, `acceptInvite` (validasi Zod, token single-use).
4. Layout per-role (`requireRole` → 404 anti-enumeration), shell UI (sidebar/header).
5. Email provider integration untuk invite/reset (butuh keputusan provider).

### Fase 5 — Job lifecycle inti
CRUD job (admin) dengan job_number sequence per-org, assignment, update status
sesuai Decision #7, jadwal + overlap guard di DB, daftar job (admin & technician).

### Fase 6 — Completion & evidence
Checklist + upload foto before/after/signature (cap 10/tipe), report, 4-gate
completion, penolakan/request-info bila perlu. Storage signed URL server-side.

### Fase 7 — Hardening & ops
Dashboard/reporting (recharts), audit trail/cancellation log, observability,
konfigurasi email produksi.

### Fase 8 — E2E Verification & Demo Seeding (SELESAI)
10 jobs simulasi seluruh siklus, verifikasi 5-gate completion trigger, storage foto
evidence, dan testing akun multi-tenant.

### Fase 9 — Fitur Operasional Lapangan v1.1 (SELESAI)
1. **BAP PDF Generator**: Dokumen resmi Berita Acara Pekerjaan dengan layout cetak A4,
   e-signature, foto before/after, checklist SOP, dan info unit.
2. **WhatsApp Quick Dispatch & Customer Updates**: Modal komunikasi `wa.me` dengan
   template pesan resmi (Jadwal, OTW/Menuju Lokasi, Selesai Servis, Disposisi Teknisi).
3. **Riwayat Servis Pelanggan (Customer Service History)**: Halaman detail `/admin/customers/[id]`
   dengan statistik pekerjaan, ringkasan kontak, dan riwayat servis komprehensif.
4. **Ekspor Laporan Excel/CSV**: Ekspor rekapitulasi data pekerjaan ber-encoding UTF-8 BOM.
5. **SLA Monitoring**: Indikator visual pintar (Overdue berkedip, Mendekati Batas, On-Time).
6. **Robust UUID Regex & Form State Auto-Save**: Dukungan UUID PostgreSQL dan auto-save draft
   `sessionStorage` agar progres input form tidak pernah hilang saat terjadi error/reload.

### Fase 10 — Next Implementations (Eksekusi Fitur Skalabilitas & Mobile)

#### 10.1 Supabase Realtime di Dispatch Board & Job Monitoring (✅ SELESAI)
- **Database Publication & Replica Identity**:
  - `ALTER TABLE public.jobs REPLICA IDENTITY FULL;`
  - `ALTER TABLE public.schedules REPLICA IDENTITY FULL;`
  - `ALTER TABLE public.job_attendance REPLICA IDENTITY FULL;`
  - Tabel `jobs`, `schedules`, dan `job_attendance` didaftarkan ke publication `supabase_realtime` via MCP Supabase.
- **Client Architecture & Hook**:
  - Hook [`useRealtimeJobs`](file:///C:/Users/adity/Downloads/gridlineos/components/realtime/use-realtime-jobs.ts) dengan filter per-tenant `org_id=eq.${orgId}` atau `technician_id=eq.${technicianId}`.
  - Notifikasi Toast instan via Sonner saat job baru dibuat, status pengerjaan berubah (`on_progress`, `completed`, `cancelled`), atau teknisi check-in GPS.
  - Auto-sync state dengan `useTransition` dan `router.refresh()` tanpa full-page flash.
- **UI Components & Integrasi**:
  - Komponen [`RealtimeIndicator`](file:///C:/Users/adity/Downloads/gridlineos/components/realtime/realtime-indicator.tsx) dengan pulsing live status dot & tombol refresh manual.
  - Komponen drop-in [`RealtimeJobsListener`](file:///C:/Users/adity/Downloads/gridlineos/components/realtime/realtime-jobs-listener.tsx).
  - Papan dispatch interaktif [`DispatchView`](file:///C:/Users/adity/Downloads/gridlineos/app/%28dashboard%29/admin/dispatch/dispatch-view.tsx) dengan pencarian teknisi, indikator status kerja (*Sedang Bertugas*), dan sinkronisasi real-time.
  - Terintegrasi di: **Dispatch Board** (`/admin/dispatch`), **Admin Dashboard** (`/admin`), **Daftar Pekerjaan** (`/admin/jobs`), dan **Tugas Lapangan Teknisi** (`/technician`).

#### 10.2 Integrasi Transactional Email Provider Resend (✅ SELESAI)
- **Transport Layer & Client SDK**:
  - Pemasangan package resmi `resend` v6.x.
  - Modul [`lib/email/client.ts`](file:///C:/Users/adity/Downloads/gridlineos/lib/email/client.ts) dengan dukungan `sendTransactionalEmail`, parsing plain-text otomatis, dan **Dev Sandbox Fallback** (mencetak output preview ke console saat API key belum dipasang di lokal).
- **Template Email Responsif Gridline OS**:
  - Template undangan tim [`invite-email.ts`](file:///C:/Users/adity/Downloads/gridlineos/lib/email/templates/invite-email.ts) (header branding Gridline OS, nama pengundang, nama perusahaan, role, tombol CTA aktivasi, masa berlaku token 24 jam).
  - Template pemulihan akun [`reset-password-email.ts`](file:///C:/Users/adity/Downloads/gridlineos/lib/email/templates/reset-password-email.ts) (tombol CTA reset sandi 60 menit, pengaman anti-pishing).
- **Otomasi Tindakan & UI**:
  - Otomatis kirim email saat admin mengundang anggota baru via [`createInviteAction`](file:///C:/Users/adity/Downloads/gridlineos/app/actions/team.ts) dengan fallback copy link.
  - Penambahan tombol **Kirim Ulang Email (Resend Invite)** di tabel daftar undangan tertunda ([`app/(dashboard)/admin/technicians/page.tsx`](file:///C:/Users/adity/Downloads/gridlineos/app/%28dashboard%29/admin/technicians/page.tsx)).
  - Halaman dan alur **Lupa Password** lengkap: [`/forgot-password`](file:///C:/Users/adity/Downloads/gridlineos/app/%28auth%29/forgot-password/page.tsx) dan [`/reset-password`](file:///C:/Users/adity/Downloads/gridlineos/app/%28auth%29/reset-password/page.tsx) dengan proteksi anti-enumeration.
- **Konfigurasi Environment**:
  - Disediakan variabel `RESEND_API_KEY`, `EMAIL_FROM="Gridline OS <noreply@sublims.id>"`, dan `NEXT_PUBLIC_APP_URL` pada [`.env.example`](file:///C:/Users/adity/Downloads/gridlineos/.env.example).

#### 10.3 PWA (Progressive Web App) untuk Teknisi Lapangan (✅ SELESAI)
- **Web App Manifest & Metadata**:
  - Konfigurasi [`app/manifest.ts`](file:///C:/Users/adity/Downloads/gridlineos/app/manifest.ts) rute statis `/manifest.webmanifest`.
  - Mode tampilan `display: "standalone"`, `orientation: "portrait-primary"`, tema `#0f172a`.
  - Shortcuts akses cepat ke *Tugas Lapangan* dan *Profil Saya*.
- **Icon Suite Dinamis & Statis**:
  - Dynamic App Icon route [`app/icon.tsx`](file:///C:/Users/adity/Downloads/gridlineos/app/icon.tsx) (192x192 via `@vercel/og` ImageResponse).
  - Dynamic Apple Touch Icon route [`app/apple-icon.tsx`](file:///C:/Users/adity/Downloads/gridlineos/app/apple-icon.tsx) (180x180 via `@vercel/og`).
  - Berkas icon statis `public/icons/` (`icon.svg`, `icon-192.png`, `icon-512.png`, `apple-touch-icon.png`).
- **Komponen Instalasi & Pengalaman Lapangan**:
  - Banner installer pintar [`InstallPrompt`](file:///C:/Users/adity/Downloads/gridlineos/components/pwa/install-prompt.tsx) dengan deteksi browser Android (`beforeinstallprompt`) dan instruksi Safari iOS.
  - Bar pemantau koneksi internet [`OfflineIndicator`](file:///C:/Users/adity/Downloads/gridlineos/components/pwa/offline-indicator.tsx) berbasis `useSyncExternalStore` (React 19).
  - Service worker [`public/sw.js`](file:///C:/Users/adity/Downloads/gridlineos/public/sw.js) dan pendaftaran [`sw-register.tsx`](file:///C:/Users/adity/Downloads/gridlineos/components/pwa/sw-register.tsx).

#### 10.4 Modul Performa & Komisi Teknisi (✅ SELESAI)
- **Mesin Kalkulasi & Utility Insentif**:
  - Modul [`lib/commission.ts`](file:///C:/Users/adity/Downloads/gridlineos/lib/commission.ts):
    - Skema komisi dasar per service type (Maintenance, Perbaikan, Instalasi, Survey).
    - Ekstra bonus SLA On-Time bagi pekerjaan yang selesai sebelum/pada batas waktu jadwal.
    - Kalkulasi durasi kerja nyata (selisih check-in GPS ke 5-gate completion).
    - Agregator statistik seluruh teknisi (`calculateAllTechniciansMetrics`).
- **Antarmuka Tab Admin Console (`/admin/technicians`)**:
  - **Tab 1: Tim & Akses**: Manajemen daftar anggota tim dan pemantauan token undangan tertunda dengan tombol kirim ulang.
  - **Tab 2: Performa & SLA ([`technician-performance-tab.tsx`](file:///C:/Users/adity/Downloads/gridlineos/components/team/technician-performance-tab.tsx))**:
    - Kartu KPI: Total Job Selesai, Rata-rata SLA On-Time, Teknisi Teraktif, Total Teknisi.
    - Leaderboard peringkat tim lapangan (medali 🥇 🥈 🥉).
    - Tabel performa detail dengan progress bar ketepatan SLA dan rata-rata durasi kerja.
  - **Tab 3: Rekap Komisi ([`technician-commission-tab.tsx`](file:///C:/Users/adity/Downloads/gridlineos/components/team/technician-commission-tab.tsx))**:
    - Akumulasi total komisi berhak cair tim dalam format Rupiah.
    - Rincian komisi dasar vs bonus SLA per teknisi.
    - Modal dialog breakdown per tiket ([`technician-commission-dialog.tsx`](file:///C:/Users/adity/Downloads/gridlineos/components/team/technician-commission-dialog.tsx)) menampilkan riwayat job tuntas dan insentif yang diperoleh.
- **Kartu Pencapaian Mandiri di HP Teknisi**:
  - Beranda teknisi ([`app/(dashboard)/technician/page.tsx`](file:///C:/Users/adity/Downloads/gridlineos/app/%28dashboard%29/technician/page.tsx)) menampilkan ringkasan pencapaian personal (jumlah job tuntas & akumulasi estimasi insentif terverifikasi).

#### 10.5 Pelacakan Unit & Aset Pelanggan (Customer Asset / Equipment Tracking) (✅ SELESAI)
- **Fondasi Skema Database & Realtime Supabase**:
  - Tabel `public.customer_assets` dengan kolom: `id`, `org_id`, `customer_id`, `asset_name`, `brand`, `model_number`, `serial_number`, `location_tag`, `installation_date`, `warranty_expires_at`, `status` (`operational`, `needs_service`, `broken`, `decommissioned`), `notes`, `created_at`, `updated_at`.
  - Foreign key relasi `public.jobs.asset_id` (nullable) mengacu ke `customer_assets(id)` dengan `ON DELETE SET NULL`.
  - Indeks performa: `idx_customer_assets_org_id`, `idx_customer_assets_customer_id`, `idx_customer_assets_status`, `idx_jobs_asset_id`.
  - Row Level Security (RLS) multi-tenant policies: `assets_admin_all`, `assets_staff_select`, `assets_technician_select`.
  - Realtime publication `supabase_realtime` + `REPLICA IDENTITY FULL`.
  - Migrasi lokal terdokumentasi di [`supabase/migrations/20260908202000_customer_assets.sql`](file:///C:/Users/adity/Downloads/gridlineos/supabase/migrations/20260908202000_customer_assets.sql) dan live diaplikasikan via Supabase API.
- **Server Actions & Validasi Zod**:
  - Berkas [`app/actions/assets.ts`](file:///C:/Users/adity/Downloads/gridlineos/app/actions/assets.ts) (`createCustomerAssetAction`, `updateCustomerAssetAction`, `getCustomerAssets`) dengan otorisasi ketat berbasis `requireUser`/`requireRole`.
  - Berkas [`app/actions/jobs.ts`](file:///C:/Users/adity/Downloads/gridlineos/app/actions/jobs.ts) diperbarui untuk menerima dan memproses `assetId` opsional pada `createJobAction`.
- **Antarmuka Tab Aset Pelanggan**:
  - Halaman profil klien ([`app/(dashboard)/admin/customers/[id]/page.tsx`](file:///C:/Users/adity/Downloads/gridlineos/app/%28dashboard%29/admin/customers/%5Bid%5D/page.tsx)) dilengkapi kartu KPI unit terdaftar dan tabulasi ganda:
    - **Tab 1: Unit Mesin / Aset ([`customer-assets-tab.tsx`](file:///C:/Users/adity/Downloads/gridlineos/components/customers/customer-assets-tab.tsx))**: Menampilkan tabel mesin terpasang, nomor model, serial number, status garansi aktif/expired, status operasional, serta tombol shortcut *Servis* dan *Edit*.
    - **Tab 2: Riwayat Servis**: Log penugasan dan perbaikan khusus untuk pelanggan tersebut.
  - Dialog registrasi & pembaruan unit peralatan ([`asset-dialog.tsx`](file:///C:/Users/adity/Downloads/gridlineos/components/customers/asset-dialog.tsx)).
- **Integrasi Tiket Servis & Work Order**:
  - Form buat job baru ([`create-job-form.tsx`](file:///C:/Users/adity/Downloads/gridlineos/app/%28dashboard%29/admin/jobs/new/create-job-form.tsx)) otomatis memfilter unit mesin berdasarkan customer yang dipilih dan menampilkan ringkasan spesifikasi unit (Merk, Model, S/N, Lokasi).
  - Admin Job Detail ([`app/(dashboard)/admin/jobs/[id]/page.tsx`](file:///C:/Users/adity/Downloads/gridlineos/app/%28dashboard%29/admin/jobs/%5Bid%5D/page.tsx)) menampilkan kartu detail unit mesin & indikator masa garansi.
  - Mobile Job View Teknisi ([`app/(dashboard)/technician/jobs/[id]/page.tsx`](file:///C:/Users/adity/Downloads/gridlineos/app/%28dashboard%29/technician/jobs/%5Bid%5D/page.tsx)) menampilkan banner target mesin lengkap dengan model, nomor seri, lokasi ruangan, dan catatan khusus teknisi.
- **Berita Acara Penyelesaian Pekerjaan (BAP PDF)**:
  - Generator BAP ([`bap-document.tsx`](file:///C:/Users/adity/Downloads/gridlineos/components/bap/bap-document.tsx), [`admin/jobs/[id]/bap`](file:///C:/Users/adity/Downloads/gridlineos/app/%28dashboard%29/admin/jobs/%5Bid%5D/bap/page.tsx), [`technician/jobs/[id]/bap`](file:///C:/Users/adity/Downloads/gridlineos/app/%28dashboard%29/technician/jobs/%5Bid%5D/bap/page.tsx)) menyertakan spesifikasi mesin, brand, model, dan nomor seri unit yang diservis dalam lembar dokumen formal.

### Fase 10.6 — Desain UI/UX Interface Teknisi & Tool Lapangan (Design Guidelines Standarisasi)
- **Design System & Palette Compliance**:
  - Penerapan token warna resmi Gridline Blue (`#007ACC`), tint background (`#EBF5FC`), netral Slate (`#0F172A`, `#475569`, `#94A3B8`, `#E2E8F0`), dan semantic status badge sesuai spesifikasi Bagian 5.2 `GridlineOS - DesignGuidelines.md`.
  - Standarisasi ukuran touch target (`h-11` hingga `h-12` / 44–48px) sesuai Fitts's Law untuk pengoperasian satu tangan di lapangan.
- **Komponen Khusus Teknisi**:
  - **Status Badge ([`status-badge.tsx`](file:///C:/Users/adity/Downloads/gridlineos/components/technician/status-badge.tsx))**: Indikator dot status dengan warna semantic (Assigned, On Progress, Completed, Cancelled, Pending).
  - **Visual 5-Gate Completion Tracker ([`five-gate-progress.tsx`](file:///C:/Users/adity/Downloads/gridlineos/components/technician/five-gate-progress.tsx))**: Progress bar interaktif dan checklist visual 5 syarat tiket kerja (Check-in GPS, SOP Checklist, Bukti Foto, Tanda Tangan Digital, Laporan Kerja Lapangan).
  - **Quick Action Tray ([`quick-action-tray.tsx`](file:///C:/Users/adity/Downloads/gridlineos/components/technician/quick-action-tray.tsx))**: Navigasi cepat satu sentuhan untuk Buka Google Maps (`maps/search/?api=1&query=...`), hubungi via telepon (`tel:`), koordinasi WhatsApp (`wa.me`), dan salin alamat.
  - **Mobile Bottom Navigation Bar ([`bottom-nav.tsx`](file:///C:/Users/adity/Downloads/gridlineos/components/technician/bottom-nav.tsx))**: Bilah navigasi ergonomis di bawah layar dengan 3 tab: *Tugas Saya* (`/technician`), *Komisi Saya* (`/technician/commissions`), dan *Profil* (`/technician/profile`).
- **Peningkatan Halaman & Fitur Pendukung**:
  - **Beranda Teknisi ([`app/(dashboard)/technician/page.tsx`](file:///C:/Users/adity/Downloads/gridlineos/app/%28dashboard%29/technician/page.tsx))**: Hero job card untuk tugas aktif prioritas tertinggi, quick earnings preview, segmented tab filter (Aktif / Selesai / Semua), dan live realtime status auto-refresh.
  - **Modul Komisi Teknisi ([`app/(dashboard)/technician/commissions/page.tsx`](file:///C:/Users/adity/Downloads/gridlineos/app/%28dashboard%29/technician/commissions/page.tsx))**: Hero earnings card gradient `#007ACC`, rincian bonus SLA on-time, indikator performa per tiket, dan tips maksimalkan pendapatan.
  - **Profil Teknisi & Hotline Dispatch ([`app/(dashboard)/technician/profile/page.tsx`](file:///C:/Users/adity/Downloads/gridlineos/app/%28dashboard%29/technician/profile/page.tsx))**: Status akun siaga aktif, tingkat keberhasilan penyelesaian (success rate), kontak hotline dispatcher darurat, dan sign-out yang aman.
  - **Work Order Mobile View ([`app/(dashboard)/technician/jobs/[id]/page.tsx`](file:///C:/Users/adity/Downloads/gridlineos/app/%28dashboard%29/technician/jobs/%5Bid%5D/page.tsx))**: Terintegrasi langsung dengan 5-Gate tracker, Quick Action Tray, target asset banner, dan tombol check-in GPS yang ramah sentuhan.





---

## 8. Butuh dari USER (blocker memasuki Fase 4)

| Item | Untuk apa | Urgensi |
|---|---|---|
| Supabase project + URL/anon/service-role key | DB, auth, storage | **Blocking Fase 3–4** |
| Keputusan email provider (Resend / SendGrid / lainnya) | invite & reset password | Blocking bagian Fase 4 |
| Keputusan verifikasi email wajib? | konfigurasi auth | Fase 4 |
| `/forgot-password` masuk MVP? | scope Fase 4 | Fase 4 |
| Timezone display (saran: Asia/Jakarta) | format tanggal | Fase 5 |
| Ukuran max foto produksi (sementara `PHOTO.maxBytes = 5MB`, jpg/png/webp) | validasi upload | Fase 6 |
| Pola arsip customer (saran: soft-archive, tanpa DELETE) | schema | Fase 3 (perlu sebelum migrasi) |

---

## 9. Catatan operasional

- `pnpm build` & `pnpm lint` hijau di status terakhir; pastikan hijau tiap sesi selesai.
- Robocopy pernah timeout 120s saat memindahkan scaffold — cek keberadaan file bila
  terjadi lagi, jangan asumsikan gagal.
- `pnpm install` di Windows pakai `--config.confirmModulesPurge=false`.
- shadcn: komponen `form` belum tersedia di registry versi ini (add dengan benar
  saat perlu, jangan asumsikan versi lama).
- Git repo sudah di-init oleh create-next-app; `.env*` sudah di-gitignore.
- Bahasa komunikasi dengan user: **Indonesia**.