
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Camera, Edit3, Save, X, Copy, Check } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useBirdLevel } from '@/hooks/useBirdLevel';

export const ProfileTab: React.FC = () => {
  const { user } = useAuth();
  const { currentBird, userStats } = useBirdLevel();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const [profile, setProfile] = useState({
    name: '',
    bio: '',
    profile_picture_url: '',
    referral_code: '',
    social_media_links: [] as string[]
  });

  const [editForm, setEditForm] = useState(profile);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      const profileData = {
        name: data.name || '',
        bio: data.bio || '',
        profile_picture_url: data.profile_picture_url || '',
        referral_code: data.referral_code || '',
        social_media_links: data.social_media_links || []
      };

      setProfile(profileData);
      setEditForm(profileData);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: editForm.name,
          bio: editForm.bio,
          social_media_links: editForm.social_media_links
        })
        .eq('id', user.id);

      if (error) throw error;

      setProfile(editForm);
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditForm(profile);
    setIsEditing(false);
  };

  const copyReferralCode = async () => {
    if (profile.referral_code) {
      try {
        await navigator.clipboard.writeText(profile.referral_code);
        setCopied(true);
        toast.success('Referral code copied to clipboard!');
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        toast.error('Failed to copy referral code');
      }
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}.${fileExt}`;
      const filePath = `profile-pictures/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('profile-pictures')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ profile_picture_url: data.publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setProfile(prev => ({ ...prev, profile_picture_url: data.publicUrl }));
      toast.success('Profile picture updated!');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to update profile picture');
    }
  };

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-6">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profile.profile_picture_url} />
                <AvatarFallback className="text-lg">
                  {profile.name ? profile.name.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-2 -right-2">
                <Label htmlFor="avatar-upload" className="cursor-pointer">
                  <div className="bg-primary text-primary-foreground p-2 rounded-full hover:bg-primary/80 transition-colors">
                    <Camera className="h-4 w-4" />
                  </div>
                </Label>
                <Input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-bold">{profile.name || 'Anonymous User'}</h2>
                {!isEditing && (
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-2 mb-3">
                {currentBird && (
                  <Badge className="bg-primary/10 text-primary border-primary/20">
                    {currentBird.emoji} {currentBird.name}
                  </Badge>
                )}
                <Badge variant="outline">
                  {userStats.points} points
                </Badge>
                <Badge variant="outline">
                  {userStats.tasksCompleted} tasks completed
                </Badge>
              </div>

              <p className="text-muted-foreground">
                {profile.bio || 'No bio added yet. Click edit to add one!'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Referral Code */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Your Referral Code</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <div className="flex-1 p-3 bg-muted rounded-lg font-mono text-lg font-semibold">
              {profile.referral_code || 'Loading...'}
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={copyReferralCode}
              disabled={!profile.referral_code}
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Share this code with friends to earn referral bonuses when they complete tasks!
          </p>
        </CardContent>
      </Card>

      {/* Edit Form */}
      {isEditing && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Edit Profile
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleCancel}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSave} disabled={loading}>
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Display Name</Label>
              <Input
                id="name"
                value={editForm.name}
                onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter your display name"
              />
            </div>

            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={editForm.bio}
                onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                placeholder="Tell us about yourself..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary mb-1">{userStats.points}</div>
            <div className="text-sm text-muted-foreground">Total Points</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">{userStats.tasksCompleted}</div>
            <div className="text-sm text-muted-foreground">Tasks Completed</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">{userStats.referrals}</div>
            <div className="text-sm text-muted-foreground">Referrals</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
