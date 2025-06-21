
import React from 'react';
import { ReferralBirdLevel } from '@/services/userService';
import { BirdBadge } from './BirdBadge';
import { AnimatedPhoenixBadge } from './AnimatedPhoenixBadge';
import { Badge } from '@/components/ui/badge';
import { Bird, Crown, Zap, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EnhancedBirdBadgeProps {
  birdLevel: ReferralBirdLevel | null;
  activeReferrals: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showName?: boolean;
  className?: string;
  showAnimation?: boolean;
}

const getEnhancedBirdIcon = (iconName: string, size: string, isAnimated: boolean = false) => {
  const iconSize = size === 'sm' ? 'h-3 w-3' : 
                   size === 'md' ? 'h-4 w-4' : 
                   size === 'lg' ? 'h-5 w-5' : 'h-6 w-6';
  
  const animationClass = isAnimated ? 'hover:animate-bounce' : '';
  
  switch (iconName) {
    case 'dove':
      return <Bird className={`${iconSize} ${animationClass}`} />;
    case 'hawk':
      return <Bird className={`${iconSize} ${animationClass}`} />;
    case 'eagle':
      return (
        <div className="relative">
          <Crown className={`${iconSize} ${animationClass} hover:text-blue-400`} />
          <Star className="absolute -top-1 -right-1 h-2 w-2 text-blue-400 opacity-70 hover:animate-pulse" />
        </div>
      );
    case 'falcon':
      return (
        <div className="relative">
          <Zap className={`${iconSize} ${animationClass} hover:text-purple-400 hover:animate-pulse`} />
          <div className="absolute -inset-1 bg-purple-400/20 rounded-full animate-pulse opacity-50" />
        </div>
      );
    case 'phoenix':
      return null; // Phoenix uses its own component
    default:
      return <Bird className={iconSize} />;
  }
};

const getEnhancedBirdColor = (iconName: string, isAnimated: boolean = false) => {
  const baseColors = {
    dove: 'bg-gray-100 text-gray-700 border-gray-300',
    hawk: 'bg-amber-100 text-amber-700 border-amber-300',
    eagle: 'bg-blue-100 text-blue-700 border-blue-300 shadow-md hover:shadow-blue-300',
    falcon: 'bg-purple-100 text-purple-700 border-purple-300 shadow-md hover:shadow-purple-300',
    phoenix: 'bg-gradient-to-r from-red-100 via-orange-100 to-yellow-100 text-red-700 border-red-300 shadow-lg shadow-orange-200'
  };

  return baseColors[iconName as keyof typeof baseColors] || baseColors.dove;
};

const getEnhancedAnimationClasses = (iconName: string, isAnimated: boolean = false) => {
  if (!isAnimated) return 'hover:scale-105 transition-all duration-200';
  
  switch (iconName) {
    case 'eagle':
      return 'hover:scale-110 hover:-rotate-3 transition-all duration-300 hover:shadow-lg';
    case 'falcon':
      return 'hover:scale-125 hover:rotate-6 transition-all duration-200 hover:shadow-purple-400/50';
    case 'phoenix':
      return 'hover:scale-110 transition-all duration-300 relative animate-pulse hover:animate-none';
    default:
      return 'hover:scale-105 transition-all duration-200';
  }
};

export const EnhancedBirdBadge: React.FC<EnhancedBirdBadgeProps> = ({ 
  birdLevel, 
  activeReferrals,
  size = 'md', 
  showName = false,
  className = '',
  showAnimation = true
}) => {
  if (!birdLevel || birdLevel.name === 'None') {
    return null;
  }

  // Phoenix gets special treatment with full animation
  if (birdLevel.icon === 'phoenix') {
    return (
      <AnimatedPhoenixBadge 
        size={size}
        showName={showName}
        className={className}
        referralCount={activeReferrals}
        isIdle={true}
      />
    );
  }

  // Determine if this bird level should have animations
  const shouldAnimate = showAnimation && (
    birdLevel.icon === 'eagle' || 
    birdLevel.icon === 'falcon'
  );

  const icon = getEnhancedBirdIcon(birdLevel.icon, size, shouldAnimate);
  const colorClass = getEnhancedBirdColor(birdLevel.icon, shouldAnimate);
  const animationClass = getEnhancedAnimationClasses(birdLevel.icon, shouldAnimate);
  
  const badgeSize = size === 'sm' ? 'text-xs px-1.5 py-0.5' : 
                    size === 'lg' ? 'text-sm px-3 py-1' : 
                    size === 'xl' ? 'text-base px-4 py-2' : 'text-xs px-2 py-1';
  
  return (
    <div className="relative">
      {/* Special effects for Eagle and Falcon */}
      {shouldAnimate && birdLevel.icon === 'falcon' && (
        <>
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full blur opacity-30 animate-pulse" />
          <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-full blur-sm opacity-20 animate-pulse" />
        </>
      )}
      
      {shouldAnimate && birdLevel.icon === 'eagle' && (
        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full blur-sm opacity-25 animate-pulse" />
      )}
      
      <Badge 
        variant="outline" 
        className={cn(
          colorClass,
          animationClass,
          badgeSize,
          className,
          'flex items-center gap-1 font-medium relative z-10 cursor-pointer',
          shouldAnimate && 'ring-2 ring-opacity-0 hover:ring-opacity-50',
          birdLevel.icon === 'eagle' && 'hover:ring-blue-400',
          birdLevel.icon === 'falcon' && 'hover:ring-purple-400'
        )}
        title={`${birdLevel.description} - ${activeReferrals} active referrals`}
      >
        {icon}
        {showName && (
          <span className={cn(
            'ml-1 font-semibold',
            shouldAnimate && 'group-hover:animate-pulse'
          )}>
            {birdLevel.name}
          </span>
        )}
        
        {/* Referral count for higher levels */}
        {(birdLevel.icon === 'eagle' || birdLevel.icon === 'falcon') && size !== 'sm' && (
          <span className="ml-1 text-xs opacity-75">
            {activeReferrals}
          </span>
        )}
      </Badge>
    </div>
  );
};
