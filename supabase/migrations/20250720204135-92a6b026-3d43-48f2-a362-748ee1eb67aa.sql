-- Create separate brand_profiles table to allow same email for brands and users
CREATE TABLE public.brand_profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name text NOT NULL,
  website text,
  industry text,
  description text,
  logo_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS on brand_profiles
ALTER TABLE public.brand_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for brand_profiles
CREATE POLICY "Brands can view their own profile" 
ON public.brand_profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Brands can update their own profile" 
ON public.brand_profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Brands can insert their own profile" 
ON public.brand_profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all brand profiles" 
ON public.brand_profiles 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::text));

-- Create function to handle new brand user creation
CREATE OR REPLACE FUNCTION public.handle_new_brand_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if this is a brand user type
  IF NEW.raw_user_meta_data->>'user_type' = 'brand' THEN
    -- Create brand profile
    INSERT INTO public.brand_profiles (
      user_id, 
      company_name, 
      website,
      industry,
      description
    )
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'company_name', NEW.raw_user_meta_data->>'name', 'Brand User'),
      NEW.raw_user_meta_data->>'website',
      NEW.raw_user_meta_data->>'industry',
      NEW.raw_user_meta_data->>'description'
    )
    ON CONFLICT (user_id) DO UPDATE SET
      company_name = EXCLUDED.company_name,
      website = EXCLUDED.website,
      industry = EXCLUDED.industry,
      description = EXCLUDED.description,
      updated_at = now();

    -- Assign brand role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'brand')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for new brand users
CREATE OR REPLACE TRIGGER on_auth_brand_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  WHEN (NEW.raw_user_meta_data->>'user_type' = 'brand')
  EXECUTE FUNCTION public.handle_new_brand_user();

-- Add trigger for updated_at
CREATE TRIGGER update_brand_profiles_updated_at
BEFORE UPDATE ON public.brand_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();