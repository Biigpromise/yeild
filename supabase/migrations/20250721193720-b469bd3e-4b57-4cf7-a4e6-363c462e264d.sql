-- Add rejection_reason column to task_submissions table
ALTER TABLE public.task_submissions 
ADD COLUMN rejection_reason text;