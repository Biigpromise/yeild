import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Crown, Zap, Gem, Flame, Bird } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BirdLevel {
  id: number;
  name: string;
  icon: string;
  emoji: string;
  min_referrals: number;
  min_points: number;
  description: string;
  color: string;
  benefits: string[];
  animation_type: string;
  glow_effect: boolean;
}

interface NextBirdLevel extends BirdLevel {
  referrals_needed: number;
  points_needed: number;
}

interface EnhancedBirdBadgeProps {
  userId: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showName?: boolean;
  showTooltip?: boolean;
  className?: string;
}

const iconMap = {
  dove: Bird,
  bird: Bird,
  zap: Zap,
  crown: Crown,
  gem: Gem,
  flame: Flame,
};

export const EnhancedBirdBadge: React.FC<EnhancedBirdBadgeProps> = ({
  userId,
  size = 'md',
  showName = false,
  showTooltip = true,
  className = ''
}) => {
  const [birdLevel, setBirdLevel] = useState<BirdLevel | null>(null);
  const [nextLevel, setNextLevel] = useState<NextBirdLevel | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBirdLevel();
  }, [userId]);

  const loadBirdLevel = async () => {
    try {
      // Get current bird level
      const { data: currentLevel, error: currentError } = await supabase
        .rpc('get_user_bird_level', { user_id_param: userId });

      if (currentError) throw currentError;

      if (currentLevel && currentLevel.length > 0) {
        setBirdLevel(currentLevel[0]);
      }

      // Get next bird level
      const { data: nextLevelData, error: nextError } = await supabase
        .rpc('get_next_bird_level', { user_id_param: userId });

      if (nextError) throw nextError;

      if (nextLevelData && nextLevelData.length > 0) {
        const nextData = nextLevelData[0] as any;
        setNextLevel({
          ...nextData,
          benefits: nextData.benefits || [],
          animation_type: nextData.animation_type || 'static',
          glow_effect: nextData.glow_effect || false
        });
      }
    } catch (error) {
      console.error('Error loading bird level:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !birdLevel) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <div className="animate-pulse bg-muted rounded-full w-6 h-6" />
        {showName && <div className="animate-pulse bg-muted h-4 w-16 rounded" />}
      </div>
    );
  }

  const IconComponent = iconMap[birdLevel.icon as keyof typeof iconMap] || Bird;

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg'
  };

  const getAnimationClasses = () => {
    switch (birdLevel.animation_type) {
      case 'wing-flap':
        return 'animate-pulse hover:animate-bounce';
      case 'hover-motion':
        return 'hover:scale-110 transition-transform duration-300';
      case 'full-animation':
        return 'animate-pulse hover:animate-spin transition-all duration-500 hover:shadow-lg hover:shadow-pink-500/50';
      default:
        return '';
    }
  };

  const getGlowClasses = () => {
    if (!birdLevel.glow_effect) return '';
    
    if (birdLevel.name === 'Phoenix') {
      return 'drop-shadow-lg hover:drop-shadow-xl transition-all duration-300 hover:shadow-lg hover:shadow-pink-500/30';
    }
    
    return 'drop-shadow-lg hover:drop-shadow-xl transition-all duration-300';
  };

  const getSpecialEffects = () => {
    if (birdLevel.name === 'Phoenix') {
      return (
        <div className="absolute inset-0 rounded-full">
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-pink-500/20 via-red-500/20 to-orange-500/20 animate-pulse" />
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/10 to-transparent animate-ping" />
        </div>
      );
    }
    return null;
  };

  const tooltipContent = (
    <div className="max-w-xs p-2">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">{birdLevel.emoji}</span>
        <span className="font-bold text-base">{birdLevel.name}</span>
      </div>
      <p className="text-sm text-muted-foreground mb-2">{birdLevel.description}</p>
      <div className="text-xs text-muted-foreground mb-2">
        Requirements: {birdLevel.min_referrals} referrals, {birdLevel.min_points} points
      </div>
      {birdLevel.benefits.length > 0 && (
        <div className="mb-2">
          <div className="text-xs font-medium mb-1">Benefits:</div>
          <ul className="text-xs text-muted-foreground">
            {birdLevel.benefits.map((benefit, index) => (
              <li key={index}>• {benefit}</li>
            ))}
          </ul>
        </div>
      )}
      {nextLevel && (
        <div className="border-t pt-2 mt-2">
          <div className="text-xs font-medium text-primary">Next: {nextLevel.name}</div>
          <div className="text-xs text-muted-foreground">
            Need: {nextLevel.referrals_needed} more referrals, {nextLevel.points_needed} more points
          </div>
        </div>
      )}
    </div>
  );

  const badgeElement = (
    <div className={cn(
      'flex items-center gap-2 transition-all duration-300',
      getAnimationClasses(),
      className
    )}>
      <div 
        className={cn(
          'relative rounded-full flex items-center justify-center overflow-hidden',
          sizeClasses[size],
          getGlowClasses()
        )}
        style={{ 
          backgroundColor: birdLevel.color + '20',
          border: `2px solid ${birdLevel.color}`,
          color: birdLevel.color
        }}
      >
        {getSpecialEffects()}
        <IconComponent className={cn(sizeClasses[size], 'p-1 relative z-10')} />
      </div>
      {showName && (
        <span 
          className={cn(
            'font-medium',
            textSizes[size]
          )}
          style={{ color: birdLevel.color }}
        >
          {birdLevel.name}
        </span>
      )}
    </div>
  );

  if (!showTooltip) {
    return badgeElement;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="cursor-pointer">
            {badgeElement}
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="border">
          {tooltipContent}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};