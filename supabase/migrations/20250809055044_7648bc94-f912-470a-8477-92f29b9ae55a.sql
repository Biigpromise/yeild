-- 1) Helper function to auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public';

-- 2) Create pricing_models table
CREATE TABLE IF NOT EXISTS public.pricing_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  currency TEXT NOT NULL,
  action_type TEXT NOT NULL DEFAULT 'task_completion',
  region TEXT NULL,
  min_cpa NUMERIC NOT NULL,
  max_cpa NUMERIC NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT pricing_models_valid_cpa CHECK (min_cpa > 0 AND max_cpa >= min_cpa)
);

-- 3) Enable RLS
ALTER TABLE public.pricing_models ENABLE ROW LEVEL SECURITY;

-- 4) RLS Policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'pricing_models' AND policyname = 'Admins can manage pricing models'
  ) THEN
    CREATE POLICY "Admins can manage pricing models"
    ON public.pricing_models
    FOR ALL
    USING (has_role(auth.uid(), 'admin'))
    WITH CHECK (has_role(auth.uid(), 'admin'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'pricing_models' AND policyname = 'Anyone can view active pricing models'
  ) THEN
    CREATE POLICY "Anyone can view active pricing models"
    ON public.pricing_models
    FOR SELECT
    USING (is_active = true);
  END IF;
END $$;

-- 5) Trigger to maintain updated_at
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_pricing_models_updated_at'
  ) THEN
    CREATE TRIGGER trg_pricing_models_updated_at
    BEFORE UPDATE ON public.pricing_models
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- 6) Seed initial pricing models (idempotent upserts)
INSERT INTO public.pricing_models (currency, action_type, region, min_cpa, max_cpa)
VALUES 
  ('NGN', 'task_completion', 'NG', 214, 300),
  ('USD', 'task_completion', 'US', 0.143, 0.2)
ON CONFLICT DO NOTHING;