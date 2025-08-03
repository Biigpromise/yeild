-- Add foreign key constraint between task_submissions and profiles
ALTER TABLE public.task_submissions 
ADD CONSTRAINT fk_task_submissions_user_id 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Also add foreign key constraint between task_submissions and tasks if it doesn't exist
ALTER TABLE public.task_submissions 
ADD CONSTRAINT fk_task_submissions_task_id 
FOREIGN KEY (task_id) REFERENCES public.tasks(id) ON DELETE CASCADE;