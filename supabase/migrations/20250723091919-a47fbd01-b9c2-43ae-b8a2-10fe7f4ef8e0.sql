-- Update notification RLS policies to allow admin-to-user notifications and user access to their own notifications

-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Admin can create notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;

-- Create improved RLS policies for notifications
CREATE POLICY "Enable insert for service role" ON public.notifications
  FOR INSERT 
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Enable insert for admins" ON public.notifications
  FOR INSERT 
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view their own notifications" ON public.notifications
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all notifications" ON public.notifications
  FOR SELECT 
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can update their own notifications" ON public.notifications
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can update all notifications" ON public.notifications
  FOR UPDATE 
  USING (has_role(auth.uid(), 'admin'));

-- Enable realtime for notifications table
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;