-- Add chat_id and message_context to messages table
ALTER TABLE public.messages 
ADD COLUMN chat_id UUID NULL,
ADD COLUMN message_context TEXT DEFAULT 'community' CHECK (message_context IN ('community', 'private', 'group'));

-- Create chats table for private conversations
CREATE TABLE public.chats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT,
  is_group_chat BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_message_at TIMESTAMP WITH TIME ZONE,
  last_message TEXT
);

-- Create chat_participants table
CREATE TABLE public.chat_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_id UUID NOT NULL REFERENCES public.chats(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_read_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(chat_id, user_id)
);

-- Enable RLS on new tables
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_participants ENABLE ROW LEVEL SECURITY;

-- RLS Policies for chats
CREATE POLICY "Users can view chats they participate in" 
ON public.chats FOR SELECT 
USING (
  id IN (
    SELECT chat_id FROM public.chat_participants 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can create chats" 
ON public.chats FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Chat creators can update their chats" 
ON public.chats FOR UPDATE 
USING (auth.uid() = created_by);

-- RLS Policies for chat_participants
CREATE POLICY "Users can view participants of their chats" 
ON public.chat_participants FOR SELECT 
USING (
  chat_id IN (
    SELECT chat_id FROM public.chat_participants 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can join chats" 
ON public.chat_participants FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave their chats" 
ON public.chat_participants FOR DELETE 
USING (auth.uid() = user_id);

-- Update messages RLS policies to handle chat_id
DROP POLICY IF EXISTS "Users can view messages in their chats or community messages" ON public.messages;
CREATE POLICY "Users can view messages in their chats or community messages" 
ON public.messages FOR SELECT 
USING (
  chat_id IS NULL OR -- Community messages
  chat_id IN (
    SELECT chat_id FROM public.chat_participants 
    WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can create messages in community or their chats" ON public.messages;
CREATE POLICY "Users can create messages in community or their chats" 
ON public.messages FOR INSERT 
WITH CHECK (
  auth.uid() = user_id AND (
    chat_id IS NULL OR -- Community messages
    chat_id IN (
      SELECT chat_id FROM public.chat_participants 
      WHERE user_id = auth.uid()
    )
  )
);

-- Add index for better performance
CREATE INDEX idx_messages_chat_id ON public.messages(chat_id);
CREATE INDEX idx_messages_context ON public.messages(message_context);
CREATE INDEX idx_chat_participants_user_id ON public.chat_participants(user_id);
CREATE INDEX idx_chat_participants_chat_id ON public.chat_participants(chat_id);

-- Set all existing messages as community messages
UPDATE public.messages SET 
  chat_id = NULL, 
  message_context = 'community' 
WHERE chat_id IS NULL;

-- Add comment to clarify the structure
COMMENT ON COLUMN public.messages.chat_id IS 'NULL for community messages, UUID for private/group chats';
COMMENT ON COLUMN public.messages.message_context IS 'Distinguishes between community, private, and group messages';