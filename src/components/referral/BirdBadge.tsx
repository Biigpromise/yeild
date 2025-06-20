
import React from 'react';
import { ReferralBirdLevel } from '@/services/userService';
import { Badge } from '@/components/ui/badge';
import { Dove, Hawk, Eagle, Falcon, Phoenix } from 'lucide-react';

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
      return <Dove className={iconSize} />;
    case 'hawk':
      return <Hawk className={iconSize} />;
    case 'eagle':
      return <Eagle className={iconSize} />;
    case 'falcon':
      return <Falcon className={iconSize} />;
    case 'phoenix':
      return <Phoenix className={iconSize} />;
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
      return 'bg-blue-100 text-blue-700 border-blue-300';
    case 'falcon':
      return 'bg-purple-100 text-purple-700 border-purple-300';
    case 'phoenix':
      return 'bg-gradient-to-r from-red-100 to-orange-100 text-red-700 border-red-300';
    default:
      return 'bg-gray-100 text-gray-500';
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
  
  const animationClass = birdLevel.animated 
    ? 'hover:scale-110 transition-all duration-300 hover:shadow-lg' 
    : '';
    
  const phoenixGlow = birdLevel.icon === 'phoenix' 
    ? 'animate-pulse shadow-orange-200 shadow-lg' 
    : '';

  return (
    <Badge 
      variant="outline" 
      className={`
        ${colorClass} 
        ${animationClass} 
        ${phoenixGlow}
        ${className}
        flex items-center gap-1 font-medium
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
  );
};
