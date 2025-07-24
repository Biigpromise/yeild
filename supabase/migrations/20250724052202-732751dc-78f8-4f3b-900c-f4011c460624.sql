
-- Add DELETE policy for brand_campaigns table to allow brands to delete their own campaigns
CREATE POLICY "Brands can delete their own campaigns"
ON public.brand_campaigns
FOR DELETE
TO authenticated
USING (auth.uid() = brand_id);

-- Add missing tables for brand dashboard features
CREATE TABLE IF NOT EXISTS public.brand_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'info',
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on brand_notifications
ALTER TABLE public.brand_notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for brand_notifications
CREATE POLICY "Brands can view their own notifications"
ON public.brand_notifications
FOR SELECT
TO authenticated
USING (auth.uid() = brand_id);

CREATE POLICY "Brands can update their own notifications"
ON public.brand_notifications
FOR UPDATE
TO authenticated
USING (auth.uid() = brand_id);

CREATE POLICY "Service role can insert notifications"
ON public.brand_notifications
FOR INSERT
TO service_role
WITH CHECK (true);

-- Add campaign analytics tracking
CREATE TABLE IF NOT EXISTS public.campaign_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.brand_campaigns(id) ON DELETE CASCADE,
  metric_name TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  metadata JSONB DEFAULT '{}'
);

-- Enable RLS on campaign_analytics
ALTER TABLE public.campaign_analytics ENABLE ROW LEVEL SECURITY;

-- Create policies for campaign_analytics
CREATE POLICY "Brands can view analytics for their campaigns"
ON public.campaign_analytics
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.brand_campaigns bc 
    WHERE bc.id = campaign_id AND bc.brand_id = auth.uid()
  )
);

CREATE POLICY "Service role can manage analytics"
ON public.campaign_analytics
FOR ALL
TO service_role
WITH CHECK (true);

-- Add campaign templates table
CREATE TABLE IF NOT EXISTS public.campaign_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  template_data JSONB NOT NULL,
  is_shared BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on campaign_templates
ALTER TABLE public.campaign_templates ENABLE ROW LEVEL SECURITY;

-- Create policies for campaign_templates
CREATE POLICY "Brands can manage their own templates"
ON public.campaign_templates
FOR ALL
TO authenticated
USING (auth.uid() = brand_id)
WITH CHECK (auth.uid() = brand_id);

CREATE POLICY "Brands can view shared templates"
ON public.campaign_templates
FOR SELECT
TO authenticated
USING (is_shared = true);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_brand_notifications_brand_id ON public.brand_notifications(brand_id);
CREATE INDEX IF NOT EXISTS idx_campaign_analytics_campaign_id ON public.campaign_analytics(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_templates_brand_id ON public.campaign_templates(brand_id);
