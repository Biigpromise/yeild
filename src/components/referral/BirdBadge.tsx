
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
      return <Flame className={`${iconSize} text-orange-500 animate-pulse hover:animate-spin`} />;
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
      return 'bg-blue-100 text-blue-700 border-blue-300 shadow-md hover:shadow-blue-300 hover:shadow-xl';
    case 'falcon':
      return 'bg-purple-100 text-purple-700 border-purple-300 shadow-md hover:shadow-purple-300 hover:shadow-xl';
    case 'phoenix':
      return 'bg-gradient-to-r from-red-100 via-orange-100 to-yellow-100 text-red-700 border-red-300 shadow-lg shadow-orange-200 hover:shadow-orange-400 hover:shadow-2xl';
    default:
      return 'bg-gray-100 text-gray-500';
  }
};

const getAnimationClasses = (iconName: string) => {
  switch (iconName) {
    case 'dove':
      return 'hover:scale-105 transition-all duration-200';
    case 'hawk':
      return 'hover:scale-105 transition-all duration-200';
    case 'eagle':
      return 'hover:scale-110 hover:-rotate-3 transition-all duration-300 hover:animate-bounce';
    case 'falcon':
      return 'hover:scale-125 hover:rotate-6 transition-all duration-200 hover:animate-pulse';
    case 'phoenix':
      return 'hover:scale-110 transition-all duration-300 relative animate-pulse hover:animate-none';
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
  const animationClass = getAnimationClasses(birdLevel.icon);
  
  return (
    <div className="relative">
      {/* Phoenix Special Glow Effect */}
      {birdLevel.icon === 'phoenix' && (
        <>
          <div className="absolute -inset-1 bg-gradient-to-r from-orange-600 to-red-600 rounded-full blur opacity-50 animate-pulse" />
          <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-400 to-red-400 rounded-full blur-sm opacity-30 animate-pulse" />
        </>
      )}
      
      <Badge 
        variant="outline" 
        className={`
          ${colorClass} 
          ${animationClass}
          ${className}
          flex items-center gap-1 font-medium relative z-10 cursor-pointer
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
