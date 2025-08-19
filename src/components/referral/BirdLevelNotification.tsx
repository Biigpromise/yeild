import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp } from 'lucide-react';

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

interface BirdLevelNotificationProps {
  previousLevel: BirdLevel | null;
  currentLevel: BirdLevel | null;
  activeReferrals: number;
}

export const BirdLevelNotification: React.FC<BirdLevelNotificationProps> = ({
  previousLevel,
  currentLevel,
  activeReferrals
}) => {
  // Only show if there's been a level change
  if (!previousLevel || !currentLevel || previousLevel.id === currentLevel.id) {
    return null;
  }

  // Only show for level ups (not downs)
  if (currentLevel.id <= previousLevel.id) {
    return null;
  }

  return (
    <Card className="border-green-200 bg-green-50 border-2">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div className="text-4xl">{currentLevel.icon}</div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="font-medium text-green-800">Level Up!</span>
              <Badge variant="default" className="bg-green-600">
                New Achievement
              </Badge>
            </div>
            <h3 className="text-lg font-bold text-green-800">
              Welcome to {currentLevel.name} Level!
            </h3>
            <p className="text-sm text-green-700 mb-2">
              {currentLevel.description}
            </p>
            <p className="text-xs text-green-600">
              You now have {activeReferrals} active referrals. Keep growing your network!
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};