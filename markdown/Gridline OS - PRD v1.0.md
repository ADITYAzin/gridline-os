# FieldOps — PRD v1.0

> **Status:** Final Baseline  
> **Product:** FieldOps  
> **Type:** B2B SaaS — Field Service Management  
> **Scope:** MVP v1.0  
> **Reference:** Source of Truth v1.0, MoSCoW Framework v1.0, MVP Feature Description v1.0, Final IA & User Flow  
> **Rule:** Tidak ada penambahan atau perubahan scope tanpa keputusan product baru.

---

# 1. Product Overview

## 1.1 Product Definition

**FieldOps** adalah platform SaaS yang membantu perusahaan jasa teknis mengelola pekerjaan teknisi lapangan secara terpusat, mulai dari pembuatan job, penjadwalan, assignment, pelaksanaan pekerjaan, dokumentasi, verifikasi, hingga monitoring.

FieldOps diposisikan sebagai **operating system sederhana untuk perusahaan jasa teknis Indonesia** yang masih mengelola pekerjaan menggunakan WhatsApp, spreadsheet, dan dokumen manual.

---

## 1.2 Product Positioning

> **FieldOps adalah platform SaaS yang membantu perusahaan jasa teknis skala menengah mengelola seluruh pekerjaan teknisi dari penugasan hingga laporan pekerjaan dalam satu sistem.**

### Core Value

FieldOps menyatukan:

- Job Management
- Scheduling
- Technician Assignment
- Technician Execution
- Work Documentation
- Work Report
- Operational Monitoring

dalam satu workflow terpusat.

---

## 1.3 Target Customer

### Primary Target

Perusahaan jasa teknis skala menengah dengan:

- 10–100 karyawan
- Memiliki teknisi/pekerja lapangan
- Memiliki pekerjaan yang datang secara rutin
- Membutuhkan scheduling dan assignment
- Masih menggunakan WhatsApp, Excel/Google Sheets, atau dokumen manual
- Membutuhkan dokumentasi pekerjaan

### Initial Market Focus

- AC & HVAC
- Building maintenance
- Instalasi CCTV
- Electrical service
- ISP / jaringan
- Pest control
- Cleaning service
- Kontraktor teknis

### MVP Focus

> **Perusahaan jasa maintenance dan instalasi teknis.**

FieldOps tidak langsung diposisikan sebagai solusi untuk seluruh industri field service.

---

# 2. Core Problems

FieldOps ditujukan untuk mengatasi masalah operasional berikut:

1. Job tersebar di WhatsApp, spreadsheet, dan dokumen.
2. Admin sulit mengetahui status setiap pekerjaan.
3. Scheduling teknisi berpotensi bentrok.
4. Instruksi pekerjaan tidak selalu lengkap atau mudah ditemukan.
5. Teknisi melakukan administrasi secara manual.
6. Foto/evidence pekerjaan tersebar.
7. Laporan pekerjaan tidak terstruktur.
8. Owner sulit mendapatkan operational visibility secara cepat.
9. Performa teknisi sulit diukur secara konsisten.

---

# 3. Product Goals

## 3.1 Admin Goal

Membantu Admin / Dispatcher mengelola seluruh siklus pekerjaan teknisi secara terpusat.

### Admin Needs

- Membuat job
- Mengelola customer
- Menjadwalkan pekerjaan
- Assign technician
- Memantau status job
- Memeriksa laporan
- Menyelesaikan job

### Admin Objective

```text
Manage
→ Schedule
→ Assign
→ Monitor
→ Review
→ Complete
```

---

## 3.2 Technician Goal

Membantu technician menyelesaikan pekerjaan dengan instruksi jelas dan administrasi minimal.

### Technician Needs

- Melihat job
- Melihat detail pekerjaan
- Check-in / check-out
- Mengikuti checklist
- Mengambil foto evidence
- Mendapatkan customer signature
- Mengirim work report

### Technician Objective

```text
Receive
→ Execute
→ Document
→ Submit
```

---

## 3.3 Owner Goal

