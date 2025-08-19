-- Add enhanced fields to brand_campaigns table for media, social links, and rich content
ALTER TABLE public.brand_campaigns 
ADD COLUMN IF NOT EXISTS media_assets jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS social_links jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS campaign_brief text,
ADD COLUMN IF NOT EXISTS target_demographics jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS tracking_parameters jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS collaboration_settings jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS deliverable_specifications jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS hashtags text[],
ADD COLUMN IF NOT EXISTS template_id uuid;

-- Create storage bucket for campaign media
INSERT INTO storage.buckets (id, name, public) 
VALUES ('campaign-media', 'campaign-media', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for campaign assets
INSERT INTO storage.buckets (id, name, public) 
VALUES ('campaign-assets', 'campaign-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for campaign-media bucket
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Brands can upload their campaign media') THEN
    CREATE POLICY "Brands can upload their campaign media" 
    ON storage.objects 
    FOR INSERT 
    WITH CHECK (bucket_id = 'campaign-media' AND auth.uid()::text = (storage.foldername(name))[1]);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Brands can view their campaign media') THEN
    CREATE POLICY "Brands can view their campaign media" 
    ON storage.objects 
    FOR SELECT 
    USING (bucket_id = 'campaign-media' AND auth.uid()::text = (storage.foldername(name))[1]);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Public can view campaign media') THEN
    CREATE POLICY "Public can view campaign media" 
    ON storage.objects 
    FOR SELECT 
    USING (bucket_id = 'campaign-media');
  END IF;
END $$;