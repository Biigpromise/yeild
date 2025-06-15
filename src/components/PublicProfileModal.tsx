
import React, { useState, useEffect } from 'react';
import { userService, UserProfile } from '@/services/userService';
import { useAuth } from '@/contexts/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from '@/components/ui/button';
import { Calendar, Target, Trophy, Users, UserPlus, UserCheck } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface PublicProfileModalProps {
  userId: string | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export const PublicProfileModal: React.FC<PublicProfileModalProps> = ({ userId, isOpen, onOpenChange }) => {
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState<Partial<UserProfile> | null>(null);
  const [loading, setLoading] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);

  useEffect(() => {
    if (isOpen && userId) {
      const fetchProfile = async () => {
        setLoading(true);
        setProfile(null);
        setIsFollowing(false);
        try {
          const userProfile = await userService.getUserProfileById(userId);
          setProfile(userProfile);

          if (currentUser && userId && currentUser.id !== userId) {
            setIsFollowLoading(true);
            const following = await userService.isFollowing(userId);
            setIsFollowing(following);
            setIsFollowLoading(false);
          }
        } catch (err) {
          console.error("Failed to fetch user profile.", err);
        } finally {
          setLoading(false);
        }
      };

      fetchProfile();
    }
  }, [isOpen, userId, currentUser]);
  
  const handleFollowToggle = async () => {
    if (!currentUser || !userId || isFollowLoading) return;

    setIsFollowLoading(true);
    const success = isFollowing 
      ? await userService.unfollowUser(userId)
      : await userService.followUser(userId);

    if (success) {
      setIsFollowing(!isFollowing);
      setProfile(prevProfile => {
        if (!prevProfile) return null;
        const newFollowersCount = isFollowing
          ? (prevProfile.followers_count ?? 1) - 1
          : (prevProfile.followers_count ?? 0) + 1;
        return { ...prevProfile, followers_count: newFollowersCount };
      });
    }
    setIsFollowLoading(false);
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>User Profile</DialogTitle>
          <DialogDescription>
            Public profile and statistics.
          </DialogDescription>
        </DialogHeader>
        {loading ? (
          <div className="space-y-4 py-4">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-16 w-16 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 pt-4 mt-4 border-t">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
            </div>
          </div>
        ) : profile ? (
          <div className="py-4 space-y-6">
            <div className="flex items-start gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profile.profile_picture_url || undefined} alt={profile.name || ''} />
                <AvatarFallback className="text-2xl">
                    {profile.name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <div className="flex justify-between items-start">
                    <h2 className="text-2xl font-bold">{profile.name}</h2>
                    {currentUser && userId && currentUser.id !== userId && (
                        <Button 
                            onClick={handleFollowToggle} 
                            disabled={isFollowLoading}
                            variant={isFollowing ? 'outline' : 'default'}
                            size="sm"
                        >
                            {isFollowLoading ? '...' : isFollowing ? (
                                <><UserCheck className="mr-2 h-4 w-4" /> Following</>
                            ) : (
                                <><UserPlus className="mr-2 h-4 w-4" /> Follow</>
                            )}
                        </Button>
                    )}
                </div>
                <p className="text-muted-foreground">
                    {profile.bio || "This user hasn't set a bio yet."}
                </p>
                <div className="flex items-center gap-6 text-sm text-muted-foreground pt-2">
                  <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span><span className="font-bold">{profile.followers_count ?? 0}</span> followers</span>
                  </div>
                  <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span><span className="font-bold">{profile.following_count ?? 0}</span> following</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground pt-2">
                    <Calendar className="h-4 w-4" />
                    <span>Joined on {formatDate(profile.created_at)}</span>
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Key Statistics</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-muted rounded-lg">
                        <Trophy className="h-6 w-6 mx-auto mb-2 text-yellow-500" />
                        <p className="text-2xl font-bold">Level {profile.level}</p>
                        <p className="text-sm text-muted-foreground">Current Level</p>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                        <Target className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                        <p className="text-2xl font-bold">{(profile.points || 0).toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">Total Points</p>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                        <Trophy className="h-6 w-6 mx-auto mb-2 text-green-500" />
                        <p className="text-2xl font-bold">{profile.tasks_completed}</p>
                        <p className="text-sm text-muted-foreground">Tasks Completed</p>
                    </div>
                </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-muted-foreground">Could not load user profile.</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