Memberikan Owner / Manager operational visibility tanpa harus mengecek pekerjaan satu per satu.

### Owner Needs

- Operational overview
- Job monitoring
- Technician status
- Basic performance
- Operational data

### Owner Objective

```text
Monitor
→ Evaluate
→ Decide
```

---

# 4. Core Product Workflow

FieldOps MVP berfokus pada satu workflow utama:

```text
CUSTOMER
    ↓
CREATE JOB
    ↓
SCHEDULE
    ↓
ASSIGN TECHNICIAN
    ↓
TECHNICIAN RECEIVES JOB
    ↓
CHECK-IN
    ↓
EXECUTE
    ↓
CHECKLIST
    ↓
DOCUMENTATION
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

### Product-Level Workflow

```text
Create
→ Schedule
→ Assign
→ Execute
→ Document
→ Verify
→ Complete
→ Monitor
```

Workflow ini menjadi batas utama desain produk MVP. Fitur di luar workflow tidak masuk MVP tanpa keputusan product baru.

---

# 5. User & Role Definition

FieldOps memiliki tiga role utama:

| Role | Primary Responsibility |
|---|---|
| **Admin / Dispatcher** | Mengatur operasional pekerjaan |
| **Field Technician** | Menjalankan pekerjaan di lapangan |
| **Owner / Manager** | Memantau dan mengevaluasi operasional |

---

# 6. MVP Product Scope

## 6.1 Core Job Management

### Login & Role Management

Login dan akses sistem berdasarkan role:

- Admin
- Technician
- Owner

### Customer Management

Mengelola:

- Customer
- Contact
- Address
- Riwayat pekerjaan yang tersedia dalam konteks job

### Quick Ticket

Membuat job/ticket baru dengan cepat menggunakan form sederhana.

### Job Management

Mengelola lifecycle pekerjaan dari dibuat hingga selesai atau dibatalkan.

### Work Order

Menyediakan informasi pekerjaan:

- Customer
- Service type
- Issue
- Instructions
- Location
- Priority

### Technician Assignment

Menentukan technician yang bertanggung jawab atas job.

### Scheduling & Calendar

Menentukan:

- Tanggal
- Waktu
- Schedule technician

### Visual Dispatch Board

Melihat dan mengatur job berdasarkan:

- Technician
- Waktu
- Status

secara visual.

### Conflict Alert

Memberikan peringatan ketika terjadi bentrok jadwal technician.

### Job Status Tracking

Memantau status:

```text
Pending
Assigned
On Progress
Completed
Cancelled
```

---

## 6.2 Technician Workflow

### My Jobs

Menampilkan pekerjaan yang ditugaskan kepada technician.

### Job Detail

Menampilkan seluruh informasi yang dibutuhkan technician untuk menjalankan pekerjaan.

### GPS Check-in / Check-out

Mencatat:

- Lokasi GPS
- Timestamp

saat technician check-in dan check-out.

### SOP Checklist

Checklist prosedur kerja untuk memastikan pekerjaan dilakukan secara standar.

> **MVP menggunakan predefined SOP template. Custom SOP Builder tidak termasuk MVP.**

### Before / After Photo

Menyimpan:

- Foto sebelum pekerjaan
- Foto sesudah pekerjaan

sebagai evidence.

### E-Signature

Customer memberikan tanda tangan digital sebagai konfirmasi pekerjaan.

### Work Report

Technician mengirim:

- Hasil pekerjaan
- Catatan
- Checklist
- Foto
- Signature

Work report kemudian dapat diperiksa oleh Admin/Owner.

---

## 6.3 Management

### Basic Admin Dashboard

Memberikan operational overview berupa:

- Job status
- Schedule
- Technician activity
- Action items

### Basic Owner Dashboard

Memberikan operational visibility berupa:

- Active jobs
- Completed jobs
- Job status
- Technician overview
- Basic performance

### Basic Job & Technician Monitoring

Admin dan Owner dapat memantau:

- Pekerjaan aktif
- Status job
- Kondisi technician

secara terpusat.

Scope fitur MVP di atas mengikuti baseline MUST yang telah ditetapkan.

---

# 7. User Flow

## 7.1 Admin / Dispatcher Primary Flow

```text
LOGIN
  ↓
