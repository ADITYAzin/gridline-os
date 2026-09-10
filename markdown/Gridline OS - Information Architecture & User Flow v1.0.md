# FieldOps — Information Architecture & User Flow v1.0

> **Status:** Final Baseline  
> **Product:** FieldOps  
> **Scope:** MVP v1.0  
> **Reference:** Source of Truth v1.0, MoSCoW Framework v1.0, MVP v1.0, PRD v1.0  
> **Purpose:** Menjadi baseline struktur informasi dan alur pengguna untuk proses UI/UX Design FieldOps MVP v1.0.  
> **Rule:** IA dan User Flow hanya mencakup fitur dalam scope MVP v1.0. Tidak ada penambahan fitur di luar scope tanpa keputusan product baru.

---

# 1. Information Architecture

## 1.1 IA Principles

Information Architecture FieldOps menggunakan prinsip:

### Object-First

Struktur utama berpusat pada objek operasional:

- Jobs
- Customers
- Technicians

### Workflow-First

Aktivitas seperti scheduling, assignment, checklist, photo, signature, dan work report ditempatkan sebagai bagian dari workflow Job, bukan sebagai modul navigasi terpisah.

### Role-First

Setiap role memiliki struktur navigasi berdasarkan kebutuhan dan tanggung jawabnya.

### MVP-First

IA hanya mencakup fitur yang termasuk dalam MVP v1.0.

---

# 2. Admin / Dispatcher IA

## 2.1 Primary Navigation

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

## 2.2 Job Detail Structure

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
└── Activity / Status
```

## 2.3 Global Primary Action

```text
+ Create Job
```

**Quick Ticket** menjadi bagian dari proses Create Job sebagai mekanisme pembuatan job secara cepat, bukan sebagai primary navigation item.

## 2.4 Admin IA Objective

```text
Manage
→ Schedule
→ Assign
→ Monitor
→ Review
→ Complete
```

---

# 3. Technician IA

## 3.1 Primary Navigation

```text
Home

My Jobs
├── Today
├── Upcoming
└── Completed

Profile
```

## 3.2 Job Detail Structure

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

## 3.3 Technician Job Actions

```text
Check-in
↓
Checklist
↓
Before Photo
↓
Execute Work
↓
After Photo
↓
Customer Signature
↓
Work Report
↓
Check-out
```

GPS Check-in / Check-out merupakan action dalam Job Detail dan bukan halaman navigasi tersendiri.

## 3.4 Technician IA Objective

```text
Receive
→ Execute
→ Document
→ Submit
```

---

# 4. Owner / Manager IA

## 4.1 Primary Navigation

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

## 4.2 Owner Dashboard Structure

```text
Operational Overview
├── Job Overview
├── Active Jobs
├── Completed Jobs
├── Technician Status
└── Basic Performance
```

## 4.3 Owner IA Objective

```text
Monitor
→ Evaluate
→ Decide
```

Owner tidak memiliki operational control seperti Create Job, Assign Technician, Schedule, atau Dispatch Board dalam MVP.

---

# 5. User Flow

# 5.1 Admin / Dispatcher User Flow

## Primary Flow

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
                         ┌─────┴─────┐
                        NO          YES
                         ↓            ↓
                  WAIT / REVIEW   COMPLETE JOB
                                      ↓
                              STATUS: COMPLETED
```

## Admin Alternative Flow — View Existing Job

```text
Dashboard / Jobs
↓
All Jobs
↓
Select Job
↓
Job Detail
↓
View / Manage
```

## Admin Alternative Flow — Assignment Conflict

```text
Select Technician
↓
Check Schedule
↓
Conflict Detected
↓
Conflict Alert
↓
Change Schedule / Technician
↓
Re-check
↓
Assign
```

## Admin Alternative Flow — Review & Completion

```text
Job
↓
Review Work Report
↓
Checklist Complete?
↓
Evidence Complete?
↓
Customer Signature Available?
↓
Work Report Submitted?
↓
Complete Job
```

Jika requirement belum lengkap:

```text
Requirement Missing
↓
Job Remains Incomplete
↓
Wait / Review Again
```

---

# 5.2 Technician User Flow

## Primary Execution Flow

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

## Technician Alternative Flow — No Assigned Job

```text
LOGIN
↓
MY JOBS
↓
NO ASSIGNED JOB
↓
EMPTY STATE
```

## Technician Alternative Flow — GPS Check-in

```text
JOB DETAIL
↓
CHECK-IN
↓
GPS + TIMESTAMP
↓
VALID
↓
CHECK-IN RECORDED
↓
CONTINUE WORK
```

## Technician Alternative Flow — Incomplete Requirement

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

# 5.3 Owner / Manager User Flow

Owner menggunakan dashboard sebagai monitoring hub dan dapat melakukan drill-down berdasarkan kebutuhan.

