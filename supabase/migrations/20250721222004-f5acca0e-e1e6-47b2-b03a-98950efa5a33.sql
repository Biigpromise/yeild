
-- Create brand_wallets table for storing brand account balances
CREATE TABLE public.brand_wallets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  balance NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  total_deposited NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  total_spent NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create brand_wallet_transactions table for transaction history
CREATE TABLE public.brand_wallet_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  wallet_id UUID REFERENCES public.brand_wallets(id) ON DELETE CASCADE NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('deposit', 'withdrawal', 'campaign_charge', 'refund')),
  amount NUMERIC(10,2) NOT NULL,
  balance_after NUMERIC(10,2) NOT NULL,
  reference_id UUID NULL,
  description TEXT NOT NULL,
  payment_transaction_id UUID REFERENCES public.payment_transactions(id) NULL,
  campaign_id UUID REFERENCES public.brand_campaigns(id) NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on brand_wallets
ALTER TABLE public.brand_wallets ENABLE ROW LEVEL SECURITY;

-- RLS policies for brand_wallets
CREATE POLICY "Brands can view their own wallet"
  ON public.brand_wallets
  FOR SELECT
  USING (auth.uid() = brand_id);

CREATE POLICY "Service role can manage wallets"
  ON public.brand_wallets
  FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Admins can view all wallets"
  ON public.brand_wallets
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

-- Enable RLS on brand_wallet_transactions
ALTER TABLE public.brand_wallet_transactions ENABLE ROW LEVEL SECURITY;

-- RLS policies for brand_wallet_transactions
CREATE POLICY "Brands can view their own transactions"
  ON public.brand_wallet_transactions
  FOR SELECT
  USING (auth.uid() = brand_id);

CREATE POLICY "Service role can manage transactions"
  ON public.brand_wallet_transactions
  FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Admins can view all transactions"
  ON public.brand_wallet_transactions
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

-- Function to create wallet for new brands
CREATE OR REPLACE FUNCTION public.create_brand_wallet()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Check if this is a brand user
  IF EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = NEW.id AND role = 'brand') THEN
    INSERT INTO public.brand_wallets (brand_id, balance, total_deposited, total_spent)
    VALUES (NEW.id, 0.00, 0.00, 0.00)
    ON CONFLICT (brand_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$function$;

-- Trigger to create wallet when brand role is assigned
CREATE OR REPLACE TRIGGER create_brand_wallet_trigger
  AFTER INSERT ON public.user_roles
  FOR EACH ROW
  WHEN (NEW.role = 'brand')
  EXECUTE FUNCTION public.create_brand_wallet();

-- Function to handle wallet transactions
CREATE OR REPLACE FUNCTION public.process_wallet_transaction(
  p_brand_id UUID,
  p_transaction_type TEXT,
  p_amount NUMERIC,
  p_description TEXT,
  p_reference_id UUID DEFAULT NULL,
  p_campaign_id UUID DEFAULT NULL,
  p_payment_transaction_id UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  wallet_record RECORD;
  new_balance NUMERIC;
  transaction_id UUID;
BEGIN
  -- Get current wallet
  SELECT * INTO wallet_record
  FROM public.brand_wallets
  WHERE brand_id = p_brand_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Brand wallet not found for user %', p_brand_id;
  END IF;

  -- Calculate new balance
  IF p_transaction_type IN ('deposit', 'refund') THEN
    new_balance := wallet_record.balance + p_amount;
  ELSIF p_transaction_type IN ('withdrawal', 'campaign_charge') THEN
    new_balance := wallet_record.balance - p_amount;
    
    -- Check sufficient balance
    IF new_balance < 0 THEN
      RAISE EXCEPTION 'Insufficient wallet balance. Current: %, Required: %', wallet_record.balance, p_amount;
    END IF;
  ELSE
    RAISE EXCEPTION 'Invalid transaction type: %', p_transaction_type;
  END IF;

  -- Update wallet balance
  UPDATE public.brand_wallets
  SET 
    balance = new_balance,
    total_deposited = CASE WHEN p_transaction_type = 'deposit' THEN total_deposited + p_amount ELSE total_deposited END,
    total_spent = CASE WHEN p_transaction_type IN ('withdrawal', 'campaign_charge') THEN total_spent + p_amount ELSE total_spent END,
    updated_at = now()
  WHERE brand_id = p_brand_id;

  -- Create transaction record
  INSERT INTO public.brand_wallet_transactions (
    brand_id,
    wallet_id,
    transaction_type,
    amount,
    balance_after,
    reference_id,
    description,
    payment_transaction_id,
    campaign_id
  )
  VALUES (
    p_brand_id,
    wallet_record.id,
    p_transaction_type,
    p_amount,
    new_balance,
    p_reference_id,
    p_description,
    p_payment_transaction_id,
    p_campaign_id
  )
  RETURNING id INTO transaction_id;

  RETURN transaction_id;
END;
$function$;

-- Update brand_campaigns table to track wallet deductions
ALTER TABLE public.brand_campaigns
ADD COLUMN IF NOT EXISTS wallet_transaction_id UUID REFERENCES public.brand_wallet_transactions(id);

-- Function to create admin notification for new campaigns
CREATE OR REPLACE FUNCTION public.notify_admin_new_campaign()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  brand_name TEXT;
BEGIN
  -- Get brand name
  SELECT COALESCE(bp.company_name, p.name, p.email)
  INTO brand_name
  FROM public.profiles p
  LEFT JOIN public.brand_profiles bp ON bp.user_id = p.id
  WHERE p.id = NEW.brand_id;

  -- Create admin notification
  INSERT INTO public.admin_notifications (type, message, link_to)
  VALUES (
    'new_campaign',
    'New campaign "' || NEW.title || '" created by ' || COALESCE(brand_name, 'Unknown Brand') || ' with budget ₦' || NEW.budget::text,
    '/admin?section=campaigns&campaign=' || NEW.id
  );

  RETURN NEW;
END;
$function$;

-- Trigger for new campaign notifications
CREATE OR REPLACE TRIGGER notify_admin_new_campaign_trigger
  AFTER INSERT ON public.brand_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_admin_new_campaign();

-- Create existing brand wallets for users who already have brand role
INSERT INTO public.brand_wallets (brand_id, balance, total_deposited, total_spent)
SELECT DISTINCT ur.user_id, 0.00, 0.00, 0.00
FROM public.user_roles ur
WHERE ur.role = 'brand'
AND NOT EXISTS (
  SELECT 1 FROM public.brand_wallets bw WHERE bw.brand_id = ur.user_id
);
