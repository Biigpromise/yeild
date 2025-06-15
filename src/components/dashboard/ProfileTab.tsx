
import React from 'react';
import { UserProfile } from '@/components/UserProfile';
import { userService } from '@/services/userService';
import { toast } from 'sonner';

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
  if (!userProfile || !userStats) {
    return <div>Loading profile...</div>;
  }

  const userForProfileComponent = {
    id: userProfile.id,
    name: userProfile.name,
    email: userProfile.email,
    bio: userProfile.bio,
    avatar: userProfile.profile_picture_url,
    level: userStats.level,
    points: userStats.points,
    tasksCompleted: userStats.tasksCompleted,
    currentStreak: userStats.currentStreak,
    longestStreak: userProfile.longest_streak || 0,
    joinDate: userProfile.created_at,
    totalPointsEarned: totalPointsEarned,
    completionRate: userProfile.task_completion_rate,
    followers_count: userStats.followers,
    following_count: userStats.following,
  };

  const handleUpdate = async (data: Partial<typeof userForProfileComponent>) => {
    const updateData: {name?: string, bio?: string, profile_picture_url?: string} = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.bio !== undefined) updateData.bio = data.bio;
    if (data.avatar !== undefined) updateData.profile_picture_url = data.avatar;
    
    if (Object.keys(updateData).length > 0) {
      const success = await userService.updateProfile(updateData);
      if (success) {
        onProfileUpdate();
      }
    }
  };

  return <UserProfile user={userForProfileComponent} onUpdate={handleUpdate} />;
};
