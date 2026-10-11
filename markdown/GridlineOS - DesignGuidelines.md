# GridlineOS — Design System & Visual Guidelines v1.0

> **Platform:** Field Service Management (B2B SaaS)  
> **Target Products:** Dispatcher Web Portal, Manager Operational Dashboard, Field Technician Poppinsface  
> **Brand Identity:** Gridline Blue (`#007ACC`)  
> **Typography System:** Plus Jakarta Sans & Poppins (mengikuti Tech Stack & Libraries)

---

## 1. Brand Identity & Color System

The color system is engineered around functional modernism: high data legibility, low visual fatigue during long dispatch shifts, and deliberate contrast.

### 1.1 Brand Primary (Gridline Blue)
Sampled directly from the primary brand identity mark. Used to anchor navigation, primary actions, and focused states.

| Token | Hex Value | Usage / Role |
|---|---|---|
| `color-primary-50` | `#EBF5FC` | Row hover/select tints, active sidebar pills, subtle badges |
| `color-primary-100` | `#D0E8F8` | Focus ring glow, light accent containers |
| `color-primary-500` | `#007ACC` | **Core Brand Blue**: primary CTA, active navigation, active tabs |
| `color-primary-600` | `#0062A3` | Hover state for primary buttons and interactive links |
| `color-primary-700` | `#004F82` | Pressed / active state for primary buttons |

### 1.2 Neutral Scales (Slate / Functional Grayscale)
Optimized for dense data surfaces, tables, and layered operational workflows.

| Token | Hex Value | Application |
|---|---|---|
| `color-surface-white` | `#FFFFFF` | Card backgrounds, modal surfaces, form inputs |
| `color-surface-canvas` | `#F8FAFC` | Page body background, nested panel fills |
| `color-surface-subdued` | `#F1F5F9` | Table header rows, disabled states, dividers |
| `color-border-subtle` | `#E2E8F0` | Default card borders, grid dividers, standard input borders |
| `color-border-strong` | `#CBD5E1` | Card hover outlines, active input boundaries |
| `color-text-muted` | `#94A3B8` | Placeholders, inactive icons, secondary meta captions |
| `color-text-secondary` | `#475569` | Table values, form labels, supporting descriptions |
| `color-text-primary` | `#0F172A` | Primary headlines, data points, active menu text |

### 1.3 Operational Semantic Colors
Used for dispatch status tags, technician SLA tracking, and audit reports.

| Semantic | Hex Color | Background Tint | Usage Example |
|---|---|---|---|
| **Success** | `#10B981` | `#ECFDF5` | Job Completed, Signature Received, Check-in Verified |
| **Warning** | `#F59E0B` | `#FFFBEB` | In Progress, Inspection Pending, SLA Warning |
| **Danger** | `#EF4444` | `#FEF2F2` | SLA Breach, Technician Conflict, Form Rejection |
| **Info** | `#0EA5E9` | `#F0F9FF` | Job Assigned, En Route, Draft Scheduled |

---

## 2. Typography System

To maintain visual cohesion, the entire system relies on a maximum of **two font families**:
* **Headline Font:** `Plus Jakarta Sans` — Modern, geometric, clean architectural feel.
* **Body / UI Font:** `Poppins` — High x-height, neutral geometric grotesque optimized for data density.

### Typographic Hierarchy Scale

| Style Level | Font Family | Size | Weight | Line Height | Tracking | Purpose |
|---|---|---|---|---|---|---|
| **Display 1** | Plus Jakarta Sans | 32px | 700 (Bold) | 40px | -0.02em | KPI Metric Numbers, Login titles |
| **Heading 1** | Plus Jakarta Sans | 24px | 600 (SemiBold) | 32px | -0.015em | View & Board Titles (e.g., Job Board) |
| **Heading 2** | Plus Jakarta Sans | 18px | 600 (SemiBold) | 26px | -0.01em | Modal headers, Card category titles |
| **Body Large** | Poppins | 16px | 400 / 500 | 24px | 0 | Lead summaries, modal introductions |
| **Body Regular** | Poppins | 14px | 400 / 500 | 20px | 0 | Form inputs, table cells, primary descriptions |
| **Caption** | Poppins | 12px | 500 (Medium) | 16px | +0.01em | Field labels, timestamps, badge labels |
| **Micro / Overline** | Poppins | 10px | 600 (SemiBold) | 14px | +0.02em | Section subheaders, metadata tags |

---

## 3. Spacing & Grid System

The spatial framework uses a strict **8-point grid** (with a 4px micro-step for compact data elements).

