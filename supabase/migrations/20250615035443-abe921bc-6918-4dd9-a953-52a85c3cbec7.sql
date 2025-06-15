
-- Create platform_settings table
CREATE TABLE public.platform_settings (
  key TEXT PRIMARY KEY,
  value JSONB,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

-- Allow admins to manage settings
CREATE POLICY "Allow admin full access to settings" 
ON public.platform_settings 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Allow authenticated users to read non-sensitive settings
CREATE POLICY "Allow authenticated users to read settings" 
ON public.platform_settings 
FOR SELECT
USING (auth.uid() IS NOT NULL AND key IN ('siteName', 'maintenanceMode', 'registrationEnabled'));


-- Insert default settings
INSERT INTO public.platform_settings (key, value) VALUES
('siteName', '"YEILD"'),
('maintenanceMode', 'false'),
('registrationEnabled', 'true'),
('taskSubmissionEnabled', 'true'),
('withdrawalEnabled', 'true'),
('maxTasksPerUser', '10'),
('pointsPerTask', '50')
ON CONFLICT (key) DO NOTHING;


-- Create announcements table
CREATE TABLE public.announcements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'warning', 'success', 'error')),
  target_audience TEXT NOT NULL DEFAULT 'all' CHECK (target_audience IN ('all', 'active', 'new', 'inactive')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  scheduled_for TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- Allow admins to manage announcements
CREATE POLICY "Allow admin full access to announcements" 
ON public.announcements 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Allow authenticated users to read active announcements
CREATE POLICY "Allow authenticated users to read active announcements" 
ON public.announcements 
FOR SELECT
USING (auth.uid() IS NOT NULL AND is_active = true);
