
-- Create payment_method_configs table for admin configuration
CREATE TABLE public.payment_method_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    method_key TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT true,
    min_amount INTEGER NOT NULL DEFAULT 0,
    max_amount INTEGER NOT NULL DEFAULT 10000,
    processing_fee_percent NUMERIC(5, 2) NOT NULL DEFAULT 0,
    processing_time_estimate TEXT,
    configuration_details JSONB,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add a trigger to automatically update the 'updated_at' column
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.payment_method_configs
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

-- Enable RLS
ALTER TABLE public.payment_method_configs ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can manage payment method configs
CREATE POLICY "Allow full access to admins on payment method configs" ON public.payment_method_configs
FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Policy: Allow read access for authenticated users
CREATE POLICY "Allow read access for authenticated users on payment method configs" ON public.payment_method_configs
FOR SELECT
USING (auth.role() = 'authenticated');

-- Populate with initial data (amounts are in points, 1000 points = $1)
INSERT INTO public.payment_method_configs (method_key, name, enabled, min_amount, max_amount, processing_fee_percent, processing_time_estimate, configuration_details) VALUES
('bank_transfer', 'Bank Transfer', true, 50000, 10000000, 2.5, '3-5 business days', '{}'),
('paypal', 'PayPal', true, 10000, 5000000, 3.0, '1-2 business days', '{}'),
('crypto', 'Cryptocurrency', true, 25000, 50000000, 1.0, '24 hours', '{"networks": ["BTC", "ETH"]}'::jsonb),
('gift_card', 'Gift Card', false, 5000, 1000000, 0, 'Instant', '{"providers": ["Amazon", "Steam"]}'::jsonb);