```text
LOGIN
  ↓
OWNER DASHBOARD
  ↓
OPERATIONAL OVERVIEW
  │
  ├── VIEW JOBS
  │     ↓
  │   Active / Completed
  │     ↓
  │   Job Detail
  │
  ├── VIEW TECHNICIANS
  │     ↓
  │   Technician Overview
  │     ↓
  │   Technician Detail
  │
  └── VIEW BASIC PERFORMANCE
        ↓
      OPERATIONAL INSIGHT
```

## Owner Objective

```text
Monitor
→ Evaluate
→ Decide
```

---

# 6. Master User Flow

```text
                    ADMIN
                      │
                      ▼
                 CREATE JOB
                      │
                      ▼
                  CUSTOMER
                      │
                      ▼
                   SCHEDULE
                      │
                      ▼
              ASSIGN TECHNICIAN
                      │
                ┌─────┴─────┐
                │           │
             CONFLICT     NO CONFLICT
                │           │
                ▼           ▼
          ADJUST SCHEDULE  ASSIGNED
                            │
                            ▼
                       TECHNICIAN
                            │
                            ▼
                         CHECK-IN
                            │
                            ▼
                         EXECUTE
                            │
                            ▼
                       CHECKLIST
                            │
                            ▼
                     BEFORE / AFTER
                         PHOTO
                            │
                            ▼
                    CUSTOMER SIGNATURE
                            │
                            ▼
                      WORK REPORT
                            │
                            ▼
                        CHECK-OUT
                            │
                            ▼
                         REVIEW
                            │
                     ┌──────┴──────┐
                     │             │
                  INCOMPLETE     COMPLETE
                     │             │
                     ▼             ▼
                   FIX          COMPLETED
                                   │
                                   ▼
                         ADMIN / OWNER
                           MONITORING
```

---

# 7. Role Responsibility

| Workflow Stage | Admin | Technician | Owner |
|---|---|---|---|
| Create Job | Action | — | — |
| Customer | Manage | View | View |
| Schedule | Action | View | View |
| Assign Technician | Action | — | View |
| Conflict | Resolve | — | View |
| Receive Job | — | Action | — |
| Check-in | — | Action | View |
| Execute | — | Action | View |
| Checklist | — | Action | View |
| Before / After Photo | — | Action | View |
| Customer Signature | — | Action | View |
| Work Report | Review | Submit | View |
| Check-out | — | Action | View |
| Complete Job | Action | — | View |
| Job Monitoring | Action | Own Jobs | Action |
| Technician Monitoring | Action | Own Status | Action |

---

# 8. Job Lifecycle

```text
PENDING
   ↓
ASSIGNED
   ↓
ON PROGRESS
   ↓
COMPLETED
```

### Cancellation Flow

```text
PENDING
   ↓
CANCELLED

ASSIGNED
   ↓
CANCELLED

ON PROGRESS
   ↓
CANCELLED
```

---

# 9. Completion Flow

Job hanya dapat menjadi `Completed` apabila seluruh requirement terpenuhi:

```text
Checklist Complete
+
Before / After Evidence Available
+
Customer Signature Available
+
Work Report Submitted
        ↓
   JOB COMPLETED
```

Jika salah satu requirement belum terpenuhi:

```text
Job
↓
Requirement Missing
↓
Job Remains Incomplete
```

---

# 10. IA & User Flow Relationship

Struktur IA dan User Flow mengikuti hubungan berikut:

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
MONITORING
```

IA menyediakan struktur tempat pengguna bekerja, sedangkan User Flow menjelaskan bagaimana pengguna berpindah dan melakukan tindakan dalam struktur tersebut.

---

# 11. MVP Boundary

IA dan User Flow hanya mencakup fitur MVP v1.0:

### Core Job Management

- Login & Role Management
- Customer Management
- Quick Ticket
- Job Management
- Work Order
- Technician Assignment
- Scheduling & Calendar
- Visual Dispatch Board
- Conflict Alert
- Job Status Tracking

### Technician Workflow

- My Jobs
- Job Detail
- GPS Check-in / Check-out
- SOP Checklist
- Before / After Photo
- E-Signature
- Work Report

### Management

- Basic Admin Dashboard
- Basic Owner Dashboard
- Basic Job & Technician Monitoring

Fitur di luar MVP v1.0 tidak dimasukkan ke dalam IA maupun User Flow.

---

# 12. Final Design Baseline

## Admin / Dispatcher

```text
Manage
→ Schedule
→ Assign
→ Monitor
→ Review
→ Complete
```

## Technician

```text
Receive
→ Execute
→ Document
→ Submit
```

## Owner / Manager

```text
Monitor
→ Evaluate
→ Decide
```

## Product-Level Flow

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

> **FieldOps IA & User Flow v1.0 = Final Baseline untuk tahap UI/UX Design MVP v1.0.**