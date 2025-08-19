import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Calendar, Star, TrendingUp } from 'lucide-react';
import { userService, UserProfile } from '@/services/userService';
import { ProfileBirdBadge } from '@/components/referral/ProfileBirdBadge';

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
      const data = await userService.getUserProfile(userId);
      setProfile(data);
    } catch (error) {
      console.error('Error loading user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !userId) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>User Profile</DialogTitle>
        </DialogHeader>
        
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : profile ? (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <div className="relative inline-block">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={profile.profile_picture_url} />
                  <AvatarFallback className="text-2xl">
                    {profile.name?.charAt(0)?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-2 -right-2">
                  <ProfileBirdBadge userId={profile.id} size="lg" />
                </div>
              </div>
              
              <div>
                <h2 className="text-xl font-bold">{profile.name}</h2>
                {profile.bio && (
                  <p className="text-sm text-muted-foreground mt-1">{profile.bio}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm font-medium">Points</span>
                  </div>
                  <div className="text-2xl font-bold">{profile.points}</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium">Level</span>
                  </div>
                  <div className="text-2xl font-bold">{profile.level}</div>
                </CardContent>
              </Card>
            </div>

            <Button variant="outline" onClick={onClose} className="w-full">
              Close
            </Button>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>Profile not found</p>
            <Button variant="outline" onClick={onClose} className="mt-4">
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};