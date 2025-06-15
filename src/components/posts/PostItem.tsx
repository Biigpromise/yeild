
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PostActions } from './PostActions';
import { Post } from '@/types/post';

interface PostItemProps {
  post: Post;
  userId: string | null;
  handleLikePost: (post: Post) => void;
  openProfile: (userId: string | null) => void;
}

export const PostItem = React.forwardRef<HTMLDivElement, PostItemProps>(
  ({ post, userId, handleLikePost, openProfile }, ref) => {
    return (
      <div
        ref={ref}
        data-post-id={post.id}
        className="border-b pb-4 last:border-b-0 flex gap-3"
      >
        <button
          type="button"
          className="outline-none focus:ring-2 rounded-full"
          onClick={() => openProfile(post.user_id)}
          tabIndex={0}
          aria-label={`View profile of ${post.profile?.name ?? "User"}`}
        >
          <Avatar className="h-10 w-10 hover:scale-105 transition">
            <AvatarImage
              src={
                post.profile?.profile_picture_url ||
                `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(post.profile?.name || 'U')}`
              }
              alt={post.profile?.name || ""}
            />
            <AvatarFallback>
              {(post.profile?.name || "U").charAt(0)}
            </AvatarFallback>
          </Avatar>
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex gap-3 items-center">
            <button
              type="button"
              className="text-sm font-semibold hover:underline hover:text-primary focus:outline-none"
              style={{ textAlign: "left" }}
              onClick={() => openProfile(post.user_id)}
            >
              {post.profile?.name || "Anonymous"}
            </button>
            <span className="text-xs opacity-50">
              {new Date(post.created_at).toLocaleString([], {
                year: "2-digit",
                month: "short",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
          <div className="mt-1 text-base break-words whitespace-pre-line">
            {post.content}
          </div>
          <PostActions post={post} userId={userId} handleLikePost={handleLikePost} />
        </div>
      </div>
    );
  }
);
PostItem.displayName = 'PostItem';
