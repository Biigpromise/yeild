-- Create the user_tours table that's missing
CREATE TABLE public.user_tours (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tour_completed BOOLEAN NOT NULL DEFAULT false,
  tour_step INTEGER NOT NULL DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS on the user_tours table
ALTER TABLE public.user_tours ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_tours
CREATE POLICY "Users can view their own tour data" 
ON public.user_tours 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own tour data" 
ON public.user_tours 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage tour data" 
ON public.user_tours 
FOR ALL 
USING (auth.role() = 'service_role');

-- Fix the initialize_user_tour function
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
END;
$function$;

-- Create the trigger if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created_tour'
  ) THEN
    CREATE TRIGGER on_auth_user_created_tour
      AFTER INSERT ON auth.users
      FOR EACH ROW
      EXECUTE FUNCTION public.initialize_user_tour();
  END IF;
END $$;