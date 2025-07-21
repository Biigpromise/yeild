
import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown, Sparkles, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface BirdLevelNotificationProps {
  previousLevel: any;
  currentLevel: any;
  activeReferrals: number;
}

export const BirdLevelNotification: React.FC<BirdLevelNotificationProps> = ({
  previousLevel,
  currentLevel,
  activeReferrals
}) => {
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    // Show notification if level has changed and we have a new level
    if (previousLevel && currentLevel && previousLevel.id !== currentLevel.id) {
      setShowNotification(true);
      
      // Auto-hide after 10 seconds
      const timer = setTimeout(() => {
        setShowNotification(false);
      }, 10000);

      return () => clearTimeout(timer);
    }
  }, [previousLevel, currentLevel]);

  if (!showNotification || !currentLevel) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -50, scale: 0.9 }}
        transition={{ duration: 0.3 }}
        className="fixed top-4 right-4 z-50 max-w-md"
      >
        <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center border-2 animate-pulse"
                  style={{ 
                    backgroundColor: currentLevel.color + '20',
                    borderColor: currentLevel.color,
                    boxShadow: `0 0 15px ${currentLevel.color}40`
                  }}
                >
                  <span className="text-2xl">{currentLevel.emoji}</span>
                </div>
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Crown className="h-4 w-4 text-yellow-600" />
                  <span className="font-semibold text-yellow-800">
                    Bird Badge Upgraded!
                  </span>
                </div>
                <div className="text-sm text-gray-700">
                  Congratulations! You've earned the{' '}
                  <span 
                    className="font-semibold"
                    style={{ color: currentLevel.color }}
                  >
                    {currentLevel.name}
                  </span>{' '}
                  badge with {activeReferrals} active referrals!
                </div>
                {currentLevel.benefits && currentLevel.benefits.length > 0 && (
                  <div className="text-xs text-gray-600 mt-1">
                    <Sparkles className="h-3 w-3 inline mr-1" />
                    New benefits: {currentLevel.benefits.join(', ')}
                  </div>
                )}
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowNotification(false)}
                className="flex-shrink-0 h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};
