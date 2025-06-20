
export type Profile = {
  id: string;
  name: string | null;
  profile_picture_url?: string | null;
};

export type PostLike = {
  user_id: string;
};

export type PostReply = {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profile: Profile | null;
};

export type Post = {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  profile: Profile | null;
  view_count: number;
  likes_count: number;
  reply_count: number;
  post_likes: PostLike[];
  post_replies?: PostReply[];
};
