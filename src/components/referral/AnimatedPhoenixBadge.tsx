
import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Crown, Star } from 'lucide-react';
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
      {/* Phoenix Glow Effects - Enhanced */}
      <div className="absolute -inset-3 opacity-75 animate-pulse">
        <div className="absolute inset-0 bg-gradient-to-r from-red-600 via-orange-500 to-yellow-400 rounded-full blur-xl opacity-80" />
      </div>
      
      <div className="absolute -inset-2 opacity-60 animate-pulse" style={{ animationDelay: '0.5s' }}>
        <div className="absolute inset-0 bg-gradient-to-r from-orange-600 via-red-500 to-orange-400 rounded-full blur-lg opacity-70" />
      </div>

      {/* Main Phoenix Badge */}
      <Badge 
        className={cn(
          `relative z-10 cursor-pointer transition-all duration-500 transform`,
          `bg-gradient-to-br from-red-700 via-orange-600 to-yellow-500`,
          `border-2 border-orange-400 shadow-2xl`,
          `hover:scale-110 hover:shadow-orange-400/70`,
          isHovered && 'scale-125 shadow-orange-400/90',
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
        {/* Phoenix Icon Container - Redesigned to match the image */}
        <div className={cn(
          'relative flex items-center justify-center',
          sizeClasses[size]
        )}>
          {/* Phoenix Body - Central flame */}
          <div className={cn(
            'absolute inset-0 flex items-center justify-center z-20'
          )}>
            <div className={cn(
              'w-3/4 h-3/4 bg-gradient-to-t from-red-600 via-orange-500 to-yellow-400',
              'rounded-full opacity-90',
              isHovered && 'animate-pulse scale-110',
              showParticles && 'animate-bounce'
            )} />
            {/* Phoenix head/beak */}
            <div className={cn(
              'absolute top-1/4 w-1/4 h-1/4 bg-gradient-to-br from-orange-600 to-red-700',
              'transform rotate-45 opacity-80'
            )} style={{ clipPath: 'polygon(0% 100%, 100% 0%, 100% 100%)' }} />
          </div>

          {/* Phoenix Wings - Majestic spread wings like in the image */}
          <div className={cn(
            'absolute inset-0 transition-all duration-700',
            isHovered ? 'scale-150 rotate-12' : 'scale-125',
            showParticles && 'animate-pulse scale-140'
          )}>
            {/* Left Wing - Multiple feather layers */}
            <div className={cn(
              'absolute left-0 top-1/2 -translate-y-1/2 w-full h-full',
              'transform -rotate-45 origin-right',
              isHovered && 'scale-110 -rotate-60',
              'transition-all duration-700'
            )}>
              {/* Outer feathers */}
              <div className="absolute inset-0 bg-gradient-to-r from-red-600 via-orange-500 to-transparent rounded-l-full opacity-70" />
              <div className="absolute inset-1 bg-gradient-to-r from-orange-600 via-yellow-500 to-transparent rounded-l-full opacity-60" />
              <div className="absolute inset-2 bg-gradient-to-r from-yellow-500 via-orange-400 to-transparent rounded-l-full opacity-50" />
            </div>
            
            {/* Right Wing - Multiple feather layers */}
            <div className={cn(
              'absolute right-0 top-1/2 -translate-y-1/2 w-full h-full',
              'transform rotate-45 origin-left',
              isHovered && 'scale-110 rotate-60',
              'transition-all duration-700'
            )}>
              {/* Outer feathers */}
              <div className="absolute inset-0 bg-gradient-to-l from-red-600 via-orange-500 to-transparent rounded-r-full opacity-70" />
              <div className="absolute inset-1 bg-gradient-to-l from-orange-600 via-yellow-500 to-transparent rounded-r-full opacity-60" />
              <div className="absolute inset-2 bg-gradient-to-l from-yellow-500 via-orange-400 to-transparent rounded-r-full opacity-50" />
            </div>
          </div>

          {/* Phoenix Tail - Flowing tail feathers */}
          <div className={cn(
            'absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-full',
            'transform translate-y-1/4',
            isHovered && 'scale-110 translate-y-1/3',
            'transition-all duration-500'
          )}>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-orange-500 to-red-600 rounded-b-full opacity-60" />
            <div className="absolute inset-1 bg-gradient-to-b from-transparent via-yellow-500 to-orange-600 rounded-b-full opacity-50" />
          </div>

          {/* Crown on top - Enhanced */}
          <Crown className={cn(
            'absolute -top-2 -right-1 text-yellow-300 z-30 drop-shadow-lg',
            size === 'sm' ? 'h-3 w-3' : 
            size === 'md' ? 'h-4 w-4' : 
            size === 'lg' ? 'h-5 w-5' : 'h-6 w-6',
            isHovered && 'animate-pulse text-yellow-100 scale-110'
          )} />
        </div>

        {showName && (
          <span className={cn(
            'ml-2 font-bold text-white tracking-wide drop-shadow-md',
            isHovered && 'animate-pulse text-yellow-100'
          )}>
            Phoenix
          </span>
        )}
      </Badge>

      {/* Enhanced Floating Particles - More realistic ember effect */}
      {showParticles && (
        <>
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className={cn(
                'absolute rounded-full opacity-80 pointer-events-none',
                i % 3 === 0 ? 'w-2 h-2 bg-orange-400' : 
                i % 3 === 1 ? 'w-1.5 h-1.5 bg-red-500' : 'w-1 h-1 bg-yellow-400',
                'animate-ping'
              )}
              style={{
                left: `${10 + Math.random() * 80}%`,
                top: `${10 + Math.random() * 80}%`,
                animationDelay: `${i * 0.1}s`,
                animationDuration: `${1.5 + Math.random()}s`
              }}
            />
          ))}
        </>
      )}

      {/* Enhanced Stars around Phoenix */}
      <Star className={cn(
        'absolute -top-1 -left-1 text-yellow-300 opacity-70 drop-shadow-sm',
        size === 'sm' ? 'h-2 w-2' : 'h-3 w-3',
        isHovered && 'animate-spin text-yellow-100 opacity-100 scale-110'
      )} />
      
      <Star className={cn(
        'absolute -bottom-1 -right-1 text-red-300 opacity-70 drop-shadow-sm',
        size === 'sm' ? 'h-2 w-2' : 'h-3 w-3',
        isHovered && 'animate-spin text-red-100 opacity-100 scale-110'
      )} />

      {/* Enhanced Tooltip */}
      {isHovered && (
        <div className="absolute -top-24 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-black/95 text-white px-4 py-3 rounded-lg shadow-2xl border border-orange-400/50 backdrop-blur-sm">
            <div className="flex items-center gap-2 whitespace-nowrap">
              <div className="w-4 h-4 bg-gradient-to-br from-red-500 to-orange-400 rounded-full animate-pulse" />
              <span className="font-bold text-orange-300">Phoenix YEILDER</span>
            </div>
            <div className="text-xs text-gray-300 mt-1">
              {referralCount.toLocaleString()}+ verified referrals. Legendary status achieved.
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Energy Ring Pulse */}
      <div className={cn(
        'absolute inset-0 rounded-full border-2 border-orange-400/40',
        'animate-ping pointer-events-none',
        isHovered ? 'opacity-100 border-orange-300/60' : 'opacity-60'
      )} style={{ animationDuration: '2s' }} />
      
      {/* Additional outer ring for more dramatic effect */}
      <div className={cn(
        'absolute -inset-1 rounded-full border border-red-400/30',
        'animate-pulse pointer-events-none',
        isHovered ? 'opacity-80' : 'opacity-40'
      )} style={{ animationDuration: '3s' }} />
    </div>
  );
};
