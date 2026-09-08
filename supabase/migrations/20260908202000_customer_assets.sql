-- 1. Create table customer_assets
CREATE TABLE IF NOT EXISTS public.customer_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  asset_name TEXT NOT NULL,
  brand TEXT NOT NULL,
  model_number TEXT,
  serial_number TEXT,
  location_tag TEXT,
  installation_date DATE,
  warranty_expires_at DATE,
  status TEXT NOT NULL DEFAULT 'operational' CHECK (status IN ('operational', 'needs_service', 'broken', 'decommissioned')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Add asset_id column to jobs table (nullable, backward compatible)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'jobs' AND column_name = 'asset_id'
  ) THEN
    ALTER TABLE public.jobs 
    ADD COLUMN asset_id UUID REFERENCES public.customer_assets(id) ON DELETE SET NULL;
  END IF;
END $$;

-- 3. Create Indexes
CREATE INDEX IF NOT EXISTS idx_customer_assets_org_id ON public.customer_assets(org_id);
CREATE INDEX IF NOT EXISTS idx_customer_assets_customer_id ON public.customer_assets(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_assets_status ON public.customer_assets(status);
CREATE INDEX IF NOT EXISTS idx_jobs_asset_id ON public.jobs(asset_id);

-- 4. Enable RLS
ALTER TABLE public.customer_assets ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies
DROP POLICY IF EXISTS "assets_admin_all" ON public.customer_assets;
CREATE POLICY "assets_admin_all" ON public.customer_assets
  FOR ALL
  USING (
    org_id = get_user_org_id() AND
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  )
  WITH CHECK (
    org_id = get_user_org_id() AND
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "assets_staff_select" ON public.customer_assets;
CREATE POLICY "assets_staff_select" ON public.customer_assets
  FOR SELECT
  USING (
    org_id = get_user_org_id() AND
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('admin', 'owner')
    )
  );

DROP POLICY IF EXISTS "assets_technician_select" ON public.customer_assets;
CREATE POLICY "assets_technician_select" ON public.customer_assets
  FOR SELECT
  USING (
    org_id = get_user_org_id()
  );

-- 6. Add to Realtime Publication
ALTER TABLE public.customer_assets REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.customer_assets;
