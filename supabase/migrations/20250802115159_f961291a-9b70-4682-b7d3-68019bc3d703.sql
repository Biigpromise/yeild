-- Create user_tours table with proper structure
CREATE TABLE IF NOT EXISTS public.user_tours (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  tour_completed BOOLEAN NOT NULL DEFAULT FALSE,
  tour_step INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_tours ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own tour progress" 
ON public.user_tours 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own tour progress" 
ON public.user_tours 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tour progress" 
ON public.user_tours 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create or replace the trigger function to handle errors gracefully
CREATE OR REPLACE FUNCTION public.initialize_user_tour()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.user_tours (user_id, tour_completed, tour_step)
  VALUES (NEW.id, FALSE, 0)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't block user creation
    RAISE WARNING 'Error in initialize_user_tour: %', SQLERRM;
    RETURN NEW;
END;
$function$;