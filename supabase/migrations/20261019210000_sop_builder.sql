-- ==============================================================================
-- Gridline OS — Migration: SOP Builder per Company Service
-- Version: 20261019210000
-- ==============================================================================
-- Adds configurable SOP support to company_services and checklist_items.
-- Admin can now define SOP items (mode, items JSONB, notes, duration, risk)
-- per service. When a job is created, the SOP is snapshotted into checklist_items.
-- ==============================================================================

-- 1. Add SOP columns to company_services
ALTER TABLE public.company_services
  ADD COLUMN IF NOT EXISTS sop_mode TEXT NOT NULL DEFAULT 'none'
    CHECK (sop_mode IN ('strict', 'reference', 'none')),
  ADD COLUMN IF NOT EXISTS sop_items JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS sop_notes TEXT,
  ADD COLUMN IF NOT EXISTS estimated_duration_minutes INTEGER,
  ADD COLUMN IF NOT EXISTS risk_level TEXT NOT NULL DEFAULT 'low'
    CHECK (risk_level IN ('low', 'medium', 'high'));

-- sop_items JSONB array format (per item):
-- [
--   {
--     "id": "uuid-string",
--     "item": "Instruksi langkah SOP",
--     "order": 1,
--     "requires_photo": false,
--     "is_critical": false,
--     "hint": ""
--   }
-- ]

-- 2. Add N/A support and SOP metadata to checklist_items (snapshot fields)
ALTER TABLE public.checklist_items
  ADD COLUMN IF NOT EXISTS is_na BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS na_reason TEXT,
  ADD COLUMN IF NOT EXISTS sop_mode TEXT NOT NULL DEFAULT 'strict',
  ADD COLUMN IF NOT EXISTS requires_photo BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS is_critical BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS hint TEXT;

-- 3. Update completion gate trigger to support N/A and SOP mode
-- Item is considered "done" if: is_completed = true OR (is_na = true AND is_critical = false)
-- Checklist validation is skipped entirely if ALL checklist items have sop_mode = 'reference' or 'none'
CREATE OR REPLACE FUNCTION public.validate_job_lifecycle_transition()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_pending_checklist_count INTEGER;
  v_before_photo_count INTEGER;
  v_after_photo_count INTEGER;
  v_signature_count INTEGER;
  v_report_count INTEGER;
  v_has_strict_items BOOLEAN;
BEGIN
  -- 8.1 Gating Transition into COMPLETED
  IF NEW.status = 'completed' AND (OLD.status IS DISTINCT FROM 'completed') THEN

    -- Check if this job has any strict-mode checklist items
    SELECT EXISTS (
      SELECT 1 FROM public.checklist_items
      WHERE job_id = NEW.id AND sop_mode = 'strict'
    ) INTO v_has_strict_items;

    -- Condition 1: Validate SOP checklist only for strict-mode jobs
    -- Item is "pending" if: is_completed = false AND (is_na = false OR is_critical = true)
    IF v_has_strict_items THEN
      SELECT COUNT(*) INTO v_pending_checklist_count
      FROM public.checklist_items
      WHERE job_id = NEW.id
        AND sop_mode = 'strict'
        AND is_completed = FALSE
        AND (is_na = FALSE OR is_critical = TRUE);

      IF v_pending_checklist_count > 0 THEN
        RAISE EXCEPTION 'Completion failed: All SOP checklist items must be completed or marked as N/A (non-critical items only).';
      END IF;
    END IF;

    -- Condition 2: At least 1 BEFORE photo (Decision #8)
    SELECT COUNT(*) INTO v_before_photo_count
    FROM public.job_photos
    WHERE job_id = NEW.id AND type = 'before';

    IF v_before_photo_count < 1 THEN
      RAISE EXCEPTION 'Completion failed: At least 1 "before" photo evidence is required.';
    END IF;

    -- Condition 3: At least 1 AFTER photo (Decision #8)
    SELECT COUNT(*) INTO v_after_photo_count
    FROM public.job_photos
    WHERE job_id = NEW.id AND type = 'after';

    IF v_after_photo_count < 1 THEN
      RAISE EXCEPTION 'Completion failed: At least 1 "after" photo evidence is required.';
    END IF;

    -- Condition 4: Customer E-Signature available
    SELECT COUNT(*) INTO v_signature_count
    FROM public.signatures
    WHERE job_id = NEW.id;

    IF v_signature_count < 1 THEN
      RAISE EXCEPTION 'Completion failed: Customer signature is required.';
    END IF;

    -- Condition 5: Submitted Work Report available
    SELECT COUNT(*) INTO v_report_count
    FROM public.work_reports
    WHERE job_id = NEW.id;

    IF v_report_count < 1 THEN
      RAISE EXCEPTION 'Completion failed: Submitted work report is required.';
    END IF;

    -- Auto-record completion timestamp if not passed
    IF NEW.completed_at IS NULL THEN
      NEW.completed_at := now();
    END IF;
  END IF;

  -- 8.2 Gating Transition into CANCELLED (Decision #6 & #9)
  IF NEW.status = 'cancelled' AND (OLD.status IS DISTINCT FROM 'cancelled') THEN
    IF NEW.cancellation_reason IS NULL OR trim(NEW.cancellation_reason) = '' THEN
      RAISE EXCEPTION 'Cancellation failed: Cancellation reason is required.';
    END IF;

    IF NEW.cancelled_at IS NULL THEN
      NEW.cancelled_at := now();
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- Re-bind the trigger (function already replaced above)
DROP TRIGGER IF EXISTS trg_validate_job_lifecycle_transition ON public.jobs;
CREATE TRIGGER trg_validate_job_lifecycle_transition
BEFORE UPDATE ON public.jobs
FOR EACH ROW
EXECUTE FUNCTION public.validate_job_lifecycle_transition();
