
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface RealisticPhoenixBirdProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animate?: boolean;
  className?: string;
}

export const RealisticPhoenixBird: React.FC<RealisticPhoenixBirdProps> = ({
  size = 'md',
  animate = true,
  className = ''
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  return (
    <div
      className={cn(
        'relative flex items-center justify-center cursor-pointer',
        sizeClasses[size],
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Phoenix Bird SVG */}
      <svg
        viewBox="0 0 100 100"
        className={cn(
          'w-full h-full transition-all duration-300',
          animate && 'animate-pulse',
          isHovered && 'scale-110'
        )}
      >
        {/* Phoenix Body */}
        <ellipse cx="50" cy="60" rx="15" ry="20" fill="url(#phoenixBody)" />
        
        {/* Phoenix Head */}
        <circle cx="50" cy="35" r="12" fill="url(#phoenixHead)" />
        
        {/* Phoenix Beak */}
        <polygon points="58,35 65,37 58,39" fill="#FFB347" />
        
        {/* Phoenix Eye */}
        <circle cx="52" cy="32" r="2" fill="#000" />
        <circle cx="53" cy="31" r="0.5" fill="#FFF" />
        
        {/* Phoenix Wings */}
        <path d="M35 55 Q25 45 20 55 Q25 65 35 60 Z" fill="url(#phoenixWing)" />
        <path d="M65 55 Q75 45 80 55 Q75 65 65 60 Z" fill="url(#phoenixWing)" />
        
        {/* Phoenix Tail Feathers */}
        <path d="M45 75 Q40 85 35 95 Q45 90 50 80 Z" fill="url(#phoenixTail)" />
        <path d="M55 75 Q60 85 65 95 Q55 90 50 80 Z" fill="url(#phoenixTail)" />
        <path d="M50 78 Q50 88 50 98 Q52 88 50 78 Z" fill="url(#phoenixTail)" />
        
        {/* Phoenix Crest */}
        <path d="M45 25 Q48 15 50 25 Q52 15 55 25 Q52 30 50 25 Q48 30 45 25 Z" fill="url(#phoenixCrest)" />
        
        {/* Flame Effects */}
        {animate && (
          <g className="animate-pulse">
            <circle cx="50" cy="50" r="35" fill="url(#flameGlow)" opacity="0.3" />
            <circle cx="50" cy="50" r="25" fill="url(#flameGlow)" opacity="0.2" />
          </g>
        )}
        
        {/* Gradient Definitions */}
        <defs>
          <radialGradient id="phoenixBody" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FF6B35" />
            <stop offset="50%" stopColor="#FF8E53" />
            <stop offset="100%" stopColor="#FF4500" />
          </radialGradient>
          
          <radialGradient id="phoenixHead" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFB347" />
            <stop offset="50%" stopColor="#FF8E53" />
            <stop offset="100%" stopColor="#FF6B35" />
          </radialGradient>
          
          <linearGradient id="phoenixWing" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF8E53" />
            <stop offset="50%" stopColor="#FF6B35" />
            <stop offset="100%" stopColor="#FF4500" />
          </linearGradient>
          
          <linearGradient id="phoenixTail" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFD700" />
            <stop offset="50%" stopColor="#FF8E53" />
            <stop offset="100%" stopColor="#FF4500" />
          </linearGradient>
          
          <linearGradient id="phoenixCrest" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFD700" />
            <stop offset="50%" stopColor="#FFB347" />
            <stop offset="100%" stopColor="#FF8E53" />
          </linearGradient>
          
          <radialGradient id="flameGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFD700" />
            <stop offset="50%" stopColor="#FF8E53" />
            <stop offset="100%" stopColor="#FF4500" />
          </radialGradient>
        </defs>
      </svg>
      
      {/* Glow Effect */}
      {animate && (
        <div className={cn(
          'absolute inset-0 rounded-full',
          isHovered && 'animate-ping bg-orange-400/30'
        )} />
      )}
    </div>
  );
};
