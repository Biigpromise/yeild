-- Create campaign-media storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('campaign-media', 'campaign-media', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policy for campaign media access
CREATE POLICY "Campaign media is publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'campaign-media');

-- Create policies for uploading campaign media
CREATE POLICY "Authenticated users can upload campaign media" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'campaign-media' AND auth.uid() IS NOT NULL);

-- Create policies for updating campaign media
CREATE POLICY "Users can update their own campaign media" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'campaign-media' AND auth.uid() IS NOT NULL);

-- Create policies for deleting campaign media
CREATE POLICY "Users can delete their own campaign media" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'campaign-media' AND auth.uid() IS NOT NULL);