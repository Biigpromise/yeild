-- Create marketplace categories table
CREATE TABLE IF NOT EXISTS public.marketplace_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create marketplace listings table
CREATE TABLE IF NOT EXISTS public.marketplace_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  image_url TEXT,
  external_link TEXT,
  price_per_day NUMERIC DEFAULT 10000,
  days_paid INTEGER NOT NULL,
  total_paid NUMERIC NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'removed', 'pending_approval')),
  views_count INTEGER DEFAULT 0,
  clicks_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create marketplace interactions table
CREATE TABLE IF NOT EXISTS public.marketplace_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.marketplace_listings(id) ON DELETE CASCADE,
  user_id UUID,
  action_type TEXT NOT NULL CHECK (action_type IN ('view', 'click')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create platform revenue table
CREATE TABLE IF NOT EXISTS public.platform_revenue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  brand_id UUID,
  listing_id UUID REFERENCES public.marketplace_listings(id),
  transaction_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.marketplace_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_revenue ENABLE ROW LEVEL SECURITY;

-- RLS Policies for marketplace_categories
CREATE POLICY "Everyone can view active categories"
  ON public.marketplace_categories FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage categories"
  ON public.marketplace_categories FOR ALL
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

-- RLS Policies for marketplace_listings
CREATE POLICY "Brands can view their own listings"
  ON public.marketplace_listings FOR SELECT
  USING (auth.uid() = brand_id);

CREATE POLICY "Users can view active listings"
  ON public.marketplace_listings FOR SELECT
  USING (status = 'active' AND end_date > now());

CREATE POLICY "Admins can view all listings"
  ON public.marketplace_listings FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Brands can create their own listings"
  ON public.marketplace_listings FOR INSERT
  WITH CHECK (auth.uid() = brand_id AND user_has_brand_role());

CREATE POLICY "Brands can update their own listings"
  ON public.marketplace_listings FOR UPDATE
  USING (auth.uid() = brand_id);

CREATE POLICY "Brands can delete their own listings"
  ON public.marketplace_listings FOR DELETE
  USING (auth.uid() = brand_id);

CREATE POLICY "Admins can manage all listings"
  ON public.marketplace_listings FOR ALL
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

-- RLS Policies for marketplace_interactions
CREATE POLICY "Users can create interactions"
  ON public.marketplace_interactions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Brands can view interactions for their listings"
  ON public.marketplace_interactions FOR SELECT
  USING (
    listing_id IN (
      SELECT id FROM public.marketplace_listings WHERE brand_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all interactions"
  ON public.marketplace_interactions FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for platform_revenue
CREATE POLICY "Admins can view all revenue"
  ON public.platform_revenue FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Service role can manage revenue"
  ON public.platform_revenue FOR ALL
  USING (auth.role() = 'service_role');

-- Insert default categories (excluding adult content)
INSERT INTO public.marketplace_categories (name, slug, description, icon) VALUES
  ('Fashion & Accessories', 'fashion', 'Clothing, shoes, bags, and accessories', 'Shirt'),
  ('Electronics & Tech', 'electronics', 'Phones, computers, gadgets, and tech accessories', 'Smartphone'),
  ('Food & Beverage', 'food-beverage', 'Restaurants, cafes, food delivery, and beverages', 'Utensils'),
  ('Beauty & Personal Care', 'beauty', 'Cosmetics, skincare, haircare, and wellness', 'Sparkles'),
  ('Home & Living', 'home-living', 'Furniture, decor, appliances, and home essentials', 'Home'),
  ('Sports & Fitness', 'sports-fitness', 'Sportswear, equipment, gyms, and fitness services', 'Dumbbell'),
  ('Entertainment', 'entertainment', 'Events, movies, music, and entertainment services', 'Music'),
  ('Education & Training', 'education', 'Courses, books, tutoring, and educational services', 'BookOpen'),
  ('Health & Wellness', 'health-wellness', 'Medical services, pharmacies, and health products', 'HeartPulse'),
  ('Automotive', 'automotive', 'Cars, bikes, auto services, and accessories', 'Car'),
  ('Travel & Tourism', 'travel', 'Hotels, tours, travel agencies, and vacation packages', 'Plane'),
  ('Professional Services', 'professional-services', 'Business services, consulting, and freelance work', 'Briefcase'),
  ('Real Estate', 'real-estate', 'Properties, rentals, and real estate services', 'Building'),
  ('Arts & Crafts', 'arts-crafts', 'Handmade items, art supplies, and creative services', 'Palette'),
  ('Pets & Animals', 'pets', 'Pet supplies, services, and animal care', 'PawPrint'),
  ('General Retail', 'general-retail', 'General merchandise and retail stores', 'Store')
ON CONFLICT (slug) DO NOTHING;

-- Function to auto-expire listings
CREATE OR REPLACE FUNCTION auto_expire_marketplace_listings()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.marketplace_listings
  SET status = 'expired', updated_at = now()
  WHERE status = 'active' AND end_date < now();
END;
$$;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_status ON public.marketplace_listings(status);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_end_date ON public.marketplace_listings(end_date);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_brand_id ON public.marketplace_listings(brand_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_interactions_listing_id ON public.marketplace_interactions(listing_id);