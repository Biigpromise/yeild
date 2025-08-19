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
CREATE POLICY "Brands can upload their campaign media" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'campaign-media' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Brands can view their campaign media" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'campaign-media' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Public can view campaign media" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'campaign-media');

CREATE POLICY "Brands can update their campaign media" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'campaign-media' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Brands can delete their campaign media" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'campaign-media' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create RLS policies for campaign-assets bucket
CREATE POLICY "Brands can upload their campaign assets" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'campaign-assets' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Brands can view their campaign assets" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'campaign-assets' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Public can view campaign assets" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'campaign-assets');

CREATE POLICY "Brands can update their campaign assets" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'campaign-assets' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Brands can delete their campaign assets" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'campaign-assets' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create campaign templates table
CREATE TABLE IF NOT EXISTS public.campaign_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  template_data jsonb NOT NULL,
  brand_id uuid,
  is_shared boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on campaign_templates
ALTER TABLE public.campaign_templates ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for campaign_templates
CREATE POLICY "Brands can manage their own templates" 
ON public.campaign_templates 
FOR ALL 
USING (auth.uid() = brand_id)
WITH CHECK (auth.uid() = brand_id);

CREATE POLICY "Brands can view shared templates" 
ON public.campaign_templates 
FOR SELECT 
USING (is_shared = true);