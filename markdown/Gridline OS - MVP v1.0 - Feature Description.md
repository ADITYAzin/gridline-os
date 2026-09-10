# FieldOps — MVP v1.0 Feature Description

> **Status:** Final Baseline  
> **Scope:** MVP v1.0  
> **Purpose:** Menjadi acuan fitur dan alur utama MVP FieldOps untuk tahap PRD berikutnya.  
> **Rule:** Baseline fitur MVP v1.0 mengikuti scope yang telah ditetapkan.

---

## 1. Core Job Management

| Feature | Deskripsi Ringkas |
|---|---|
| **Login & Role Management** | Login dan akses sistem berdasarkan role Admin, Technician, dan Owner. |
| **Customer Management** | Mengelola data customer, kontak, alamat, dan riwayat pekerjaan. |
| **Quick Ticket** | Membuat job/ticket baru dengan cepat menggunakan form sederhana. |
| **Job Management** | Mengelola seluruh lifecycle pekerjaan dari dibuat hingga selesai. |
| **Work Order** | Menyediakan detail pekerjaan, instruksi, lokasi, prioritas, dan informasi customer. |
| **Technician Assignment** | Menentukan technician yang bertanggung jawab atas suatu job. |
| **Scheduling & Calendar** | Menentukan tanggal/waktu pekerjaan dan melihat jadwal technician. |
| **Visual Dispatch Board** | Melihat dan mengatur job berdasarkan technician, waktu, dan status secara visual. |
| **Conflict Alert** | Memberikan peringatan ketika terjadi bentrok jadwal technician. |
| **Job Status Tracking** | Memantau status job seperti Pending, Assigned, On Progress, Completed, dan Cancelled. |

---

## 2. Technician Workflow

| Feature | Deskripsi Ringkas |
|---|---|
| **My Jobs** | Menampilkan daftar pekerjaan yang ditugaskan kepada technician. |
| **Job Detail** | Menampilkan seluruh informasi yang dibutuhkan technician untuk menjalankan pekerjaan. |
| **GPS Check-in / Check-out** | Mencatat kedatangan dan penyelesaian pekerjaan berdasarkan lokasi dan waktu. |
| **SOP Checklist** | Checklist prosedur kerja untuk memastikan pekerjaan dilakukan secara standar. |
| **Before / After Photo** | Mengambil dan menyimpan bukti kondisi sebelum dan sesudah pekerjaan. |
| **E-Signature** | Customer memberikan tanda tangan digital sebagai konfirmasi pekerjaan. |
| **Work Report** | Technician mengirim hasil pekerjaan, catatan, dan dokumentasi pekerjaan. |

---

## 3. Management

| Feature | Deskripsi Ringkas |
|---|---|
| **Basic Admin Dashboard** | Ringkasan job, schedule, status, dan aktivitas technician untuk kebutuhan operasional Admin. |
| **Basic Owner Dashboard** | Ringkasan kondisi operasional agar Owner dapat melihat keadaan bisnis tanpa mengecek job satu per satu. |
| **Basic Job & Technician Monitoring** | Memantau pekerjaan aktif, status job, dan kondisi technician secara terpusat. |

---

## 4. Core MVP Workflow

```text
CREATE JOB
→ SCHEDULE
→ ASSIGN
→ EXECUTE
→ DOCUMENT
→ VERIFY
→ COMPLETE
→ MONITOR
```

---

## 5. MVP Baseline

**Ini menjadi baseline fitur MVP v1.0 untuk tahap PRD berikutnya.**