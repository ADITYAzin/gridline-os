# FieldOps — Tech Stack & Libraries

## 1. Core Tech Stack

- **Framework:** Next.js
- **Frontend:** React + TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui + Radix UI
- **Backend:** Supabase
- **Database:** PostgreSQL
- **Authentication:** Supabase Auth
- **File Storage:** Supabase Storage
- **Deployment:** Vercel
- **Version Control:** Git + GitHub

## 2. UI / UX

- **Component:** shadcn/ui
- **Primitive:** Radix UI
- **Icons:** Lucide React
- **Headline Font:** Sora
- **Body / Description Font:** Poppins
- **Animation:** Framer Motion
- **Charts:** Recharts

## 3. Form & Validation

- React Hook Form
- Zod
- @hookform/resolvers

## 4. Data & State

- TanStack Query — Server State
- Zustand — Client State

## 5. Scheduling & Field Service

- FullCalendar — Calendar / Scheduling
- dnd-kit — Drag & Drop Dispatch Board
- date-fns — Date & Time

## 6. Location & Maps

- Browser Geolocation API — GPS Check-in / Check-out (MVP)
- Mapbox GL JS — **ditunda ke v1.1**

> **Keputusan 2026-09-04:** MVP hanya membutuhkan koordinat GPS (Browser Geolocation API). Mapbox ditunda ke v1.1 untuk menahan biaya & kompleksitas MVP.

## 7. Technician Workflow

- react-signature-canvas — Customer Signature
- MediaDevices API — Camera
- Browser Geolocation API — GPS Check-in / Check-out

## 8. Developer Tools

- ESLint
- Prettier
- pnpm
- Husky
- lint-staged

## 9. VS Code Extensions

- ESLint
- Prettier - Code formatter
- Tailwind CSS IntelliSense
- Error Lens
- GitLens

## 10. Core Dependencies

```bash
pnpm add @supabase/supabase-js
pnpm add @tanstack/react-query
pnpm add zustand
pnpm add react-hook-form zod @hookform/resolvers
pnpm add date-fns
pnpm add lucide-react
pnpm add recharts
pnpm add framer-motion
```

## 11. Feature-Specific Dependencies

Install only when the feature is developed:

```bash
pnpm add @dnd-kit/core @dnd-kit/sortable
pnpm add react-signature-canvas
```

FullCalendar dan dnd-kit dipasang saat modul **Schedule/Dispatch** mulai dikerjakan. `mapbox-gl` dipasang saat modul **Location/Map v1.1** dimulai.

## 12. Recommended Architecture

```text
Next.js
├── React
├── TypeScript
├── Tailwind CSS
├── shadcn/ui
├── Radix UI
├── Lucide React
├── React Hook Form
├── Zod
├── TanStack Query
├── Zustand
├── Recharts
├── Framer Motion
├── FullCalendar
├── dnd-kit
└── Supabase
    ├── Auth
    ├── PostgreSQL
    └── Storage
```

## 13. MVP Priority

### Must Install

- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- Supabase
- React Hook Form
- Zod
- TanStack Query
- Zustand
- Lucide React
- date-fns
- FullCalendar
- dnd-kit
- Recharts
- Framer Motion
- react-signature-canvas

> Mapbox tidak termasuk MVP — lihat §6.

### Avoid for MVP

- Redux
- UI library tambahan
- State management tambahan
- Heavy animation library
- Backend framework terpisah
- Database ORM tambahan
- Unnecessary utility libraries
- Mapbox (ditunda ke v1.1)

---

# Revision History

| Ver | Tanggal | Perubahan | Dokumen Terkait |
|---|---|---|---|
| v1.0 | 2026-09-04 | Mapbox ditunda ke v1.1 — MVP memakai Browser Geolocation API (§6, §11, §12, §13) | ERD Database Schema v1.1, DesignGuidelines |