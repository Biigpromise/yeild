
-- Add a new column to track chat posting eligibility requirements
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS can_post_in_chat boolean DEFAULT false;

-- Create a function to check if user meets chat posting requirements
CREATE OR REPLACE FUNCTION public.check_chat_posting_eligibility(user_id_param uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path TO 'public'
AS $$
  SELECT 
    COALESCE(p.tasks_completed, 0) >= 1 AND 
    COALESCE(p.active_referrals_count, 0) >= 3
  FROM profiles p
  WHERE p.id = user_id_param;
$$;

-- Update the messages table RLS policy to restrict posting
DROP POLICY IF EXISTS "Allow users to insert their own messages" ON public.messages;

CREATE POLICY "Allow eligible users to insert their own messages"
ON public.messages
FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND 
  check_chat_posting_eligibility(auth.uid())
);

-- Update bird levels to include new earning benefits instead of 4% system
UPDATE public.bird_levels 
SET benefits = CASE 
  WHEN name = 'Sparrow' THEN ARRAY['Basic community access', 'Profile customization']
  WHEN name = 'Robin' THEN ARRAY['Enhanced task visibility', '+5% referral bonus', 'Priority support']
  WHEN name = 'Eagle' THEN ARRAY['Exclusive task access', '+10% referral bonus', 'Advanced analytics']
  WHEN name = 'Phoenix' THEN ARRAY['VIP task access', '+15% referral bonus', 'Direct admin contact', 'Custom badge']
  ELSE benefits
END;

-- Add a trigger to automatically update chat posting eligibility
CREATE OR REPLACE FUNCTION public.update_chat_posting_eligibility()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Update chat posting eligibility when tasks_completed or active_referrals_count changes
  IF (NEW.tasks_completed IS DISTINCT FROM OLD.tasks_completed) OR 
     (NEW.active_referrals_count IS DISTINCT FROM OLD.active_referrals_count) THEN
    NEW.can_post_in_chat := check_chat_posting_eligibility(NEW.id);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create the trigger
DROP TRIGGER IF EXISTS update_chat_eligibility_trigger ON public.profiles;
CREATE TRIGGER update_chat_eligibility_trigger
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_chat_posting_eligibility();

-- Update existing users' chat posting eligibility
UPDATE public.profiles 
SET can_post_in_chat = check_chat_posting_eligibility(id);
