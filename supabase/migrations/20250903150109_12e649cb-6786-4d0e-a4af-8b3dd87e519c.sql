-- If Blessing's task doesn't have proper social links, update it with the campaign links
UPDATE tasks 
SET social_media_links = (
  SELECT bc.social_links
  FROM brand_campaigns bc
  WHERE bc.id = tasks.source_campaign_id
)
WHERE id = '60ed9856-7d4d-4a5e-ba11-426794d59919'
  AND (social_media_links IS NULL OR social_media_links = '{}' OR social_media_links = 'null');

-- Check what we updated
SELECT 
  t.id, t.title, t.social_media_links,
  bc.social_links as original_campaign_links
FROM tasks t
LEFT JOIN brand_campaigns bc ON t.source_campaign_id = bc.id
WHERE t.id = '60ed9856-7d4d-4a5e-ba11-426794d59919';