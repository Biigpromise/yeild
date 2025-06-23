
import React from 'react';
import { ProfileBirdBadge } from './ProfileBirdBadge';

interface UserNameWithBirdProps {
  userId: string;
  userName: string;
  showBirdBadge?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const UserNameWithBird: React.FC<UserNameWithBirdProps> = ({
  userId,
  userName,
  showBirdBadge = true,
  className = '',
  size = 'sm'
}) => {
  console.log('UserNameWithBird props:', { userId, userName, showBirdBadge, size });
  
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="font-medium">{userName}</span>
      {showBirdBadge && userId && (
        <ProfileBirdBadge userId={userId} size={size} />
      )}
    </div>
  );
};
