-- Create message_comments table for community chat comments
CREATE TABLE public.message_comments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id uuid NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.message_comments ENABLE ROW LEVEL SECURITY;

-- Create policies for message comments
CREATE POLICY "Users can view all comments" 
ON public.message_comments 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create their own comments" 
ON public.message_comments 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" 
ON public.message_comments 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" 
ON public.message_comments 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX idx_message_comments_message_id ON public.message_comments(message_id);
CREATE INDEX idx_message_comments_created_at ON public.message_comments(created_at);

-- Add trigger for updated_at
CREATE TRIGGER update_message_comments_updated_at
BEFORE UPDATE ON public.message_comments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();