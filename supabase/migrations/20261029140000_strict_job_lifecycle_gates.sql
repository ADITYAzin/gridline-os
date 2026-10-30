-- ==============================================================================
-- Opilines — Migration: Strict Job Lifecycle Anti-Skip Gates
-- Version: 20261029140000
-- ==============================================================================
-- Ensures Check-in, SOP, Evidence Photos, E-Signature, Work Report,
-- and Check-out are strictly REQUIRED to transition into 'completed'.
-- Prevents any skipping or bypass across all lifecycle stages.
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.validate_job_lifecycle_transition()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_has_check_in BOOLEAN;
  v_has_check_out BOOLEAN;
  v_has_strict_items BOOLEAN;
  v_pending_checklist_count INTEGER;
  v_missing_sop_photos INTEGER;
  v_before_photo_count INTEGER;
  v_after_photo_count INTEGER;
  v_signature_count INTEGER;
  v_report_count INTEGER;
BEGIN
  -- 1. Gating Transition into COMPLETED
  IF NEW.status = 'completed' AND (OLD.status IS DISTINCT FROM 'completed') THEN

    -- Gate 1: Check-in attendance is strictly required
    SELECT EXISTS (
      SELECT 1 FROM public.job_attendance
      WHERE job_id = NEW.id AND check_in_at IS NOT NULL
    ) INTO v_has_check_in;

    IF NOT v_has_check_in THEN
      RAISE EXCEPTION 'Completion failed: Check-in kehadiran teknisi di lokasi wajib dilakukan sebelum tiket dapat diselesaikan.';
    END IF;

    -- Gate 2: Check-out attendance is strictly required
    SELECT EXISTS (
      SELECT 1 FROM public.job_attendance
      WHERE job_id = NEW.id AND check_out_at IS NOT NULL
    ) INTO v_has_check_out;

    IF NOT v_has_check_out THEN
      RAISE EXCEPTION 'Completion failed: Check-out kepulangan teknisi dari lokasi wajib dilakukan sebelum tiket dapat diselesaikan.';
    END IF;

    -- Gate 3: SOP checklist validation
    SELECT EXISTS (
      SELECT 1 FROM public.checklist_items
      WHERE job_id = NEW.id AND sop_mode = 'strict'
    ) INTO v_has_strict_items;

    IF v_has_strict_items THEN
      -- All strict items must be completed or marked N/A (non-critical only)
      SELECT COUNT(*) INTO v_pending_checklist_count
      FROM public.checklist_items
      WHERE job_id = NEW.id
        AND sop_mode = 'strict'
        AND is_completed = FALSE
        AND (is_na = FALSE OR is_critical = TRUE);

      IF v_pending_checklist_count > 0 THEN
        RAISE EXCEPTION 'Completion failed: Seluruh langkah SOP wajib diselesaikan atau ditandai N/A yang sah.';
      END IF;

      -- All strict items requiring photo must have physical photo attached
      SELECT COUNT(*) INTO v_missing_sop_photos
      FROM public.checklist_items ci
      WHERE ci.job_id = NEW.id
        AND ci.sop_mode = 'strict'
        AND ci.requires_photo = TRUE
        AND ci.is_completed = TRUE
        AND NOT EXISTS (
          SELECT 1 FROM public.job_photos jp
          WHERE jp.checklist_item_id = ci.id
        );

      IF v_missing_sop_photos > 0 THEN
        RAISE EXCEPTION 'Completion failed: Seluruh langkah SOP yang wajib foto harus memiliki lampiran foto bukti fisik.';
      END IF;
    END IF;

    -- Gate 4: At least 1 BEFORE photo
    SELECT COUNT(*) INTO v_before_photo_count
    FROM public.job_photos
    WHERE job_id = NEW.id AND type = 'before';

    IF v_before_photo_count < 1 THEN
      RAISE EXCEPTION 'Completion failed: Minimal 1 foto bukti Before (sebelum pengerjaan) wajib diunggah.';
    END IF;

    -- Gate 5: At least 1 AFTER photo
    SELECT COUNT(*) INTO v_after_photo_count
    FROM public.job_photos
    WHERE job_id = NEW.id AND type = 'after';

    IF v_after_photo_count < 1 THEN
      RAISE EXCEPTION 'Completion failed: Minimal 1 foto bukti After (sesudah pengerjaan) wajib diunggah.';
    END IF;

    -- Gate 6: Customer E-Signature available
    SELECT COUNT(*) INTO v_signature_count
    FROM public.signatures
    WHERE job_id = NEW.id;

    IF v_signature_count < 1 THEN
      RAISE EXCEPTION 'Completion failed: Tanda tangan pelanggan wajib diperoleh.';
    END IF;

    -- Gate 7: Submitted Work Report available
    SELECT COUNT(*) INTO v_report_count
    FROM public.work_reports
    WHERE job_id = NEW.id AND trim(result) <> '';

    IF v_report_count < 1 THEN
      RAISE EXCEPTION 'Completion failed: Laporan hasil pekerjaan teknisi wajib diisi.';
    END IF;

    -- Auto-record completion timestamp if not passed
    IF NEW.completed_at IS NULL THEN
      NEW.completed_at := now();
    END IF;
  END IF;

  -- 2. Gating Transition into CANCELLED
  IF NEW.status = 'cancelled' AND (OLD.status IS DISTINCT FROM 'cancelled') THEN
    IF NEW.cancellation_reason IS NULL OR trim(NEW.cancellation_reason) = '' THEN
      RAISE EXCEPTION 'Cancellation failed: Alasan pembatalan pekerjaan wajib diisi.';
    END IF;

    IF NEW.cancelled_at IS NULL THEN
      NEW.cancelled_at := now();
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;

-- Ensure trigger is active
DROP TRIGGER IF EXISTS trg_validate_job_lifecycle_transition ON public.jobs;
CREATE TRIGGER trg_validate_job_lifecycle_transition
BEFORE UPDATE ON public.jobs
FOR EACH ROW
EXECUTE FUNCTION public.validate_job_lifecycle_transition();
