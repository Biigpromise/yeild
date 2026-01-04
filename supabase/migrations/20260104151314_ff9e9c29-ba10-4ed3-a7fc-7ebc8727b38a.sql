-- Add task comments table for user collaboration
CREATE TABLE public.task_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  parent_comment_id UUID REFERENCES public.task_comments(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for task_comments
ALTER TABLE public.task_comments ENABLE ROW LEVEL SECURITY;

-- Anyone can view comments on active tasks
CREATE POLICY "Anyone can view task comments"
ON public.task_comments
FOR SELECT
USING (true);

-- Authenticated users can create comments
CREATE POLICY "Authenticated users can create comments"
ON public.task_comments
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own comments
CREATE POLICY "Users can update their own comments"
ON public.task_comments
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own comments
CREATE POLICY "Users can delete their own comments"
ON public.task_comments
FOR DELETE
USING (auth.uid() = user_id);

-- Create index for fast lookups
CREATE INDEX idx_task_comments_task_id ON public.task_comments(task_id);
CREATE INDEX idx_task_comments_parent ON public.task_comments(parent_comment_id);

-- Add location targeting and point boost columns to tasks
ALTER TABLE public.tasks 
ADD COLUMN IF NOT EXISTS target_location JSONB DEFAULT NULL,
ADD COLUMN IF NOT EXISTS location_type TEXT DEFAULT 'global',
ADD COLUMN IF NOT EXISTS allowed_countries TEXT[] DEFAULT NULL,
ADD COLUMN IF NOT EXISTS original_points INTEGER DEFAULT NULL,
ADD COLUMN IF NOT EXISTS point_boost_history JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS last_boosted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Add video support to marketplace listings (the image_urls column already supports multiple URLs, we'll just use it for videos too)
-- Add a media_type column to track if it's image or video
ALTER TABLE public.marketplace_listings
ADD COLUMN IF NOT EXISTS media_types JSONB DEFAULT '[]'::jsonb;

-- Create trigger to update updated_at for task_comments
CREATE TRIGGER update_task_comments_updated_at
BEFORE UPDATE ON public.task_comments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();