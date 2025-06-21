
-- Update referral levels with new thresholds and titles
UPDATE public.referral_levels 
SET required_referrals = 5, name = 'Dove', rewards_description = 'New Flight'
WHERE name = 'Dove';

UPDATE public.referral_levels 
SET required_referrals = 20, name = 'Hawk', rewards_description = 'Rising Wing'
WHERE name = 'Hawk';

UPDATE public.referral_levels 
SET required_referrals = 100, name = 'Eagle', rewards_description = 'Trailblazer'
WHERE name = 'Eagle';

UPDATE public.referral_levels 
SET required_referrals = 500, name = 'Falcon', rewards_description = 'Sky Master'
WHERE name = 'Falcon';

UPDATE public.referral_levels 
SET required_referrals = 1000, name = 'Phoenix', rewards_description = 'Legend of YEILD'
WHERE name = 'Phoenix';

-- Create table for storing image hashes to detect duplicate screenshots
CREATE TABLE IF NOT EXISTS public.image_hashes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  hash_value TEXT NOT NULL UNIQUE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
  submission_id UUID REFERENCES public.task_submissions(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add index for fast hash lookups
CREATE INDEX IF NOT EXISTS idx_image_hashes_hash_value ON public.image_hashes(hash_value);
CREATE INDEX IF NOT EXISTS idx_image_hashes_user_id ON public.image_hashes(user_id);

-- Create table for duplicate image flags
CREATE TABLE IF NOT EXISTS public.duplicate_image_flags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  original_hash_id UUID NOT NULL REFERENCES public.image_hashes(id) ON DELETE CASCADE,
  duplicate_hash_id UUID NOT NULL REFERENCES public.image_hashes(id) ON DELETE CASCADE,
  flagged_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  reviewed BOOLEAN DEFAULT FALSE,
  admin_notes TEXT
);

-- Enable RLS on new tables
ALTER TABLE public.image_hashes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.duplicate_image_flags ENABLE ROW LEVEL SECURITY;

-- RLS policies for image_hashes (users can see their own, admins can see all)
CREATE POLICY "Users can view their own image hashes"
  ON public.image_hashes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all image hashes"
  ON public.image_hashes FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Service can insert image hashes"
  ON public.image_hashes FOR INSERT
  WITH CHECK (true);

-- RLS policies for duplicate_image_flags (admins only)
CREATE POLICY "Admins can view duplicate flags"
  ON public.duplicate_image_flags FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Service can insert duplicate flags"
  ON public.duplicate_image_flags FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can update duplicate flags"
  ON public.duplicate_image_flags FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));
