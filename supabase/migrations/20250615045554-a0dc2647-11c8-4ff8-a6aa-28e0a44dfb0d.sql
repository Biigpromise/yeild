
-- Create the referral_levels table
CREATE TABLE public.referral_levels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    required_referrals INTEGER NOT NULL,
    rewards_description TEXT,
    color TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add a trigger to automatically update the 'updated_at' column
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.referral_levels
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

-- Enable RLS for admin-only access
ALTER TABLE public.referral_levels ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can manage referral levels
CREATE POLICY "Allow full access to admins" ON public.referral_levels
FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Policy: Allow read access for authenticated users
CREATE POLICY "Allow read access for authenticated users" ON public.referral_levels
FOR SELECT
USING (auth.role() = 'authenticated');

-- Populate the table with initial data from the mock
INSERT INTO public.referral_levels (name, required_referrals, rewards_description, color) VALUES
('Bronze', 2, '2% on referrals', '#CD7F32'),
('Silver', 10, '5% on referrals', '#C0C0C0'),
('Gold', 50, '10% on referrals', '#FFD100'),
('Platinum', 100, '15% on referrals', '#50C878'),
('Diamond', 500, '20% on referrals', '#9370DB');
