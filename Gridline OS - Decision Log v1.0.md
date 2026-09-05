# Gridline OS — Decision Log v1.0

> **Status:** Final Technical Baseline  
> **Version:** v1.0 — 2026-09-05  
> **Reference:** PRD v1.0, MVP v1.0, ERD Database Schema v1.1, IA & User Flow v1.0, Tech Stack & Libraries, Design Guidelines  
> **Purpose:** Mencatat seluruh keputusan teknis & produk yang disepakati untuk development Gridline OS. Menjadi source of truth tambahan di sisi pengembangan.
> **Rule:** Keputusan hanya berubah melalui persetujuan produk/arsitektur baru (dokumen ini di-update dan direvisi versinya).

---

## 1. Daftar Keputusan

| # | Topik | Keputusan | Dampak Teknis |
|---|---|---|---|
| 1 | **Brand** | Nama resmi produk = **Gridline OS**. (Dokumen lama menyebut "FieldOps" / "GridlineOS" — konsistenkan ke Gridline OS.) | Konfigurasi, metadata, title, dan dokumentasi baru memakai "Gridline OS". Dokumen lama tidak diubah isinya kecuali keputusan produk baru. |
| 2 | **Provisioning Organisasi & User** | **Self-serve onboarding + invite-by-email:**<br>a. User pertama mendaftar → sistem membuat organisasi baru + profil user → role `admin`.<br>b. Admin membuat user lain cukup dengan **email + role**.<br>c. Sistem mengirim **invite email** (token aktif 24 jam, sekali pakai) → user klik → **menentukan password sendiri** → masuk ke org.<br>d. Admin **tidak pernah** membuat/mengetahui password user lain. | Diperlukan tabel/konsep invite token server-side. Role berasal dari data undangan, bukan form. Token expire 24 jam & single-use. |
| 3 | **Nomor Job** | `job_number` **unique per organisasi** dengan format `GL-0001` (incremental per org). | Constraint `UNIQUE (org_id, job_number)` + counter per org (mis. tabel `job_counters` atau kolom di `organizations` seperti `job_sequence`). DB menolak duplikat. |
| 4 | **Syarat Completion** | `Completed` tercapai jika **4 syarat PRD terpenuhi**: checklist selesai + before photo ada + after photo ada + signature ada + work report submitted. Check-out **tidak** menjadi syarat (tetap dicatat tetapi bukan gate). | Trigger DB transisi `on_progress → completed` hanya lolos jika 4 syarat ada. |
| 5 | **Akses Customer oleh Teknisi** | Teknisi dapat melihat data customer **hanya dalam konteks job yang ditugaskan kepadanya** (nama, kontak, alamat). Tidak bisa melihat list seluruh customer org. | RLS: technician SELECT pada `customers` hanya jika ada `jobs.customer_id = customers.id AND jobs.technician_id = auth.uid()`. |
| 6 | **Cancellation** | Job dibatalkan oleh **Admin saja** dan **wajib menyertakan alasan**. Berlaku dari status `Pending`, `Assigned`, `On Progress`. Owner & teknisi tidak dapat membatalkan. | Diperlukan kolom `cancelled_at` dan `cancellation_reason` (atau tabel audit). Divalidasi server + trigger DB. |
| 7 | **Edit Job Detail** | Admin dapat mengubah detail job (customer, alamat, instruksi, dsb.) selama status `Pending`, `Assigned`, `On Progress`. Terkunci saat `Completed` dan `Cancelled`. | Validasi status pada server action UPDATE job + trigger DB. |
| 8 | **Foto Evidence** | Foto **lebih dari satu per tipe** (before/after), **minimal 1 each** untuk syarat completion, dengan **batas atas 10 foto per tipe per job**. | ERD `job_photos` 1:N tetap. Trigger completion memeriksa `count(before) >= 1` dan `count(after) >= 1`. Batas atas divalidasi server-side. |
| 9 | **Cancellation Records** | (Mengikuti #6) Setiap pembatalan menyimpan alasan & siapa yang membatalkan untuk jejak audit. | Kolom `cancelled_by`, `cancelled_at`, `cancellation_reason` pada `jobs`. |

---

## 2. Implikasi Arsitektur

### 2.1 Provisioning & Invite (Keputusan #2)

```text
SIGNUP (self-serve)
   ↓
buat ORGANIZATIONS (UUID baru)
   ↓
buat PROFILES (id = auth.uid(), org_id = org baru, role = 'admin')
   ↓
masuk dashboard admin

INVITE (oleh admin)
   ↓
admin input email + role (technician / owner)
   ↓
server buat invite token (expire 24 jam, single use) + kirim email
   ↓
user klik link → set password → login → profile dibuat di org sesuai token
```

Keamanan:

- `role`, `org_id`, `password` tidak pernah berasal dari input form klien.
- Token invite dibangkitkan & divalidasi server-side (Server Action), tidak ditulis di browser.
- Admin tidak memiliki password user lain.

### 2.2 Nomor Job (Keputusan #3)

```sql
-- contoh: simpan sequence per org
alter table organizations add column job_sequence integer not null default 0;

-- pembuatan job: generate GL-{job_sequence+1} di dalam transaksi + lock row,
-- atau gunakan sequence/nextval per org (disarankan nextval dengan sequence unik per org).
-- fallback: insert dengan job_number = 'GL-' || lpad(..) dan constraint unique(org_id, job_number).
```

### 2.3 Completion Gate (Keputusan #4)

Trigger `on_progress -> completed` menolak jika salah satu tidak ada:

```text
checklist: SELECT count(*) WHERE job_id=$1 AND is_completed = false  → harus 0
before:    count(job_photos WHERE job_id=$1 AND type='before')       → >= 1
after:     count(job_photos WHERE job_id=$1 AND type='after')        → >= 1
signature: count(signatures WHERE job_id=$1)                         → >= 1
report:    count(work_reports WHERE job_id=$1)                        → >= 1
```

### 2.4 Foto Evidence (Keputusan #8)

```text
- job_photos.id = uuid (multiple row per job, per type)
- completion trigger: >= 1 before && >= 1 after
- batas atas 10/tipe/job divalidasi server action (anti spam storage)
- upload: teknisi yang ditugaskan saja → path {org_id}/{job_id}/before|after/
```

---

## 3. Prioritas Implementasi (setelah audit)

```text
1.  Project scaffolding          — Next.js App Router + TS + Tailwind + shadcn + deps
2.  Database integrity           — migrations v1.1 + keputusan #3, #6, #7, #8 (kolom & trigger)
3.  Authentication               — Supabase Auth, /login, middleware, refresh
4.  Provisioning & Invite (#2)   — self-serve onboard + mekanisme invite email
5.  Authorization                — rbac, role guard, object-level authz
6.  Multi-tenancy + RLS          — policy per role, isolasi org
7.  Server Actions/API           — mutasi sensitif + validasi business rule
8.  Storage security             — private bucket, path, signed URL
9.  Business rules               — completion, transisi status, conflict alert
10. UI (SSR) + Feature           — sesuai route & milestone PRD
11. Security testing             — matrix peran, 2 tenant, negatif test
```

---

## 4. Revisi

| Ver | Tanggal | Perubahan |
|---|---|---|
| v1.0 | 2026-09-05 | Baseline keputusan produk/teknis Gridline OS dari Open Questions audit v1.0 |