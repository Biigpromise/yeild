
import React from 'react';
import { ReferralBirdLevel } from '@/services/userService';
import { Badge } from '@/components/ui/badge';
import { Bird, Zap, Crown, Star, Flame } from 'lucide-react';

interface BirdBadgeProps {
  birdLevel: ReferralBirdLevel | null;
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
  className?: string;
}

const getBirdIcon = (iconName: string, size: string) => {
  const iconSize = size === 'sm' ? 'h-4 w-4' : size === 'md' ? 'h-6 w-6' : 'h-8 w-8';
  
  switch (iconName) {
    case 'dove':
      return <Bird className={iconSize} />;
    case 'hawk':
      return <Bird className={iconSize} />;
    case 'eagle':
      return <Crown className={`${iconSize} hover:animate-bounce`} />;
    case 'falcon':
      return <Zap className={`${iconSize} hover:animate-pulse`} />;
    case 'phoenix':
      return <Flame className={`${iconSize} animate-pulse hover:animate-spin text-orange-500`} />;
    default:
      return null;
  }
};

const getBirdColor = (iconName: string) => {
  switch (iconName) {
    case 'dove':
      return 'bg-gray-100 text-gray-700 border-gray-300';
    case 'hawk':
      return 'bg-amber-100 text-amber-700 border-amber-300';
    case 'eagle':
      return 'bg-blue-100 text-blue-700 border-blue-300 hover:shadow-blue-300 hover:shadow-lg';
    case 'falcon':
      return 'bg-purple-100 text-purple-700 border-purple-300 hover:shadow-purple-300 hover:shadow-lg';
    case 'phoenix':
      return 'bg-gradient-to-r from-red-100 via-orange-100 to-yellow-100 text-red-700 border-red-300 shadow-orange-200 shadow-lg hover:shadow-orange-400 hover:shadow-xl';
    default:
      return 'bg-gray-100 text-gray-500';
  }
};

const getAnimationClasses = (iconName: string, animated: boolean) => {
  if (!animated) return '';
  
  switch (iconName) {
    case 'eagle':
      return 'hover:scale-110 hover:-rotate-3 transition-all duration-300';
    case 'falcon':
      return 'hover:scale-125 hover:rotate-6 transition-all duration-200';
    case 'phoenix':
      return 'hover:scale-110 transition-all duration-300 animate-pulse hover:animate-none relative before:absolute before:inset-0 before:bg-gradient-to-r before:from-orange-400 before:to-red-400 before:opacity-0 hover:before:opacity-20 before:rounded-full before:blur-lg before:transition-opacity before:duration-300';
    default:
      return 'hover:scale-105 transition-all duration-300';
  }
};

export const BirdBadge: React.FC<BirdBadgeProps> = ({ 
  birdLevel, 
  size = 'md', 
  showName = false,
  className = ''
}) => {
  if (!birdLevel || birdLevel.name === 'None') {
    return null;
  }

  const icon = getBirdIcon(birdLevel.icon, size);
  const colorClass = getBirdColor(birdLevel.icon);
  const animationClass = getAnimationClasses(birdLevel.icon, birdLevel.animated);
  
  const phoenixGlow = birdLevel.icon === 'phoenix' 
    ? 'relative overflow-visible' 
    : '';

  return (
    <div className={`relative ${phoenixGlow}`}>
      {birdLevel.icon === 'phoenix' && (
        <>
          <div className="absolute inset-0 bg-gradient-to-r from-orange-400 via-red-400 to-yellow-400 rounded-full blur-md opacity-50 animate-pulse scale-110" />
          <div className="absolute inset-0 bg-gradient-to-r from-red-300 to-orange-300 rounded-full blur-sm opacity-30 animate-pulse scale-125" />
        </>
      )}
      <Badge 
        variant="outline" 
        className={`
          ${colorClass} 
          ${animationClass}
          ${className}
          flex items-center gap-1 font-medium relative z-10
        `}
        title={birdLevel.description}
      >
        {icon}
        {showName && (
          <span className="ml-1 text-xs font-semibold">
            {birdLevel.name}
          </span>
        )}
      </Badge>
    </div>
  );
};
