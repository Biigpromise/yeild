-- Fix task_comments RLS policy - ensure proper WITH CHECK for INSERT
DROP POLICY IF EXISTS "Users can create comments on tasks" ON public.task_comments;

CREATE POLICY "Users can create comments on tasks" 
ON public.task_comments 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Add referral tracking columns for the new referral bonus system
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS referral_bonus_pending BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS referral_bonus_deducted_from_task_id UUID REFERENCES public.tasks(id),
ADD COLUMN IF NOT EXISTS first_task_completed BOOLEAN DEFAULT false;