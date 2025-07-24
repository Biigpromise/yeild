-- Add logo_url field to brand_campaigns table
ALTER TABLE public.brand_campaigns 
ADD COLUMN logo_url TEXT;

-- Add currency preference to brand profiles
ALTER TABLE public.brand_profiles 
ADD COLUMN currency_preference TEXT DEFAULT 'NGN';

-- Create currency conversion table for real-time rates
CREATE TABLE public.currency_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_currency TEXT NOT NULL,
  to_currency TEXT NOT NULL,
  rate NUMERIC NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on currency_rates
ALTER TABLE public.currency_rates ENABLE ROW LEVEL SECURITY;

-- Allow everyone to view currency rates
CREATE POLICY "Everyone can view currency rates" 
ON public.currency_rates 
FOR SELECT 
USING (true);

-- Only service role can update rates
CREATE POLICY "Service role can manage currency rates" 
ON public.currency_rates 
FOR ALL 
USING (auth.role() = 'service_role');

-- Insert initial USD to NGN rate
INSERT INTO public.currency_rates (from_currency, to_currency, rate)
VALUES ('USD', 'NGN', 1500.00)
ON CONFLICT DO NOTHING;