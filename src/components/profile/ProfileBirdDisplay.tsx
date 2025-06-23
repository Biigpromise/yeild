
import React from 'react';
import { ProfileBirdBadge } from '@/components/referral/ProfileBirdBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Trophy, Crown } from 'lucide-react';

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
    <Card className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 border-purple-500/30 shadow-xl">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
          <Crown className="h-6 w-6 text-yellow-500" />
          Referral Status & Bird Badge
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <ProfileBirdBadge userId={userId} size="lg" showName />
            <div className="text-center md:text-left">
              <h3 className="text-lg font-semibold text-white mb-2">Your Bird Status</h3>
              <p className="text-gray-300 text-sm">
                Earn your wings through referrals and activity!
              </p>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4">
            <div className="text-center p-4 bg-gradient-to-br from-blue-600/20 to-blue-800/20 rounded-lg border border-blue-500/30">
              <Users className="h-6 w-6 mx-auto mb-2 text-blue-400" />
              <div className="text-2xl font-bold text-white">{activeReferrals}</div>
              <div className="text-sm text-gray-400">Active Referrals</div>
            </div>
            
            <div className="text-center p-4 bg-gradient-to-br from-yellow-600/20 to-yellow-800/20 rounded-lg border border-yellow-500/30">
              <Trophy className="h-6 w-6 mx-auto mb-2 text-yellow-400" />
              <div className="text-2xl font-bold text-white">{totalReferrals}</div>
              <div className="text-sm text-gray-400">Total Referrals</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
