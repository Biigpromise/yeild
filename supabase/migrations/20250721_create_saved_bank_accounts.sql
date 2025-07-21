
-- Create saved_bank_accounts table
CREATE TABLE public.saved_bank_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  account_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  bank_code TEXT NOT NULL,
  bank_name TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- Ensure only one default account per user
  UNIQUE(user_id, account_number, bank_code)
);

-- Enable RLS
ALTER TABLE public.saved_bank_accounts ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own saved accounts"
  ON public.saved_bank_accounts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own saved accounts"
  ON public.saved_bank_accounts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own saved accounts"
  ON public.saved_bank_accounts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved accounts"
  ON public.saved_bank_accounts FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_saved_bank_accounts_user_id ON public.saved_bank_accounts(user_id);
CREATE INDEX idx_saved_bank_accounts_default ON public.saved_bank_accounts(user_id, is_default);

-- Add trigger to update updated_at column
CREATE TRIGGER update_saved_bank_accounts_updated_at
  BEFORE UPDATE ON public.saved_bank_accounts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
