-- Create chats table
CREATE TABLE public.chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  is_group BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create chat_participants table
CREATE TABLE public.chat_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID REFERENCES public.chats(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_admin BOOLEAN DEFAULT false,
  UNIQUE(chat_id, user_id)
);

-- Create chat_messages table
CREATE TABLE public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID REFERENCES public.chats(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'audio', 'video')),
  media_url TEXT,
  reply_to_id UUID REFERENCES public.chat_messages(id) ON DELETE SET NULL,
  reply_content TEXT,
  reply_sender_name TEXT,
  is_edited BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create message_reactions table
CREATE TABLE public.message_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID REFERENCES public.chat_messages(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  emoji TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(message_id, user_id, emoji)
);

-- Create user_online_status table
CREATE TABLE public.user_online_status (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  is_online BOOLEAN DEFAULT false,
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_online_status ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for chats
CREATE POLICY "Users can view chats they participate in"
ON public.chats FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.chat_participants 
    WHERE chat_participants.chat_id = chats.id 
    AND chat_participants.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create chats"
ON public.chats FOR INSERT
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Chat admins can update chats"
ON public.chats FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.chat_participants 
    WHERE chat_participants.chat_id = chats.id 
    AND chat_participants.user_id = auth.uid()
    AND chat_participants.is_admin = true
  )
);

-- Create RLS policies for chat_participants
CREATE POLICY "Users can view participants of chats they're in"
ON public.chat_participants FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.chat_participants cp2
    WHERE cp2.chat_id = chat_participants.chat_id 
    AND cp2.user_id = auth.uid()
  )
);

CREATE POLICY "Chat admins can manage participants"
ON public.chat_participants FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.chat_participants cp2
    WHERE cp2.chat_id = chat_participants.chat_id 
    AND cp2.user_id = auth.uid()
    AND cp2.is_admin = true
  )
);

-- Create RLS policies for chat_messages
CREATE POLICY "Users can view messages in chats they participate in"
ON public.chat_messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.chat_participants 
    WHERE chat_participants.chat_id = chat_messages.chat_id 
    AND chat_participants.user_id = auth.uid()
  )
);

CREATE POLICY "Users can send messages to chats they participate in"
ON public.chat_messages FOR INSERT
WITH CHECK (
  auth.uid() = sender_id AND
  EXISTS (
    SELECT 1 FROM public.chat_participants 
    WHERE chat_participants.chat_id = chat_messages.chat_id 
    AND chat_participants.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own messages"
ON public.chat_messages FOR UPDATE
USING (auth.uid() = sender_id);

CREATE POLICY "Users can delete their own messages"
ON public.chat_messages FOR DELETE
USING (auth.uid() = sender_id);

-- Create RLS policies for message_reactions
CREATE POLICY "Users can view reactions in accessible chats"
ON public.message_reactions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.chat_messages cm
    JOIN public.chat_participants cp ON cm.chat_id = cp.chat_id
    WHERE cm.id = message_reactions.message_id 
    AND cp.user_id = auth.uid()
  )
);

CREATE POLICY "Users can manage their own reactions"
ON public.message_reactions FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for user_online_status
CREATE POLICY "Users can view all online statuses"
ON public.user_online_status FOR SELECT
USING (true);

CREATE POLICY "Users can update their own status"
ON public.user_online_status FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_chat_participants_chat_id ON public.chat_participants(chat_id);
CREATE INDEX idx_chat_participants_user_id ON public.chat_participants(user_id);
CREATE INDEX idx_chat_messages_chat_id ON public.chat_messages(chat_id);
CREATE INDEX idx_chat_messages_created_at ON public.chat_messages(created_at);
CREATE INDEX idx_message_reactions_message_id ON public.message_reactions(message_id);

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_chats_updated_at BEFORE UPDATE ON public.chats FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_chat_messages_updated_at BEFORE UPDATE ON public.chat_messages FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_user_online_status_updated_at BEFORE UPDATE ON public.user_online_status FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();