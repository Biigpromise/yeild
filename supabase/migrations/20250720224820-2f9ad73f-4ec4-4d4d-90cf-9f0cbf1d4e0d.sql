
-- Add email confirmation tracking for brands
ALTER TABLE brand_applications 
ADD COLUMN email_confirmed BOOLEAN DEFAULT FALSE,
ADD COLUMN email_confirmed_at TIMESTAMP WITH TIME ZONE NULL;

-- Create brand_payment_methods table for storing payment information
CREATE TABLE IF NOT EXISTS brand_payment_methods (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  payment_type TEXT NOT NULL DEFAULT 'flutterwave',
  is_default BOOLEAN DEFAULT TRUE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on brand_payment_methods
ALTER TABLE brand_payment_methods ENABLE ROW LEVEL SECURITY;

-- Create policies for brand_payment_methods
CREATE POLICY "Brands can view their own payment methods" 
  ON brand_payment_methods FOR SELECT 
  USING (auth.uid() = brand_id);

CREATE POLICY "Brands can insert their own payment methods" 
  ON brand_payment_methods FOR INSERT 
  WITH CHECK (auth.uid() = brand_id);

CREATE POLICY "Brands can update their own payment methods" 
  ON brand_payment_methods FOR UPDATE 
  USING (auth.uid() = brand_id);

-- Create brand_campaigns table for real campaign management
CREATE TABLE IF NOT EXISTS brand_campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  budget DECIMAL(10,2) NOT NULL CHECK (budget >= 10.00),
  funded_amount DECIMAL(10,2) DEFAULT 0.00,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed', 'cancelled')),
  start_date DATE,
  end_date DATE,
  target_audience JSONB DEFAULT '{}',
  requirements JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on brand_campaigns
ALTER TABLE brand_campaigns ENABLE ROW LEVEL SECURITY;

-- Create policies for brand_campaigns
CREATE POLICY "Brands can view their own campaigns" 
  ON brand_campaigns FOR SELECT 
  USING (auth.uid() = brand_id);

CREATE POLICY "Brands can create their own campaigns" 
  ON brand_campaigns FOR INSERT 
  WITH CHECK (auth.uid() = brand_id);

CREATE POLICY "Brands can update their own campaigns" 
  ON brand_campaigns FOR UPDATE 
  USING (auth.uid() = brand_id);

-- Function to handle brand email confirmation
CREATE OR REPLACE FUNCTION handle_brand_email_confirmation()
RETURNS TRIGGER AS $$
BEGIN
  -- When a brand user confirms their email, update the brand application
  IF NEW.email_confirmed_at IS NOT NULL AND OLD.email_confirmed_at IS NULL THEN
    UPDATE brand_applications 
    SET email_confirmed = TRUE, 
        email_confirmed_at = NEW.email_confirmed_at
    WHERE user_id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for email confirmation
DROP TRIGGER IF EXISTS on_brand_email_confirmation ON auth.users;
CREATE TRIGGER on_brand_email_confirmation
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_brand_email_confirmation();
