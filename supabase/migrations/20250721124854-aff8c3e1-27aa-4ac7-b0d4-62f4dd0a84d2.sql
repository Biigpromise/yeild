
-- First, let's clean up duplicate task categories and organize the data properly
-- Remove duplicate task categories, keeping only the ones with proper structure
DELETE FROM task_categories WHERE name IN ('Content Creation', 'Social Media', 'Design', 'Marketing', 'Research') AND id NOT IN (
  SELECT MIN(id) FROM task_categories WHERE name IN ('Content Creation', 'Social Media', 'Design', 'Marketing', 'Research') GROUP BY name
);

-- Insert proper task categories if they don't exist
INSERT INTO task_categories (name, description, icon, color) VALUES
  ('Content Creation', 'Create engaging content for various platforms', 'PenTool', 'text-blue-600'),
  ('Social Media', 'Social media engagement and promotion tasks', 'Share2', 'text-green-600'),
  ('Design', 'Visual design and creative tasks', 'Smartphone', 'text-purple-600'),
  ('Marketing', 'Marketing and promotional activities', 'Target', 'text-orange-600'),
  ('Research', 'Research and data collection tasks', 'Search', 'text-red-600')
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  color = EXCLUDED.color;

-- Update existing tasks to have proper categories
UPDATE tasks SET category = 'Content Creation' WHERE category IS NULL OR category = '';
UPDATE tasks SET category = 'Social Media' WHERE title ILIKE '%social%' OR title ILIKE '%share%' OR title ILIKE '%tweet%';
UPDATE tasks SET category = 'Design' WHERE title ILIKE '%design%' OR title ILIKE '%logo%' OR title ILIKE '%graphic%';
UPDATE tasks SET category = 'Marketing' WHERE title ILIKE '%marketing%' OR title ILIKE '%promo%' OR title ILIKE '%campaign%';
UPDATE tasks SET category = 'Research' WHERE title ILIKE '%research%' OR title ILIKE '%survey%' OR title ILIKE '%data%';
