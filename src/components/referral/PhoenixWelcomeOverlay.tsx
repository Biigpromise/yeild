
import React, { useState, useEffect } from 'react';
import { AnimatedPhoenixBadge } from './AnimatedPhoenixBadge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Crown, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PhoenixWelcomeOverlayProps {
  userName: string;
  referralCount: number;
  onClose: () => void;
}

export const PhoenixWelcomeOverlay: React.FC<PhoenixWelcomeOverlayProps> = ({
  userName,
  referralCount,
  onClose
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Animate in after mount
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  return (
    <div className={cn(
      'fixed inset-0 z-50 flex items-center justify-center transition-all duration-300',
      'bg-black/70 backdrop-blur-sm',
      isVisible ? 'opacity-100' : 'opacity-0'
    )}>
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-orange-400 rounded-full animate-ping opacity-60"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      <Card className={cn(
        'relative max-w-md mx-4 overflow-hidden transition-all duration-500',
        'bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50',
        'border-2 border-orange-300 shadow-2xl',
        isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
      )}>
        {/* Background Glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-100/50 via-orange-100/50 to-yellow-100/50" />
        <div className="absolute top-4 left-4 w-32 h-32 bg-orange-400/20 rounded-full blur-xl animate-pulse" />
        <div className="absolute bottom-4 right-4 w-24 h-24 bg-red-400/20 rounded-full blur-lg animate-pulse" style={{ animationDelay: '1s' }} />

        {/* Close Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClose}
          className="absolute top-2 right-2 z-10 hover:bg-red-100"
        >
          <X className="h-4 w-4" />
        </Button>

        <CardContent className="p-8 text-center space-y-6 relative z-10">
          {/* Phoenix Badge */}
          <div className="flex justify-center">
            <AnimatedPhoenixBadge 
              size="xl"
              showName={false}
              referralCount={referralCount}
              isIdle={true}
            />
          </div>

          {/* Welcome Message */}
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-2">
              <Crown className="h-6 w-6 text-red-600 animate-pulse" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                Welcome Back, Phoenix!
              </h1>
              <Crown className="h-6 w-6 text-red-600 animate-pulse" />
            </div>
            
            <p className="text-lg font-semibold text-gray-800">
              {userName}
            </p>
            
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Star className="h-4 w-4 text-orange-500" />
              <span className="text-sm">
                {referralCount.toLocaleString()} Active Referrals
              </span>
              <Star className="h-4 w-4 text-orange-500" />
            </div>
          </div>

          {/* Elite Status Message */}
          <div className="bg-white/80 rounded-lg p-4 border border-orange-200">
            <p className="text-sm text-gray-700 leading-relaxed">
              You've achieved the ultimate YEILD status! As a Phoenix, you have access to exclusive features, 
              premium tasks, and special recognition throughout the platform.
            </p>
          </div>

          {/* Action Button */}
          <Button 
            onClick={handleClose}
            className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white shadow-lg"
          >
            Continue to Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
