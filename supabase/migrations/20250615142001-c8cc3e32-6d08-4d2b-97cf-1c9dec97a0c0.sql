
-- Enable Row Level Security (RLS) for task_categories
ALTER TABLE public.task_categories ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to select (read) all categories
CREATE POLICY "Authenticated users can view all categories"
  ON public.task_categories
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow only admins to insert/update/delete categories
CREATE POLICY "Admins can insert categories"
  ON public.task_categories
  FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update categories"
  ON public.task_categories
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete categories"
  ON public.task_categories
  FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
