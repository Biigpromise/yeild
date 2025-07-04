
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { ProfileBirdBadge } from '@/components/referral/ProfileBirdBadge';
import { BirdProgression } from '@/components/referral/BirdProgression';
import { Users, Trophy, Star, Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

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
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userId && isOpen) {
      loadUserProfile();
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
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !userId) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>User Profile</DialogTitle>
        </DialogHeader>
        
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : profile ? (
          <div className="space-y-6">
            {/* Profile Header */}
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={profile.profile_picture_url} />
                <AvatarFallback className="text-2xl">
                  {profile.name?.charAt(0)?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold">{profile.name || 'User'}</h2>
                  <ProfileBirdBadge userId={profile.id} size="md" showName />
                </div>
                
                {profile.bio && (
                  <p className="text-muted-foreground mb-2">{profile.bio}</p>
                )}
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Joined {formatDistanceToNow(new Date(profile.created_at), { addSuffix: true })}
                  </span>
                </div>
              </div>
            </div>

            {/* Social Stats - Moved to top */}
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Users className="h-5 w-5 text-blue-500" />
                    <span className="text-lg font-semibold">{profile.followers_count}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">Followers</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Users className="h-5 w-5 text-green-500" />
                    <span className="text-lg font-semibold">{profile.following_count}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">Following</div>
                </CardContent>
              </Card>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary">{profile.points}</div>
                  <div className="text-sm text-muted-foreground">Points</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{profile.tasks_completed}</div>
                  <div className="text-sm text-muted-foreground">Tasks Done</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{profile.active_referrals_count}</div>
                  <div className="text-sm text-muted-foreground">Active Referrals</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">{profile.level}</div>
                  <div className="text-sm text-muted-foreground">Level</div>
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
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Total Referrals:</span>
                    <Badge variant="secondary">{profile.total_referrals_count}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Active Referrals:</span>
                    <Badge variant="default">{profile.active_referrals_count}</Badge>
                  </div>
                </div>
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
