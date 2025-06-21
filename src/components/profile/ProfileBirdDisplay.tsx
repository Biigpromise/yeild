
import React from 'react';
import { ProfileBirdBadge } from '@/components/referral/ProfileBirdBadge';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Trophy } from 'lucide-react';

interface ProfileBirdDisplayProps {
  userId: string;
  activeReferrals?: number;
  totalReferrals?: number;
}

export const ProfileBirdDisplay: React.FC<ProfileBirdDisplayProps> = ({
  userId,
  activeReferrals = 0,
  totalReferrals = 0
}) => {
  return (
    <Card className="border-0 shadow-sm bg-gradient-to-r from-blue-50 to-purple-50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <ProfileBirdBadge userId={userId} size="lg" showName />
            <div className="flex flex-col space-y-1">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <Badge variant="outline" className="text-xs">
                  {activeReferrals} Active Referrals
                </Badge>
              </div>
              <div className="flex items-center space-x-2">
                <Trophy className="h-4 w-4 text-muted-foreground" />
                <Badge variant="outline" className="text-xs">
                  {totalReferrals} Total Referrals
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
