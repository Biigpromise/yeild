import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  MessageCircle, 
  UserPlus, 
  Trophy, 
  Target, 
  Calendar, 
  Star,
  Award,
  Crown,
  Zap
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
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
  created_at: string;
  followers_count: number;
  following_count: number;
  task_completion_rate: number;
}

interface UserProfileModalProps {
  userId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onMessage?: (userId: string) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  userId,
  isOpen,
  onClose,
  onMessage
}) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

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

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error loading user profile:', error);
      toast.error('Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };

  const checkFollowStatus = async () => {
    // For now, we'll skip the follow functionality since user_follows table doesn't exist
    setIsFollowing(false);
  };

  const handleFollow = async () => {
    try {
      // For now, we'll show a placeholder message
      toast.info('Follow functionality coming soon!');
    } catch (error) {
      console.error('Error toggling follow:', error);
      toast.error('Failed to update follow status');
    }
  };

  const handleMessage = () => {
    if (onMessage && userId) {
      onMessage(userId);
      onClose();
    }
  };

  const getLevelColor = (level: number) => {
    if (level >= 50) return 'text-purple-500';
    if (level >= 25) return 'text-blue-500';
    if (level >= 10) return 'text-green-500';
    return 'text-gray-500';
  };

  const getLevelBadge = (level: number) => {
    if (level >= 50) return <Crown className="h-4 w-4 text-purple-500" />;
    if (level >= 25) return <Award className="h-4 w-4 text-blue-500" />;
    if (level >= 10) return <Star className="h-4 w-4 text-green-500" />;
    return <Zap className="h-4 w-4 text-gray-500" />;
  };

  if (!userId) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>User Profile</DialogTitle>
        </DialogHeader>
        
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-pulse text-muted-foreground">Loading profile...</div>
          </div>
        ) : profile ? (
          <div className="space-y-6">
            {/* Profile Header */}
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20 border-4 border-primary/20">
                <AvatarImage src={profile.profile_picture_url} />
                <AvatarFallback className="text-lg font-bold bg-primary/10">
                  {profile.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-xl font-bold">{profile.name}</h3>
                  {getLevelBadge(profile.level)}
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary" className={getLevelColor(profile.level)}>
                    Level {profile.level}
                  </Badge>
                  <Badge variant="outline">
                    {profile.points.toLocaleString()} points
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{profile.followers_count} followers</span>
                  <span>{profile.following_count} following</span>
                </div>
              </div>
            </div>

            {/* Bio */}
            {profile.bio && (
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">{profile.bio}</p>
                </CardContent>
              </Card>
            )}

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-3 text-center">
                  <Trophy className="h-5 w-5 mx-auto mb-1 text-yellow-500" />
                  <div className="text-lg font-bold">{profile.tasks_completed}</div>
                  <div className="text-xs text-muted-foreground">Tasks</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-3 text-center">
                  <Target className="h-5 w-5 mx-auto mb-1 text-green-500" />
                  <div className="text-lg font-bold">{profile.task_completion_rate.toFixed(0)}%</div>
                  <div className="text-xs text-muted-foreground">Success</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-3 text-center">
                  <Calendar className="h-5 w-5 mx-auto mb-1 text-blue-500" />
                  <div className="text-lg font-bold">
                    {new Date(profile.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </div>
                  <div className="text-xs text-muted-foreground">Joined</div>
                </CardContent>
              </Card>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button 
                onClick={handleFollow}
                variant={isFollowing ? "secondary" : "default"}
                className="flex-1"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                {isFollowing ? 'Following' : 'Follow'}
              </Button>
              <Button 
                onClick={handleMessage}
                variant="outline"
                className="flex-1"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Message
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center p-8 text-muted-foreground">
            User profile not found
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};