DASHBOARD
  ↓
CREATE JOB
  ↓
SELECT CUSTOMER
  ↓
INPUT JOB DETAILS
  ↓
SAVE JOB
  ↓
STATUS: PENDING
  ↓
SCHEDULE
  ↓
CHECK TECHNICIAN AVAILABILITY
  ↓
CONFLICT?
 ┌──────────────┴──────────────┐
YES                          NO
 ↓                             ↓
SHOW CONFLICT              ASSIGN TECHNICIAN
 ↓                             ↓
ADJUST SCHEDULE             STATUS: ASSIGNED
 │                             ↓
 └──────────────→──────→ MONITOR JOB
                               ↓
                         TECHNICIAN EXECUTES
                               ↓
                         REVIEW WORK REPORT
                               ↓
                     COMPLETION REQUIREMENTS?
                       ┌───────┴───────┐
                      NO              YES
                       ↓                ↓
                WAIT / REVIEW       COMPLETE JOB
                                         ↓
                                  STATUS: COMPLETED
```

### Admin Alternative Flow — View Existing Job

```text
DASHBOARD / JOBS
    ↓
ALL JOBS
    ↓
SELECT JOB
    ↓
JOB DETAIL
    ↓
VIEW / MANAGE
```

### Admin Alternative Flow — Assignment Conflict

```text
SELECT TECHNICIAN
    ↓
CHECK SCHEDULE
    ↓
CONFLICT DETECTED
    ↓
CONFLICT ALERT
    ↓
CHANGE SCHEDULE
       OR
ASSIGN ANOTHER TECHNICIAN
    ↓
RE-CHECK
    ↓
ASSIGN
```

### Admin Alternative Flow — Review & Completion

```text
JOB DETAIL
    ↓
REVIEW WORK REPORT
    ↓
CHECKLIST COMPLETE?
    ↓
EVIDENCE COMPLETE?
    ↓
CUSTOMER SIGNATURE AVAILABLE?
    ↓
WORK REPORT SUBMITTED?
    ↓
COMPLETE JOB
```

Jika requirement belum terpenuhi, job tetap berada pada status yang sesuai dan belum dapat menjadi `Completed`.

---

# 8. Technician User Flow

## 8.1 Primary Flow

```text
LOGIN
  ↓
MY JOBS
  ↓
SELECT ASSIGNED JOB
  ↓
JOB DETAIL
  ↓
VIEW WORK INFORMATION
  ↓
CHECK-IN
  ↓
STATUS: ON PROGRESS
  ↓
SOP CHECKLIST
  ↓
BEFORE PHOTO
  ↓
PERFORM WORK
  ↓
AFTER PHOTO
  ↓
CUSTOMER SIGNATURE
  ↓
WORK REPORT
  ↓
SUBMIT REPORT
  ↓
CHECK-OUT
  ↓
JOB SUBMITTED FOR REVIEW
```

Technician tidak melakukan final completion terhadap job. Completion dilakukan setelah proses review dan seluruh requirement terpenuhi.

---

## 8.2 No Assigned Job

```text
LOGIN
  ↓
MY JOBS
  ↓
NO ASSIGNED JOB
  ↓
EMPTY STATE
```

---

## 8.3 GPS Check-in Flow

```text
JOB DETAIL
    ↓
CHECK-IN
    ↓
GPS + TIMESTAMP
    ↓
LOCATION VALID?
 ┌───────┴───────┐
YES             NO
 ↓                ↓
CHECK-IN       SHOW ERROR
RECORDED          ↓
 ↓             RETRY
CONTINUE
```

---

## 8.4 Incomplete Requirement Flow

```text
WORK REPORT
    ↓
SUBMIT
    ↓
REQUIREMENT MISSING
    ↓
SHOW MISSING REQUIREMENT
    ↓
COMPLETE REQUIREMENT
    ↓
