# FieldOps — ERD / Database Schema v1.1

> **Status:** Final Technical Baseline (revisi tenant model)  
> **Version:** v1.1 — 2026-09-04  
> **Reference:** PRD v1.0, MVP v1.0, IA & User Flow v1.0, Keputusan Product 2026-09-04  
> **Scope:** MVP v1.0  
> **Rule:** Database hanya mendukung fitur MVP v1.0. Tidak memasukkan fitur di luar MVP tanpa keputusan product baru.

> **Perubahan v1.1:** Ditambahkan model multi-tenant (`organizations` + `org_id` + Row Level Security) karena produk akan dijual sebagai SaaS multi-customer. Seluruh tabel operasional kini di-scope per organization.

---

# 1. Database Architecture

**Database:** PostgreSQL  
**Backend:** Supabase

```text
AUTH USERS
    ↓
PROFILES (org_id)
    ↓
ORGANIZATIONS
    ↓
CUSTOMERS (org_id)
    ↓
JOBS (org_id)
  +-- SCHEDULES (org_id)
  +-- CHECKLIST ITEMS (org_id)
  +-- JOB PHOTOS (org_id)
  +-- JOB ATTENDANCE (org_id)
  +-- WORK REPORTS (org_id)
  +-- SIGNATURES (org_id)
```

---

# 2. Entity Relationship Diagram

```text
+----------------+       +----------------+       +----------------+
|  ORGANIZATIONS |       |   PROFILES     |       |  CUSTOMERS     |
+----------------+       +----------------+       +----------------+
| id PK          |<----1:1| id PK          |       | id PK          |
| name           |       | name           |       | name           |
| subscription_tier|     | email          |       | email          |
| created_at     |       | phone          |       | address        |
+----------------+       | org_id FK      |       | org_id FK      |
       1:N               | role           |       | created_at     |
       |                 +----------------+       +----------------+
       |                          ↓
       |                    +----------------+
       +--> 1:N ------------->|  JOBS        |
                          +----------------+
                          | id PK                |
                          | job_number UNIQUE    |
                          | customer_id FK       |
                          | org_id FK            |
                          | technician_id FK     |
                          | service_type         |
                          | issue                |
                          | instructions         |
                          | address              |
                          | latitude             |
                          | longitude            |
                          | priority             |
                          | status               |
                          | created_at            |
                          | updated_at            |
                          | completed_at          |
                          +--------------------+

                          +----------------+
                          | SCHEDULES      |
                          +----------------+
                          | id PK            |
                          | job_id FK UNIQUE |
                          | technician_id FK |
                          | start_at         |
                          | end_at           |
                          | created_at       |
                          | updated_at       |
                          +----------------+

                          +----------------------------+
                          | CHECKLIST ITEMS          |
                          +----------------------------+
                          | id PK                    |
                          | job_id FK NOT NULL       |
                          | org_id FK NOT NULL       |
                          | item TEXT NOT NULL       |
                          | is_completed BOOLEAN DEFAULT false |
                          | completed_at             |
                          | created_at               |
                          | updated_at               |
                          +----------------------------+

                          +---------------------+
                          | JOB PHOTOS          |
                          +---------------------+
                          | id PK               |
                          | job_id FK NOT NULL  |
                          | org_id FK NOT NULL  |
                          | type ENUM (before/after) NOT NULL |
                          | file_url TEXT NOT NULL |
                          | latitude            |
                          | longitude           |
                          | captured_at NOT NULL |
                          | uploaded_by FK      |
                          | created_at          |
                          +---------------------+

                          +------------------------+
                          | JOB ATTENDANCE      |
                          +------------------------+
                          | id PK               |
                          | job_id FK UNIQUE NOT NULL |
                          | technician_id FK NOT NULL |
                          | check_in_at         |
                          | check_in_latitude   |
                          | check_in_longitude  |
                          | check_out_at        |
                          | check_out_latitude  |
                          | check_out_longitude |
                          | created_at          |
                          | updated_at          |
                          +------------------------+

                          +------------------+
                          | WORK REPORTS     |
                          +------------------+
                          | id PK            |
                          | job_id FK UNIQUE NOT NULL |
                          | org_id FK NOT NULL |
                          | result TEXT NOT NULL |
                          | notes            |
                          | submitted_by FK NOT NULL |
                          | submitted_at NOT NULL |
                          | updated_at       |
                          +------------------+

                          +--------------+
                          | SIGNATURES   |
                          +--------------+
                          | id PK        |
                          | job_id FK UNIQUE NOT NULL |
                          | org_id FK NOT NULL |
                          | customer_name TEXT NOT NULL |
                          | signature_url TEXT NOT NULL |
                          | signed_at NOT NULL |
                          +--------------+
```

