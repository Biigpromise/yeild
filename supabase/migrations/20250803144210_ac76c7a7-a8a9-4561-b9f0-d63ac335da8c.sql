-- Phase 1: Enhanced Message Features Database Schema

-- 1. Message Reactions System (beyond just likes)
CREATE TABLE public.message_reactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  emoji TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(message_id, user_id, emoji)
);

-- Enable RLS on message_reactions
ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;

-- Policies for message_reactions
CREATE POLICY "Anyone can view reactions" ON public.message_reactions FOR SELECT USING (true);
CREATE POLICY "Users can add reactions" ON public.message_reactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove their reactions" ON public.message_reactions FOR DELETE USING (auth.uid() = user_id);

-- 2. Message Threading System
CREATE TABLE public.message_threads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  reply_message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(parent_message_id, reply_message_id)
);

-- Enable RLS on message_threads
ALTER TABLE public.message_threads ENABLE ROW LEVEL SECURITY;

-- Policies for message_threads
CREATE POLICY "Anyone can view threads" ON public.message_threads FOR SELECT USING (true);
CREATE POLICY "Users can create threads for their messages" ON public.message_threads FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.messages WHERE id = reply_message_id AND user_id = auth.uid())
);

-- 3. User Mentions System
CREATE TABLE public.message_mentions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  mentioned_user_id UUID NOT NULL,
  mentioned_by_user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_read BOOLEAN NOT NULL DEFAULT false,
  UNIQUE(message_id, mentioned_user_id)
);

-- Enable RLS on message_mentions
ALTER TABLE public.message_mentions ENABLE ROW LEVEL SECURITY;

-- Policies for message_mentions
CREATE POLICY "Users can view their mentions" ON public.message_mentions FOR SELECT USING (auth.uid() = mentioned_user_id);
CREATE POLICY "Users can create mentions" ON public.message_mentions FOR INSERT WITH CHECK (auth.uid() = mentioned_by_user_id);
CREATE POLICY "Users can update their mention read status" ON public.message_mentions FOR UPDATE USING (auth.uid() = mentioned_user_id);

-- 4. Message Edit History
CREATE TABLE public.message_edit_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  previous_content TEXT NOT NULL,
  edited_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  edited_by UUID NOT NULL
);

-- Enable RLS on message_edit_history
ALTER TABLE public.message_edit_history ENABLE ROW LEVEL SECURITY;

-- Policies for message_edit_history
CREATE POLICY "Users can view edit history of messages" ON public.message_edit_history FOR SELECT USING (true);
CREATE POLICY "System can insert edit history" ON public.message_edit_history FOR INSERT WITH CHECK (auth.uid() = edited_by);

-- 5. Add fields to existing messages table for enhanced features
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS is_edited BOOLEAN DEFAULT false;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS edit_count INTEGER DEFAULT 0;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS last_edited_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS reply_count INTEGER DEFAULT 0;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS parent_message_id UUID REFERENCES public.messages(id) ON DELETE SET NULL;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- 6. Voice Messages Support
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS message_type TEXT DEFAULT 'text';
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS voice_duration INTEGER; -- in seconds
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS voice_transcript TEXT;

-- 7. Message Search and Indexing
CREATE INDEX IF NOT EXISTS idx_messages_content_search ON public.messages USING gin(to_tsvector('english', content));
CREATE INDEX IF NOT EXISTS idx_messages_user_date ON public.messages (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_type ON public.messages (message_type);

-- 8. Typing Indicators
CREATE TABLE public.typing_indicators (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  chat_id TEXT NOT NULL DEFAULT 'community', -- for different chat rooms
  is_typing BOOLEAN NOT NULL DEFAULT true,
  last_typed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '10 seconds'),
  UNIQUE(user_id, chat_id)
);

-- Enable RLS on typing_indicators
ALTER TABLE public.typing_indicators ENABLE ROW LEVEL SECURITY;

-- Policies for typing_indicators
CREATE POLICY "Anyone can view typing indicators" ON public.typing_indicators FOR SELECT USING (true);
CREATE POLICY "Users can manage their typing status" ON public.typing_indicators FOR ALL USING (auth.uid() = user_id);

-- 9. User Presence and Status
CREATE TABLE public.user_presence (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'offline', -- online, away, busy, offline
  custom_status TEXT,
  last_seen_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_online BOOLEAN NOT NULL DEFAULT false
);

-- Enable RLS on user_presence
ALTER TABLE public.user_presence ENABLE ROW LEVEL SECURITY;

-- Policies for user_presence
CREATE POLICY "Anyone can view user presence" ON public.user_presence FOR SELECT USING (true);
CREATE POLICY "Users can update their own presence" ON public.user_presence FOR ALL USING (auth.uid() = user_id);

-- 10. Message Read Receipts
CREATE TABLE public.message_read_receipts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  read_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(message_id, user_id)
);

-- Enable RLS on message_read_receipts
ALTER TABLE public.message_read_receipts ENABLE ROW LEVEL SECURITY;

-- Policies for message_read_receipts
CREATE POLICY "Anyone can view read receipts" ON public.message_read_receipts FOR SELECT USING (true);
CREATE POLICY "Users can mark messages as read" ON public.message_read_receipts FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Add realtime publication for new tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.message_reactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.message_threads;
ALTER PUBLICATION supabase_realtime ADD TABLE public.message_mentions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.typing_indicators;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_presence;
ALTER PUBLICATION supabase_realtime ADD TABLE public.message_read_receipts;

-- Functions for enhanced functionality

-- Function to update message reply count
CREATE OR REPLACE FUNCTION public.update_message_reply_count()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT' AND NEW.parent_message_id IS NOT NULL) THEN
    UPDATE public.messages
    SET reply_count = reply_count + 1
    WHERE id = NEW.parent_message_id;
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE' AND OLD.parent_message_id IS NOT NULL) THEN
    UPDATE public.messages
    SET reply_count = GREATEST(0, reply_count - 1)
    WHERE id = OLD.parent_message_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for reply count
CREATE TRIGGER update_message_reply_count_trigger
  AFTER INSERT OR DELETE ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_message_reply_count();

-- Function to clean up expired typing indicators
CREATE OR REPLACE FUNCTION public.cleanup_expired_typing_indicators()
RETURNS void AS $$
BEGIN
  DELETE FROM public.typing_indicators 
  WHERE expires_at < now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update user presence
CREATE OR REPLACE FUNCTION public.update_user_presence(
  p_user_id UUID,
  p_status TEXT DEFAULT 'online',
  p_custom_status TEXT DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  INSERT INTO public.user_presence (user_id, status, custom_status, is_online)
  VALUES (p_user_id, p_status, p_custom_status, p_status = 'online')
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    status = EXCLUDED.status,
    custom_status = EXCLUDED.custom_status,
    is_online = EXCLUDED.is_online,
    last_seen_at = CASE 
      WHEN EXCLUDED.status = 'offline' THEN now()
      ELSE user_presence.last_seen_at
    END,
    updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;