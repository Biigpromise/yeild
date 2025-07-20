
-- Create table to store user saved payment methods
CREATE TABLE public.user_payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  method_type TEXT NOT NULL CHECK (method_type IN ('bank_transfer', 'mobile_money', 'digital_wallet')),
  bank_code TEXT NOT NULL,
  bank_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  account_name TEXT NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, account_number, bank_code)
);

-- Enable RLS
ALTER TABLE public.user_payment_methods ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own payment methods"
ON public.user_payment_methods FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own payment methods"
ON public.user_payment_methods FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own payment methods"
ON public.user_payment_methods FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own payment methods"
ON public.user_payment_methods FOR DELETE
USING (auth.uid() = user_id);

-- Add comprehensive Nigerian banks including digital banks
INSERT INTO payment_method_configs (method_key, name, enabled, min_amount, max_amount, processing_fee_percent, processing_time_estimate, configuration_details) 
VALUES 
  ('flutterwave_ng', 'Nigerian Banks (Flutterwave)', true, 1000, 50000, 5.0, '1-3 business days', 
   '{
     "supportedBanks": [
       {"name": "Access Bank", "code": "044"},
       {"name": "Guaranty Trust Bank", "code": "058"},
       {"name": "First Bank of Nigeria", "code": "011"},
       {"name": "United Bank For Africa", "code": "033"},
       {"name": "Zenith Bank", "code": "057"},
       {"name": "Fidelity Bank", "code": "070"},
       {"name": "First City Monument Bank", "code": "214"},
       {"name": "Sterling Bank", "code": "232"},
       {"name": "Union Bank of Nigeria", "code": "032"},
       {"name": "Wema Bank", "code": "035"},
       {"name": "Polaris Bank", "code": "076"},
       {"name": "Keystone Bank", "code": "082"},
       {"name": "Ecobank Nigeria", "code": "050"},
       {"name": "Heritage Bank", "code": "030"},
       {"name": "Stanbic IBTC Bank", "code": "221"},
       {"name": "Standard Chartered Bank", "code": "068"},
       {"name": "Unity Bank", "code": "215"},
       {"name": "Providus Bank", "code": "101"},
       {"name": "OPay", "code": "999992"},
       {"name": "Moniepoint", "code": "50515"},
       {"name": "Kuda Bank", "code": "50211"},
       {"name": "VFD Microfinance Bank", "code": "566"},
       {"name": "Palmpay", "code": "999991"},
       {"name": "Carbon", "code": "565"},
       {"name": "Rubies Bank", "code": "125"},
       {"name": "Sparkle Microfinance Bank", "code": "51310"}
     ],
     "supportedCountries": ["NG"],
     "supportedCurrencies": ["NGN"]
   }'::jsonb)
ON CONFLICT (method_key) 
DO UPDATE SET 
  configuration_details = EXCLUDED.configuration_details,
  updated_at = now();

-- Update withdrawal_requests table to reference saved payment methods
ALTER TABLE public.withdrawal_requests 
ADD COLUMN IF NOT EXISTS payment_method_id UUID REFERENCES public.user_payment_methods(id);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_payment_methods_updated_at
    BEFORE UPDATE ON public.user_payment_methods
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