SUBMIT AGAIN
```

---

# 9. Owner / Manager User Flow

Owner menggunakan produk sebagai **monitoring hub**, bukan sebagai sequential operational workflow.

```text
LOGIN
  ↓
OWNER DASHBOARD
  ↓
OPERATIONAL OVERVIEW
  ├── VIEW JOBS
  │     ↓
  │   ACTIVE / COMPLETED
  │     ↓
  │   JOB DETAIL
  │
  ├── VIEW TECHNICIANS
  │     ↓
  │   TECHNICIAN OVERVIEW
  │     ↓
  │   TECHNICIAN DETAIL
  │
  └── BASIC PERFORMANCE
        ↓
    OPERATIONAL INSIGHT
```

Owner tidak memiliki tanggung jawab operational execution seperti Create Job, Schedule, Assign Technician, atau Dispatch Board pada MVP.

---

# 10. Information Architecture

IA menggunakan pendekatan **object-first, workflow-first, dan role-first**.

Workflow seperti Schedule, Assignment, Checklist, Photo, Signature, dan Work Report merupakan bagian dari lifecycle job dan tidak diposisikan sebagai top-level navigation tersendiri.

---

## 10.1 Admin / Dispatcher IA

```text
Dashboard

Jobs
├── All Jobs
├── Pending
├── Assigned
├── On Progress
├── Completed
└── Cancelled

Dispatch
├── Calendar
└── Dispatch Board

Technicians
├── All Technicians
└── Technician Detail

Customers
├── All Customers
└── Customer Detail

Profile
```

### Primary Action

```text
+ Create Job
```

Create Job merupakan primary action dalam Jobs workflow, bukan module operasional terpisah.

---

## 10.2 Admin Job Detail

```text
Job Detail
├── Overview
├── Work Order
├── Schedule & Assignment
├── Execution & Evidence
│   ├── Checklist
│   ├── Before / After Photo
│   └── Customer Signature
├── Work Report
└── Status
```

Job Detail menjadi pusat informasi dan lifecycle pekerjaan.

---

## 10.3 Technician IA

```text
Home

My Jobs
├── Today
├── Upcoming
└── Completed

Profile
```

### Technician Job Detail

```text
Job Detail
├── Job Information
├── Location
├── Instructions
├── Checklist
├── Before / After Photo
├── Customer Signature
└── Work Report
```

GPS Check-in / Check-out merupakan action dalam Job Detail, bukan navigation item.

---

## 10.4 Owner / Manager IA

```text
Dashboard
├── Job Overview
├── Active Jobs
├── Completed Jobs
├── Technician Status
└── Basic Performance

Jobs
└── Job Detail

Technicians
├── Technician Overview
└── Technician Detail

