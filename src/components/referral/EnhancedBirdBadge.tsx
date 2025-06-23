
import React from 'react';
import { ReferralBirdLevel, userService } from '@/services/userService';
import { AnimatedPhoenixBadge } from './AnimatedPhoenixBadge';
import { Badge } from '@/components/ui/badge';
import { Bird, Crown, Zap, Star, Feather } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EnhancedBirdBadgeProps {
  birdLevel?: ReferralBirdLevel | null;
  activeReferrals: number;
  userPoints?: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showName?: boolean;
  className?: string;
  showAnimation?: boolean;
}

const getEnhancedBirdIcon = (iconName: string, size: string, isAnimated: boolean = false) => {
  const iconSize = size === 'sm' ? 'h-3 w-3' : 
                   size === 'md' ? 'h-4 w-4' : 
                   size === 'lg' ? 'h-5 w-5' : 'h-6 w-6';
  
  const baseAnimationClass = isAnimated ? 'transition-all duration-300' : '';
  
  switch (iconName) {
    case 'dove':
      return <Bird className={`${iconSize} ${baseAnimationClass}`} />;
    case 'hawk':
      return <Feather className={`${iconSize} ${baseAnimationClass}`} />;
    case 'eagle':
      return (
        <div className="relative">
          <Crown className={cn(
            iconSize,
            baseAnimationClass,
            'hover:text-blue-400',
            isAnimated && 'hover:animate-pulse hover:drop-shadow-lg'
          )} />
          <Star className="absolute -top-1 -right-1 h-2 w-2 text-blue-400 opacity-70" />
          {/* Eagle Glow Effect */}
          {isAnimated && (
            <div className="absolute inset-0 bg-blue-400/20 rounded-full animate-ping opacity-0 hover:opacity-100 transition-opacity duration-300" />
          )}
        </div>
      );
    case 'falcon':
      return (
        <div className="relative">
          <Zap className={cn(
            iconSize,
            baseAnimationClass,
            'hover:text-purple-400',
            isAnimated && 'hover:animate-bounce hover:drop-shadow-lg'
          )} />
          {/* Falcon Flame Trail Effect */}
          {isAnimated && (
            <>
              <div className="absolute -inset-1 bg-purple-400/30 rounded-full animate-pulse opacity-50" />
              <div className="absolute -top-2 -left-2 w-1 h-1 bg-purple-400 rounded-full animate-ping" style={{ animationDelay: '0.2s' }} />
              <div className="absolute -bottom-2 -right-2 w-1 h-1 bg-purple-400 rounded-full animate-ping" style={{ animationDelay: '0.4s' }} />
            </>
          )}
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
    eagle: `bg-blue-100 text-blue-700 border-blue-300 shadow-md ${isAnimated ? 'hover:shadow-blue-400/50 hover:border-blue-400' : ''}`,
    falcon: `bg-purple-100 text-purple-700 border-purple-300 shadow-md ${isAnimated ? 'hover:shadow-purple-400/50 hover:border-purple-400' : ''}`,
    phoenix: 'bg-gradient-to-r from-red-100 via-orange-100 to-yellow-100 text-red-700 border-red-300 shadow-lg shadow-orange-200'
  };

  return baseColors[iconName as keyof typeof baseColors] || baseColors.dove;
};

const getEnhancedAnimationClasses = (iconName: string, isAnimated: boolean = false) => {
  if (!isAnimated) return 'hover:scale-105 transition-all duration-200';
  
  switch (iconName) {
    case 'eagle':
      return 'hover:scale-110 hover:-rotate-2 transition-all duration-300 hover:shadow-lg hover:shadow-blue-400/30';
    case 'falcon':
      return 'hover:scale-125 hover:rotate-3 transition-all duration-300 hover:shadow-lg hover:shadow-purple-400/50 hover:animate-pulse';
    case 'phoenix':
      return 'hover:scale-110 transition-all duration-300 relative animate-pulse hover:animate-none';
    default:
      return 'hover:scale-105 transition-all duration-200';
  }
};

export const EnhancedBirdBadge: React.FC<EnhancedBirdBadgeProps> = ({ 
  birdLevel, 
  activeReferrals,
  userPoints = 0,
  size = 'md', 
  showName = false,
  className = '',
  showAnimation = true
}) => {
  // Calculate the correct bird level if not provided
  const actualBirdLevel = birdLevel || userService.getBirdLevel(activeReferrals, userPoints);
  
  console.log('EnhancedBirdBadge rendering:', {
    activeReferrals,
    userPoints,
    birdLevel: actualBirdLevel.name,
    showName
  });

  if (!actualBirdLevel || actualBirdLevel.name === 'None') {
    return null;
  }

  // Phoenix gets special treatment with full animation
  if (actualBirdLevel.icon === 'phoenix') {
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
    actualBirdLevel.icon === 'eagle' || 
    actualBirdLevel.icon === 'falcon'
  );

  const icon = getEnhancedBirdIcon(actualBirdLevel.icon, size, shouldAnimate);
  const colorClass = getEnhancedBirdColor(actualBirdLevel.icon, shouldAnimate);
  const animationClass = getEnhancedAnimationClasses(actualBirdLevel.icon, shouldAnimate);
  
  const badgeSize = size === 'sm' ? 'text-xs px-1.5 py-0.5' : 
                    size === 'lg' ? 'text-sm px-3 py-1' : 
                    size === 'xl' ? 'text-base px-4 py-2' : 'text-xs px-2 py-1';
  
  return (
    <div className="relative group">
      {/* Special effects for Eagle and Falcon */}
      {shouldAnimate && actualBirdLevel.icon === 'falcon' && (
        <>
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full blur opacity-20 group-hover:opacity-40 animate-pulse transition-opacity duration-300" />
          <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-full blur-sm opacity-15 group-hover:opacity-30 animate-pulse transition-opacity duration-300" />
        </>
      )}
      
      {shouldAnimate && actualBirdLevel.icon === 'eagle' && (
        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full blur-sm opacity-20 group-hover:opacity-35 animate-pulse transition-opacity duration-300" />
      )}
      
      <Badge 
        variant="outline" 
        className={cn(
          colorClass,
          animationClass,
          badgeSize,
          className,
          'flex items-center gap-1 font-medium relative z-10 cursor-pointer',
          shouldAnimate && 'ring-2 ring-opacity-0 hover:ring-opacity-50 transition-all duration-300',
          actualBirdLevel.icon === 'eagle' && 'hover:ring-blue-400',
          actualBirdLevel.icon === 'falcon' && 'hover:ring-purple-400'
        )}
        title={`${actualBirdLevel.description} - ${activeReferrals} active referrals, ${userPoints} points`}
      >
        {icon}
        {showName && (
          <span className={cn(
            'ml-1 font-semibold',
            shouldAnimate && 'group-hover:animate-pulse'
          )}>
            {actualBirdLevel.name}
          </span>
        )}
        
        {/* Referral count for higher levels */}
        {(actualBirdLevel.icon === 'eagle' || actualBirdLevel.icon === 'falcon') && size !== 'sm' && (
          <span className="ml-1 text-xs opacity-75">
            {activeReferrals}
          </span>
        )}
      </Badge>
    </div>
  );
};
