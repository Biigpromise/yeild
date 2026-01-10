-- YEILD System & Pricing Implementation - Part 2: Additional Tables

-- 2.1 Add execution_mode to execution_orders
ALTER TABLE public.execution_orders 
  ADD COLUMN IF NOT EXISTS execution_mode TEXT DEFAULT 'digital';

-- 2.2 Add execution_mode and reward_type to execution_order_templates
ALTER TABLE public.execution_order_templates
  ADD COLUMN IF NOT EXISTS execution_mode TEXT DEFAULT 'digital';

ALTER TABLE public.execution_order_templates
  ADD COLUMN IF NOT EXISTS reward_type TEXT DEFAULT 'fixed';

-- 2.3 Create campaign_fees table
CREATE TABLE IF NOT EXISTS public.campaign_fees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL,
  campaign_id UUID REFERENCES public.brand_campaigns(id),
  execution_order_id UUID REFERENCES public.execution_orders(id),
  fee_amount NUMERIC NOT NULL,
  fee_type TEXT NOT NULL,
  currency TEXT DEFAULT 'NGN',
  payment_status TEXT DEFAULT 'pending',
  paid_at TIMESTAMPTZ,
  transaction_reference TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.campaign_fees ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Brands can view their own fees" ON public.campaign_fees;
DROP POLICY IF EXISTS "Brands can insert their own fees" ON public.campaign_fees;

CREATE POLICY "Brands can view their own fees"
  ON public.campaign_fees FOR SELECT
  USING (auth.uid() = brand_id);

CREATE POLICY "Brands can insert their own fees"
  ON public.campaign_fees FOR INSERT
  WITH CHECK (auth.uid() = brand_id);

-- 2.4 Update operator_ranks with execution mode access
ALTER TABLE public.operator_ranks
  ADD COLUMN IF NOT EXISTS allowed_execution_modes TEXT[] DEFAULT ARRAY['digital'];

-- 2.5 Create fraud_detection_logs table
CREATE TABLE IF NOT EXISTS public.fraud_detection_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  submission_id UUID REFERENCES public.execution_submissions(id),
  detection_type TEXT NOT NULL,
  device_fingerprint TEXT,
  ip_address INET,
  location_data JSONB,
  risk_score INTEGER DEFAULT 0,
  is_blocked BOOLEAN DEFAULT false,
  admin_reviewed BOOLEAN DEFAULT false,
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.fraud_detection_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own fraud logs" ON public.fraud_detection_logs;
CREATE POLICY "Users can view their own fraud logs"
  ON public.fraud_detection_logs FOR SELECT
  USING (auth.uid() = user_id);

-- 2.6 Create dispute_resolutions table
CREATE TABLE IF NOT EXISTS public.dispute_resolutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES public.execution_submissions(id),
  raised_by UUID NOT NULL,
  raised_by_type TEXT NOT NULL,
  dispute_reason TEXT NOT NULL,
  dispute_category TEXT,
  operator_response TEXT,
  admin_decision TEXT DEFAULT 'pending',
  admin_notes TEXT,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID,
  appeal_deadline TIMESTAMPTZ,
  rank_impact INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.dispute_resolutions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Participants can view their disputes" ON public.dispute_resolutions;
DROP POLICY IF EXISTS "Users can create disputes" ON public.dispute_resolutions;

CREATE POLICY "Participants can view their disputes"
  ON public.dispute_resolutions FOR SELECT
  USING (
    auth.uid() = raised_by OR 
    auth.uid() IN (SELECT operator_id FROM public.execution_submissions WHERE id = submission_id)
  );

CREATE POLICY "Users can create disputes"
  ON public.dispute_resolutions FOR INSERT
  WITH CHECK (auth.uid() = raised_by);