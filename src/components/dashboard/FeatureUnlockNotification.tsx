import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Trophy, Users, BarChart3, Gift, History, Activity, Bell, Search } from 'lucide-react';
import { ExperienceTier } from '@/hooks/useExperienceLevel';

interface FeatureUnlockNotificationProps {
  isOpen: boolean;
  onClose: () => void;
  unlockedFeatures: string[];
  newTier: ExperienceTier;
}

const featureIcons: Record<string, React.ComponentType<any>> = {
  community: Users,
  stories: Activity,
  referrals: Users,
  leaderboard: BarChart3,
  achievements: Trophy,
  history: History,
  notifications: Bell,
  search: Search,
  rewards: Gift,
  activity: Activity
};

const featureNames: Record<string, string> = {
  community: 'Community Chat',
  stories: 'Stories',
  referrals: 'Referral System',
  leaderboard: 'Leaderboard',
  achievements: 'Achievements & Badges',
  history: 'Task History',
  notifications: 'Notifications',
  search: 'Global Search',
  rewards: 'Rewards Store',
  activity: 'Activity Feed'
};

export const FeatureUnlockNotification: React.FC<FeatureUnlockNotificationProps> = ({
  isOpen,
  onClose,
  unlockedFeatures,
  newTier
}) => {
  if (unlockedFeatures.length === 0) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto">
        <div className="text-center space-y-6">
          {/* Celebration Header */}
          <div className="space-y-2">
            <div className="flex justify-center">
              <Sparkles className="h-12 w-12 text-yellow-500 animate-pulse" />
            </div>
            <h2 className="text-2xl font-bold">Features Unlocked!</h2>
            <Badge variant="secondary" className="text-sm">
              {newTier.name}
            </Badge>
          </div>

          {/* Unlocked Features List */}
          <div className="space-y-3">
            <p className="text-muted-foreground">
              You've unlocked new features:
            </p>
            <div className="space-y-2">
              {unlockedFeatures.map((featureId) => {
                const Icon = featureIcons[featureId];
                const name = featureNames[featureId];
                
                if (!Icon || !name) return null;
                
                return (
                  <div 
                    key={featureId}
                    className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg border"
                  >
                    <Icon className="h-5 w-5 text-primary" />
                    <span className="font-medium">{name}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Progress Message */}
          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              {newTier.description}
            </p>
          </div>

          {/* Action Button */}
          <Button onClick={onClose} className="w-full">
            Explore New Features
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};