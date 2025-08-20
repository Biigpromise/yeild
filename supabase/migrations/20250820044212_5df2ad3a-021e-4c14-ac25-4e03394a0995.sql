-- Fix brand_campaigns RLS policies and add better error handling

-- First check if user has brand role before allowing campaign creation
CREATE OR REPLACE FUNCTION public.user_has_brand_role()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'brand'
  );
$$;

-- Update the brand_campaigns RLS policy for insertion
DROP POLICY IF EXISTS "Brands can create their own campaigns" ON public.brand_campaigns;

CREATE POLICY "Brands can create their own campaigns" 
ON public.brand_campaigns 
FOR INSERT 
WITH CHECK (
  auth.uid() = brand_id AND user_has_brand_role()
);

-- Add missing direct messaging tables and fix RLS
-- Ensure direct_chats has proper constraints
ALTER TABLE public.direct_chats 
DROP CONSTRAINT IF EXISTS check_chat_name;

ALTER TABLE public.direct_chats 
ADD CONSTRAINT check_chat_name 
CHECK (
  (is_group_chat = true AND name IS NOT NULL) OR 
  (is_group_chat = false)
);

-- Fix direct_chat_participants RLS to allow reading all chats user participates in
DROP POLICY IF EXISTS "Users can view participants of their chats" ON public.direct_chat_participants;

CREATE POLICY "Users can view participants of their chats" 
ON public.direct_chat_participants 
FOR SELECT 
USING (
  chat_id IN (
    SELECT chat_id FROM direct_chat_participants 
    WHERE user_id = auth.uid()
  )
);

-- Enable the campaign-media storage bucket if not exists
INSERT INTO storage.buckets (id, name, public) 
VALUES ('campaign-media', 'campaign-media', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for campaign-media bucket
CREATE POLICY "Anyone can view campaign media" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'campaign-media');

CREATE POLICY "Authenticated users can upload campaign media" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'campaign-media' AND 
  auth.uid() IS NOT NULL
);

CREATE POLICY "Users can update their campaign media" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'campaign-media' AND 
  auth.uid() IS NOT NULL
);

CREATE POLICY "Users can delete their campaign media" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'campaign-media' AND 
  auth.uid() IS NOT NULL
);