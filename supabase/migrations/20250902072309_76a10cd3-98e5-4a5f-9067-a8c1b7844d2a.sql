-- Add social media links to existing tasks for better testing and user experience
UPDATE tasks SET social_media_links = '{
  "facebook": "https://facebook.com/company123",
  "twitter": "https://twitter.com/company123", 
  "instagram": "https://instagram.com/company123"
}'::jsonb 
WHERE id IN (
  SELECT id FROM tasks 
  WHERE social_media_links IS NULL OR social_media_links = '{}'::jsonb
  LIMIT 5
);

-- Insert some sample tasks with social media requirements using valid difficulty values
INSERT INTO tasks (
  title, description, category, points, estimated_time, difficulty, 
  task_type, brand_name, status, social_media_links
) VALUES 
(
  'Follow Our Social Media Channels',
  'Help us grow our community by following our official social media accounts. Visit our Facebook, Twitter, and Instagram pages and hit that follow button!',
  'Social Media',
  25,
  '5 minutes',
  'easy',
  'social_media',
  'YieldSocials',
  'active',
  '{
    "facebook": "https://facebook.com/yieldsocials",
    "twitter": "https://twitter.com/yieldsocials", 
    "instagram": "https://instagram.com/yieldsocials"
  }'::jsonb
),
(
  'Engage with Brand Content',
  'Like and share our latest posts across all platforms. Help spread the word about our amazing products and services!',
  'Social Media',
  40,
  '10 minutes', 
  'easy',
  'engagement',
  'TechCorp',
  'active',
  '{
    "facebook": "https://facebook.com/techcorp",
    "twitter": "https://twitter.com/techcorp",
    "linkedin": "https://linkedin.com/company/techcorp",
    "youtube": "https://youtube.com/@techcorp"
  }'::jsonb
),
(
  'Complete Social Media Challenge',
  'Join our viral challenge! Follow us on TikTok and Instagram, then create your own content using our hashtag #BrandChallenge',
  'Social Media',
  75,
  '15 minutes',
  'medium', 
  'content_creation',
  'ViralBrand',
  'active',
  '{
    "tiktok": "https://tiktok.com/@viralbrand",
    "instagram": "https://instagram.com/viralbrand",
    "youtube": "https://youtube.com/@viralbrand"
  }'::jsonb
);