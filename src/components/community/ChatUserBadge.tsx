
import React from 'react';
import { ProfileBirdBadge } from '@/components/referral/ProfileBirdBadge';

interface ChatUserBadgeProps {
  userId: string;
  userName: string;
  className?: string;
}

export const ChatUserBadge: React.FC<ChatUserBadgeProps> = ({
  userId,
  userName,
  className = ''
}) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="font-medium text-sm">{userName}</span>
      <ProfileBirdBadge userId={userId} size="sm" />
    </div>
  );
};