### Spacing Tokens
* `space-1` (4px): Micro gap between icons and text, chip vertical padding.
* `space-2` (8px): Badge internal padding, compact form spacing, list item row gaps.
* `space-3` (12px): Standard input field vertical padding, small group margin.
* `space-4` (16px): Card standard horizontal inset, standard form row gaps.
* `space-5` (20px): Drawer panel internal padding, sidebar group separators.
* `space-6` (24px): Primary dashboard widget padding, table outer margins.
* `space-8` (32px): Vertical spacing between dashboard sections.
* `space-12` (48px): Page-level module separation.

### Layout & Container Specifications
* **Max Container Width:** 1600px (Desktop Full-HD dashboard).
* **Sidebar Navigation:** 260px fixed width (collapses to 72px icon rail on viewports < 1280px).
* **Grid Architecture:** 12-column grid with 24px gutters and 24px outer page margins.

---

## 4. Elevation & Radius Tokens

### Border Radii
* `radius-sm` (6px): Status badges, filter tags, small avatar clips.
* `radius-md` (8px): Buttons, form text inputs, select dropdowns.
* `radius-lg` (12px): Dashboard cards, data table wrappers, modal panels.
* `radius-pill` (9999px): Toggle switches, circular profile avatars.

### Shadows & Elevation
* **Elevation 1 (Card Default):** `0px 1px 2px 0px rgba(15, 23, 42, 0.05)`  
* **Elevation 2 (Card Hover & Dropdowns):** `0px 4px 6px -1px rgba(15, 23, 42, 0.08), 0px 2px 4px -2px rgba(15, 23, 42, 0.04)`  
* **Elevation 3 (Slide-over Drawers & Modals):** `0px 20px 25px -5px rgba(15, 23, 42, 0.1), 0px 8px 10px -6px rgba(15, 23, 42, 0.04)`  

---

## 5. UI Component Guidelines

### 5.1 Buttons
* **Primary:**
  * Background: `#007ACC` | Text: `#FFFFFF` | Border: None | Radius: `8px` | Height: `40px` | Font: Poppins 14px / 500
  * Hover: `#0062A3` | Active: `#004F82`
* **Secondary:**
  * Background: `#FFFFFF` | Text: `#0F172A` | Border: `1px solid #CBD5E1` | Radius: `8px`
  * Hover: Background `#F8FAFC`, Border `#94A3B8`
* **Ghost:**
  * Background: Transparent | Text: `#475569` | Radius: `8px`
  * Hover: Background `#F1F5F9`, Text `#0F172A`

### 5.2 Status Badges
Pill components showing job lifecycle state:
* Height: `24px` | Padding: `0 8px` | Radius: `6px` | Font: Poppins 12px / 500
* **Draft / Unassigned:** Background `#F1F5F9` | Text `#475569`
* **Assigned:** Background `#F0F9FF` | Text `#0369A1` | Dot indicator: `#0EA5E9`
* **In Progress:** Background `#FFFBEB` | Text `#B45309` | Dot indicator: `#F59E0B`
* **Completed:** Background `#ECFDF5` | Text `#047857` | Dot indicator: `#10B981`
* **Conflict / Delayed:** Background `#FEF2F2` | Text `#B91C1C` | Dot indicator: `#EF4444`

### 5.3 Data Tables (Job Management & Dispatch)
* **Header Row:** Height `44px`, background `#F8FAFC`, border bottom `1px solid #E2E8F0`. Label: Poppins 12px / 600, uppercase, tracking +0.02em, color `#475569`.
* **Data Row:** Height `56px`, background `#FFFFFF`, border bottom `1px solid #F1F5F9`. Text: Poppins 14px / 400, color `#0F172A`.
* **Row Hover:** Background `#F8FAFC`.
* **Active / Selected Row:** Background `#EBF5FC`, left border accent `3px solid #007ACC`.

### 5.4 Form Inputs
* **Standard Field:** Height `40px`, background `#FFFFFF`, border `1px solid #E2E8F0`, radius `8px`, padding `0 12px`, text Poppins 14px.
* **Focus State:** Border `#007ACC`, box shadow ring `0 0 0 3px rgba(0, 122, 204, 0.15)`.
* **Error State:** Border `#EF4444`, box shadow ring `0 0 0 3px rgba(239, 68, 68, 0.15)`.

---

# Revision History

| Ver | Tanggal | Perubahan | Dokumen Terkait |
|---|---|---|---|
| v1.0 | 2026-09-04 | Font system disamakan ke Sora + Poppins (sesuai Tech Stack) | Tech Stack & Libraries, ERD Database Schema v1.1 |
