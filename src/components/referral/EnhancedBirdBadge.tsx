
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface BirdLevel {
  id: number;
  name: string;
  icon: string;
  emoji: string;
  color: string;
  min_referrals: number;
  min_points: number;
  description: string;
  benefits: string[];
  glow_effect: boolean;
}

interface EnhancedBirdBadgeProps {
  userId: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showName?: boolean;
  showTooltip?: boolean;
  className?: string;
}

export const EnhancedBirdBadge: React.FC<EnhancedBirdBadgeProps> = ({
  userId,
  size = 'md',
  showName = false,
  showTooltip = true,
  className = ''
}) => {
  const [birdLevel, setBirdLevel] = useState<BirdLevel | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBirdLevel();
  }, [userId]);

  const loadBirdLevel = async () => {
    try {
      const { data, error } = await supabase
        .rpc('get_user_bird_level', { user_id_param: userId });

      if (error) {
        console.error('Error loading bird level:', error);
        return;
      }

      if (data && data.length > 0) {
        setBirdLevel(data[0]);
      }
    } catch (error) {
      console.error('Error loading bird level:', error);
    } finally {
      setLoading(false);
    }
  };

  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base',
    xl: 'w-12 h-12 text-lg'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg'
  };

  if (loading) {
    return (
      <div className={`${sizeClasses[size]} rounded-full bg-gray-200 animate-pulse ${className}`} />
    );
  }

  if (!birdLevel) {
    return (
      <div className={`${sizeClasses[size]} rounded-full bg-gray-100 flex items-center justify-center ${className}`}>
        <span className="text-gray-400">🐣</span>
      </div>
    );
  }

  const BadgeComponent = (
    <div className={`flex items-center gap-2 ${className}`}>
      <div 
        className={`
          ${sizeClasses[size]} 
          rounded-full 
          flex items-center justify-center 
          border-2 
          transition-all duration-200 
          ${birdLevel.glow_effect ? 'shadow-lg' : ''}
        `}
        style={{ 
          backgroundColor: birdLevel.color + '20',
          borderColor: birdLevel.color,
          color: birdLevel.color,
          boxShadow: birdLevel.glow_effect ? `0 0 15px ${birdLevel.color}40` : undefined
        }}
      >
        <span>{birdLevel.emoji}</span>
      </div>
      {showName && (
        <span 
          className={`font-medium ${textSizeClasses[size]}`}
          style={{ color: birdLevel.color }}
        >
          {birdLevel.name}
        </span>
      )}
    </div>
  );

  if (!showTooltip) {
    return BadgeComponent;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {BadgeComponent}
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-center">
            <div className="font-semibold">{birdLevel.name}</div>
            <div className="text-sm text-muted-foreground">{birdLevel.description}</div>
            <div className="text-xs mt-1">
              Requirements: {birdLevel.min_referrals} referrals, {birdLevel.min_points} points
            </div>
            {birdLevel.benefits.length > 0 && (
              <div className="text-xs mt-1">
                <strong>Benefits:</strong> {birdLevel.benefits.join(', ')}
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
