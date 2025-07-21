-- Create payment_transactions table
CREATE TABLE public.payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  transaction_ref TEXT UNIQUE NOT NULL,
  flutterwave_id TEXT,
  amount DECIMAL(15,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'NGN',
  payment_type TEXT NOT NULL CHECK (payment_type IN ('campaign_funding', 'task_payment', 'premium_subscription', 'general')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'successful', 'failed', 'cancelled')),
  amount_settled DECIMAL(15,2),
  processor_response JSONB,
  payment_method TEXT,
  customer_email TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  campaign_id UUID,
  task_id UUID,
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create payout_transactions table
CREATE TABLE public.payout_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  withdrawal_id UUID,
  task_id UUID,
  reference TEXT UNIQUE NOT NULL,
  flutterwave_id TEXT,
  amount DECIMAL(15,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'NGN',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'successful', 'failed', 'cancelled')),
  account_bank TEXT NOT NULL,
  account_number TEXT NOT NULL,
  beneficiary_name TEXT NOT NULL,
  narration TEXT,
  fee DECIMAL(15,2),
  response_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create campaigns table for brand funding
CREATE TABLE public.campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  budget DECIMAL(15,2) NOT NULL,
  funded_amount DECIMAL(15,2) DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed', 'cancelled')),
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  target_audience JSONB,
  requirements JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payout_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for payment_transactions
CREATE POLICY "Users can view their own payment transactions"
ON public.payment_transactions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all payment transactions"
ON public.payment_transactions FOR SELECT
USING (has_role(auth.uid(), 'admin'::text));

CREATE POLICY "Service role can manage payment transactions"
ON public.payment_transactions FOR ALL
USING (auth.role() = 'service_role');

-- Create RLS policies for payout_transactions
CREATE POLICY "Users can view their own payout transactions"
ON public.payout_transactions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all payout transactions"
ON public.payout_transactions FOR ALL
USING (has_role(auth.uid(), 'admin'::text));

CREATE POLICY "Service role can manage payout transactions"
ON public.payout_transactions FOR ALL
USING (auth.role() = 'service_role');

-- Create RLS policies for campaigns
CREATE POLICY "Brands can manage their own campaigns"
ON public.campaigns FOR ALL
USING (auth.uid() = brand_id)
WITH CHECK (auth.uid() = brand_id);

CREATE POLICY "Users can view active campaigns"
ON public.campaigns FOR SELECT
USING (status = 'active');

CREATE POLICY "Admins can manage all campaigns"
ON public.campaigns FOR ALL
USING (has_role(auth.uid(), 'admin'::text));

-- Create indexes for better performance
CREATE INDEX idx_payment_transactions_user_id ON public.payment_transactions(user_id);
CREATE INDEX idx_payment_transactions_transaction_ref ON public.payment_transactions(transaction_ref);
CREATE INDEX idx_payment_transactions_status ON public.payment_transactions(status);
CREATE INDEX idx_payout_transactions_user_id ON public.payout_transactions(user_id);
CREATE INDEX idx_payout_transactions_reference ON public.payout_transactions(reference);
CREATE INDEX idx_campaigns_brand_id ON public.campaigns(brand_id);
CREATE INDEX idx_campaigns_status ON public.campaigns(status);

-- Create function to credit user account
CREATE OR REPLACE FUNCTION public.credit_user_account(
  user_id UUID,
  amount DECIMAL,
  reference TEXT
)
RETURNS VOID AS $$
BEGIN
  -- Update user points/balance
  UPDATE public.profiles
  SET points = points + amount,
      updated_at = now()
  WHERE id = user_id;
  
  -- Record transaction
  INSERT INTO public.point_transactions (
    user_id,
    points,
    transaction_type,
    description,
    reference_id
  ) VALUES (
    user_id,
    amount,
    'payment_credit',
    'Payment credited: ' || reference,
    gen_random_uuid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;