Profile
```

Owner berfokus pada:

```text
Monitor
→ Evaluate
→ Decide
```

---

# 11. Feature Specification

Format:

> **Purpose → Actor → Input → Process → Output**

---

## 11.1 Login & Role Management

**Purpose:** memberikan akses sistem sesuai role.

**Actor:**

- Admin
- Technician
- Owner

**Input:**

- Email
- Password

**Process:**

```text
Authenticate
→ Identify Role
→ Authorize
→ Redirect
```

**Output:** User masuk ke interface sesuai role.

---

## 11.2 Customer Management

**Purpose:** menyimpan data customer untuk digunakan dalam job.

**Actor:** Admin.

**Input:**

- Customer name
- Contact
- Address

**Process:**

```text
Create / View / Edit Customer
```

**Output:** Data customer tersedia untuk job.

---

## 11.3 Quick Ticket

**Purpose:** membuat job dengan cepat.

**Actor:** Admin.

**Input:**

- Customer
- Service type
- Issue
- Location
- Priority

**Process:**

```text
Fill Form
→ Validate
→ Generate Job ID
→ Create Job
```

**Output:** Job dibuat dengan status `Pending`.

---

## 11.4 Job Management

**Purpose:** mengelola lifecycle pekerjaan.

**Actor:** Admin.

**Input:** Data job.

**Process:**

```text
Create
→ Schedule
→ Assign
→ Execute
→ Review
→ Complete / Cancel
```

**Output:** Job memiliki status aktual.

---

## 11.5 Work Order

**Purpose:** menyediakan informasi lengkap yang dibutuhkan untuk pekerjaan.

**Actor:**

- Admin
- Technician

**Input:**

- Customer
- Service type
- Issue
- Instructions
- Location
- Priority

**Output:** Informasi pekerjaan tersedia dalam Job Detail.

---

## 11.6 Technician Assignment

**Purpose:** menentukan technician yang bertanggung jawab atas job.

**Actor:** Admin.

**Input:**

- Job
- Technician
- Schedule

**Process:**

```text
Select Technician
→ Check Schedule
→ Detect Conflict
→ Assign
```

**Output:** Job muncul pada My Jobs technician.

---

## 11.7 Scheduling & Calendar

**Purpose:** mengatur waktu pekerjaan dan melihat jadwal technician.

**Actor:** Admin.

**Input:**

- Date
- Start time
- End time
- Technician

**Process:**

```text
Set Schedule
→ Check Availability
→ Save
```

**Output:** Schedule tersedia pada Calendar dan Dispatch Board.

---

## 11.8 Visual Dispatch Board

**Purpose:** memberikan visualisasi pekerjaan berdasarkan technician, waktu, dan status.

**Actor:** Admin.

**Output:** Admin dapat melihat dan mengatur distribusi job secara visual.

### Core Elements

- Technician rows
- Time blocks
- Job cards
- Status
- Priority
- Schedule

---

## 11.9 Conflict Alert

**Purpose:** mencegah bentrok jadwal technician.

**Actor:** Admin.

**Process:**

```text
Schedule / Assignment
→ Check Existing Schedule
→ Conflict?
```

**Output:**

Jika konflik:

```text
Schedule Conflict

Technician already has another job
at this time.

[Change Schedule]
[Assign Another Technician]
```

Conflict tidak hanya ditampilkan melalui warna; sistem harus memberikan penjelasan dan action yang dapat dilakukan.

---

## 11.10 Job Status Tracking

**Purpose:** mengetahui kondisi setiap job.

**Actor:**

- Admin
- Technician
- Owner

### Status

```text
Pending
↓
Assigned
↓
On Progress
↓
Completed
```

Cancellation:

```text
Pending
   ↓
Cancelled

Assigned
   ↓
Cancelled

On Progress
   ↓
