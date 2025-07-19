
-- Add sample task categories
INSERT INTO task_categories (name, description, icon, color) VALUES
('Survey', 'Complete surveys and provide feedback', 'FileText', 'text-blue-500'),
('Social Media', 'Engage with social media content', 'Share2', 'text-pink-500'),
('App Testing', 'Test mobile and web applications', 'Smartphone', 'text-green-500'),
('Content Creation', 'Create written or visual content', 'PenTool', 'text-purple-500'),
('Research', 'Conduct online research tasks', 'Search', 'text-yellow-500'),
('Reviews', 'Write product or service reviews', 'Star', 'text-orange-500');

-- Add diverse sample tasks
INSERT INTO tasks (title, description, points, category, difficulty, estimated_time, status, task_type, brand_name, expires_at) VALUES
('Complete Consumer Survey', 'Share your opinion on household products in this 10-minute survey', 150, 'Survey', 'easy', '10 minutes', 'active', 'survey', 'MarketResearch Co', NOW() + INTERVAL '30 days'),
('Instagram Story Engagement', 'Like and comment on 5 Instagram stories from @brandname', 75, 'Social Media', 'easy', '5 minutes', 'active', 'social_engagement', 'TrendyBrand', NOW() + INTERVAL '7 days'),
('Beta Test Mobile App', 'Download and test our new fitness tracking app, provide detailed feedback', 300, 'App Testing', 'medium', '30 minutes', 'active', 'app_testing', 'FitTrack Pro', NOW() + INTERVAL '14 days'),
('Write Product Review', 'Purchase and review our eco-friendly water bottle (reimbursed)', 250, 'Reviews', 'medium', '20 minutes', 'active', 'review', 'EcoLife Products', NOW() + INTERVAL '21 days'),
('TikTok Video Creation', 'Create a 30-second video showcasing our product creatively', 500, 'Content Creation', 'hard', '45 minutes', 'active', 'content_creation', 'CreativeHub', NOW() + INTERVAL '10 days'),
('Market Research Study', 'Research competitor pricing for tech gadgets and compile findings', 400, 'Research', 'medium', '40 minutes', 'active', 'research', 'TechAnalytics', NOW() + INTERVAL '15 days'),
('Social Media Follow Campaign', 'Follow our social media accounts and share one post', 50, 'Social Media', 'easy', '3 minutes', 'active', 'social_follow', 'GrowthBrand', NOW() + INTERVAL '5 days'),
('Website Usability Test', 'Navigate our e-commerce site and report any issues found', 200, 'App Testing', 'easy', '15 minutes', 'active', 'usability_testing', 'ShopEasy', NOW() + INTERVAL '12 days'),
('YouTube Video Review', 'Watch and provide detailed feedback on our promotional video', 125, 'Reviews', 'easy', '12 minutes', 'active', 'video_review', 'VideoMakers Inc', NOW() + INTERVAL '8 days'),
('Blog Article Writing', 'Write a 500-word article about sustainable living tips', 600, 'Content Creation', 'hard', '60 minutes', 'active', 'article_writing', 'GreenLiving Blog', NOW() + INTERVAL '20 days'),
('Quick Opinion Poll', 'Answer 5 quick questions about your shopping preferences', 25, 'Survey', 'easy', '2 minutes', 'active', 'poll', 'Consumer Insights', NOW() + INTERVAL '3 days'),
('Discord Community Join', 'Join our Discord server and introduce yourself in the welcome channel', 100, 'Social Media', 'easy', '8 minutes', 'active', 'community_join', 'GamersUnite', NOW() + INTERVAL '30 days');

-- Add some sample rewards
INSERT INTO rewards (title, description, points_required, reward_type, reward_value, image_url, is_active) VALUES
('$5 Amazon Gift Card', 'Redeem your points for a $5 Amazon gift card', 500, 'gift_card', '$5', NULL, true),
('$10 PayPal Cash', 'Get $10 transferred directly to your PayPal account', 1000, 'cash', '$10', NULL, true),
('$25 Visa Gift Card', 'Universal Visa gift card accepted everywhere', 2500, 'gift_card', '$25', NULL, true),
('Premium Account Upgrade', 'Unlock premium features for 30 days', 750, 'digital', '30 days premium', NULL, true),
('$50 Gaming Gift Card', 'Choose from Steam, PlayStation, or Xbox gift cards', 5000, 'gift_card', '$50', NULL, true),
('Custom Profile Badge', 'Exclusive badge to show off your achievements', 300, 'digital', 'Exclusive Badge', NULL, true);

-- Update bird levels with more realistic requirements
UPDATE bird_levels SET 
  min_referrals = 0, 
  min_points = 0,
  benefits = ARRAY['Access to basic tasks', 'Welcome bonus points']
WHERE name = 'Sparrow';

UPDATE bird_levels SET 
  min_referrals = 1, 
  min_points = 100,
  benefits = ARRAY['Access to medium difficulty tasks', '10% point bonus on completed tasks']
WHERE name = 'Robin';

UPDATE bird_levels SET 
  min_referrals = 3, 
  min_points = 500,
  benefits = ARRAY['Access to all task types', '15% point bonus', 'Priority support']
WHERE name = 'Eagle';

-- Add achievements for task completion
INSERT INTO achievements (title, description, requirement_type, requirement_value, points_reward, badge_icon, badge_color) VALUES
('First Steps', 'Complete your first task', 'tasks_completed', 1, 50, 'Trophy', '#10B981'),
('Getting Started', 'Complete 5 tasks', 'tasks_completed', 5, 100, 'Award', '#3B82F6'),
('Task Master', 'Complete 10 tasks', 'tasks_completed', 10, 200, 'Crown', '#8B5CF6'),
('Point Collector', 'Earn 500 points', 'points_earned', 500, 100, 'Star', '#F59E0B'),
('High Achiever', 'Earn 1000 points', 'points_earned', 1000, 250, 'Gem', '#EF4444');
