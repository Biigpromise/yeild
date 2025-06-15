
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  points: number;
  level: number;
  tasks_completed: number;
  created_at: string;
  updated_at: string;
  bio?: string;
  profile_picture_url?: string;
  social_media_links?: string[];
  followers_count: number;
  following_count: number;
}

export interface UserStats {
  level: number;
  points: number;
  tasksCompleted: number;
  currentStreak: number;
  longestStreak: number;
}

export interface LeaderboardUser {
  id: string;
  name: string;
  points: number;
  level: number;
  tasks_completed: number;
  rank: number;
}

export const userService = {
  // Get current user profile
  async getCurrentUser(): Promise<UserProfile | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  },

  // Update user profile
  async updateProfile(updates: Partial<UserProfile>): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;
      toast.success('Profile updated successfully!');
      return true;
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
      return false;
    }
  },

  // Update profile picture URL
  async updateProfilePicture(profilePictureUrl: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase
        .from('profiles')
        .update({
          profile_picture_url: profilePictureUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating profile picture:', error);
      return false;
    }
  },

  // Get user profile by ID
  async getUserProfileById(userId: string): Promise<Partial<UserProfile> | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, points, level, tasks_completed, created_at, bio, profile_picture_url, followers_count, following_count')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user profile by ID:', error);
      return null;
    }
  },

  // Follow a user
  async followUser(followingId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.id === followingId) return false;

      const { error } = await supabase
        .from('user_followers')
        .insert({ follower_id: user.id, following_id: followingId });

      if (error) throw error;
      toast.success('User followed!');
      return true;
    } catch (error) {
      console.error('Error following user:', error);
      toast.error('Failed to follow user');
      return false;
    }
  },

  // Unfollow a user
  async unfollowUser(followingId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase
        .from('user_followers')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', followingId);

      if (error) throw error;
      toast.success('User unfollowed!');
      return true;
    } catch (error) {
      console.error('Error unfollowing user:', error);
      toast.error('Failed to unfollow user');
      return false;
    }
  },

  // Check if current user is following another user
  async isFollowing(followingId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { count, error } = await supabase
        .from('user_followers')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', user.id)
        .eq('following_id', followingId);

      if (error) throw error;
      return (count ?? 0) > 0;
    } catch (error) {
      console.error('Error checking follow status:', error);
      return false;
    }
  },

  // Get user stats for dashboard
  async getUserStats(): Promise<UserStats | null> {
    try {
      const user = await this.getCurrentUser();
      if (!user) return null;

      // For now, return basic stats from profile
      // You can extend this to calculate streaks from task completion dates
      return {
        level: user.level,
        points: user.points,
        tasksCompleted: user.tasks_completed,
        currentStreak: 0, // TODO: Calculate from task completion dates
        longestStreak: 0   // TODO: Calculate from task completion dates
      };
    } catch (error) {
      console.error('Error fetching user stats:', error);
      return null;
    }
  },

  // Get leaderboard data
  async getLeaderboard(limit: number = 50): Promise<LeaderboardUser[]> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, points, level, tasks_completed')
        .order('points', { ascending: false })
        .limit(limit);

      if (error) throw error;

      // Add rank to each user
      return (data || []).map((user, index) => ({
        ...user,
        rank: index + 1
      }));
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      return [];
    }
  },

  // Get user's point transactions
  async getPointTransactions(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('point_transactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching point transactions:', error);
      return [];
    }
  }
};
