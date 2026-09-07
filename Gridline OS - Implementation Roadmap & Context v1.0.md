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