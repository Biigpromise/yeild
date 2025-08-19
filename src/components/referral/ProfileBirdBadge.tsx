import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';

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

interface ProfileBirdBadgeProps {
  userId: string;
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
}

export const ProfileBirdBadge: React.FC<ProfileBirdBadgeProps> = ({
  userId,
  size = 'md',
  showName = false
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
        console.error('Error fetching bird level:', error);
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

  if (loading) {
    return (
      <Badge variant="outline" className={getSizeClasses(size)}>
        <div className="animate-pulse">...</div>
      </Badge>
    );
  }

  if (!birdLevel) {
    return null;
  }

  const sizeClasses = getSizeClasses(size);
  const iconSize = getIconSize(size);

  return (
    <Badge 
      variant="outline" 
      className={`${sizeClasses} ${birdLevel.glow_effect ? 'animate-pulse' : ''}`}
      style={{ 
        borderColor: birdLevel.color,
        color: birdLevel.color 
      }}
    >
      <span className={iconSize}>{birdLevel.emoji || birdLevel.icon}</span>
      {showName && <span className="ml-1">{birdLevel.name}</span>}
    </Badge>
  );
};

function getSizeClasses(size: 'sm' | 'md' | 'lg'): string {
  switch (size) {
    case 'sm':
      return 'text-xs px-1 py-0 h-5';
    case 'lg':
      return 'text-sm px-3 py-1 h-7';
    default:
      return 'text-xs px-2 py-1 h-6';
  }
}

function getIconSize(size: 'sm' | 'md' | 'lg'): string {
  switch (size) {
    case 'sm':
      return 'text-xs';
    case 'lg':
      return 'text-base';
    default:
      return 'text-sm';
  }
}