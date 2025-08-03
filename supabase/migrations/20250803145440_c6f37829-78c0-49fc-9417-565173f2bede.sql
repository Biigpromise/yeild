-- Create storage buckets for enhanced chat features

-- Create bucket for voice messages
INSERT INTO storage.buckets (id, name, public) VALUES ('voice-messages', 'voice-messages', true);

-- Create bucket for chat images (if it doesn't exist)
INSERT INTO storage.buckets (id, name, public) VALUES ('chat-images', 'chat-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create policies for voice messages bucket
CREATE POLICY "Voice messages are publicly accessible" ON storage.objects
FOR SELECT USING (bucket_id = 'voice-messages');

CREATE POLICY "Users can upload their own voice messages" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'voice-messages' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own voice messages" ON storage.objects
FOR UPDATE USING (bucket_id = 'voice-messages' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete their own voice messages" ON storage.objects
FOR DELETE USING (bucket_id = 'voice-messages' AND auth.uid() IS NOT NULL);

-- Create policies for chat images bucket (if not exists)
DO $$
BEGIN
    -- Check if policy already exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Chat images are publicly accessible'
    ) THEN
        CREATE POLICY "Chat images are publicly accessible" ON storage.objects
        FOR SELECT USING (bucket_id = 'chat-images');
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Users can upload chat images'
    ) THEN
        CREATE POLICY "Users can upload chat images" ON storage.objects
        FOR INSERT WITH CHECK (bucket_id = 'chat-images' AND auth.uid() IS NOT NULL);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Users can update chat images'
    ) THEN
        CREATE POLICY "Users can update chat images" ON storage.objects
        FOR UPDATE USING (bucket_id = 'chat-images' AND auth.uid() IS NOT NULL);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Users can delete chat images'
    ) THEN
        CREATE POLICY "Users can delete chat images" ON storage.objects
        FOR DELETE USING (bucket_id = 'chat-images' AND auth.uid() IS NOT NULL);
    END IF;
END
$$;