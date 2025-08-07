export interface MessageProfile {
  name: string;
  profile_picture_url?: string;
  is_anonymous?: boolean;
}

export interface MessageReaction {
  id: string;
  emoji: string;
  user_id: string;
  created_at: string;
}

export interface MessageMention {
  id: string;
  mentioned_user_id: string;
  is_read: boolean;
  created_at: string;
}

export interface BaseMessage {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
  updated_at?: string;
  media_url?: string;
  likes_count?: number;
  views_count?: number;
  reply_count?: number;
  message_type: 'text' | 'image' | 'voice' | 'file';
  is_edited?: boolean;
  edit_count?: number;
  last_edited_at?: string;
  parent_message_id?: string;
  voice_duration?: number;
  voice_transcript?: string;
  chat_id?: string | null;
  profiles: MessageProfile | null;
  reactions?: MessageReaction[];
  mentions?: MessageMention[];
}

export interface EnhancedMessage extends BaseMessage {
  replies?: Array<{
    id: string;
    content: string;
    user_id: string;
    created_at: string;
    updated_at?: string;
    media_url?: string;
    message_type: 'text' | 'image' | 'voice' | 'file';
    profiles: MessageProfile | null;
  }>;
}

export interface TypingUser {
  user_id: string;
  name: string;
  avatar?: string;
}

export interface UserPresence {
  id: string;
  user_id: string;
  status: string;
  custom_status?: string;
  is_online: boolean;
  last_seen_at: string;
  updated_at: string;
}