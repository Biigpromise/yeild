-- Fix Blessing's task with the correct social links from the campaign
UPDATE tasks 
SET social_media_links = (
  SELECT bc.social_links
  FROM brand_campaigns bc
  WHERE bc.id = tasks.source_campaign_id
)
WHERE id = '60ed9856-7d4d-4a5e-ba11-426794d59919';

-- Verify the update
SELECT 
  t.id, t.title, t.social_media_links
FROM tasks t
WHERE t.id = '60ed9856-7d4d-4a5e-ba11-426794d59919';