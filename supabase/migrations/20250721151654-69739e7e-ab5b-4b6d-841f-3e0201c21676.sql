
-- Phase 3: Database Cleanup and Task-Category Association Fixes

-- 1. Clean up duplicate categories - remove duplicates and keep the cleaner names
DELETE FROM task_categories WHERE name IN ('social_media', 'app_testing', 'content_creation', 'survey', 'research');

-- 2. Update existing categories to use proper case naming
UPDATE task_categories SET name = 'Social Media' WHERE name = 'Social Media';
UPDATE task_categories SET name = 'App Testing' WHERE name = 'App Testing'; 
UPDATE task_categories SET name = 'Content Creation' WHERE name = 'Content Creation';
UPDATE task_categories SET name = 'Survey' WHERE name = 'Survey';
UPDATE task_categories SET name = 'Research' WHERE name = 'Research';

-- 3. Fix the existing task to have proper category assignment
-- Update the "Follow YEILD" task to be properly categorized as Social Media
UPDATE tasks 
SET category = 'Social Media', 
    task_type = 'social_media_follow'
WHERE title = 'Follow YEILD' OR title LIKE '%Follow YEILD%';

-- 4. Ensure all tasks have proper categories - update any with null categories
UPDATE tasks 
SET category = CASE 
    WHEN task_type = 'social_media' OR task_type LIKE '%social%' THEN 'Social Media'
    WHEN task_type = 'app_testing' OR task_type LIKE '%app%' THEN 'App Testing'
    WHEN task_type = 'content_creation' OR task_type LIKE '%content%' THEN 'Content Creation'
    WHEN task_type = 'survey' THEN 'Survey'
    WHEN task_type = 'research' THEN 'Research'
    ELSE 'Social Media'  -- Default fallback
END
WHERE category IS NULL;

-- 5. Add validation to prevent future null categories
-- Create a check constraint to ensure category is not null for active tasks
ALTER TABLE tasks ADD CONSTRAINT tasks_category_not_null_when_active 
CHECK (status != 'active' OR category IS NOT NULL);
