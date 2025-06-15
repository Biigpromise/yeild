
-- Create a table for brand applications
CREATE TABLE public.brand_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    company_name TEXT NOT NULL,
    website TEXT,
    company_size TEXT NOT NULL,
    industry TEXT NOT NULL,
    task_types JSONB NOT NULL,
    budget TEXT NOT NULL,
    goals TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending', -- Can be 'pending', 'approved', 'rejected'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.brand_applications ENABLE ROW LEVEL SECURITY;

-- Allow users to insert their own application after signing up
CREATE POLICY "Users can insert their own brand application"
ON public.brand_applications
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Allow brands to view their own application status
CREATE POLICY "Brands can view their own application"
ON public.brand_applications
FOR SELECT
USING (auth.uid() = user_id);

-- Allow admins to manage all applications
CREATE POLICY "Admins can manage brand applications"
ON public.brand_applications
FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create a trigger to automatically update the 'updated_at' column on change
CREATE TRIGGER handle_brand_applications_updated_at
BEFORE UPDATE ON public.brand_applications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
