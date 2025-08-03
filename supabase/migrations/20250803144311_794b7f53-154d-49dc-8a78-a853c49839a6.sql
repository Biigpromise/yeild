-- Phase 1: Enhanced Message Features Database Schema (Part 2)
-- Skip existing tables and add only new ones

-- Check what we can add to existing messages table
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS is_edited BOOLEAN DEFAULT false;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS edit_count INTEGER DEFAULT 0;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS last_edited_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS reply_count INTEGER DEFAULT 0;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS parent_message_id UUID REFERENCES public.messages(id) ON DELETE SET NULL;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS message_type TEXT DEFAULT 'text';
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS voice_duration INTEGER;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS voice_transcript TEXT;

-- 2. Message Threading System (if not exists)
CREATE TABLE IF NOT EXISTS public.message_threads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  reply_message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(parent_message_id, reply_message_id)
);

-- Enable RLS on message_threads
ALTER TABLE public.message_threads ENABLE ROW LEVEL SECURITY;

-- Drop policies if they exist and recreate
DROP POLICY IF EXISTS "Anyone can view threads" ON public.message_threads;
DROP POLICY IF EXISTS "Users can create threads for their messages" ON public.message_threads;

CREATE POLICY "Anyone can view threads" ON public.message_threads FOR SELECT USING (true);
CREATE POLICY "Users can create threads for their messages" ON public.message_threads FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.messages WHERE id = reply_message_id AND user_id = auth.uid())
);

-- 3. User Mentions System
CREATE TABLE IF NOT EXISTS public.message_mentions (
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

-- Drop policies if they exist and recreate
DROP POLICY IF EXISTS "Users can view their mentions" ON public.message_mentions;
DROP POLICY IF EXISTS "Users can create mentions" ON public.message_mentions;
DROP POLICY IF EXISTS "Users can update their mention read status" ON public.message_mentions;

CREATE POLICY "Users can view their mentions" ON public.message_mentions FOR SELECT USING (auth.uid() = mentioned_user_id);
CREATE POLICY "Users can create mentions" ON public.message_mentions FOR INSERT WITH CHECK (auth.uid() = mentioned_by_user_id);
CREATE POLICY "Users can update their mention read status" ON public.message_mentions FOR UPDATE USING (auth.uid() = mentioned_user_id);

-- 4. Message Edit History
CREATE TABLE IF NOT EXISTS public.message_edit_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  previous_content TEXT NOT NULL,
  edited_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  edited_by UUID NOT NULL
);

-- Enable RLS on message_edit_history
ALTER TABLE public.message_edit_history ENABLE ROW LEVEL SECURITY;

-- Drop policies if they exist and recreate
DROP POLICY IF EXISTS "Users can view edit history of messages" ON public.message_edit_history;
DROP POLICY IF EXISTS "System can insert edit history" ON public.message_edit_history;

CREATE POLICY "Users can view edit history of messages" ON public.message_edit_history FOR SELECT USING (true);
CREATE POLICY "System can insert edit history" ON public.message_edit_history FOR INSERT WITH CHECK (auth.uid() = edited_by);

-- 8. Typing Indicators
CREATE TABLE IF NOT EXISTS public.typing_indicators (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  chat_id TEXT NOT NULL DEFAULT 'community',
  is_typing BOOLEAN NOT NULL DEFAULT true,
  last_typed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '10 seconds'),
  UNIQUE(user_id, chat_id)
);

-- Enable RLS on typing_indicators
ALTER TABLE public.typing_indicators ENABLE ROW LEVEL SECURITY;

-- Drop policies if they exist and recreate
DROP POLICY IF EXISTS "Anyone can view typing indicators" ON public.typing_indicators;
DROP POLICY IF EXISTS "Users can manage their typing status" ON public.typing_indicators;

CREATE POLICY "Anyone can view typing indicators" ON public.typing_indicators FOR SELECT USING (true);
CREATE POLICY "Users can manage their typing status" ON public.typing_indicators FOR ALL USING (auth.uid() = user_id);

-- 9. User Presence and Status
CREATE TABLE IF NOT EXISTS public.user_presence (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'offline',
  custom_status TEXT,
  last_seen_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_online BOOLEAN NOT NULL DEFAULT false
);

-- Enable RLS on user_presence
ALTER TABLE public.user_presence ENABLE ROW LEVEL SECURITY;

-- Drop policies if they exist and recreate
DROP POLICY IF EXISTS "Anyone can view user presence" ON public.user_presence;
DROP POLICY IF EXISTS "Users can update their own presence" ON public.user_presence;

CREATE POLICY "Anyone can view user presence" ON public.user_presence FOR SELECT USING (true);
CREATE POLICY "Users can update their own presence" ON public.user_presence FOR ALL USING (auth.uid() = user_id);

-- 10. Message Read Receipts
CREATE TABLE IF NOT EXISTS public.message_read_receipts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  read_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(message_id, user_id)
);

-- Enable RLS on message_read_receipts
ALTER TABLE public.message_read_receipts ENABLE ROW LEVEL SECURITY;

-- Drop policies if they exist and recreate
DROP POLICY IF EXISTS "Anyone can view read receipts" ON public.message_read_receipts;
DROP POLICY IF EXISTS "Users can mark messages as read" ON public.message_read_receipts;

CREATE POLICY "Anyone can view read receipts" ON public.message_read_receipts FOR SELECT USING (true);
CREATE POLICY "Users can mark messages as read" ON public.message_read_receipts FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 7. Message Search and Indexing
CREATE INDEX IF NOT EXISTS idx_messages_content_search ON public.messages USING gin(to_tsvector('english', content));
CREATE INDEX IF NOT EXISTS idx_messages_user_date ON public.messages (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_type ON public.messages (message_type);
CREATE INDEX IF NOT EXISTS idx_messages_parent ON public.messages (parent_message_id);

-- Add realtime publication for new tables
DO $$
BEGIN
    -- Add tables to realtime publication if not already added
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.message_threads;
    EXCEPTION WHEN duplicate_object THEN
        -- Table already added, skip
    END;
    
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.message_mentions;
    EXCEPTION WHEN duplicate_object THEN
        -- Table already added, skip
    END;
    
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.typing_indicators;
    EXCEPTION WHEN duplicate_object THEN
        -- Table already added, skip
    END;
    
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.user_presence;
    EXCEPTION WHEN duplicate_object THEN
        -- Table already added, skip
    END;
    
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.message_read_receipts;
    EXCEPTION WHEN duplicate_object THEN
        -- Table already added, skip
    END;
END
$$;