
-- Add is_anonymous column to profiles table to support user privacy settings
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_anonymous BOOLEAN NOT NULL DEFAULT false;

-- Add a comment to explain the column
COMMENT ON COLUMN public.profiles.is_anonymous IS 'Determines if user wants to appear anonymous in chat and posts';

-- Update any existing users to have the default privacy setting
UPDATE public.profiles 
SET is_anonymous = false 
WHERE is_anonymous IS NULL;
