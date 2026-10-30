-- ==============================================================================
-- Opilines — Migration: Full Realtime Publication & Technician Customer RLS Fix
-- Version: 20261025010000
-- ==============================================================================

-- 1. Add RLS SELECT policy on customers for technicians in the same organization
-- Ensures technicians can view customer name/phone/address on assigned jobs & BAP
CREATE POLICY "customers_technician_select" ON public.customers
  FOR SELECT
  TO authenticated
  USING (org_id = get_user_org_id());

-- 2. Enable REPLICA IDENTITY FULL on all remaining operational tables
ALTER TABLE public.checklist_items REPLICA IDENTITY FULL;
ALTER TABLE public.job_photos REPLICA IDENTITY FULL;
ALTER TABLE public.work_reports REPLICA IDENTITY FULL;
ALTER TABLE public.signatures REPLICA IDENTITY FULL;
ALTER TABLE public.organizations REPLICA IDENTITY FULL;
ALTER TABLE public.profiles REPLICA IDENTITY FULL;
ALTER TABLE public.customers REPLICA IDENTITY FULL;
ALTER TABLE public.invite_tokens REPLICA IDENTITY FULL;

-- 3. Add all remaining operational tables to supabase_realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.checklist_items;
ALTER PUBLICATION supabase_realtime ADD TABLE public.job_photos;
ALTER PUBLICATION supabase_realtime ADD TABLE public.work_reports;
ALTER PUBLICATION supabase_realtime ADD TABLE public.signatures;
ALTER PUBLICATION supabase_realtime ADD TABLE public.organizations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.customers;
ALTER PUBLICATION supabase_realtime ADD TABLE public.invite_tokens;
