-- ==============================================================================
-- Opilines — Migration: Technician Attendance Photo
-- Version: 20261025030000
-- ==============================================================================

-- 1. Add check_in_photo_url to job_attendance
ALTER TABLE public.job_attendance
  ADD COLUMN IF NOT EXISTS check_in_photo_url TEXT DEFAULT NULL;

COMMENT ON COLUMN public.job_attendance.check_in_photo_url 
  IS 'Storage path to technician presence selfie/photo taken during GPS check-in (internal company attendance only, excluded from customer BAP).';
