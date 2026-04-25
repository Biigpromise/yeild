-- Create job_categories table
CREATE TABLE IF NOT EXISTS public.job_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT,
  pricing_model TEXT NOT NULL CHECK (pricing_model IN ('flat', 'flat_plus_bonus', 'cpa', 'base_plus_variable', 'flat_plus_reimbursement', 'hourly_or_quote', 'commission', 'recurring')),
  default_min_ngn INTEGER NOT NULL,
  default_max_ngn INTEGER NOT NULL,
  default_base_ngn INTEGER NOT NULL,
  effort_estimate TEXT,
  supports_rank_multiplier BOOLEAN NOT NULL DEFAULT true,
  supports_quality_bonus BOOLEAN NOT NULL DEFAULT true,
  supports_outcome_bonus BOOLEAN NOT NULL DEFAULT false,
  supports_commission BOOLEAN NOT NULL DEFAULT false,
  supports_hourly BOOLEAN NOT NULL DEFAULT false,
  supports_expense_reimbursement BOOLEAN NOT NULL DEFAULT false,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.job_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Job categories readable by everyone"
  ON public.job_categories FOR SELECT
  USING (true);

CREATE POLICY "Only admins can insert job categories"
  ON public.job_categories FOR INSERT
  WITH CHECK (public.is_admin_safe(auth.uid()));

CREATE POLICY "Only admins can update job categories"
  ON public.job_categories FOR UPDATE
  USING (public.is_admin_safe(auth.uid()));

CREATE POLICY "Only admins can delete job categories"
  ON public.job_categories FOR DELETE
  USING (public.is_admin_safe(auth.uid()));

CREATE TRIGGER update_job_categories_updated_at
  BEFORE UPDATE ON public.job_categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Seed the 8 categories
INSERT INTO public.job_categories (code, name, description, icon, pricing_model, default_min_ngn, default_max_ngn, default_base_ngn, effort_estimate, supports_outcome_bonus, supports_commission, supports_hourly, supports_expense_reimbursement, display_order)
VALUES
  ('quick_action', 'Quick Action', 'Short tasks that take a few minutes — share a post, join a channel, simple confirmations.', 'Zap', 'flat', 300, 800, 500, '2–5 minutes', false, false, false, false, 1),
  ('content_creation', 'Content Creation', 'Writing reviews, recording videos, designing visuals. Quality bonuses available.', 'PenTool', 'flat_plus_bonus', 2000, 15000, 5000, '20–60 minutes', false, false, false, false, 2),
  ('lead_generation', 'Lead Generation', 'Cost-per-action: signups, demo bookings, deposits, verified conversions.', 'Target', 'cpa', 500, 10000, 2000, 'Per verified lead', true, false, false, false, 3),
  ('field_work', 'Field Work', 'On-site jobs: property inspections, store audits, ground activations. Distance + time included.', 'MapPin', 'base_plus_variable', 5000, 50000, 10000, '1–4 hours on site', false, false, false, false, 4),
  ('mystery_shopping', 'Mystery Shopping', 'Visit a store, evaluate service, buy a product. Receipts reimbursed.', 'ShoppingBag', 'flat_plus_reimbursement', 3000, 12000, 5000, '30–90 minutes', false, false, false, true, 5),
  ('specialist_audit', 'Specialist / Audit', 'Expert reviews, compliance checks, professional audits. Hourly or quoted.', 'ShieldCheck', 'hourly_or_quote', 5000, 200000, 25000, 'Hourly or per project', false, false, true, false, 6),
  ('performance_sales', 'Performance / Sales', 'Commission-based: asset sales, paid referrals, closed deals.', 'TrendingUp', 'commission', 1000, 500000, 5000, '% of deal value', true, true, false, false, 7),
  ('recurring_retainer', 'Recurring / Retainer', 'Ongoing monthly engagements: community moderation, support, account management.', 'Repeat', 'recurring', 20000, 200000, 50000, 'Monthly engagement', false, false, false, false, 8)
ON CONFLICT (code) DO NOTHING;

-- Add columns to execution_order_templates
ALTER TABLE public.execution_order_templates
  ADD COLUMN IF NOT EXISTS job_category_code TEXT REFERENCES public.job_categories(code),
  ADD COLUMN IF NOT EXISTS rank_multiplier_enabled BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS quality_bonus_max_pct INTEGER NOT NULL DEFAULT 20,
  ADD COLUMN IF NOT EXISTS outcome_bonus_pct INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS commission_pct NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS hourly_rate_ngn INTEGER,
  ADD COLUMN IF NOT EXISTS expense_reimbursable BOOLEAN NOT NULL DEFAULT false;

-- Add columns to execution_orders
ALTER TABLE public.execution_orders
  ADD COLUMN IF NOT EXISTS job_category_code TEXT REFERENCES public.job_categories(code),
  ADD COLUMN IF NOT EXISTS rank_multiplier_enabled BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS quality_bonus_max_pct INTEGER NOT NULL DEFAULT 20,
  ADD COLUMN IF NOT EXISTS outcome_bonus_pct INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS commission_pct NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS hourly_rate_ngn INTEGER,
  ADD COLUMN IF NOT EXISTS expense_reimbursable BOOLEAN NOT NULL DEFAULT false;

-- Add bonus tracking columns to execution_submissions
ALTER TABLE public.execution_submissions
  ADD COLUMN IF NOT EXISTS quality_bonus_pct INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS outcome_bonus_awarded BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS rank_multiplier_applied NUMERIC(3,2) NOT NULL DEFAULT 1.0,
  ADD COLUMN IF NOT EXISTS expense_reimbursed_ngn INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_execution_orders_job_category ON public.execution_orders(job_category_code);
CREATE INDEX IF NOT EXISTS idx_execution_order_templates_job_category ON public.execution_order_templates(job_category_code);