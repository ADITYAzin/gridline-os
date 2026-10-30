-- ==============================================================================
-- Gridline OS — Migration: Dynamic Technician Commissions Configuration
-- Version: 20261025000000
-- ==============================================================================

-- 1. Add commission settings columns to organizations table
ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS commission_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS commission_type TEXT NOT NULL DEFAULT 'service_based',
  ADD COLUMN IF NOT EXISTS default_commission_rate NUMERIC(12, 2) NOT NULL DEFAULT 50000,
  ADD COLUMN IF NOT EXISTS on_time_bonus_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS on_time_bonus_rate NUMERIC(12, 2) NOT NULL DEFAULT 25000;

-- 2. Add custom commission rate column to company_services
ALTER TABLE public.company_services
  ADD COLUMN IF NOT EXISTS commission_rate NUMERIC(12, 2) DEFAULT NULL;

-- 3. Comment on columns for schema clarity
COMMENT ON COLUMN public.organizations.commission_enabled IS 'Master flag: whether technician commissions are active for this organization';
COMMENT ON COLUMN public.organizations.commission_type IS 'Commission scheme: service_based or flat';
COMMENT ON COLUMN public.organizations.default_commission_rate IS 'Fallback or flat commission rate per completed job';
COMMENT ON COLUMN public.organizations.on_time_bonus_enabled IS 'Flag: whether SLA on-time bonus is awarded';
COMMENT ON COLUMN public.organizations.on_time_bonus_rate IS 'Bonus amount awarded if job is completed before scheduled end';
COMMENT ON COLUMN public.company_services.commission_rate IS 'Service-specific base commission. If NULL, fallback to default_commission_rate';
