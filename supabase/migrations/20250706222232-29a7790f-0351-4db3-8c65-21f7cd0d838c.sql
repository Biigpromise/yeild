-- Create FAQ management table
CREATE TABLE IF NOT EXISTS public.faqs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  is_published BOOLEAN DEFAULT false,
  order_index INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user feedback table
CREATE TABLE IF NOT EXISTS public.user_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  category TEXT NOT NULL DEFAULT 'general',
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved')),
  admin_response TEXT,
  responded_by UUID REFERENCES auth.users(id),
  responded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user activity logs table
CREATE TABLE IF NOT EXISTS public.user_activity_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  action TEXT NOT NULL,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activity_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for FAQs
CREATE POLICY "Everyone can view published FAQs" ON public.faqs
  FOR SELECT USING (is_published = true);

CREATE POLICY "Admins can manage FAQs" ON public.faqs
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for User Feedback  
CREATE POLICY "Users can create their own feedback" ON public.user_feedback
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own feedback" ON public.user_feedback
  FOR SELECT USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all feedback" ON public.user_feedback
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for Activity Logs
CREATE POLICY "Users can view their own activity" ON public.user_activity_logs
  FOR SELECT USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert activity logs" ON public.user_activity_logs
  FOR INSERT WITH CHECK (true);

-- Add indexes for performance
CREATE INDEX idx_faqs_category ON public.faqs(category);
CREATE INDEX idx_faqs_published ON public.faqs(is_published);
CREATE INDEX idx_user_feedback_user_id ON public.user_feedback(user_id);
CREATE INDEX idx_user_feedback_status ON public.user_feedback(status);
CREATE INDEX idx_user_activity_logs_user_id ON public.user_activity_logs(user_id);
CREATE INDEX idx_user_activity_logs_created_at ON public.user_activity_logs(created_at DESC);