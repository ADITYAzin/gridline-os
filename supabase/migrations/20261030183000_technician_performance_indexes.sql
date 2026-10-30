-- ==============================================================================
-- Gridline OS — Migration: Technician PWA Query Performance & FK Indexes
-- Version: 20261030183000
-- ==============================================================================

-- 1. Foreign Key Indexes on job_id for TechnicianJobDetailPage parallel queries
CREATE INDEX IF NOT EXISTS idx_checklist_items_job_id ON public.checklist_items(job_id);
CREATE INDEX IF NOT EXISTS idx_job_photos_job_id ON public.job_photos(job_id);
CREATE INDEX IF NOT EXISTS idx_job_attendance_job_id ON public.job_attendance(job_id);
CREATE INDEX IF NOT EXISTS idx_signatures_job_id ON public.signatures(job_id);
CREATE INDEX IF NOT EXISTS idx_work_reports_job_id ON public.work_reports(job_id);
CREATE INDEX IF NOT EXISTS idx_schedules_job_id ON public.schedules(job_id);

-- 2. Composite Indexes for Technician Home & Commission/Performance Queries
CREATE INDEX IF NOT EXISTS idx_jobs_technician_org ON public.jobs(technician_id, org_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_technician_status ON public.jobs(technician_id, status, completed_at DESC);
