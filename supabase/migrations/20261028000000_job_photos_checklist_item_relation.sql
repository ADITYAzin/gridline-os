-- Migration: Add checklist_item_id and caption to job_photos
-- Enables direct 1-tap photo evidence attachment from SOP checklist items and proper BAP labeling.

ALTER TABLE public.job_photos 
ADD COLUMN IF NOT EXISTS checklist_item_id UUID REFERENCES public.checklist_items(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS caption TEXT;

CREATE INDEX IF NOT EXISTS idx_job_photos_checklist_item_id ON public.job_photos(checklist_item_id);

COMMENT ON COLUMN public.job_photos.checklist_item_id IS 'Optional link to specific SOP checklist item';
COMMENT ON COLUMN public.job_photos.caption IS 'Descriptive title or SOP item label for BAP documentation';
