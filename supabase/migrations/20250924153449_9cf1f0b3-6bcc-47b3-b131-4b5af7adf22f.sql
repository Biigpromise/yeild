-- Create platform_settings table for maintenance mode and other platform settings
CREATE TABLE IF NOT EXISTS public.platform_settings (
  key TEXT PRIMARY KEY,
  value JSONB,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can manage platform settings" 
ON public.platform_settings 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::text))
WITH CHECK (has_role(auth.uid(), 'admin'::text));

CREATE POLICY "Anyone can read platform settings" 
ON public.platform_settings 
FOR SELECT 
USING (true);

-- Insert default maintenance mode setting
INSERT INTO public.platform_settings (key, value) 
VALUES ('maintenanceMode', 'false'::jsonb)
ON CONFLICT (key) DO NOTHING;