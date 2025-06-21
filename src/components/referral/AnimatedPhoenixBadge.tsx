
import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Flame, Crown, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AnimatedPhoenixBadgeProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showName?: boolean;
  className?: string;
  referralCount?: number;
  isIdle?: boolean;
}

export const AnimatedPhoenixBadge: React.FC<AnimatedPhoenixBadgeProps> = ({
  size = 'md',
  showName = false,
  className = '',
  referralCount = 1000,
  isIdle = true
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showParticles, setShowParticles] = useState(false);

  // Trigger wing flap animation every 3-5 seconds in idle mode
  useEffect(() => {
    if (!isIdle) return;
    
    const interval = setInterval(() => {
      setShowParticles(true);
      setTimeout(() => setShowParticles(false), 1000);
    }, Math.random() * 2000 + 3000); // 3-5 seconds

    return () => clearInterval(interval);
  }, [isIdle]);

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  const badgeSize = size === 'sm' ? 'text-xs px-2 py-1' : 
                   size === 'lg' ? 'text-sm px-4 py-2' : 
                   size === 'xl' ? 'text-base px-6 py-3' : 
                   'text-xs px-3 py-1.5';

  return (
    <div className="relative group">
      {/* Phoenix Glow Effects */}
      <div className="absolute -inset-2 opacity-75 animate-pulse">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-600 via-red-500 to-yellow-500 rounded-full blur-lg opacity-60" />
      </div>
      
      <div className="absolute -inset-1 opacity-50 animate-pulse" style={{ animationDelay: '0.5s' }}>
        <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-orange-400 to-yellow-400 rounded-full blur-md opacity-40" />
      </div>

      {/* Main Phoenix Badge */}
      <Badge 
        className={cn(
          `relative z-10 cursor-pointer transition-all duration-300 transform`,
          `bg-gradient-to-br from-red-600 via-orange-500 to-yellow-500`,
          `border-2 border-orange-400 shadow-2xl`,
          `hover:scale-110 hover:shadow-orange-400/50`,
          isHovered && 'scale-125 shadow-orange-400/70',
          badgeSize,
          className
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => {
          setShowParticles(true);
          setTimeout(() => setShowParticles(false), 2000);
        }}
      >
        {/* Phoenix Icon Container */}
        <div className={cn(
          'relative flex items-center justify-center',
          sizeClasses[size]
        )}>
          {/* Phoenix Wings - Animated */}
          <div className={cn(
            'absolute inset-0 transition-all duration-500',
            isHovered ? 'scale-150 rotate-12' : 'scale-100',
            showParticles && 'animate-pulse'
          )}>
            {/* Left Wing */}
            <div className={cn(
              'absolute left-0 top-1/2 -translate-y-1/2 w-1/3 h-full',
              'bg-gradient-to-r from-red-500 to-orange-400 rounded-l-full',
              'opacity-80 transform -rotate-45',
              isHovered && 'scale-110 -rotate-60',
              'transition-all duration-500'
            )} />
            
            {/* Right Wing */}
            <div className={cn(
              'absolute right-0 top-1/2 -translate-y-1/2 w-1/3 h-full',
              'bg-gradient-to-l from-red-500 to-orange-400 rounded-r-full',
              'opacity-80 transform rotate-45',
              isHovered && 'scale-110 rotate-60',
              'transition-all duration-500'
            )} />
          </div>

          {/* Phoenix Body */}
          <Flame className={cn(
            'relative z-10 text-white transition-all duration-300',
            size === 'sm' ? 'h-4 w-4' : 
            size === 'md' ? 'h-6 w-6' : 
            size === 'lg' ? 'h-8 w-8' : 'h-12 w-12',
            isHovered && 'animate-bounce text-yellow-200',
            showParticles && 'animate-pulse'
          )} />

          {/* Crown on top */}
          <Crown className={cn(
            'absolute -top-2 -right-1 text-yellow-400 z-20',
            size === 'sm' ? 'h-3 w-3' : 
            size === 'md' ? 'h-4 w-4' : 
            size === 'lg' ? 'h-5 w-5' : 'h-6 w-6',
            isHovered && 'animate-spin text-yellow-200'
          )} />
        </div>

        {showName && (
          <span className={cn(
            'ml-2 font-bold text-white tracking-wide',
            isHovered && 'animate-pulse'
          )}>
            Phoenix
          </span>
        )}
      </Badge>

      {/* Floating Particles */}
      {showParticles && (
        <>
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className={cn(
                'absolute w-2 h-2 bg-orange-400 rounded-full opacity-80',
                'animate-ping pointer-events-none'
              )}
              style={{
                left: `${20 + Math.random() * 60}%`,
                top: `${20 + Math.random() * 60}%`,
                animationDelay: `${i * 0.1}s`,
                animationDuration: '1s'
              }}
            />
          ))}
        </>
      )}

      {/* Stars around Phoenix */}
      <Star className={cn(
        'absolute -top-1 -left-1 text-yellow-400 opacity-60',
        size === 'sm' ? 'h-2 w-2' : 'h-3 w-3',
        isHovered && 'animate-spin text-yellow-200 opacity-100'
      )} />
      
      <Star className={cn(
        'absolute -bottom-1 -right-1 text-red-400 opacity-60',
        size === 'sm' ? 'h-2 w-2' : 'h-3 w-3',
        isHovered && 'animate-spin text-red-200 opacity-100'
      )} />

      {/* Tooltip */}
      {isHovered && (
        <div className="absolute -top-20 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-black/90 text-white px-4 py-2 rounded-lg shadow-xl border border-orange-400">
            <div className="flex items-center gap-2 whitespace-nowrap">
              <Flame className="h-4 w-4 text-orange-400" />
              <span className="font-bold">Phoenix YEILDER</span>
            </div>
            <div className="text-xs text-gray-300 mt-1">
              {referralCount.toLocaleString()}+ verified referrals. Elite badge unlocked.
            </div>
          </div>
        </div>
      )}

      {/* Energy Ring Pulse */}
      <div className={cn(
        'absolute inset-0 rounded-full border-2 border-orange-400/30',
        'animate-ping pointer-events-none',
        isHovered ? 'opacity-100' : 'opacity-50'
      )} style={{ animationDuration: '3s' }} />
    </div>
  );
};