---

# 3. Tables

## 3.1 organizations (BAGIAN BARU V1.1)

Menyimpan data perusahaan/sebagai tenant dalam arsitektur multi-tenant.

| Column | Type | Constraint |
|---|---|---|
| `id` | uuid | PK |
| `name` | text | NOT NULL |
| `subscription_tier` | text | NULL (mis. trial/pro/enterprise) |
| `created_at` | timestamptz | NOT NULL |

**Catatan:** 1 organization = 1 perusahaan klien (tenant). Semua data operasional terikat pada organization melalui `org_id`.

---

## 3.2 profiles

| Column | Type | Constraint |
|---|---|---|
| `id` | uuid | PK, FK → auth.users.id |
| `org_id` | uuid | FK → organizations.id, NOT NULL |
| `name` | text | NOT NULL |
| `email` | text | NOT NULL |
| `phone` | text | NULL |
| `role` | enum | NOT NULL (admin, technician, owner) |
| `avatar_url` | text | NULL |
| `created_at` | timestamptz | NOT NULL |
| `updated_at` | timestamptz | NOT NULL |

### Role

```text
admin
technician
owner
```

---

## 3.3 customers

| Column | Type | Constraint |
|---|---|---|
| `id` | uuid | PK |
| `org_id` | uuid | FK → organizations.id, NOT NULL |
| `name` | text | NOT NULL |
| `phone` | text | NULL |
| `email` | text | NULL |
| `address` | text | NOT NULL |
| `latitude` | numeric | NULL |
| `longitude` | numeric | NULL |
| `created_at` | timestamptz | NOT NULL |
| `updated_at` | timestamptz | NOT NULL |

---

## 3.4 jobs (dialih dari 3.3 sebelumnya)

| Column | Type | Constraint |
|---|---|---|
| `id` | uuid | PK |
| `job_number` | text | UNIQUE, NOT NULL |
| `org_id` | uuid | FK → organizations.id, NOT NULL |
| `customer_id` | uuid | FK → customers.id, NOT NULL |
| `technician_id` | uuid | FK → profiles.id, NULL |
| `created_by` | uuid | FK → profiles.id, NOT NULL |
| `service_type` | text | NOT NULL |
| `issue` | text | NOT NULL |
| `instructions` | text | NULL |
| `address` | text | NOT NULL |
| `latitude` | numeric | NULL |
| `longitude` | numeric | NULL |
| `priority` | enum | NOT NULL |
| `status` | enum | NOT NULL |
| `created_at` | timestamptz | NOT NULL |
| `updated_at` | timestamptz | NOT NULL |
| `completed_at` | timestamptz | NULL |

### Priority

```text
low
medium
high
```

### Status

```text
pending
assigned
on_progress
completed
cancelled
```

`technician_id` dapat NULL ketika Job belum memiliki technician.

---

## 3.5 schedules

| Column | Type | Constraint |
|---|---|---|
| `id` | uuid | PK |
| `job_id` | uuid | FK → jobs.id, UNIQUE |
| `org_id` | uuid | FK → organizations.id, NOT NULL |
| `technician_id` | uuid | FK → profiles.id, NOT NULL |
| `start_at` | timestamptz | NOT NULL |
| `end_at` | timestamptz | NOT NULL |
| `created_at` | timestamptz | NOT NULL |
| `updated_at` | timestamptz | NOT NULL |

### Constraint

```text
end_at > start_at
```

Satu Job memiliki satu Schedule aktif pada MVP.

---

## 3.6 checklist_items (dialih dari 3.5 sebelumnya)

| Column | Type | Constraint |
|---|---|---|
| `id` | uuid | PK |
| `job_id` | uuid | FK → jobs.id, NOT NULL |
| `org_id` | uuid | FK → organizations.id, NOT NULL |
| `item` | text | NOT NULL |
| `is_completed` | boolean | DEFAULT false |
| `completed_at` | timestamptz | NULL |
| `created_at` | timestamptz | NOT NULL |
| `updated_at` | timestamptz | NOT NULL |

### Keputusan MVP

Checklist menggunakan **predefined SOP berdasarkan service type**.

Tidak ada:

- Custom SOP Builder
- Workflow Builder

Checklist merupakan bagian dari Job execution workflow.

---

## 3.7 job_photos (dialih dari 3.6 sebelumnya)

