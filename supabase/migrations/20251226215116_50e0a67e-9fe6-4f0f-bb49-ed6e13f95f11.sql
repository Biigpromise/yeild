-- Create storage bucket for marketplace images
INSERT INTO storage.buckets (id, name, public)
VALUES ('marketplace-images', 'marketplace-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create policy for brand users to upload their own marketplace images
CREATE POLICY "Brands can upload marketplace images"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'marketplace-images' AND auth.uid() IS NOT NULL);

-- Create policy for anyone to view marketplace images (public bucket)
CREATE POLICY "Anyone can view marketplace images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'marketplace-images');

-- Create policy for brands to delete their own images
CREATE POLICY "Brands can delete their marketplace images"
ON storage.objects
FOR DELETE
USING (bucket_id = 'marketplace-images' AND auth.uid() IS NOT NULL);