
import React from 'react';
import { ReferralBirdLevel } from '@/services/userService';
import { EnhancedBirdBadge } from './EnhancedBirdBadge';

interface BirdBadgeProps {
  birdLevel?: ReferralBirdLevel | null;
  userId?: string;
  activeReferrals?: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showName?: boolean;
  showTooltip?: boolean;
  className?: string;
}

export const BirdBadge: React.FC<BirdBadgeProps> = ({ 
  birdLevel,
  userId,
  activeReferrals = 0,
  size = 'md', 
  showName = false,
  showTooltip = true,
  className = ''
}) => {
  // If userId is provided, use the new enhanced system
  if (userId) {
    return (
      <EnhancedBirdBadge 
        userId={userId}
        size={size}
        showName={showName}
        showTooltip={showTooltip}
        className={className}
      />
    );
  }

  // Legacy support for old birdLevel prop system
  if (!birdLevel) {
    return (
      <div className="w-6 h-6 rounded-full bg-muted animate-pulse" />
    );
  }

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div 
        className={`rounded-full flex items-center justify-center ${sizeClasses[size]}`}
        style={{ 
          backgroundColor: birdLevel.color + '20',
          border: `2px solid ${birdLevel.color}`,
          color: birdLevel.color
        }}
      >
        <span className="text-xs">{birdLevel.icon}</span>
      </div>
      {showName && (
        <span className="font-medium text-sm" style={{ color: birdLevel.color }}>
          {birdLevel.name}
        </span>
      )}
    </div>
  );
};
