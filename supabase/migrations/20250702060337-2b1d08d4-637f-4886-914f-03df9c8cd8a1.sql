-- Create message_views table to track unique views per message
CREATE TABLE IF NOT EXISTS public.message_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  viewed_at timestamp with time zone DEFAULT now(),
  
  -- Ensure a user can only view a message once (for counting purposes)
  UNIQUE(message_id, user_id)
);

-- Enable RLS
ALTER TABLE public.message_views ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view all message views" ON public.message_views
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own views" ON public.message_views
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_message_views_message_id ON public.message_views(message_id);
CREATE INDEX IF NOT EXISTS idx_message_views_user_id ON public.message_views(user_id);

-- Add views_count column to messages table
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS views_count integer DEFAULT 0;

-- Function to increment message view count
CREATE OR REPLACE FUNCTION public.increment_message_view(message_id_param uuid, user_id_param uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Try to insert a new view record (will fail if already exists due to unique constraint)
  INSERT INTO public.message_views (message_id, user_id)
  VALUES (message_id_param, user_id_param)
  ON CONFLICT (message_id, user_id) DO NOTHING;
  
  -- Update the message view count based on actual unique views
  UPDATE public.messages
  SET views_count = (
    SELECT COUNT(*)
    FROM public.message_views
    WHERE message_id = message_id_param
  )
  WHERE id = message_id_param;
END;
$$;