Cancelled
```

---

## 11.11 My Jobs

**Purpose:** menampilkan pekerjaan yang ditugaskan kepada technician.

**Actor:** Technician.

**Views:**

- Today
- Upcoming
- Completed

**Output:** Technician dapat memilih job untuk dikerjakan.

---

## 11.12 Job Detail

**Purpose:** menjadi pusat informasi pekerjaan untuk execution.

**Actor:**

- Admin
- Technician
- Owner

### Admin

Melihat dan mengelola:

- Customer
- Work Order
- Schedule
- Assignment
- Evidence
- Work Report
- Status

### Technician

Melihat dan menjalankan:

- Job Information
- Location
- Instructions
- Checklist
- Photo
- Signature
- Work Report
- Check-in / Check-out

### Owner

Melihat informasi job untuk monitoring.

---

## 11.13 GPS Check-in / Check-out

**Purpose:** mencatat aktivitas technician di lokasi.

**Actor:** Technician.

**Input:**

- GPS location
- Timestamp

**Process:**

```text
Action
→ Capture Location
→ Capture Timestamp
→ Record
```

**Output:** Aktivitas check-in / check-out tercatat.

---

## 11.14 SOP Checklist

**Purpose:** memastikan prosedur pekerjaan dilakukan secara standar.

**Actor:** Technician.

**Input:** Predefined checklist items.

**Process:**

```text
Open Checklist
→ Complete Items
→ Save Progress
→ Validate Completion
```

**Output:** Checklist tersimpan sebagai bagian dari job.

> Custom SOP Builder tidak termasuk MVP.

---

## 11.15 Before / After Photo

**Purpose:** menyediakan bukti kondisi pekerjaan.

**Actor:** Technician.

**Input:**

- Before photo
- After photo

**Process:**

```text
Capture / Upload
→ Validate
→ Save Evidence
```

**Output:** Evidence tersimpan pada job.

---

## 11.16 E-Signature

**Purpose:** mendapatkan konfirmasi customer.

**Actor:**

- Technician
- Customer

**Input:**

- Customer name
- Signature

**Process:**

```text
Customer Reviews
→ Provides Signature
→ Save
```

**Output:** Customer signature tersimpan pada job.

---

## 11.17 Work Report

**Purpose:** mendokumentasikan hasil pekerjaan.

**Actor:** Technician.

**Input:**

- Result
- Notes
- Checklist
- Photos
- Signature

**Process:**

```text
Complete Work
→ Fill Report
→ Validate Requirements
→ Submit
```

**Output:** Work report tersimpan dan dapat diperiksa Admin/Owner.

---

## 11.18 Basic Admin Dashboard

**Purpose:** memberikan operational overview kepada Admin.

**Actor:** Admin.

**Output:**

- Job status
- Schedule
- Technician activity
- Action items

---

## 11.19 Basic Owner Dashboard

**Purpose:** memberikan operational visibility kepada Owner.

**Actor:** Owner.

**Output:**

- Active jobs
- Completed jobs
- Job status
- Technician overview
- Basic performance

---

## 11.20 Basic Job & Technician Monitoring

**Purpose:** memantau kondisi job dan technician secara terpusat.

**Actor:**

- Admin
- Owner

**Output:** Status pekerjaan dan technician dapat dipantau tanpa mengecek satu per satu melalui WhatsApp.

---

# 12. Business Rules

## 12.1 Job Rules

- Setiap job memiliki Job ID unik.
- Customer wajib tersedia.
- Service type wajib.
- Location wajib.
- Issue wajib.
- Priority wajib.
- Job tidak dapat dihapus sembarangan setelah pekerjaan dimulai.

---

## 12.2 Assignment Rules

- Job dapat memiliki technician yang ditugaskan.
- Sistem harus memeriksa konflik schedule.
- Technician hanya melihat job yang ditugaskan kepadanya.

---

## 12.3 Scheduling Rules

- Schedule memiliki tanggal.
- Schedule memiliki start time.
- Schedule memiliki end time.
- Sistem harus memberikan warning jika terjadi konflik technician.

---

## 12.4 Technician Rules

- Check-in dilakukan sebelum pekerjaan.
- Check-out dilakukan setelah pekerjaan.
- GPS digunakan untuk mencatat lokasi.
- Work Report harus dikirim sebelum job dapat diselesaikan.

---

## 12.5 Completion Rules

Job hanya dapat menjadi `Completed` jika:

```text
Checklist selesai
+
Before / After evidence tersedia
+
Customer signature tersedia
+
Work report submitted
```

Jika salah satu requirement belum terpenuhi, Job tidak dapat diselesaikan.

---

## 12.6 Cancellation Rules

Job dapat dibatalkan sebelum selesai dari:

```text
Pending
Assigned
On Progress
```

Status akhir:

```text
Cancelled
```

---

# 13. Permission Matrix

| Action | Admin | Technician | Owner |
|---|---:|---:|---:|
| Login | Yes | Yes | Yes |
| View Dashboard | Yes | Limited | Yes |
| Manage Customer | Yes | No | View |
| Create Job | Yes | No | No |
| Edit Job | Yes | No | No |
| Assign Technician | Yes | No | No |
| Manage Schedule | Yes | No | View |
| View Assigned Job | Yes | Yes | Yes |
| Check-in / Check-out | No | Yes | No |
| Checklist | No | Yes | View |
| Upload Photo | No | Yes | View |
| Customer Signature | No | Yes | View |
| Submit Work Report | No | Yes | View |
| Review Work Report | Yes | Own | Yes |
| Complete Job | Yes | No | No |
| View Technician Status | Yes | Own | Yes |
| View Basic Performance | Yes | No | Yes |

> Authorization wajib diterapkan pada backend/database, bukan hanya frontend.

---

# 14. Acceptance Criteria

## 14.1 Authentication

- User dapat login.
- Role user dikenali sistem.
- User diarahkan ke interface sesuai role.
- User tidak dapat mengakses halaman yang tidak memiliki permission.

---

## 14.2 Customer

- Admin dapat membuat customer.
- Admin dapat melihat customer.
- Admin dapat mengedit customer.
- Customer dapat digunakan saat membuat job.

---

## 14.3 Job

- Admin dapat membuat job.
- Job memiliki Job ID unik.
- Job memiliki customer.
- Job memiliki service type.
- Job memiliki location.
- Job memiliki issue.
- Job memiliki priority.
- Status awal adalah `Pending`.

---

## 14.4 Assignment

- Admin dapat assign technician.
- Sistem memeriksa konflik schedule.
- Konflik menghasilkan warning.
- Assigned job muncul pada My Jobs technician.

---

## 14.5 Scheduling

- Admin dapat menentukan tanggal.
- Admin dapat menentukan waktu mulai.
- Admin dapat menentukan waktu selesai.
- Schedule tampil pada Calendar.
- Schedule tampil pada Dispatch Board.

---

## 14.6 Technician Workflow

Technician dapat menyelesaikan:

```text
View Job
→ Check-in
→ Checklist
→ Before Photo
→ Work
→ After Photo
→ Signature
→ Work Report
→ Check-out
```

---

## 14.7 Completion

Job hanya dapat menjadi `Completed` jika seluruh completion requirements terpenuhi.

---

## 14.8 Dashboard & Monitoring

- Dashboard menampilkan data aktual.
- Admin dapat melihat kondisi operasional.
- Owner dapat melihat operational overview.
- Admin dan Owner dapat memonitor status job.
- Admin dan Owner dapat memonitor technician sesuai permission.

---

# 15. Non-Functional Requirements

## 15.1 Performance

- Interface harus responsif dan cepat digunakan.
- Query hanya mengambil data yang diperlukan.
- Upload foto menggunakan optimasi ukuran yang wajar.

---

## 15.2 Security

- Authentication wajib.
- Authorization berdasarkan role.
- Database menggunakan Row Level Security.
- User tidak boleh mengakses data yang tidak memiliki hak akses.
- File storage memiliki access policy.

---

## 15.3 Reliability

- Data tidak hilang saat halaman di-refresh.
- Form memiliki validasi.
- Error upload ditampilkan kepada user.
- Sistem memberikan feedback untuk proses berhasil/gagal.

---

## 15.4 Responsive

| Role | Primary Device |
|---|---|
| Technician | Smartphone-first |
| Admin | Desktop-first |
| Owner | Desktop-first |

Fungsi inti tetap usable pada berbagai ukuran layar.

---

## 15.5 Usability

- Workflow technician harus sederhana.
- Informasi utama job mudah ditemukan.
- CTA utama jelas.
- Navigasi konsisten antar halaman.
- Technician dapat menyelesaikan workflow dengan langkah minimal.

---

# 16. MVP Boundary

## 16.1 Included

```text
AUTH
  ↓