| Column | Type | Constraint |
|---|---|---|
| `id` | uuid | PK |
| `job_id` | uuid | FK → jobs.id, NOT NULL |
| `org_id` | uuid | FK → organizations.id, NOT NULL |
| `type` | enum | NOT NULL |
| `file_url` | text | NOT NULL |
| `latitude` | numeric | NULL |
| `longitude` | numeric | NULL |
| `captured_at` | timestamptz | NOT NULL |
| `uploaded_by` | uuid | FK → profiles.id, NOT NULL |
| `created_at` | timestamptz | NOT NULL |

### Photo Type

```text
before
after
```

---

## 3.8 job_attendance (dialih dari 3.7 sebelumnya)

| Column | Type | Constraint |
|---|---|---|
| `id` | uuid | PK |
| `job_id` | uuid | FK → jobs.id, UNIQUE NOT NULL |
| `org_id` | uuid | FK → organizations.id, NOT NULL |
| `technician_id` | uuid | FK → profiles.id, NOT NULL |
| `check_in_at` | timestamptz | NULL |
| `check_in_latitude` | numeric | NULL |
| `check_in_longitude` | numeric | NULL |
| `check_out_at` | timestamptz | NULL |
| `check_out_latitude` | numeric | NULL |
| `check_out_longitude` | numeric | NULL |
| `created_at` | timestamptz | NOT NULL |
| `updated_at` | timestamptz | NOT NULL |

### Relationship

```text
JOB 1 ── 1 JOB ATTENDANCE
```

### Attendance Flow

```text
CHECK-IN
    ↓
GPS + TIMESTAMP
    ↓
WORK EXECUTION
    ↓
CHECK-OUT
    ↓
GPS + TIMESTAMP
```

Satu Job memiliki satu record attendance pada MVP.

---

## 3.9 work_reports (dialih dari 3.8 sebelumnya)

| Column | Type | Constraint |
|---|---|---|
| `id` | uuid | PK |
| `job_id` | uuid | FK → jobs.id, UNIQUE NOT NULL |
| `org_id` | uuid | FK → organizations.id, NOT NULL |
| `result` | text | NOT NULL |
| `notes` | text | NULL |
| `submitted_by` | uuid | FK → profiles.id, NOT NULL |
| `submitted_at` | timestamptz | NOT NULL |
| `updated_at` | timestamptz | NOT NULL |

### Relationship

```text
JOB 1 ── 1 WORK REPORT
```

Work Report dapat mereferensikan:

```text
Checklist
Photos
Signature
```

melalui relationship masing-masing dengan Job.

---

## 3.10 signatures (dialih dari 3.9 sebelumnya)

| Column | Type | Constraint |
|---|---|---|
| `id` | uuid | PK |
| `job_id` | uuid | FK → jobs.id, UNIQUE NOT NULL |
| `org_id` | uuid | FK → organizations.id, NOT NULL |
| `customer_name` | text | NOT NULL |
| `signature_url` | text | NOT NULL |
| `signed_at` | timestamptz | NOT NULL |

### Relationship

```text
JOB 1 ── 1 SIGNATURE
```

Satu Job hanya memiliki satu signature final pada MVP.

---

# 10. Relationship Final

```text
ORGANIZATIONS
 └── 1:N ── PROFILES, CUSTOMERS, JOBS, SCHEDULES, CHECKLIST_ITEMS, JOB_PHOTOS, JOB_ATTENDANCE, WORK_REPORTS, SIGNATURES

PROFILES
 └── 1:N ── JOBS (created_by, technician_id), SCHEDULES

CUSTOMERS
 └── 1:N ── JOBS

JOBS
 └── 1:1 ── SCHEDULES
 └── 1:N ── CHECKLIST_ITEMS
 └── 1:1 ── JOB_ATTENDANCE
 └── 1:1 ── WORK_REPORTS
 └── 1:1 ── SIGNATURES

SCHEDULES
 └── 1:N ── JOBS (via job_id)

CHECKLIST_ITEMS
 └── 1:N ── JOBS (via job_id)

JOB_PHOTOS
 └── 1:N ── JOBS (via job_id)

JOB_ATTENDANCE
 └── 1:1 ── JOBS (via job_id)

WORK_REPORTS
 └── 1:1 ── JOBS (via job_id)

SIGNATURES
 └── 1:1 ── JOBS (via job_id)
```

---

# 11. Job Lifecycle

Database harus mendukung lifecycle PRD:

```text
PENDING
   ↓
ASSIGNED
   ↓
ON_PROGRESS
   ↓
COMPLETED
```

Cancellation:

```text
PENDING
ASSIGNED
ON_PROGRESS
   ↓
CANCELLED
```

