-- Add proper RLS policies for yield_wallets
DROP POLICY IF EXISTS "Users can view their own yield wallet" ON yield_wallets;
DROP POLICY IF EXISTS "Users can insert their own yield wallet" ON yield_wallets;
DROP POLICY IF EXISTS "Users can update their own yield wallet" ON yield_wallets;

-- Enable RLS if not already enabled
ALTER TABLE yield_wallets ENABLE ROW LEVEL SECURITY;

-- Users can view their own wallet
CREATE POLICY "Users can view their own yield wallet"
ON yield_wallets FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own wallet
CREATE POLICY "Users can create their own yield wallet"
ON yield_wallets FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own wallet
CREATE POLICY "Users can update their own yield wallet"
ON yield_wallets FOR UPDATE
USING (auth.uid() = user_id);

-- Add RLS for yield_wallet_transactions
DROP POLICY IF EXISTS "Users can view their own wallet transactions" ON yield_wallet_transactions;
DROP POLICY IF EXISTS "Users can insert wallet transactions" ON yield_wallet_transactions;

ALTER TABLE yield_wallet_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own wallet transactions"
ON yield_wallet_transactions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM yield_wallets 
    WHERE yield_wallets.id = yield_wallet_transactions.wallet_id 
    AND yield_wallets.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert wallet transactions"
ON yield_wallet_transactions FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM yield_wallets 
    WHERE yield_wallets.id = yield_wallet_transactions.wallet_id 
    AND yield_wallets.user_id = auth.uid()
  )
);