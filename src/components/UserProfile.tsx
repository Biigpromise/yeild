
import React, { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Edit2, Save, X, Camera, Trophy, Target, Flame, Calendar, MapPin, Link as LinkIcon, Upload, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { fileUploadService } from "@/services/fileUploadService";
import { useAuth } from "@/contexts/AuthContext";

interface UserProfileProps {
  user: {
    id: string;
    name: string;
    email: string;
    bio?: string;
    avatar?: string;
    level: number;
    points: number;
    tasksCompleted: number;
    currentStreak: number;
    longestStreak: number;
    joinDate: string;
    totalPointsEarned?: number;
    averageTaskRating?: number;
    favoriteCategory?: string;
    completionRate?: number;
  };
  onUpdate: (data: Partial<UserProfileProps['user']>) => void;
}

export const UserProfile = ({ user, onUpdate }: UserProfileProps) => {
  const { user: authUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editData, setEditData] = useState({
    name: user.name,
    bio: user.bio || "",
  });

  const handleSave = () => {
    onUpdate(editData);
    setIsEditing(false);
    toast({
      title: "Profile Updated",
      description: "Your profile has been successfully updated.",
    });
  };

  const handleCancel = () => {
    setEditData({ name: user.name, bio: user.bio || "" });
    setIsEditing(false);
  };

  const handleAvatarUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !authUser) return;

    setIsUploadingAvatar(true);
    try {
      const result = await fileUploadService.uploadProfilePicture(file, authUser.id);
      if (result) {
        onUpdate({ avatar: result.url });
        toast({
          title: "Profile Picture Updated",
          description: "Your profile picture has been updated successfully.",
        });
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
    } finally {
      setIsUploadingAvatar(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveAvatar = async () => {
    if (!user.avatar) return;
    
    // Extract file path from URL
    const url = new URL(user.avatar);
    const filePath = url.pathname.split('/').slice(-2).join('/'); // Get userId/filename part
    
    const success = await fileUploadService.deleteProfilePicture(filePath);
    if (success) {
      onUpdate({ avatar: '' });
      toast({
        title: "Profile Picture Removed",
        description: "Your profile picture has been removed.",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Main Profile Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Profile Information</CardTitle>
            {!isEditing ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                <Edit2 className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSave}>
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
                <Button variant="outline" size="sm" onClick={handleCancel}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-start gap-6">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="text-2xl">
                  {user.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-2 -right-2 flex gap-1">
                <Button
                  size="sm"
                  className="h-8 w-8 rounded-full"
                  onClick={handleAvatarUpload}
                  disabled={isUploadingAvatar}
                >
                  {isUploadingAvatar ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <Camera className="h-4 w-4" />
                  )}
                </Button>
                {user.avatar && (
                  <Button
                    size="sm"
                    variant="destructive"
                    className="h-8 w-8 rounded-full"
                    onClick={handleRemoveAvatar}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
            
            <div className="flex-1 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Full Name</label>
                  {isEditing ? (
                    <Input
                      value={editData.name}
                      onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                      className="mt-1"
                    />
                  ) : (
                    <p className="text-lg font-semibold mt-1">{user.name}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <p className="text-muted-foreground mt-1">{user.email}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Bio</label>
                {isEditing ? (
                  <Textarea
                    value={editData.bio}
                    onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                    placeholder="Tell us about yourself..."
                    className="mt-1"
                    rows={3}
                  />
                ) : (
                  <p className="text-muted-foreground mt-1">
                    {user.bio || "No bio provided yet."}
                  </p>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Key Stats */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Key Statistics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-muted rounded-lg">
                <Trophy className="h-6 w-6 mx-auto mb-2 text-yellow-500" />
                <p className="text-2xl font-bold">Level {user.level}</p>
                <p className="text-sm text-muted-foreground">Current Level</p>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <Target className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                <p className="text-2xl font-bold">{user.points.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Total Points</p>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <Trophy className="h-6 w-6 mx-auto mb-2 text-green-500" />
                <p className="text-2xl font-bold">{user.tasksCompleted}</p>
                <p className="text-sm text-muted-foreground">Tasks Completed</p>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <Flame className="h-6 w-6 mx-auto mb-2 text-orange-500" />
                <p className="text-2xl font-bold">{user.currentStreak}</p>
                <p className="text-sm text-muted-foreground">Current Streak</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Additional Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Additional Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Member Since</p>
                    <p className="text-sm text-muted-foreground">{formatDate(user.joinDate)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Flame className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Longest Streak</p>
                    <p className="text-sm text-muted-foreground">{user.longestStreak} days</p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                {user.totalPointsEarned && (
                  <div className="flex items-center gap-3">
                    <Target className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Total Points Earned</p>
                      <p className="text-sm text-muted-foreground">{user.totalPointsEarned.toLocaleString()}</p>
                    </div>
                  </div>
                )}
                {user.completionRate && (
                  <div className="flex items-center gap-3">
                    <Trophy className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Success Rate</p>
                      <p className="text-sm text-muted-foreground">{user.completionRate}%</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
