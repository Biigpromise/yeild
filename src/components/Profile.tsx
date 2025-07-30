import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  MapPin, 
  Calendar, 
  Trophy, 
  Star, 
  Edit, 
  Save, 
  X,
  Camera,
  Mail,
  Globe
} from "lucide-react";
import { toast } from "sonner";
import { fileUploadService } from "@/services/fileUploadService";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  bio: string;
  profile_picture_url: string;
  points: number;
  level: number;
  tasks_completed: number;
  created_at: string;
  social_media_links: string[] | null;
  followers_count: number;
  following_count: number;
}

const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [editedProfile, setEditedProfile] = useState<Partial<UserProfile>>({});
  const [bioCharCount, setBioCharCount] = useState(0);

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error('Profile not found');

      const profileData: UserProfile = {
        id: data.id,
        name: data.name || '',
        email: data.email || '',
        bio: data.bio || '',
        profile_picture_url: data.profile_picture_url || '',
        points: data.points || 0,
        level: data.level || 1,
        tasks_completed: data.tasks_completed || 0,
        created_at: data.created_at || '',
        social_media_links: data.social_media_links || null,
        followers_count: data.followers_count || 0,
        following_count: data.following_count || 0
      };

      setProfile(profileData);
      setEditedProfile(profileData);
      setBioCharCount(profileData.bio?.length || 0);
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setEditing(true);
    setEditedProfile(profile || {});
  };

  const handleCancel = () => {
    setEditing(false);
    setEditedProfile(profile || {});
    setBioCharCount(profile?.bio?.length || 0);
  };

  const handleBioChange = (value: string) => {
    if (value.length <= 150) {
      setEditedProfile(prev => ({ ...prev, bio: value }));
      setBioCharCount(value.length);
    } else {
      toast.error("Bio cannot exceed 150 characters");
    }
  };

  const handleSave = async () => {
    if (!user || !profile) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: editedProfile.name,
          bio: editedProfile.bio,
          social_media_links: editedProfile.social_media_links || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      setProfile(prev => ({ ...prev!, ...editedProfile }));
      setEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setUploadingImage(true);
    try {
      const result = await fileUploadService.uploadProfilePicture(file, user.id);
      
      if (!result) {
        toast.error('Failed to upload profile picture');
        return;
      }
      
      const { error } = await supabase
        .from('profiles')
        .update({ profile_picture_url: result.url })
        .eq('id', user.id);

      if (error) throw error;

      setProfile(prev => ({ ...prev!, profile_picture_url: result.url }));
      toast.success('Profile picture updated');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-muted rounded-full"></div>
                <div className="space-y-2">
                  <div className="h-6 bg-muted rounded w-40"></div>
                  <div className="h-4 bg-muted rounded w-32"></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold">Profile not found</h3>
        <p className="text-muted-foreground">Unable to load profile data</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="relative">
              <Avatar className="w-24 h-24">
                <AvatarImage src={profile.profile_picture_url} />
                <AvatarFallback className="text-2xl">
                  {profile.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <label className="absolute bottom-0 right-0 bg-primary text-primary-foreground p-2 rounded-full cursor-pointer hover:bg-primary/90 transition-colors">
                <Camera className="h-4 w-4" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={uploadingImage}
                />
              </label>
              {uploadingImage && (
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                </div>
              )}
            </div>

            <div className="flex-1 space-y-1">
              {editing ? (
                <Input
                  value={editedProfile.name || ''}
                  onChange={(e) => setEditedProfile(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Your name"
                  className="text-lg font-semibold"
                />
              ) : (
                <h1 className="text-2xl font-bold">{profile.name}</h1>
              )}
              
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>{profile.email}</span>
              </div>
              
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Joined {new Date(profile.created_at).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="flex gap-2">
              {editing ? (
                <>
                  <Button onClick={handleSave} disabled={saving} size="sm">
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? 'Saving...' : 'Save'}
                  </Button>
                  <Button onClick={handleCancel} variant="outline" size="sm">
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </>
              ) : (
                <Button onClick={handleEdit} variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Trophy className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
            <div className="text-2xl font-bold">{profile.points}</div>
            <div className="text-sm text-muted-foreground">Points</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Star className="h-8 w-8 mx-auto mb-2 text-blue-500" />
            <div className="text-2xl font-bold">Level {profile.level}</div>
            <div className="text-sm text-muted-foreground">Current Level</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <User className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <div className="text-2xl font-bold">{profile.tasks_completed}</div>
            <div className="text-sm text-muted-foreground">Tasks Completed</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex justify-center gap-4 mb-2">
              <div className="text-center">
                <div className="font-bold">{profile.followers_count}</div>
                <div className="text-xs text-muted-foreground">Followers</div>
              </div>
              <div className="text-center">
                <div className="font-bold">{profile.following_count}</div>
                <div className="text-xs text-muted-foreground">Following</div>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">Social</div>
          </CardContent>
        </Card>
      </div>

      {/* Bio Section */}
      <Card>
        <CardHeader>
          <CardTitle>Tell us about yourself</CardTitle>
        </CardHeader>
        <CardContent>
          {editing ? (
            <div className="space-y-2">
              <Textarea
                value={editedProfile.bio || ''}
                onChange={(e) => handleBioChange(e.target.value)}
                placeholder="Tell us about yourself... (max 150 characters)"
                rows={4}
                maxLength={150}
              />
              <div className="flex justify-between items-center text-sm text-muted-foreground">
                <span>Share your interests, goals, or anything you'd like others to know</span>
                <span className={`${bioCharCount > 140 ? 'text-destructive' : ''}`}>
                  {bioCharCount}/150
                </span>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">
              {profile.bio || 'No bio added yet. Click "Edit Profile" to add one.'}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
