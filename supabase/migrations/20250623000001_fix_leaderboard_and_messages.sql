
-- Enable RLS on profiles table for leaderboard visibility
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all authenticated users to read public profile data for leaderboard
CREATE POLICY "Allow authenticated users to read public profiles" ON public.profiles
FOR SELECT USING (auth.role() = 'authenticated');

-- Enable RLS on messages table
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Create policies for messages table
CREATE POLICY "Allow authenticated users to read messages" ON public.messages
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert messages" ON public.messages
FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);

CREATE POLICY "Allow users to delete their own messages" ON public.messages
FOR DELETE USING (auth.role() = 'authenticated' AND auth.uid() = user_id);

-- Add media_url column to messages table if it doesn't exist
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS media_url text;

-- Create storage bucket for chat media if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('chat-media', 'chat-media', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for chat media
CREATE POLICY "Allow authenticated users to upload chat media" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'chat-media' AND auth.role() = 'authenticated');

CREATE POLICY "Allow public access to chat media" ON storage.objects
FOR SELECT USING (bucket_id = 'chat-media');

CREATE POLICY "Allow users to delete their own chat media" ON storage.objects
FOR DELETE USING (bucket_id = 'chat-media' AND auth.uid()::text = (storage.foldername(name))[1]);
