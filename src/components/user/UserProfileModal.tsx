import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ProfileBirdBadge } from '@/components/referral/ProfileBirdBadge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  User, 
  Trophy, 
  Users, 
  Calendar, 
  Activity,
  MessageSquare,
  UserPlus,
  UserMinus,
  Star
} from 'lucide-react';
import { toast } from 'sonner';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  bio?: string;
  profile_picture_url?: string;
  points: number;
  level: number;
  tasks_completed: number;
  followers_count: number;
  following_count: number;
  active_referrals_count: number;
  total_referrals_count: number;
  created_at: string;
  can_post_in_chat: boolean;
}

interface UserProfileModalProps {
  userId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  userId,
  isOpen,
  onClose
}) => {
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    if (userId && isOpen) {
      loadUserProfile();
      checkFollowStatus();
    }
  }, [userId, isOpen]);

  const loadUserProfile = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error loading user profile:', error);
        toast.error('Failed to load user profile');
        return;
      }

      setProfile(data);
    } catch (error) {
      console.error('Error loading user profile:', error);
      toast.error('Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };

  const checkFollowStatus = async () => {
    if (!userId || !currentUser?.id) return;

    try {
      const { data, error } = await supabase
        .from('user_followers')
        .select('id')
        .eq('follower_id', currentUser.id)
        .eq('following_id', userId)
        .single();

      if (!error && data) {
        setIsFollowing(true);
      }
    } catch (error) {
      // User is not following
      setIsFollowing(false);
    }
  };

  const handleFollow = async () => {
    if (!userId || !currentUser?.id || userId === currentUser.id) return;

    setFollowLoading(true);
    try {
      if (isFollowing) {
        // Unfollow
        const { error } = await supabase
          .from('user_followers')
          .delete()
          .eq('follower_id', currentUser.id)
          .eq('following_id', userId);

        if (error) throw error;
        
        setIsFollowing(false);
        toast.success('Unfollowed user');
      } else {
        // Follow
        const { error } = await supabase
          .from('user_followers')
          .insert({
            follower_id: currentUser.id,
            following_id: userId
          });

        if (error) throw error;
        
        setIsFollowing(true);
        toast.success('Following user');
      }
      
      // Reload profile to get updated follower count
      loadUserProfile();
    } catch (error) {
      console.error('Error updating follow status:', error);
      toast.error('Failed to update follow status');
    } finally {
      setFollowLoading(false);
    }
  };

  if (!profile && !loading) {
    return null;
  }

  const isOwnProfile = currentUser?.id === userId;
  const joinedDate = profile ? new Date(profile.created_at).toLocaleDateString() : '';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            User Profile
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="space-y-4">
            <div className="flex flex-col items-center space-y-3">
              <div className="w-20 h-20 bg-muted rounded-full animate-pulse" />
              <div className="h-6 w-32 bg-muted rounded animate-pulse" />
              <div className="h-4 w-24 bg-muted rounded animate-pulse" />
            </div>
          </div>
        ) : profile ? (
          <div className="space-y-4">
            {/* Profile Header */}
            <div className="flex flex-col items-center space-y-3">
              <div className="relative">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={profile.profile_picture_url} />
                  <AvatarFallback className="text-lg">
                    {profile.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-2 -right-2">
                  <ProfileBirdBadge userId={profile.id} size="sm" />
                </div>
              </div>
              
              <div className="text-center">
                <h3 className="text-lg font-semibold">{profile.name}</h3>
                {profile.bio && (
                  <p className="text-sm text-muted-foreground mt-1">{profile.bio}</p>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline">Level {profile.level}</Badge>
                  {profile.can_post_in_chat && (
                    <Badge variant="secondary">
                      <MessageSquare className="h-3 w-3 mr-1" />
                      Chat Verified
                    </Badge>
                  )}
                </div>
              </div>

              {/* Follow Button */}
              {!isOwnProfile && (
                <Button
                  variant={isFollowing ? "outline" : "default"}
                  size="sm"
                  onClick={handleFollow}
                  disabled={followLoading}
                  className="w-full"
                >
                  {followLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
                  ) : isFollowing ? (
                    <>
                      <UserMinus className="h-4 w-4 mr-2" />
                      Unfollow
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Follow
                    </>
                  )}
                </Button>
              )}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              <Card>
                <CardContent className="p-3 text-center">
                  <div className="flex items-center justify-center gap-1 text-yellow-600 mb-1">
                    <Trophy className="h-4 w-4" />
                  </div>
                  <div className="text-lg font-bold">{profile.points.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">Points</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-3 text-center">
                  <div className="flex items-center justify-center gap-1 text-green-600 mb-1">
                    <Activity className="h-4 w-4" />
                  </div>
                  <div className="text-lg font-bold">{profile.tasks_completed}</div>
                  <div className="text-xs text-muted-foreground">Tasks</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-3 text-center">
                  <div className="flex items-center justify-center gap-1 text-blue-600 mb-1">
                    <Users className="h-4 w-4" />
                  </div>
                  <div className="text-lg font-bold">{profile.followers_count}</div>
                  <div className="text-xs text-muted-foreground">Followers</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-3 text-center">
                  <div className="flex items-center justify-center gap-1 text-purple-600 mb-1">
                    <Star className="h-4 w-4" />
                  </div>
                  <div className="text-lg font-bold">{profile.active_referrals_count}</div>
                  <div className="text-xs text-muted-foreground">Referrals</div>
                </CardContent>
              </Card>
            </div>

            {/* Additional Info */}
            <div className="text-center text-sm text-muted-foreground">
              <div className="flex items-center justify-center gap-1">
                <Calendar className="h-3 w-3" />
                Joined {joinedDate}
              </div>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};