### Execution Relationship

```text
ASSIGNED
   ↓
CHECK-IN
   ↓
ON_PROGRESS
   ↓
CHECKLIST
   ↓
BEFORE PHOTO
   ↓
EXECUTE WORK
   ↓
AFTER PHOTO
   ↓
CUSTOMER SIGNATURE
   ↓
WORK REPORT
   ↓
CHECK-OUT
   ↓
REVIEW
   ↓
COMPLETED
   ↓
MONITOR
```

---

# 12. Core Database Rules

## Job

- `job_number` harus unique.
- `customer_id` wajib.
- `service_type` wajib.
- `address` wajib.
- `issue` wajib.
- `priority` wajib.
- `created_by` wajib.
- Technician boleh NULL saat Job masih `Pending`.
- Job tidak boleh dihapus setelah `On Progress`.
- Job hanya dapat menjadi `Completed` setelah completion requirements terpenuhi.
- **Setiap job wajib memiliki org_id.**

## Assignment

- Technician harus merupakan user dengan role `technician`.
- Technician hanya dapat melihat Job yang ditugasku kepadanya (melalui RLS org_id).
- Assignment harus memiliki technician yang valid.

## Schedule

- `start_at < end_at`.
- Technician harus valid.
- Sistem harus mendeteksi overlapping schedule.
- Schedule harus terkait dengan Job.
- Satu Job memiliki satu Schedule aktif pada MVP.
- **Setiap schedule wajib memiliki org_id.**

## Check-in / Check-out

- Check-in dilakukan oleh technician yang ditugaskan.
- Check-in menyimpan GPS location dan timestamp.
- Check-out dilakukan setelah execution.
- Check-out menyimpan GPS location dan timestamp.
- Check-out tidak boleh memiliki timestamp sebelum check-in.

## Checklist

- Semua item checklist harus berasal dari SOP yang ditentukan untuk service type.
- Checklist harus selesai sebelum Job dapat menjadi `Completed`.

## Evidence

- Job harus memiliki evidence `Before` dan `After`.
- Photo hanya dapat ditambahkan oleh technician yang memiliki Job tersebut.
- Evidence menyimpan waktu pengambilan.
- GPS dapat disimpan bersama evidence.

## Signature

- Satu Job hanya memiliki satu signature final.
- Signature harus tersedia sebelum Job dapat menjadi `Completed`.

## Work Report

- Satu Job hanya memiliki satu Work Report final.
- Report hanya dapat disubmit oleh technician yang ditugaskan.
- Work Report harus submitted sebelum Job dapat menjadi `Completed`.

## Completion

Job hanya dapat menjadi:

```text
COMPLETED
```

jika:

```text
Checklist Complete
+
Before Photo Available
+
After Photo Available
+
Customer Signature Available
+
Work Report Submitted
```

---

# 13. Core Indexes

Index yang diperlukan untuk MVP (dengan penambahan `org_id`):

```text
organizations.name

profiles.role
profiles.org_id

customers.name
customers.org_id
customers.phone

jobs.job_number
jobs.org_id
jobs.customer_id
jobs.technician_id
jobs.status
jobs.priority
jobs.created_at
jobs.updated_at

schedules.org_id
schedules.job_id
schedules.technician_id
schedules.start_at
schedules.end_at

checklist_items.org_id
checklist_items.job_id

job_photos.org_id
job_photos.job_id
job_photos.type
job_photos.captured_at

job_attendance.org_id
job_attendance.job_id
job_attendance.technician_id
job_attendance.check_in_at
job_attendance.check_out_at

work_reports.org_id
work_reports.job_id
work_reports.submitted_by

signatures.org_id
signatures.job_id
```

---

# 14. Database Security

Supabase menggunakan:

```text
Supabase Auth
      ↓
auth.uid()
      ↓
profiles (org_id, role)
      ↓
get_user_org_id()
      ↓
Row Level Security
      ↓
Data Access
```

Authorization diterapkan pada backend/database dan bukan hanya pada frontend.

### 14.1 Tenant Helper Function

```sql
create or replace function get_user_org_id()
returns uuid
language sql stable security definer
set search_path = public
as $$
  select org_id from profiles where id = auth.uid();
$$;
```

### 14.2 Tenant Isolation Policy (Contoh)