CUSTOMER
  ↓
JOB
  ↓
SCHEDULE
  ↓
ASSIGNMENT
  ↓
TECHNICIAN
  ↓
CHECK-IN
  ↓
CHECKLIST
  ↓
BEFORE / AFTER EVIDENCE
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
MONITORING
```

---

## 16.2 Excluded from MVP

Fitur berikut tidak termasuk MVP:

- Payment
- Accounting
- Payroll
- Full CRM
- Native in-app chat
- AI route optimization
- AI predictive maintenance
- Advanced inventory
- Advanced analytics
- Customer portal
- Recurring maintenance

---

## 16.3 Future Roadmap Reference

### SHOULD — v1.1

- WhatsApp Notification
- Asset & Service History
- Customer Service History
- SLA Monitoring
- Technician Performance
- Executive Health Cards
- Technician Commission
- Job Counter
- BAP PDF Generator
- Report Export
- Offline Mode + Auto Sync

### COULD — v1.2+

- Customer Tracking Portal
- Integrated Payment
- Custom SOP Builder
- Advanced Analytics
- Recurring Maintenance
- Inventory Management
- Expense Tracking
- Route Optimization

### WON'T — Current Phase

- Native In-App Chatting
- AI Route Optimization
- Full Accounting System
- Payroll Management
- Full CRM
- AI Predictive Maintenance

Fitur di luar MUST tidak masuk MVP tanpa keputusan product baru.

---

# 17. Development Milestones

| Phase | Fokus | Output |
|---|---|---|
| 1 | Foundation | Project setup, Auth, Role |
| 2 | Customer & Job | Customer, Quick Ticket, Job |
| 3 | Dispatch | Assignment, Schedule, Dispatch Board |
| 4 | Technician | My Jobs, Job Detail, Check-in/out |
| 5 | Execution | Checklist, Before/After Photo |
| 6 | Completion | E-Signature, Work Report, Completion |
| 7 | Dashboard | Admin & Owner Dashboard |
| 8 | QA & Security | Permission, validation, bug fixing |
| 9 | Deployment | Production release |

### Development Priority

```text
AUTH
  ↓
