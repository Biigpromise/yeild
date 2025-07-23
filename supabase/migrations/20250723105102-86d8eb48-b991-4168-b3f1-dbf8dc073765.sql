-- Fix the relationship between brand_campaigns and brand_profiles
-- The issue is that brand_campaigns.brand_id should reference brand_profiles.user_id, not id

-- First, let's check the current structure
-- brand_campaigns has brand_id (uuid) which should link to brand_profiles.user_id (uuid)

-- Add foreign key constraint to ensure referential integrity
ALTER TABLE public.brand_campaigns 
ADD CONSTRAINT fk_brand_campaigns_brand_profiles 
FOREIGN KEY (brand_id) REFERENCES public.brand_profiles(user_id) 
ON DELETE CASCADE;