```sql
-- Semua tabel operasional mengaktifkan RLS
alter table profiles enable row level security;
alter table customers enable row level security;
alter table jobs enable row level security;
alter table schedules enable row level security;
alter table checklist_items enable row level security;
alter table job_photos enable row level security;
alter table job_attendance enable row level security;
alter table work_reports enable row level security;
alter table signatures enable row level security;

-- Policy dasar: user hanya bisa membaca data organization-nya sendiri
create policy "org_isolation_select" on profiles
  for select
  using (org_id = get_user_org_id());

create policy "org_isolation_select" on jobs
  for select
  using (org_id = get_user_org_id());

-- Admin: full operational access dalam org-nya
create policy "admin_full_access" on jobs
  for all
  using (org_id = get_user_org_id()
    and exists (
      select 1 from profiles p
      where p.id = auth.uid() and p.role = 'admin'
    ));

-- Technician: hanya job yang ditugaskan kepadanya
create policy "technician_assigned_jobs" on jobs
  for select
  using (
    org_id = get_user_org_id()
    and technician_id = auth.uid()
  );

-- Owner: read-only (di bawah policy select umum)
-- (tidak perlu policy tambahan, sudah ditutup oleh org_isolation_select)
```

### 14.3 Role Access (melanjuti dari PRD §14)

- **Admin**: Full operational access di dalam org-nya. Dapat mengelola Customer, Job, Schedule, Assignment. Dapat review dan final completion.
- **Technician**: Hanya dapat mengakses Job yang ditugaskan kepadanya (RLS org_id + technician_id). Dapat Check-in/Check-out, Checklist, Photo, Signature, Work Report. Tidak dapat final completion.
- **Owner**: Read-only terhadap data org-nya. Dapat melihat Job, Technician, Schedule, Checklist, Evidence, Work Report. Tidak memiliki operational control pada MVP.

---

# 15. Storage Architecture

Supabase Storage digunakan untuk file evidence.

```text
SUPABASE STORAGE
       ↓
JOB FILES
       ↓
  {org_id}/
       ↓
     {job_id}/
           ├── before/
           ├── after/
           └── signature/
```

Database hanya menyimpan reference:

```text
file_url
signature_url
```

File access harus mengikuti permission Job dan role user. RLS policy storage: user hanya bisa baca/unggah file di folder org miliknya.

---

# 16. Scope Validation

| Database Component | MVP v1.0 | Status |
|---|---|---|
| Organizations / Tenancy | MUST | Included (v1.1) |
| Profiles / Roles | MUST | Included |
| Customers | MUST | Included |
| Jobs | MUST | Included |
| Work Order | MUST | Included |
| Technician Assignment | MUST | Included |
| Schedules / Calendar | MUST | Included |
| Dispatch Board Data | MUST | Included |
| Conflict Detection Data | MUST | Included |
| Job Status | MUST | Included |
| GPS Check-in / Check-out | MUST | Included |
| SOP Checklist | MUST | Included |
| Before / After Photos | MUST | Included |
| E-Signature | MUST | Included |
| Work Reports | MUST | Included |
| Admin Dashboard Data | MUST | Included |
| Owner Dashboard Data | MUST | Included |
| Job & Technician Monitoring | MUST | Included |

---

# 17. Final Decision

**ERD / Database Schema v1.1 ini menjadi baseline technical database untuk MVP FieldOps dengan model multi-tenant.**

Struktur final:

```text
AUTH
  ↓
ORGANIZATIONS
  ↓
PROFILES
  ↓
CUSTOMERS
  ↓
JOBS
  +-- SCHEDULES
  +-- CHECKLIST ITEMS
  +-- JOB PHOTOS
  +-- JOB ATTENDANCE
  +-- WORK REPORTS
  +-- SIGNATURES
```

Core operational flow:

```text
CREATE JOB
    ↓
SCHEDULE
    ↓
ASSIGN
    ↓
CHECK-IN
    ↓
EXECUTE
    ↓
CHECKLIST
    ↓
DOCUMENT
    ↓
SIGNATURE
    ↓
WORK REPORT
    ↓
CHECK-OUT
    ↓
REVIEW
    ↓
COMPLETED
    ↓
MONITOR
```

Database berpusat pada `JOBS` sebagai operational object utama, dengan isolasi tenant melalui `org_id` dan Row Level Security.

Tidak perlu menambah entity lain sebelum ada perubahan requirement pada **PRD v1.0 / MVP v1.0**.

---

# Revision History

| Ver | Tanggal | Perubahan | Dokumen Terkait |
|---|---|---|---|
| v1.1 | 2026-09-04 | Tambah model tenant: tabel `organizations`, kolom `org_id` di semua tabel operasional, RLS tenant isolation & policy per role | Tech Stack & Libraries, Design Guidelines |
| v1.0 | — | Baseline awal | — |