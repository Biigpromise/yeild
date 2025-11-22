-- Add new columns to marketplace_listings for multiple images and premium features
ALTER TABLE marketplace_listings 
ADD COLUMN IF NOT EXISTS image_urls JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS featured_until TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS featured_position INTEGER,
ADD COLUMN IF NOT EXISTS listing_tier TEXT DEFAULT 'standard' 
  CHECK (listing_tier IN ('standard', 'featured', 'premium'));

-- Create marketplace_listing_notifications table for expiry notifications
CREATE TABLE IF NOT EXISTS marketplace_listing_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES marketplace_listings(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL CHECK (notification_type IN ('expiry_warning_3d', 'expiry_warning_1d', 'expired')),
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(listing_id, notification_type)
);

-- Create marketplace_analytics_daily table for aggregated analytics
CREATE TABLE IF NOT EXISTS marketplace_analytics_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES marketplace_listings(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  views INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  unique_viewers INTEGER DEFAULT 0,
  unique_clickers INTEGER DEFAULT 0,
  ctr NUMERIC GENERATED ALWAYS AS (
    CASE WHEN views > 0 THEN (clicks::numeric / views::numeric * 100) ELSE 0 END
  ) STORED,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(listing_id, date)
);

-- Create marketplace_bookmarks table for users to save listings
CREATE TABLE IF NOT EXISTS marketplace_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  listing_id UUID REFERENCES marketplace_listings(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, listing_id)
);

-- Add helpful indexes for performance
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_tier ON marketplace_listings(listing_tier);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_featured ON marketplace_listings(is_featured, featured_until) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_marketplace_analytics_daily_date ON marketplace_analytics_daily(listing_id, date);
CREATE INDEX IF NOT EXISTS idx_marketplace_bookmarks_user_id ON marketplace_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_bookmarks_listing_id ON marketplace_bookmarks(listing_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_listing_notifications_listing ON marketplace_listing_notifications(listing_id);

-- Enable RLS on new tables
ALTER TABLE marketplace_listing_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_analytics_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_bookmarks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for marketplace_listing_notifications
CREATE POLICY "Brands can view notifications for their listings"
  ON marketplace_listing_notifications FOR SELECT
  USING (
    listing_id IN (
      SELECT id FROM marketplace_listings WHERE brand_id = auth.uid()
    )
  );

CREATE POLICY "Service role can manage notifications"
  ON marketplace_listing_notifications FOR ALL
  USING (auth.role() = 'service_role');

-- RLS Policies for marketplace_analytics_daily
CREATE POLICY "Brands can view analytics for their listings"
  ON marketplace_analytics_daily FOR SELECT
  USING (
    listing_id IN (
      SELECT id FROM marketplace_listings WHERE brand_id = auth.uid()
    )
  );

CREATE POLICY "Service role can manage analytics"
  ON marketplace_analytics_daily FOR ALL
  USING (auth.role() = 'service_role');

-- RLS Policies for marketplace_bookmarks
CREATE POLICY "Users can view their own bookmarks"
  ON marketplace_bookmarks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bookmarks"
  ON marketplace_bookmarks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bookmarks"
  ON marketplace_bookmarks FOR DELETE
  USING (auth.uid() = user_id);