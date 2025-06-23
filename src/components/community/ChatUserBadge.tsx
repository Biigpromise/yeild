
import React from 'react';
import { ProfileBirdBadge } from '@/components/referral/ProfileBirdBadge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface ChatUserBadgeProps {
  userId: string;
  userName: string;
  userAvatar?: string;
  userTasksCompleted?: number;
  size?: 'sm' | 'md' | 'lg';
  showBirdBadge?: boolean;
}

export const ChatUserBadge: React.FC<ChatUserBadgeProps> = ({
  userId,
  userName,
  userAvatar,
  userTasksCompleted = 0,
  size = 'sm',
  showBirdBadge = true
}) => {
  const avatarSize = size === 'sm' ? 'h-6 w-6' : size === 'md' ? 'h-8 w-8' : 'h-10 w-10';
  
  console.log('ChatUserBadge rendering:', { userId, userName, userAvatar, showBirdBadge });
  
  return (
    <div className="flex items-center space-x-2">
      <div className="relative">
        <Avatar className={avatarSize}>
          <AvatarImage src={userAvatar} alt={userName} />
          <AvatarFallback className="text-xs">
            {userName?.charAt(0)?.toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
        {showBirdBadge && userId && (
          <div className="absolute -top-1 -right-1">
            <ProfileBirdBadge userId={userId} size="sm" />
          </div>
        )}
      </div>
    </div>
  );
};
