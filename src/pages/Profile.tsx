import React, { useState, useEffect } from 'react';
import { userService } from '@/services/userService';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Edit2, Camera, Save, X, User, Star, Trophy, Gift } from 'lucide-react';
import { fileUploadService } from '@/services/fileUploadService';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [editForm, setEditForm] = useState({
    name: '',
    bio: '',
    profile_picture_url: ''
  });

  useEffect(() => {
    if (user?.id) {
      loadProfile();
    }
  }, [user?.id]);

  const loadProfile = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      const profileData = await userService.getUserProfile(user.id);
      if (profileData) {
        setProfile(profileData);
        setEditForm({
          name: profileData.name || '',
          bio: profileData.bio || '',
          profile_picture_url: profileData.profile_picture_url || ''
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditForm({
      name: profile?.name || '',
      bio: profile?.bio || '',
      profile_picture_url: profile?.profile_picture_url || ''
    });
  };

  const handleSave = async () => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: editForm.name,
          bio: editForm.bio,
          profile_picture_url: editForm.profile_picture_url
        })
        .eq('id', user.id);

      if (error) throw error;

      setProfile(prev => ({
        ...prev,
        name: editForm.name,
        bio: editForm.bio,
        profile_picture_url: editForm.profile_picture_url
      }));

      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    try {
      const result = await fileUploadService.uploadProfilePicture(file, user.id);
      if (result && result.url) {
        setEditForm(prev => ({
          ...prev,
          profile_picture_url: result.url
        }));
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center">Loading profile...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center">Profile not found</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <User className="h-6 w-6" />
              Profile
            </CardTitle>
            {!isEditing && (
              <Button onClick={handleEdit} variant="outline">
                <Edit2 className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Profile Picture and Basic Info */}
          <div className="flex items-center gap-6">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage 
                  src={isEditing ? editForm.profile_picture_url : profile.profile_picture_url} 
                />
                <AvatarFallback className="text-lg">
                  {profile.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              {isEditing && (
                <label className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-2 cursor-pointer hover:bg-primary/80">
                  <Camera className="h-4 w-4" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-2">
                  <Input
                    value={editForm.name}
                    onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter your name"
                  />
                  <Textarea
                    value={editForm.bio}
                    onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                    placeholder="Tell us about yourself..."
                    rows={3}
                  />
                </div>
              ) : (
                <div>
                  <h2 className="text-2xl font-bold">{profile.name || 'Anonymous User'}</h2>
                  <p className="text-muted-foreground">{profile.email}</p>
                  {profile.bio && (
                    <p className="mt-2 text-sm">{profile.bio}</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons for Editing */}
          {isEditing && (
            <div className="flex gap-2">
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
              <Button onClick={handleCancel} variant="outline">
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          )}

          {/* Profile Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Trophy className="h-8 w-8 text-yellow-500" />
                </div>
                <div className="text-2xl font-bold">{profile.points || 0}</div>
                <div className="text-sm text-muted-foreground">Points</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Star className="h-8 w-8 text-blue-500" />
                </div>
                <div className="text-2xl font-bold">Level {profile.level || 1}</div>
                <div className="text-sm text-muted-foreground">Current Level</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Gift className="h-8 w-8 text-green-500" />
                </div>
                <div className="text-2xl font-bold">{profile.tasks_completed || 0}</div>
                <div className="text-sm text-muted-foreground">Tasks Completed</div>
              </CardContent>
            </Card>
          </div>

          {/* Social Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-xl font-bold">{profile.followers_count || 0}</div>
                <div className="text-sm text-muted-foreground">Followers</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-xl font-bold">{profile.following_count || 0}</div>
                <div className="text-sm text-muted-foreground">Following</div>
              </CardContent>
            </Card>
          </div>

          {/* Referral Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Referral Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-xl font-bold">{profile.active_referrals_count || 0}</div>
                  <div className="text-sm text-muted-foreground">Active Referrals</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold">{profile.total_referrals_count || 0}</div>
                  <div className="text-sm text-muted-foreground">Total Referrals</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};
