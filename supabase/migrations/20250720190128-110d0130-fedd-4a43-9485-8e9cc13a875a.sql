-- Enable realtime for messages and related tables
ALTER TABLE public.messages REPLICA IDENTITY FULL;
ALTER TABLE public.message_comments REPLICA IDENTITY FULL;
ALTER TABLE public.message_likes REPLICA IDENTITY FULL;
ALTER TABLE public.message_reactions REPLICA IDENTITY FULL;
ALTER TABLE public.message_views REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.message_comments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.message_likes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.message_reactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.message_views;