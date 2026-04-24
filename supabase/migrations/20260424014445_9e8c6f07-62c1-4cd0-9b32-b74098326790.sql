-- Phase 5: Pricing tier system for execution orders

-- 1. Create pricing_tiers table
CREATE TABLE IF NOT EXISTS public.pricing_tiers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  mode TEXT NOT NULL CHECK (mode IN ('digital', 'field')),
  payout_min NUMERIC NOT NULL,
  payout_max NUMERIC NOT NULL,
  recommended_payout NUMERIC NOT NULL,
  min_rank_level INTEGER NOT NULL DEFAULT 1,
  description TEXT,
  use_cases TEXT[] DEFAULT '{}',
  rush_premium_percent INTEGER DEFAULT 0,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.pricing_tiers ENABLE ROW LEVEL SECURITY;

-- Public read for all authenticated users (brands & operators need to see tiers)
CREATE POLICY "Anyone can view active pricing tiers"
  ON public.pricing_tiers FOR SELECT
  USING (is_active = true);

-- Only admins can manage
CREATE POLICY "Admins can manage pricing tiers"
  ON public.pricing_tiers FOR ALL
  USING (public.is_admin_safe(auth.uid()))
  WITH CHECK (public.is_admin_safe(auth.uid()));

-- Seed the 6 tiers
INSERT INTO public.pricing_tiers (id, name, mode, payout_min, payout_max, recommended_payout, min_rank_level, description, use_cases, rush_premium_percent, display_order)
VALUES
  ('micro', 'Micro Task', 'digital', 300, 800, 500, 1,
   'Quick digital actions completed in 2-5 minutes',
   ARRAY['App download', 'Account signup', 'Quick survey', 'Newsletter subscription'], 0, 1),
  ('standard', 'Standard Task', 'digital', 1500, 3500, 2500, 2,
   '10-20 minute digital tasks requiring detail and care',
   ARRAY['KYC completion', 'Detailed feedback', 'Content review', 'Product testing'], 20, 2),
  ('priority', 'Priority Task', 'digital', 5000, 10000, 7500, 3,
   'Verification-heavy digital work requiring trusted operators',
   ARRAY['Mystery shopping', 'In-depth product testing', 'Compliance verification'], 0, 3),
  ('field_standard', 'Field — Standard', 'field', 8000, 15000, 11000, 3,
   'Single-location physical visits with proof requirements',
   ARRAY['Branch visit', 'Store audit', 'Geo-photo verification', 'Single inspection'], 20, 4),
  ('field_high_value', 'Field — High Value', 'field', 20000, 50000, 30000, 4,
   'Multi-stop or specialized field activations',
   ARRAY['Property inspection', 'Multi-stop audit', 'Full activation', 'Event verification'], 0, 5),
  ('audit', 'Audit / Specialist', 'field', 75000, 200000, 100000, 5,
   'Compliance audits and expert-level verification',
   ARRAY['Compliance audit', 'Expert verification', 'Multi-day field operation'], 0, 6)
ON CONFLICT (id) DO NOTHING;

-- 2. Add tier columns to execution_order_templates
ALTER TABLE public.execution_order_templates
  ADD COLUMN IF NOT EXISTS pricing_tier TEXT REFERENCES public.pricing_tiers(id),
  ADD COLUMN IF NOT EXISTS payout_min NUMERIC,
  ADD COLUMN IF NOT EXISTS payout_max NUMERIC,
  ADD COLUMN IF NOT EXISTS recommended_payout NUMERIC;

-- 3. Add tier + rush flag to execution_orders for tracking
ALTER TABLE public.execution_orders
  ADD COLUMN IF NOT EXISTS pricing_tier TEXT REFERENCES public.pricing_tiers(id),
  ADD COLUMN IF NOT EXISTS is_rush BOOLEAN NOT NULL DEFAULT false;

-- 4. Trigger for updated_at on pricing_tiers
CREATE TRIGGER update_pricing_tiers_updated_at
  BEFORE UPDATE ON public.pricing_tiers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();