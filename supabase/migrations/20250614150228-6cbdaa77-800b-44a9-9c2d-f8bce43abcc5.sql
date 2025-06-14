
-- Add unique constraint to prevent duplicate task submissions
ALTER TABLE task_submissions 
ADD CONSTRAINT unique_user_task_submission 
UNIQUE (user_id, task_id);

-- Add calculated points and breakdown columns if they don't exist
ALTER TABLE task_submissions 
ADD COLUMN IF NOT EXISTS calculated_points INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS point_breakdown JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS point_explanation TEXT;
