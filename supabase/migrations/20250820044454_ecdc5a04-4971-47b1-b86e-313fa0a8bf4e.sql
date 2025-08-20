-- Phase 3: Reset all task submissions and user points for fresh start

-- Step 1: Clear all task submissions
DELETE FROM public.task_submissions;

-- Step 2: Clear all point transactions related to tasks
DELETE FROM public.point_transactions 
WHERE transaction_type IN ('task_completion', 'submission_bonus', 'achievement');

-- Step 3: Reset all user points and task-related stats to 0
UPDATE public.profiles 
SET 
  points = 0,
  tasks_completed = 0,
  task_completion_rate = 0.0,
  updated_at = now()
WHERE points > 0 OR tasks_completed > 0;

-- Step 4: Reset user tasks progress
DELETE FROM public.user_tasks;

-- Step 5: Reset user achievements
DELETE FROM public.user_achievements;

-- Step 6: Reset any user streaks related to tasks
DELETE FROM public.user_streaks WHERE streak_type = 'task_completion';

-- Step 7: Clear message views and post views to reset engagement stats
DELETE FROM public.message_views;
DELETE FROM public.post_views;

-- Step 8: Add admin notification about the reset
INSERT INTO public.admin_notifications (type, message, link_to)
VALUES (
  'system_reset',
  'Task submissions system has been reset. All user points, submissions, and achievements have been cleared for fresh testing.',
  '/admin?section=tasks'
);