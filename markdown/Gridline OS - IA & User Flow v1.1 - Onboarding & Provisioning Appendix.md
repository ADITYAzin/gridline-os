# Gridline OS — IA & User Flow v1.1 — Onboarding & Provisioning Appendix

> **Status:** Final Technical Baseline (Lampiran)
> **Version:** v1.1 — 2026-09-05
> **Reference:** IA & User Flow v1.0, PRD v1.0, ERD Database Schema v1.1, Decision Log v1.0
> **Scope:** Menambahkan alur **Provisioning** (signup, pembuatan organisasi, invite rekan) yang belum ada pada IA v1.0.
> **Rule:** Lampiran ini **tidak mengubah isi** `IA & User Flow v1.0`. Keduanya berlaku bersama sebagai baseline IA Gridline OS.

---

# 1. Latar Belakang

IA & User Flow v1.0 ditulis pada model single-tenant dan tidak membahas bagaimana **organisasi** serta **user pertama** dibuat. Sejak ERD v1.1 memperkenalkan model multi-tenant (`organizations` + `org_id` + RLS), alur provisioning menjadi kebutuhan baru. Keputusan 2026-09-05 (Decision Log #2) menetapkan:

```text
Self-serve onboarding + invite-by-email
```

Lampiran ini melengkapi IA & User Flow dengan alur tersebut.

---

# 2. Titik Masuk (Penambahan Screen)

| Screen | Status | Alur |
|---|---|---|
| `/login` | Sudah ada di IA v1.0 | Login berdasar role |
| `/register` | **BARU** | Signup → buat organisasi → admin pertama |
| `/accept-invite` | **BARU** | Terima undangan → set password → masuk |
| `/forgot-password` | **BARU (opsional)** | Reset password via email |
| Empty state dashboard | **BARU** | Dashboard pertama kali setelah signup |

> Marketing/landing page **tidak termasuk MVP** — `/register` diakses langsung dari `login` atau link yang dibagikan.

---

# 3. Alur Utama 1 — Signup Admin Pertama (Membuat Organisasi)

```text
VISITOR (belum punya akun)
   ↓
/register
   ↓
FORM:
  • Nama perusahaan (organisasi)
  • Nama user
  • Email
  • Password
   ↓
SERVER:
  • validasi input (Zod)
  • buat ORGANIZATIONS (UUID baru)
  • buat AUTH USER (email + password)
  • buat PROFILES → role = 'admin', org_id = org baru
  • kirim email selamat datang (opsional)
   ↓
MASUK DASHBOARD ADMIN (empty state)
   ↓
LANGSUNG BISA: buat customer → buat job → undang rekan
```

### Aturan Produk

- 1 user pertama = 1 organisasi baru.
- User pertama otomatis menjadi `admin`.
- `role` / `org_id` / `password` **tidak pernah** berasal dari input klien — ditentukan server.
- RLS aktif sejak detik pertama data dibuat.

---

# 4. Alur Utama 2 — Login (mengacu IA v1.0)

```text
/login
   ↓
EMAIL + PASSWORD
   ↓
AUTHENTICATE
   ↓
IDENTIFY ROLE (dari profiles)
   ↓
REDIRECT sesuai role
   ↓
admin → /admin
technician → /technician
owner → /owner
```

### Alur Transisi

```text
LOGOUT
   ↓
SESSION DIHAPUS
   ↓
REDIRECT ke /login
```

---

# 5. Alur Utama 3 — Invite Rekan Setim (Admin → Teknisi / Owner)

```text
ADMIN di dashboard
   ↓
"Undang Anggota" (Technicians / Settings)
   ↓
INPUT: email + role (technician / owner)
   ↓
SERVER:
  • validasi email & role
  • buat INVITE TOKEN (expire 24 jam, single-use, terikat org + role)
  • kirim email undangan (berisi link /accept-invite)
   ↓
INVITE (email, klik link dalam 24 jam)
   ↓
/accept-invite
   ↓
FORM: nama + set password sendiri
   ↓
SERVER:
  • validasi token (belum expire, belum terpakai)
  • buat AUTH USER + PROFILES → role & org dari TOKEN
   ↓
LOGIN → masuk sesuai role
```

### Aturan Produk

- Admin **tidak pernah** membuat/mengetahui password rekan.
- Token undangan: **sekali pakai & kedaluwarsa 24 jam**.
- Role rekan ditentukan admin saat invite — bukan dipilih user.
- Teknisi/owner tidak bisa "mendaftar sendiri" masuk ke organisasi lain.

### Status Undangan (opsional di UI Admin)

```text
terkirim → menunggu → diterima → kedaluwarsa → dibatalkan
```

---

# 6. Alur Alternatif — Undangan Kedaluwarsa / Gagal

```text
INVITE klik link
   ↓
TOKEN KEDALUWARSA / SUDAH DIPAKAI?
  ↓ ya
TAMPILKAN "Link sudah tidak berlaku"
   ↓
[Lewatkan] / [Minta undangan baru dari admin]
```

```text
EMAIL SUDAH TERDAFTAR di organisasi?
  ↓ ya
TAMPILKAN "Akun sudah ada — silakan login"
```

---

# 7. First-Run State (Empty State Dashboard Admin)

Setelah signup, dashboard admin menampilkan panduan singkat:

```text
🎉 Perusahaan kamu sudah siap!

[1] Buat customer pertama     → /admin/customers
[2] Buat job pertama          → /admin/jobs/new
[3] Undang teknisi & owner    → /admin/technicians (Undang Anggota)
```

> Empty state hanya muncul ketika organisasi belum memiliki data (0 customer, 0 job, 0 anggota selain admin).

---

# 8. Keamanan Provisioning

| Aspek | Jaminan |
|---|---|
| Identity | `auth.uid()` dari session — tidak bisa dipalsukan klien |
| Role & org | Ditetapkan server saat signup / dari token invite |
| Token invite | Single-use, expire 24 jam, terikat org + role |
| Password | Hanya diketahui user (set sendiri / atur saat invite) |
| Isolasi | RLS aktif sejak record pertama dibuat |
| Secret | Service-role key hanya di server |

---

# 9. Keputusan Terbuka (belum diputuskan)

1. **Email provider** untuk mengirim invite & reset password (mis. Resend / SendGrid / Supabase email) — belum ditunjuk.
2. **Verifikasi email wajib** sebelum akun aktif, atau opsional/ditunda?
3. `/forgot-password` — masuk MVP atau ditunda ke v1.1?

> Keputusan di atas akan dicatat di Decision Log saat disetujui. Tanpa keputusan baru, alur otentikasi tetap berjalan (signup + invite).

---

# 10. Posisi Lampiran dalam Hirarki IA

```text
IA & User Flow v1.0  (struktur navigasi + alur fitur MVP)
        ↓
IA & User Flow v1.1 — Onboarding Appendix (alur provisioning entry point)
        ↓
UI/UX Specification → Development
```

Dokumen asli `IA & User Flow v1.0` tidak diubah. Lampiran ini menambahkan alur yang sebelumnya tidak tercakup.

---

# Revision History

| Ver | Tanggal | Perubahan |
|---|---|---|
| v1.1 | 2026-09-05 | Lampiran: alur signup (buat organisasi), invite-by-email, accept-invite, forgot-password (opsional), empty state onboarding. Sumber: Decision Log v1.0 #2. |