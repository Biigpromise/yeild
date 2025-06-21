
import React, { useState } from 'react';
import { ProfileForm } from '@/components/profile/ProfileForm';
import { ProfileStats } from '@/components/profile/ProfileStats';
import { ProfileBirdDisplay } from '@/components/profile/ProfileBirdDisplay';
import { BirdProgression } from '@/components/referral/BirdProgression';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { userService } from '@/services/userService';
import { useAuth } from '@/contexts/AuthContext';

interface ProfileTabProps {
  userProfile: any;
  userStats: any;
  totalPointsEarned: number;
  onProfileUpdate: () => void;
}

export const ProfileTab: React.FC<ProfileTabProps> = ({
  userProfile,
  userStats,
  totalPointsEarned,
  onProfileUpdate
}) => {
  const { user } = useAuth();
  const [currentBirdLevel, setCurrentBirdLevel] = useState(() => {
    if (userProfile) {
      return userService.getBirdLevel(
        userProfile.active_referrals_count || 0,
        userStats.points || 0
      );
    }
    return userService.getBirdLevel(0, 0);
  });

  const nextBirdLevel = userService.getNextBirdLevel(currentBirdLevel);

  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* Bird Badge Display */}
      <ProfileBirdDisplay 
        userId={user.id}
        activeReferrals={userProfile?.active_referrals_count || 0}
        totalReferrals={userProfile?.total_referrals_count || 0}
      />

      {/* Bird Progression */}
      <BirdProgression
        userPoints={userStats.points || 0}
        activeReferrals={userProfile?.active_referrals_count || 0}
        currentBirdLevel={currentBirdLevel}
        nextBirdLevel={nextBirdLevel}
      />

      <Tabs defaultValue="stats" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="stats">Profile Stats</TabsTrigger>
          <TabsTrigger value="edit">Edit Profile</TabsTrigger>
        </TabsList>
        
        <TabsContent value="stats">
          <ProfileStats 
            userProfile={userProfile}
            userStats={userStats}
            totalPointsEarned={totalPointsEarned}
          />
        </TabsContent>
        
        <TabsContent value="edit">
          <Card>
            <CardHeader>
              <CardTitle>Edit Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <ProfileForm onUpdate={onProfileUpdate} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
