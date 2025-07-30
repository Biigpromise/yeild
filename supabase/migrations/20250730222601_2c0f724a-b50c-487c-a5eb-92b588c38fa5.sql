-- Create storage bucket for task submissions
INSERT INTO storage.buckets (id, name, public) 
VALUES ('task-submissions', 'task-submissions', true);

-- Create storage policies for task submissions
CREATE POLICY "Users can upload their own task submissions" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'task-submissions' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own task submissions" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'task-submissions' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own task submissions" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'task-submissions' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own task submissions" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'task-submissions' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create storage bucket for user avatars if not exists
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for avatars
CREATE POLICY "Avatar images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatar" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);