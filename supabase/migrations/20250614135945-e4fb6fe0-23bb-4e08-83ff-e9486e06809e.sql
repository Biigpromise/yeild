
-- Add new withdrawal methods and update existing table structure
-- Add new payment method options to support crypto, gift cards, and yield wallet
ALTER TABLE public.withdrawal_requests 
ADD COLUMN IF NOT EXISTS exchange_rate DECIMAL(10,4),
ADD COLUMN IF NOT EXISTS conversion_amount DECIMAL(15,2),
ADD COLUMN IF NOT EXISTS recipient_address TEXT,
ADD COLUMN IF NOT EXISTS gift_card_type TEXT;

-- Create crypto addresses table for supported cryptocurrencies
CREATE TABLE IF NOT EXISTS public.crypto_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  crypto_type TEXT NOT NULL, -- 'bitcoin', 'ethereum', 'usdt'
  wallet_address TEXT NOT NULL,
  network TEXT, -- 'mainnet', 'polygon', 'bsc' for tokens
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create gift card inventory table
CREATE TABLE IF NOT EXISTS public.gift_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL, -- 'amazon', 'apple', 'google_play', 'steam'
  denomination INTEGER NOT NULL, -- value in USD
  points_required INTEGER NOT NULL,
  stock_quantity INTEGER,
  is_active BOOLEAN DEFAULT true,
  image_url TEXT,
  terms_conditions TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create yield wallet table for internal wallet system
CREATE TABLE IF NOT EXISTS public.yield_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  balance INTEGER NOT NULL DEFAULT 0, -- balance in points
  total_earned INTEGER NOT NULL DEFAULT 0,
  total_spent INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create yield wallet transactions table
CREATE TABLE IF NOT EXISTS public.yield_wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id UUID REFERENCES public.yield_wallets(id) ON DELETE CASCADE NOT NULL,
  transaction_type TEXT NOT NULL, -- 'deposit', 'withdrawal', 'purchase', 'transfer'
  amount INTEGER NOT NULL,
  description TEXT,
  reference_id UUID, -- can reference tasks, purchases, etc.
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS for all new tables
ALTER TABLE public.crypto_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gift_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.yield_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.yield_wallet_transactions ENABLE ROW LEVEL SECURITY;

-- RLS policies for crypto_addresses
CREATE POLICY "Users can view own crypto addresses" 
ON public.crypto_addresses FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own crypto addresses" 
ON public.crypto_addresses FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own crypto addresses" 
ON public.crypto_addresses FOR UPDATE 
USING (auth.uid() = user_id);

-- RLS policies for gift_cards (public read)
CREATE POLICY "Anyone can view active gift cards" 
ON public.gift_cards FOR SELECT 
USING (is_active = true);

-- RLS policies for yield_wallets
CREATE POLICY "Users can view own yield wallet" 
ON public.yield_wallets FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own yield wallet" 
ON public.yield_wallets FOR UPDATE 
USING (auth.uid() = user_id);

-- RLS policies for yield_wallet_transactions
CREATE POLICY "Users can view own wallet transactions" 
ON public.yield_wallet_transactions FOR SELECT 
USING (auth.uid() = (SELECT user_id FROM public.yield_wallets WHERE id = wallet_id));

-- Add triggers for updated_at
CREATE TRIGGER update_crypto_addresses_updated_at
  BEFORE UPDATE ON public.crypto_addresses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_gift_cards_updated_at
  BEFORE UPDATE ON public.gift_cards
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_yield_wallets_updated_at
  BEFORE UPDATE ON public.yield_wallets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some sample gift cards
INSERT INTO public.gift_cards (provider, denomination, points_required, stock_quantity, image_url) VALUES
('amazon', 10, 10000, 100, 'https://images.unsplash.com/photo-1523474253046-8cd2748b5fd2?w=400'),
('amazon', 25, 25000, 50, 'https://images.unsplash.com/photo-1523474253046-8cd2748b5fd2?w=400'),
('amazon', 50, 50000, 25, 'https://images.unsplash.com/photo-1523474253046-8cd2748b5fd2?w=400'),
('apple', 10, 10000, 100, 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400'),
('apple', 25, 25000, 50, 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400'),
('google_play', 10, 10000, 100, 'https://images.unsplash.com/photo-1607252650355-f7fd0460ccdb?w=400'),
('google_play', 25, 25000, 50, 'https://images.unsplash.com/photo-1607252650355-f7fd0460ccdb?w=400'),
('steam', 20, 20000, 75, 'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=400'),
('steam', 50, 50000, 30, 'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=400');

-- Function to create yield wallet for new users
CREATE OR REPLACE FUNCTION public.create_yield_wallet()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.yield_wallets (user_id, balance, total_earned, total_spent)
  VALUES (NEW.id, 0, 0, 0)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Trigger to create yield wallet for new users
CREATE TRIGGER on_auth_user_created_yield_wallet
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.create_yield_wallet();
