
export type Profile = {
  id: string;
  name: string | null;
  profile_picture_url?: string | null;
};

export type PostLike = {
  user_id: string;
};

export type Post = {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  profile: Profile | null;
  view_count: number;
  likes_count: number;
  post_likes: PostLike[];
};
