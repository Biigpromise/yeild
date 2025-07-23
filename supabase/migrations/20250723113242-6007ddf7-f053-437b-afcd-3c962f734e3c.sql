-- Create company financial tracking tables
CREATE TABLE IF NOT EXISTS public.company_financial_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  bank_code TEXT NOT NULL,
  bank_name TEXT NOT NULL,
  account_type TEXT NOT NULL DEFAULT 'settlement',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create fund transfers tracking table
CREATE TABLE IF NOT EXISTS public.fund_transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transfer_reference TEXT UNIQUE NOT NULL,
  flutterwave_id TEXT,
  source_type TEXT NOT NULL, -- 'payment', 'settlement', 'manual'
  source_id UUID, -- references payment_transactions or other sources
  amount NUMERIC NOT NULL,
  fee NUMERIC DEFAULT 0,
  net_amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'NGN',
  recipient_account TEXT NOT NULL,
  recipient_bank TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending', 'processing', 'successful', 'failed'
  transfer_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  settlement_date TIMESTAMP WITH TIME ZONE,
  flutterwave_response JSONB,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create settlement schedules table
CREATE TABLE IF NOT EXISTS public.settlement_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_name TEXT NOT NULL,
  frequency TEXT NOT NULL, -- 'daily', 'weekly', 'monthly'
  day_of_week INTEGER, -- 1-7 for weekly schedules
  day_of_month INTEGER, -- 1-31 for monthly schedules
  time_of_day TIME NOT NULL DEFAULT '09:00:00',
  minimum_amount NUMERIC DEFAULT 1000,
  is_active BOOLEAN DEFAULT true,
  last_run TIMESTAMP WITH TIME ZONE,
  next_run TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create company revenue tracking table
CREATE TABLE IF NOT EXISTS public.company_revenue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  revenue_date DATE NOT NULL,
  total_payments NUMERIC DEFAULT 0,
  total_fees NUMERIC DEFAULT 0,
  total_withdrawals NUMERIC DEFAULT 0,
  net_revenue NUMERIC DEFAULT 0,
  payment_count INTEGER DEFAULT 0,
  withdrawal_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(revenue_date)
);

-- Enable RLS on all tables
ALTER TABLE public.company_financial_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fund_transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settlement_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_revenue ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (admin only access)
CREATE POLICY "Admins can manage financial accounts" ON public.company_financial_accounts
  FOR ALL USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view fund transfers" ON public.fund_transfers
  FOR SELECT USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Service role can manage fund transfers" ON public.fund_transfers
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Admins can manage settlement schedules" ON public.settlement_schedules
  FOR ALL USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view company revenue" ON public.company_revenue
  FOR SELECT USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Service role can manage company revenue" ON public.company_revenue
  FOR ALL USING (auth.role() = 'service_role');

-- Insert default settlement account
INSERT INTO public.company_financial_accounts (
  account_name,
  account_number,
  bank_code,
  bank_name,
  account_type
) VALUES (
  'YEILD Technologies',
  '1234567890', -- Replace with actual account number
  '044', -- Replace with actual bank code
  'Access Bank', -- Replace with actual bank name
  'settlement'
) ON CONFLICT DO NOTHING;

-- Insert default settlement schedule (daily at 9 AM)
INSERT INTO public.settlement_schedules (
  schedule_name,
  frequency,
  time_of_day,
  minimum_amount,
  next_run
) VALUES (
  'Daily Settlement',
  'daily',
  '09:00:00',
  5000,
  CURRENT_DATE + INTERVAL '1 day' + TIME '09:00:00'
) ON CONFLICT DO NOTHING;