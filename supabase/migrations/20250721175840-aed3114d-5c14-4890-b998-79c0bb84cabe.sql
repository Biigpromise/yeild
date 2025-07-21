
-- Add table to track global image usage across all users
CREATE TABLE IF NOT EXISTS public.global_image_usage (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  hash_value text NOT NULL,
  user_id uuid NOT NULL,
  task_id uuid,
  submission_id uuid,
  file_url text NOT NULL,
  used_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(hash_value) -- Prevent the same image hash from being used twice globally
);

-- Enable RLS on global_image_usage
ALTER TABLE public.global_image_usage ENABLE ROW LEVEL SECURITY;

-- Create policies for global_image_usage
CREATE POLICY "Service can insert global image usage" 
  ON public.global_image_usage 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Admins can view all global image usage" 
  ON public.global_image_usage 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Users can view their own global image usage" 
  ON public.global_image_usage 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Add support for multiple file URLs in task submissions
ALTER TABLE public.task_submissions 
ADD COLUMN IF NOT EXISTS evidence_files jsonb DEFAULT '[]'::jsonb;

-- Add index for better performance on hash lookups
CREATE INDEX IF NOT EXISTS idx_global_image_usage_hash 
  ON public.global_image_usage(hash_value);

-- Add index for user lookups
CREATE INDEX IF NOT EXISTS idx_global_image_usage_user 
  ON public.global_image_usage(user_id);
