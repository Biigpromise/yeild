
-- Create a storage bucket for stories media
INSERT INTO storage.buckets (id, name, public)
VALUES ('stories', 'stories', true)
ON CONFLICT (id) DO NOTHING;

-- RLS policy to allow authenticated users to upload to the 'stories' bucket
CREATE POLICY "Allow authenticated users to upload stories"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'stories' AND owner = auth.uid());

-- RLS policy to allow anyone to view media in the 'stories' bucket
CREATE POLICY "Allow public read access to stories"
ON storage.objects FOR SELECT
USING (bucket_id = 'stories');


-- Create the 'stories' table
CREATE TABLE public.stories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  media_url TEXT NOT NULL,
  media_type TEXT NOT NULL DEFAULT 'image',
  caption TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '24 hours')
);

-- Add indexes for performance
CREATE INDEX stories_user_id_expires_at_idx ON public.stories(user_id, expires_at);
CREATE INDEX stories_expires_at_idx ON public.stories(expires_at);

-- Enable Row Level Security for the stories table
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;

-- RLS policy for users to create their own stories
CREATE POLICY "Users can create their own stories"
ON public.stories FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- RLS policy for users to view stories from people they follow and their own active stories
CREATE POLICY "Users can view active stories from followed users and self"
ON public.stories FOR SELECT
TO authenticated
USING (
  expires_at > now() AND (
    user_id = auth.uid() OR
    user_id IN (SELECT following_id FROM public.user_followers WHERE follower_id = auth.uid())
  )
);

-- RLS policy for users to delete their own stories
CREATE POLICY "Users can delete their own stories"
ON public.stories FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