CUSTOMER
  ↓
JOB
  ↓
ASSIGNMENT
  ↓
SCHEDULE
  ↓
TECHNICIAN WORKFLOW
  ↓
EVIDENCE
  ↓
REPORT
  ↓
COMPLETION
  ↓
DASHBOARD
  ↓
QA
  ↓
RELEASE
```

---

# 18. Document Relationship

PRD v1.0 menjadi baseline kebutuhan produk dan menjadi penghubung antara keputusan product dengan dokumen desain dan teknis.

```text
SOURCE OF TRUTH
       ↓
   MoSCoW / MVP
       ↓
    PRD v1.0
       ↓
 ┌─────┴─────┐
 ↓           ↓
IA &       ERD /
User Flow  Database
 ↓
UI/UX Specification
 ↓
Development
 ↓
QA
 ↓
Release
```

### Document Boundary

**Source of Truth**

Menjadi baseline positioning, problem, target, role, dan konsep produk.

**MoSCoW**

Menentukan prioritas fitur dan batas MVP.

**MVP Feature Description**

Menjelaskan baseline fitur MVP.

**PRD**

Menentukan:

- Product scope
- User role
- Workflow
- Information Architecture
- Feature behavior
- Business rules
- Permission
- Acceptance criteria
- Non-functional requirements
- MVP boundary

**IA & User Flow**

Menjadi struktur navigasi dan alur interaksi yang berasal dari PRD.

**UI/UX Specification**

Menentukan detail interface, component, interaction, responsive behavior, accessibility, dan design requirements.

**ERD / Database Schema**

Menentukan struktur database dan relasi data berdasarkan kebutuhan PRD.

> UI/UX Specification dan ERD / Database Schema tetap menjadi dokumen terpisah dan tidak menjadi bagian dari PRD utama.

---

# 19. Final Product Principles

Seluruh keputusan produk MVP harus mengikuti prinsip:

> **Admin mengatur. Technician mengerjakan. Owner memantau.**

### Admin

```text
Manage
→ Schedule
→ Assign
→ Monitor
→ Review
→ Complete
```

### Technician

```text
Receive
→ Execute
→ Document
→ Submit
```

### Owner

```text
Monitor
→ Evaluate
→ Decide
```

### Product

```text
Create
→ Schedule
→ Assign
→ Execute
→ Document
→ Verify
→ Complete
→ Monitor
```

---

# 20. Final Status

> **FieldOps PRD v1.0 = Final Baseline**

PRD ini menjadi baseline untuk:

- UI/UX Design
- IA & User Flow
- Database Design
- Technical Planning
- Development
- QA
- Production Release

Tidak ada perubahan scope atau konsep tanpa keputusan product baru.

**MVP v1.0 hanya membangun workflow inti FieldOps dari Create Job sampai Monitoring.**