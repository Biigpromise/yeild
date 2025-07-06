
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';
import { Post } from '@/types/post';
import { useUserDisplay } from '@/utils/userDisplayUtils';

interface PostHeaderProps {
  post: Post & {
    profiles?: {
      id?: string;
      name?: string;
      profile_picture_url?: string;
      is_anonymous?: boolean;
    } | null;
  };
  userId: string | null;
  onProfileClick: () => void;
  onDeletePost?: () => void;
}

export const PostHeader: React.FC<PostHeaderProps> = ({
  post,
  userId,
  onProfileClick,
  onDeletePost
}) => {
  const { getDisplayName, getAvatarFallback } = useUserDisplay();
  
  // Convert profiles to UserProfile format
  const userProfile = post.profiles ? {
    id: post.profiles.id || post.user_id,
    name: post.profiles.name,
    profile_picture_url: post.profiles.profile_picture_url,
    is_anonymous: post.profiles.is_anonymous
  } : null;
  
  const displayName = getDisplayName(userProfile);
  const avatarFallback = getAvatarFallback(userProfile);

  console.log('PostHeader rendering:', {
    postId: post.id,
    profiles: post.profiles,
    displayName,
    userId: post.user_id,
    isAnonymous: post.profiles?.is_anonymous
  });

  return (
    <div className="flex items-center gap-2 mb-1 justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onProfileClick}
          className="focus:outline-none focus:ring-2 focus:ring-primary rounded-full"
        >
          <Avatar className="h-10 w-10 hover:scale-105 transition-transform cursor-pointer">
            <AvatarImage src={userProfile?.profile_picture_url || undefined} />
            <AvatarFallback>{avatarFallback}</AvatarFallback>
          </Avatar>
        </button>
        
        <div className="flex items-center gap-2">
          <button
            onClick={onProfileClick}
            className="font-semibold text-sm hover:underline focus:outline-none focus:underline truncate"
          >
            {displayName}
          </button>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
          </span>
        </div>
      </div>
      
      {userId === post.user_id && onDeletePost && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onDeletePost}
          className="p-1 h-auto text-red-500 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};
