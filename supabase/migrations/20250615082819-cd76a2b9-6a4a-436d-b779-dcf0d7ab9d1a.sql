
-- Add a column to the 'tasks' table to link campaigns to a specific brand user, if it doesn't already exist
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS brand_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Enable Row Level Security (RLS) on the tables. This is idempotent.
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_applications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to prevent conflicts, then re-create them
DROP POLICY IF EXISTS "Brands can manage their own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Admins can manage all tasks" ON public.tasks;
DROP POLICY IF EXISTS "Authenticated users can view active tasks" ON public.tasks;
DROP POLICY IF EXISTS "Brands can view their own application" ON public.brand_applications;
DROP POLICY IF EXISTS "Brands can update their own application" ON public.brand_applications;
DROP POLICY IF EXISTS "Admins can manage all brand applications" ON public.brand_applications;

-- RLS Policies for the 'tasks' table
CREATE POLICY "Brands can manage their own tasks"
ON public.tasks FOR ALL
TO authenticated
USING (brand_user_id = auth.uid())
WITH CHECK (brand_user_id = auth.uid());

CREATE POLICY "Admins can manage all tasks"
ON public.tasks FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can view active tasks"
ON public.tasks FOR SELECT
TO authenticated
USING (status = 'active');

-- RLS Policies for the 'brand_applications' table
CREATE POLICY "Brands can view their own application"
ON public.brand_applications FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Brands can update their own application"
ON public.brand_applications FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all brand applications"
ON public.brand_applications FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create or replace the function to automatically assign the 'brand' role on approval
CREATE OR REPLACE FUNCTION public.assign_brand_role_on_approval()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if the application status changed to 'approved'
  IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
    -- Assign the 'brand' role to the user
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.user_id, 'brand')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the trigger if it exists, then re-create it to ensure it's up to date
DROP TRIGGER IF EXISTS on_brand_application_approval ON public.brand_applications;
CREATE TRIGGER on_brand_application_approval
AFTER UPDATE ON public.brand_applications
FOR EACH ROW
EXECUTE FUNCTION public.assign_brand_role_on_approval();
