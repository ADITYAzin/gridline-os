# FieldOps — Source of Truth v1.0

> **Status:** Baseline  
> **Purpose:** Menjadi acuan utama untuk seluruh proses product planning, PRD, UI/UX, technical planning, dan development FieldOps.  
> **Rule:** Tidak ada perubahan scope/konsep tanpa keputusan product baru.

---

## 1. Product Positioning

### Product Name

**FieldOps**

### Product Type

**B2B SaaS — Field Service Management**

### Positioning Statement

> FieldOps adalah platform SaaS yang membantu perusahaan jasa teknis skala menengah mengelola seluruh pekerjaan teknisi dari penugasan hingga laporan pekerjaan dalam satu sistem.

### Core Positioning

> Operating system sederhana untuk perusahaan jasa teknis Indonesia yang masih mengelola pekerjaan teknisi melalui WhatsApp, spreadsheet, dan dokumen manual.

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

### Core Workflow

```text
Create Job
    ↓
Schedule
    ↓
Assign
    ↓
Execute
    ↓
Document
    ↓
Verify
    ↓
Complete
    ↓
Monitor
```

---

## 2. Target Customer

### Primary Target

Perusahaan jasa teknis skala menengah dengan:

- 10–100 karyawan
- Memiliki teknisi/pekerja lapangan
- Memiliki pekerjaan yang datang secara rutin
- Membutuhkan scheduling dan assignment
- Masih menggunakan WhatsApp, Excel/Google Sheets, atau dokumen manual
- Membutuhkan dokumentasi pekerjaan

### Initial Market Focus

Validasi awal difokuskan pada:

- Perusahaan AC & HVAC
- Building maintenance
- Instalasi CCTV
- Electrical service
- ISP / jaringan
- Pest control
- Cleaning service
- Kontraktor teknis

### Fokus MVP

> **Perusahaan jasa maintenance dan instalasi teknis.**

FieldOps tidak langsung diposisikan sebagai solusi untuk seluruh industri field service.

---

## 3. Core Problems

Perusahaan menghadapi masalah:

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

## 4. User & Role

FieldOps memiliki 3 role utama:

1. Admin / Dispatcher
2. Field Technician
3. Owner / Manager

---

### 4.1 Admin / Dispatcher

#### Goal

Mengelola seluruh pekerjaan dan teknisi secara efisien.

#### Needs

- Membuat job
- Mengatur customer
- Menjadwalkan pekerjaan
- Assign technician
- Memantau status job
- Memeriksa laporan

#### Main Pain

> Sulit mengontrol banyak pekerjaan dan teknisi karena informasi tersebar di berbagai media.

---

### 4.2 Field Technician

#### Goal

Menyelesaikan pekerjaan dengan instruksi jelas dan administrasi minimal.

#### Needs

- Melihat job
- Melihat detail pekerjaan
- Check-in/out
- Mengikuti checklist
- Mengambil foto
- Mendapatkan customer signature
- Mengirim work report

#### Main Pain

> Menerima tugas dan membuat laporan pekerjaan masih merepotkan serta membutuhkan banyak proses manual.

---

### 4.3 Owner / Manager

#### Goal

Mengetahui kondisi operasional tanpa harus mengecek pekerjaan satu per satu.

#### Needs

- Operational overview
- Job monitoring
- Technician status
- Performance overview
- Basic operational data

#### Main Pain

> Tidak memiliki visibility operasional yang cepat dan terstruktur untuk mengambil keputusan.

---

## 5. User POV

### Admin

> Dispatcher membutuhkan sistem terpusat untuk mengatur, menugaskan, dan memantau pekerjaan teknisi agar operasional berjalan tanpa miskomunikasi.

### Technician

> Teknisi membutuhkan workflow kerja yang sederhana agar dapat menerima instruksi, menjalankan pekerjaan, dan mengirim bukti pekerjaan tanpa proses administrasi yang rumit.

### Owner

> Owner membutuhkan dashboard operasional yang memberikan informasi aktual agar dapat mengetahui performa tim dan mengambil keputusan dengan cepat.

---

## 6. Empathy Map — Core Pain

| Role | Main Pain |
|---|---|
| Admin | Sulit mengontrol banyak pekerjaan dan teknisi secara terpusat |
| Technician | Menerima tugas dan membuat laporan masih merepotkan |
| Owner | Tidak memiliki visibility operasional yang cepat dan terstruktur |

---

## 7. How Might We

### Admin

> **HMW membantu admin mengelola seluruh siklus pekerjaan teknisi dari penerimaan job hingga penyelesaian dalam satu workflow yang terpusat?**

### Technician

> **HMW membuat workflow teknisi dari menerima tugas hingga mengirim laporan sesederhana mungkin tanpa menambah beban administrasi?**

### Owner

> **HMW memberikan owner visibility terhadap pekerjaan, SLA, dan performa teknisi secara aktual sehingga keputusan operasional dapat dibuat berdasarkan data?**

### Overall

> **How Might We membantu perusahaan jasa teknis mengelola, menjalankan, memantau, dan mendokumentasikan pekerjaan teknisi secara terpusat agar operasional lebih terkontrol dan efisien?**

---

## 8. Core Product Scope

FieldOps berfokus pada siklus:

```text
CUSTOMER
   ↓
JOB
   ↓
SCHEDULE
   ↓
ASSIGN
   ↓
TECHNICIAN
   ↓
CHECK-IN
   ↓
EXECUTE
   ↓
DOCUMENT
   ↓
SIGNATURE
   ↓
WORK REPORT
   ↓
REVIEW
   ↓
COMPLETED
   ↓
MONITOR
```

---

## 9. User Flow

### 9.1 Admin / Dispatcher

```text
Login
  ↓
Dashboard
  ↓
Create / View Job
  ↓
Select Customer
  ↓
Input Job Detail
  ↓
Schedule
  ↓
Assign Technician
  ↓
Monitor Job
  ↓
Review Work Report
  ↓
Complete Job
```

---

### 9.2 Field Technician

```text
Login
  ↓
My Jobs
  ↓
Select Job
  ↓
View Job Detail
  ↓
Navigate to Location
  ↓
Check-in
  ↓
Perform Checklist
  ↓
Upload Before Photo
  ↓
Perform Work
  ↓
Upload After Photo
  ↓
Customer Signature
  ↓
Submit Work Report
  ↓
Check-out
```

---

### 9.3 Owner / Manager

```text
Login
  ↓
Owner Dashboard
  ↓
View Job Overview
  ↓
View Technician Status
  ↓
Monitor Active / Completed Jobs
  ↓
Review Basic Performance
```

---

## 10. Master Product Flow

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
SOP CHECKLIST
    ↓
BEFORE / AFTER PHOTO
    ↓
CUSTOMER SIGNATURE
    ↓
WORK REPORT
    ↓
CHECK-OUT
    ↓
REVIEW
    ↓
JOB COMPLETED
    ↓
ADMIN / OWNER MONITORING
```

### Source of Truth Rule

**FieldOps v1.0 hanya berfokus pada workflow utama di atas.**

Fitur di luar workflow tersebut tidak boleh masuk ke MVP tanpa keputusan product baru.