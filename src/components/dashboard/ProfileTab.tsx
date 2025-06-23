
import React, { useState } from 'react';
import { ProfileForm } from '@/components/profile/ProfileForm';
import { ProfileStats } from '@/components/profile/ProfileStats';
import { ProfileBirdDisplay } from '@/components/profile/ProfileBirdDisplay';
import { ProfilePictureUpload } from '@/components/profile/ProfilePictureUpload';
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

  // Create user object that matches ProfileStats and ProfileForm interfaces
  const userForComponents = {
    id: user.id,
    name: userProfile?.name || user.email || 'User',
    email: user.email || '',
    bio: userProfile?.bio || '',
    avatar: userProfile?.profile_picture_url || '',
    level: userStats.level || 1,
    points: userStats.points || 0,
    tasksCompleted: userStats.tasksCompleted || 0,
    currentStreak: userStats.currentStreak || 0,
    longestStreak: userProfile?.longest_streak || 0,
    joinDate: userProfile?.created_at || new Date().toISOString(),
    totalPointsEarned: totalPointsEarned,
    averageTaskRating: userProfile?.average_task_rating || 0,
    favoriteCategory: userProfile?.favorite_category || '',
    completionRate: userProfile?.completion_rate || 0,
    followers_count: userProfile?.followers_count || 0,
    following_count: userProfile?.following_count || 0,
    active_referrals_count: userProfile?.active_referrals_count || 0,
    total_referrals_count: userProfile?.total_referrals_count || 0,
  };

  return (
    <div className="space-y-6">
      {/* Profile Stats and Edit Profile - Now First */}
      <Tabs defaultValue="stats" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="stats">Profile Stats</TabsTrigger>
          <TabsTrigger value="edit">Edit Profile</TabsTrigger>
          <TabsTrigger value="photo">Profile Photo</TabsTrigger>
        </TabsList>
        
        <TabsContent value="stats">
          <ProfileStats 
            user={userForComponents}
          />
        </TabsContent>
        
        <TabsContent value="edit">
          <Card>
            <CardHeader>
              <CardTitle>Edit Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <ProfileForm 
                user={userForComponents}
                editData={{
                  name: userForComponents.name,
                  bio: userForComponents.bio
                }}
                isEditing={true}
                bioCharCount={userForComponents.bio.length}
                maxChars={90}
                onNameChange={() => {}}
                onBioChange={() => {}}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="photo">
          <ProfilePictureUpload
            userProfile={userProfile}
            onProfileUpdate={onProfileUpdate}
          />
        </TabsContent>
      </Tabs>

      {/* Bird Badge Display */}
      <ProfileBirdDisplay 
        userId={user.id}
        activeReferrals={userProfile?.active_referrals_count || 0}
        totalReferrals={userProfile?.total_referrals_count || 0}
      />

      {/* Bird Progression - Now Last */}
      <BirdProgression
        userPoints={userStats.points || 0}
        activeReferrals={userProfile?.active_referrals_count || 0}
        currentBirdLevel={currentBirdLevel}
        nextBirdLevel={nextBirdLevel}
      />
    </div>
  );
};
