-- YEILD System & Pricing Implementation - Part 1: Core Tables

-- 1.1 Create platform_constants table for dynamic configuration
CREATE TABLE IF NOT EXISTS public.platform_constants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Insert platform constants
INSERT INTO public.platform_constants (key, value, description) VALUES
  ('platform_fee_percent', '15', 'Default platform fee percentage (10-20% range)'),
  ('platform_fee_min_percent', '10', 'Minimum platform fee percentage'),
  ('platform_fee_max_percent', '20', 'Maximum platform fee percentage'),
  ('campaign_creation_fee_digital', '10000', 'Campaign creation fee for digital mode (NGN)'),
  ('campaign_creation_fee_field', '50000', 'Campaign creation fee for field mode (NGN)'),
  ('min_payout_threshold', '1000', 'Minimum payout threshold in credits'),
  ('payout_hold_days', '7', 'Days to hold payouts before release')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();

-- Enable RLS on platform_constants
ALTER TABLE public.platform_constants ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can read platform constants" ON public.platform_constants;
DROP POLICY IF EXISTS "Service role can manage platform constants" ON public.platform_constants;

-- Everyone can read platform constants
CREATE POLICY "Anyone can read platform constants"
  ON public.platform_constants FOR SELECT
  USING (true);

-- 1.2 Create execution_modes table
CREATE TABLE IF NOT EXISTS public.execution_modes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  eligible_rank_levels INTEGER[] NOT NULL,
  use_cases TEXT[] NOT NULL,
  verification_types TEXT[] NOT NULL,
  platform_fee_min INTEGER DEFAULT 10,
  platform_fee_max INTEGER DEFAULT 20,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Insert execution modes per spec
INSERT INTO public.execution_modes (id, name, description, eligible_rank_levels, use_cases, verification_types, platform_fee_min, platform_fee_max) VALUES
  ('digital', 'Digital Execution Mode', 'Online execution for digital products, fintech, SaaS, e-commerce, and digital referrals', 
   ARRAY[1, 2, 3],
   ARRAY['Online real estate platforms', 'Fintech products', 'SaaS', 'Subscriptions', 'E-commerce', 'Digital referrals'],
   ARRAY['referral_tracking', 'conversion_id', 'payment_confirmation', 'brand_approval', 'webhook'],
   10, 15),
  ('field', 'Field Execution Mode', 'Offline/hybrid execution for physical inspections, asset sales, events, and ground activations',
   ARRAY[3, 4, 5],
   ARRAY['Property inspections', 'Physical asset sales', 'Events', 'Ground activations'],
   ARRAY['gps_location', 'timestamped_media', 'client_confirmation', 'brand_validation'],
   15, 20)
ON CONFLICT (id) DO UPDATE SET 
  eligible_rank_levels = EXCLUDED.eligible_rank_levels,
  use_cases = EXCLUDED.use_cases,
  verification_types = EXCLUDED.verification_types,
  platform_fee_min = EXCLUDED.platform_fee_min,
  platform_fee_max = EXCLUDED.platform_fee_max,
  updated_at = now();

-- Enable RLS on execution_modes
ALTER TABLE public.execution_modes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read execution modes" ON public.execution_modes;
CREATE POLICY "Anyone can read execution modes"
  ON public.execution_modes FOR SELECT
  USING (true);