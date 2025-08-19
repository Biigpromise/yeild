import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Sparkles, Share2 } from 'lucide-react';

interface BirdLevel {
  id: number;
  name: string;
  icon: string;
  color: string;
  min_referrals: number;
  min_points: number;
  description: string;
  benefits: string[];
}

interface BirdLevelCelebrationProps {
  newLevel: BirdLevel | null;
  isOpen: boolean;
  onClose: () => void;
}

export const BirdLevelCelebration: React.FC<BirdLevelCelebrationProps> = ({
  newLevel,
  isOpen,
  onClose
}) => {
  if (!newLevel) return null;

  const shareAchievement = () => {
    if (navigator.share) {
      navigator.share({
        title: `I just reached ${newLevel.name} level on YIELD! 🎉`,
        text: `Just achieved ${newLevel.name} status with ${newLevel.min_referrals} referrals! Join me on YIELD and let's grow together! 🚀`,
        url: window.location.origin
      });
    } else {
      // Fallback to copying to clipboard
      navigator.clipboard.writeText(
        `I just reached ${newLevel.name} level on YIELD! 🎉 Join me and let's grow together! ${window.location.origin}`
      );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Crown className="h-6 w-6 text-yellow-500" />
              <span>Level Up Achievement!</span>
              <Sparkles className="h-6 w-6 text-yellow-500" />
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div className="text-center space-y-6 py-4">
          {/* Achievement Icon */}
          <div className="relative">
            <div className="text-8xl animate-bounce">{newLevel.icon}</div>
            <div className="absolute -top-2 -right-2">
              <div className="animate-ping absolute inline-flex h-6 w-6 rounded-full bg-yellow-400 opacity-75"></div>
              <div className="relative inline-flex rounded-full h-6 w-6 bg-yellow-500 items-center justify-center">
                <Sparkles className="h-3 w-3 text-white" />
              </div>
            </div>
          </div>

          {/* Level Info */}
          <div className="space-y-2">
            <h2 className="text-2xl font-bold" style={{ color: newLevel.color }}>
              {newLevel.name}
            </h2>
            <p className="text-muted-foreground">
              {newLevel.description}
            </p>
            <Badge variant="default" className="bg-gradient-to-r from-yellow-400 to-yellow-600">
              🏆 New Achievement Unlocked
            </Badge>
          </div>

          {/* Benefits */}
          {newLevel.benefits && newLevel.benefits.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-medium text-sm">New Benefits Unlocked:</h3>
              <div className="flex flex-wrap gap-1 justify-center">
                {newLevel.benefits.map((benefit, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    ✨ {benefit}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={shareAchievement}
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share Achievement
            </Button>
            <Button variant="outline" onClick={onClose} className="flex-1">
              Continue
            </Button>
          </div>

          {/* Motivational Message */}
          <div className="text-xs text-muted-foreground p-3 bg-muted/50 rounded-lg">
            🎯 Keep referring friends to unlock even higher levels and exclusive rewards!
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};