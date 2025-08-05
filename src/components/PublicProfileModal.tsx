
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { ProfileBirdBadge } from '@/components/referral/ProfileBirdBadge';
import { UserNameWithBird } from '@/components/referral/UserNameWithBird';
import { Users, Trophy, Star, Calendar, Target, Flame, UserPlus, UserMinus } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  profile_picture_url?: string;
  bio?: string;
  points: number;
  level: number;
  tasks_completed: number;
  active_referrals_count: number;
  total_referrals_count: number;
  created_at: string;
  followers_count: number;
  following_count: number;
  current_streak?: number;
  longest_streak?: number;
}

interface PublicProfileModalProps {
  userId: string | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PublicProfileModal: React.FC<PublicProfileModalProps> = ({
  userId,
  isOpen,
  onOpenChange
}) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
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
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error('Profile not found');
      setProfile(data);
    } catch (error) {
      console.error('Error loading user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkFollowStatus = async () => {
    if (!user || !userId || user.id === userId) return;

    try {
      const { data } = await supabase
        .from('user_followers')
        .select('id')
        .eq('follower_id', user.id)
        .eq('following_id', userId)
        .maybeSingle();

      setIsFollowing(!!data);
    } catch (error) {
      // Not following, which is fine
    }
  };

  const handleFollowToggle = async () => {
    if (!user || !userId || user.id === userId) return;

    setFollowLoading(true);
    try {
      if (isFollowing) {
        await supabase
          .from('user_followers')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', userId);
        
        setIsFollowing(false);
        toast.success(`Unfollowed ${profile?.name}`);
      } else {
        await supabase
          .from('user_followers')
          .insert({
            follower_id: user.id,
            following_id: userId
          });
        
        setIsFollowing(true);
        toast.success(`Now following ${profile?.name}`);
      }
    } catch (error) {
      console.error('Error updating follow status:', error);
      toast.error('Failed to update follow status');
    } finally {
      setFollowLoading(false);
    }
  };

  if (!isOpen || !userId) return null;

  const isOwnProfile = user?.id === userId;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>User Profile</span>
            {!isOwnProfile && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Create a private chat - navigate to messaging with user
                    window.location.href = `/messaging?user=${userId}`;
                    onOpenChange(false);
                  }}
                >
                  Message
                </Button>
                <Button
                  variant={isFollowing ? "outline" : "default"}
                  size="sm"
                  onClick={handleFollowToggle}
                  disabled={followLoading}
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
              </div>
            )}
          </DialogTitle>
        </DialogHeader>
        
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : profile ? (
          <div className="space-y-6">
            {/* Profile Header */}
            <div className="flex flex-col md:flex-row items-center gap-4">
              <Avatar className="h-24 w-24 md:h-32 md:w-32">
                <AvatarImage src={profile.profile_picture_url} />
                <AvatarFallback className="text-2xl">
                  {profile.name?.charAt(0)?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row items-center gap-3 mb-3">
                  <UserNameWithBird 
                    userId={profile.id} 
                    userName={profile.name || 'User'} 
                    size="md"
                    className="text-2xl font-bold"
                  />
                </div>
                
                {profile.bio && (
                  <p className="text-muted-foreground mb-3 max-w-md">{profile.bio}</p>
                )}
                
                <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Joined {formatDistanceToNow(new Date(profile.created_at), { addSuffix: true })}
                  </span>
                  <Badge variant="secondary">Level {profile.level}</Badge>
                </div>
              </div>
            </div>

            {/* Social Stats */}
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Users className="h-5 w-5 text-blue-500" />
                    <span className="text-xl font-bold">{profile.followers_count}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">Followers</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Users className="h-5 w-5 text-green-500" />
                    <span className="text-xl font-bold">{profile.following_count}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">Following</div>
                </CardContent>
              </Card>
            </div>

            {/* Activity Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Target className="h-6 w-6 text-primary" />
                  </div>
                  <div className="text-2xl font-bold">{profile.points.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Points</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Trophy className="h-6 w-6 text-yellow-500" />
                  </div>
                  <div className="text-2xl font-bold">{profile.tasks_completed}</div>
                  <div className="text-sm text-muted-foreground">Tasks Done</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Flame className="h-6 w-6 text-orange-500" />
                  </div>
                  <div className="text-2xl font-bold">{profile.current_streak || 0}</div>
                  <div className="text-sm text-muted-foreground">Current Streak</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Star className="h-6 w-6 text-purple-500" />
                  </div>
                  <div className="text-2xl font-bold">{profile.longest_streak || 0}</div>
                  <div className="text-sm text-muted-foreground">Best Streak</div>
                </CardContent>
              </Card>
            </div>

            {/* Referral Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Referral Achievement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-primary">{profile.total_referrals_count}</div>
                    <div className="text-sm text-muted-foreground">Total Referrals</div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{profile.active_referrals_count}</div>
                    <div className="text-sm text-muted-foreground">Active Referrals</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Bird Badge Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Achievement Badge
                </CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center">
                <ProfileBirdBadge userId={profile.id} size="lg" showName />
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="text-center py-8">
            <p>Unable to load profile information.</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
