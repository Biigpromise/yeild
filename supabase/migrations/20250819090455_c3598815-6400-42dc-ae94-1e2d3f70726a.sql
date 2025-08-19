-- Create direct messages schema
CREATE TABLE IF NOT EXISTS public.direct_chats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_by UUID NOT NULL,
  is_group_chat BOOLEAN NOT NULL DEFAULT false,
  name TEXT,
  description TEXT,
  last_message_id UUID,
  last_message_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.direct_chats ENABLE ROW LEVEL SECURITY;

-- Create participants table
CREATE TABLE IF NOT EXISTS public.direct_chat_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_id UUID NOT NULL REFERENCES public.direct_chats(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_read_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(chat_id, user_id)
);

-- Enable RLS
ALTER TABLE public.direct_chat_participants ENABLE ROW LEVEL SECURITY;

-- Create messages table
CREATE TABLE IF NOT EXISTS public.direct_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_id UUID NOT NULL REFERENCES public.direct_chats(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT,
  message_type TEXT NOT NULL DEFAULT 'text',
  media_url TEXT,
  reply_to_id UUID REFERENCES public.direct_messages(id),
  is_edited BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;

-- Create message reactions table
CREATE TABLE IF NOT EXISTS public.direct_message_reactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID NOT NULL REFERENCES public.direct_messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  emoji TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(message_id, user_id, emoji)
);

-- Enable RLS
ALTER TABLE public.direct_message_reactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view chats they participate in" ON public.direct_chats
  FOR SELECT USING (
    id IN (
      SELECT chat_id FROM public.direct_chat_participants 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create chats" ON public.direct_chats
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update chats they created" ON public.direct_chats
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can view participants of their chats" ON public.direct_chat_participants
  FOR SELECT USING (
    chat_id IN (
      SELECT chat_id FROM public.direct_chat_participants 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can join chats" ON public.direct_chat_participants
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own participation" ON public.direct_chat_participants
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view messages in their chats" ON public.direct_messages
  FOR SELECT USING (
    chat_id IN (
      SELECT chat_id FROM public.direct_chat_participants 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can send messages to their chats" ON public.direct_messages
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    chat_id IN (
      SELECT chat_id FROM public.direct_chat_participants 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own messages" ON public.direct_messages
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view reactions in their chats" ON public.direct_message_reactions
  FOR SELECT USING (
    message_id IN (
      SELECT id FROM public.direct_messages
      WHERE chat_id IN (
        SELECT chat_id FROM public.direct_chat_participants 
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can add reactions" ON public.direct_message_reactions
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    message_id IN (
      SELECT id FROM public.direct_messages
      WHERE chat_id IN (
        SELECT chat_id FROM public.direct_chat_participants 
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can remove their own reactions" ON public.direct_message_reactions
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_direct_chat_participants_user_id ON public.direct_chat_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_direct_chat_participants_chat_id ON public.direct_chat_participants(chat_id);
CREATE INDEX IF NOT EXISTS idx_direct_messages_chat_id ON public.direct_messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_direct_messages_created_at ON public.direct_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_direct_message_reactions_message_id ON public.direct_message_reactions(message_id);

-- Function to get unread message count
CREATE OR REPLACE FUNCTION public.get_unread_message_count(chat_id_param uuid, user_id_param uuid)
RETURNS integer
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT COUNT(*)::integer
  FROM public.direct_messages dm
  LEFT JOIN public.direct_chat_participants dcp ON dcp.chat_id = dm.chat_id AND dcp.user_id = user_id_param
  WHERE dm.chat_id = chat_id_param 
    AND dm.user_id != user_id_param
    AND dm.created_at > COALESCE(dcp.last_read_at, '1970-01-01'::timestamp with time zone);
$function$;