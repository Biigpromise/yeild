-- Create brand task announcements table
CREATE TABLE public.brand_task_announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  task_category TEXT,
  estimated_launch_date TIMESTAMP WITH TIME ZONE,
  estimated_budget NUMERIC,
  target_audience JSONB DEFAULT '{}',
  requirements JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  announcement_type TEXT DEFAULT 'upcoming_task',
  status TEXT DEFAULT 'draft', -- draft, published, launched, cancelled
  interest_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user task interests table (for users to show interest in upcoming tasks)
CREATE TABLE public.user_task_interests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  announcement_id UUID NOT NULL REFERENCES public.brand_task_announcements(id) ON DELETE CASCADE,
  interest_level TEXT DEFAULT 'interested', -- interested, very_interested, notify_me
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, announcement_id)
);

-- Enable RLS
ALTER TABLE public.brand_task_announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_task_interests ENABLE ROW LEVEL SECURITY;

-- RLS policies for brand_task_announcements
CREATE POLICY "Brands can manage their own announcements" 
ON public.brand_task_announcements 
FOR ALL 
USING (auth.uid() = brand_id)
WITH CHECK (auth.uid() = brand_id);

CREATE POLICY "Users can view published announcements" 
ON public.brand_task_announcements 
FOR SELECT 
USING (status = 'published' AND is_active = true);

CREATE POLICY "Admins can view all announcements" 
ON public.brand_task_announcements 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'));

-- RLS policies for user_task_interests
CREATE POLICY "Users can manage their own interests" 
ON public.user_task_interests 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Brands can view interests in their announcements" 
ON public.user_task_interests 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.brand_task_announcements 
  WHERE id = announcement_id AND brand_id = auth.uid()
));

-- Create function to update interest count
CREATE OR REPLACE FUNCTION public.update_announcement_interest_count()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE public.brand_task_announcements
    SET interest_count = interest_count + 1
    WHERE id = NEW.announcement_id;
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE public.brand_task_announcements
    SET interest_count = GREATEST(0, interest_count - 1)
    WHERE id = OLD.announcement_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for interest count
CREATE TRIGGER update_announcement_interest_count_trigger
  AFTER INSERT OR DELETE ON public.user_task_interests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_announcement_interest_count();

-- Add indexes for performance
CREATE INDEX idx_brand_task_announcements_brand_id ON public.brand_task_announcements(brand_id);
CREATE INDEX idx_brand_task_announcements_status ON public.brand_task_announcements(status);
CREATE INDEX idx_brand_task_announcements_launch_date ON public.brand_task_announcements(estimated_launch_date);
CREATE INDEX idx_user_task_interests_user_id ON public.user_task_interests(user_id);
CREATE INDEX idx_user_task_interests_announcement_id ON public.user_task_interests(announcement_id);