
-- Clean up potentially conflicting brand-related policies on the tasks table
DROP POLICY IF EXISTS "Brands can manage their own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Allow brands to view their own campaigns" ON public.tasks;
DROP POLICY IF EXISTS "Allow brands to create campaigns" ON public.tasks;
DROP POLICY IF EXISTS "Allow brands to update their own campaigns" ON public.tasks;

-- Re-creation of this policy is intentional to ensure it's correct
DROP POLICY IF EXISTS "Authenticated users can view active tasks" ON public.tasks;

-- Enable RLS on task_submissions (this is idempotent, safe to run again)
ALTER TABLE public.task_submissions ENABLE ROW LEVEL SECURITY;

-- Clean up policies on task_submissions to ensure a fresh start
DROP POLICY IF EXISTS "Allow brands to view submissions for their campaigns" ON public.task_submissions;
DROP POLICY IF EXISTS "Allow users to view their own submissions" ON public.task_submissions;
DROP POLICY IF EXISTS "Allow users to create submissions" ON public.task_submissions;


-- Re-create correct policies for the 'tasks' table
CREATE POLICY "Authenticated users can view active tasks"
ON public.tasks
FOR SELECT
TO authenticated
USING (status = 'active');

CREATE POLICY "Allow brands to view their own campaigns"
ON public.tasks
FOR SELECT
TO authenticated
USING (brand_user_id = auth.uid());

CREATE POLICY "Allow brands to create campaigns"
ON public.tasks
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'brand') AND brand_user_id = auth.uid());

CREATE POLICY "Allow brands to update their own campaigns"
ON public.tasks
FOR UPDATE
TO authenticated
USING (brand_user_id = auth.uid())
WITH CHECK (brand_user_id = auth.uid());


-- Re-create correct policies for the 'task_submissions' table
CREATE POLICY "Allow brands to view submissions for their campaigns"
ON public.task_submissions
FOR SELECT
TO authenticated
USING (EXISTS (
  SELECT 1
  FROM public.tasks
  WHERE tasks.id = task_submissions.task_id AND tasks.brand_user_id = auth.uid()
));

CREATE POLICY "Allow users to view their own submissions"
ON public.task_submissions
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Allow users to create submissions"
ON public.task_submissions
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

