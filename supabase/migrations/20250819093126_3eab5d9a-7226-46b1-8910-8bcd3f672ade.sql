-- Create campaign-media bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('campaign-media', 'campaign-media', true)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for campaign-media bucket
CREATE POLICY "Brands can upload campaign media" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'campaign-media' AND auth.uid() IS NOT NULL);

CREATE POLICY "Campaign media is publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'campaign-media');

CREATE POLICY "Brands can update their own campaign media" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'campaign-media' AND auth.uid() IS NOT NULL);

CREATE POLICY "Brands can delete their own campaign media" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'campaign-media' AND auth.uid() IS NOT NULL);