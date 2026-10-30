-- ==============================================================================
-- Opilines — Migration: Default Commission Rates to Rp 0
-- Version: 20261025020000
-- ==============================================================================

-- Alter default values on organizations table to 0
ALTER TABLE public.organizations
  ALTER COLUMN default_commission_rate SET DEFAULT 0,
  ALTER COLUMN on_time_bonus_rate SET DEFAULT 0,
  ALTER COLUMN on_time_bonus_enabled SET DEFAULT false;

-- Update existing rows where commission is disabled and still holding old dummy defaults
UPDATE public.organizations
SET 
  default_commission_rate = 0,
  on_time_bonus_rate = 0,
  on_time_bonus_enabled = false
WHERE commission_enabled = false AND default_commission_rate = 50000;

-- Ensure null values are coerced to 0
UPDATE public.organizations
SET 
  default_commission_rate = COALESCE(default_commission_rate, 0),
  on_time_bonus_rate = COALESCE(on_time_bonus_rate, 0);
