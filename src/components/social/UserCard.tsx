import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserPlus, UserMinus, Users, Heart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface UserProfile {
  id: string;
  name: string;
  profile_picture_url?: string;
  followers_count: number;
  following_count: number;
  tasks_completed: number;
  points: number;
}

interface UserCardProps {
  profile: UserProfile;
  isFollowing?: boolean;
  onFollowUpdate: () => void;
}

export const UserCard: React.FC<UserCardProps> = ({ profile, isFollowing = false, onFollowUpdate }) => {
  const { user } = useAuth();
  const [following, setFollowing] = useState(isFollowing);
  const [loading, setLoading] = useState(false);

  const handleFollow = async () => {
    if (!user) {
      toast.error('Please sign in to follow users');
      return;
    }

    if (user.id === profile.id) {
      toast.error("You can't follow yourself");
      return;
    }

    setLoading(true);

    try {
      if (following) {
        await supabase
          .from('user_followers')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', profile.id);
        
        setFollowing(false);
        toast.success(`Unfollowed ${profile.name}`);
      } else {
        await supabase
          .from('user_followers')
          .insert({
            follower_id: user.id,
            following_id: profile.id
          });
        
        setFollowing(true);
        toast.success(`Now following ${profile.name}`);
      }
      
      onFollowUpdate();
    } catch (error) {
      console.error('Error updating follow status:', error);
      toast.error('Failed to update follow status');
    } finally {
      setLoading(false);
    }
  };

  const isOwnProfile = user?.id === profile.id;

  return (
    <Card className="p-4">
      <div className="flex items-start gap-3">
        <Avatar className="h-12 w-12">
          <AvatarImage src={profile.profile_picture_url} />
          <AvatarFallback>
            {profile.name?.charAt(0).toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="font-semibold truncate">{profile.name || 'Anonymous User'}</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {profile.followers_count} followers
                </span>
                <span>·</span>
                <span>{profile.following_count} following</span>
              </div>
            </div>

            {!isOwnProfile && (
              <Button
                variant={following ? "outline" : "default"}
                size="sm"
                onClick={handleFollow}
                disabled={loading}
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current" />
                ) : following ? (
                  <>
                    <UserMinus className="h-3 w-3 mr-1" />
                    Unfollow
                  </>
                ) : (
                  <>
                    <UserPlus className="h-3 w-3 mr-1" />
                    Follow
                  </>
                )}
              </Button>
            )}
          </div>

          <div className="flex gap-2">
            <Badge variant="secondary" className="text-xs">
              {profile.points} points
            </Badge>
            <Badge variant="outline" className="text-xs">
              {profile.tasks_completed} tasks
            </Badge>
          </div>
        </div>
      </div>
    </Card>
  );
};