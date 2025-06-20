
export interface Post {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
  likes_count: number;
  view_count: number;
  reply_count?: number;
  media_url?: string;
  profiles?: {
    id: string;
    name: string;
    profile_picture_url?: string;
  };
  post_likes?: {
    user_id: string;
  }[];
}

export interface PostReply {
  id: string;
  content: string;
  user_id: string;
  post_id: string;
  created_at: string;
  likes_count: number;
  profiles?: {
    id: string;
    name: string;
    profile_picture_url?: string;
  };
  reply_likes?: {
    user_id: string;
  }[];
}
