-- ==============================================================================
-- Gridline OS — Migration: Company Info, Location & Services Catalog
-- Version: 20261014220000
-- ==============================================================================

-- 1. Add company information and location columns to organizations table
ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS province TEXT,
  ADD COLUMN IF NOT EXISTS postal_code TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS is_onboarded BOOLEAN NOT NULL DEFAULT FALSE;

-- 2. Create table company_services
CREATE TABLE IF NOT EXISTS public.company_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  default_price NUMERIC(12, 2) DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_company_services_org_name UNIQUE (org_id, name)
);

-- 3. Indexes
CREATE INDEX IF NOT EXISTS idx_company_services_org_id ON public.company_services(org_id);
CREATE INDEX IF NOT EXISTS idx_company_services_org_active ON public.company_services(org_id, is_active);

-- 4. Enable RLS
ALTER TABLE public.company_services ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies
-- Admin and Owner have full access
DROP POLICY IF EXISTS "company_services_admin_all" ON public.company_services;
CREATE POLICY "company_services_admin_all" ON public.company_services
  FOR ALL
  USING (
    org_id = get_user_org_id() AND
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('admin', 'owner')
    )
  )
  WITH CHECK (
    org_id = get_user_org_id() AND
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('admin', 'owner')
    )
  );

-- All authenticated org members (including technicians) can view active services
DROP POLICY IF EXISTS "company_services_member_select" ON public.company_services;
CREATE POLICY "company_services_member_select" ON public.company_services
  FOR SELECT
  USING (
    org_id = get_user_org_id() AND is_active = TRUE
  );

-- 6. Add to Realtime Publication
ALTER TABLE public.company_services REPLICA IDENTITY FULL;
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.company_services;
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
