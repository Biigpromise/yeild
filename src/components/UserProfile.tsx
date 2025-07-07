
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { fileUploadService } from "@/services/fileUploadService";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Camera, 
  Trash2, 
  Edit, 
  Save, 
  X, 
  Trophy, 
  Target, 
  Flame, 
  Calendar,
  User,
  Mail,
  Award
} from "lucide-react";
import { ProfileBirdDisplay } from '@/components/profile/ProfileBirdDisplay';

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
    followers_count: number;
    following_count: number;
    active_referrals_count: number;
    total_referrals_count: number;
  };
  onUpdate: (data: Partial<UserProfileProps['user']>) => void;
}

export const UserProfile = ({ user, onUpdate }: UserProfileProps) => {
  const { user: authUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [editData, setEditData] = useState({
    name: user.name,
    bio: user.bio || "",
  });

  const bioCharCount = editData.bio.length;
  const maxChars = 150;

  const handleSave = () => {
    if (bioCharCount > maxChars) {
      toast({
        title: "Bio too long",
        description: `Please keep your bio to ${maxChars} characters or less. Current: ${bioCharCount} characters.`,
        variant: "destructive",
      });
      return;
    }

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
      toast({
        title: "Upload Failed",
        description: "Failed to upload profile picture. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleRemoveAvatar = async () => {
    if (!user.avatar) return;
    
    const url = new URL(user.avatar);
    const filePath = url.pathname.split('/').slice(-2).join('/');
    
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
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Main Profile Card */}
      <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 shadow-xl">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              <User className="h-6 w-6 text-blue-400" />
              <CardTitle className="text-2xl font-bold text-white">My Profile</CardTitle>
            </div>
            
            {!isEditing ? (
              <Button 
                onClick={() => setIsEditing(true)}
                variant="outline" 
                size="sm"
                className="border-gray-600 text-white hover:bg-gray-700"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button onClick={handleSave} size="sm" className="bg-blue-600 hover:bg-blue-700">
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
                <Button onClick={handleCancel} variant="outline" size="sm" className="border-gray-600 text-white hover:bg-gray-700">
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Profile Picture and Basic Info */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Avatar Section */}
            <div className="relative group">
              <Avatar className="h-32 w-32 border-4 border-gray-600 shadow-lg">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="text-3xl bg-gray-700 text-white font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleFileSelect}
                className="hidden"
                id="avatar-upload"
              />
              
              <div className="absolute -bottom-2 -right-2 flex gap-1">
                <Button
                  size="sm"
                  className="h-10 w-10 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
                  onClick={() => document.getElementById('avatar-upload')?.click()}
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
                    className="h-10 w-10 rounded-full shadow-lg"
                    onClick={handleRemoveAvatar}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Profile Information */}
            <div className="flex-1 space-y-4 w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name" className="text-white font-medium">Full Name</Label>
                  {isEditing ? (
                    <Input
                      id="name"
                      value={editData.name}
                      onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                      className="mt-1 bg-gray-800 border-gray-600 text-white focus:border-blue-500"
                      placeholder="Enter your name"
                    />
                  ) : (
                    <p className="text-xl font-bold text-white mt-1">{user.name}</p>
                  )}
                </div>

                <div>
                  <Label className="text-white font-medium flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email Address
                  </Label>
                  <p className="text-gray-300 mt-1">{user.email}</p>
                </div>
              </div>

              <div>
                <Label htmlFor="bio" className="text-white font-medium">Bio</Label>
                {isEditing ? (
                  <div>
                    <Textarea
                      id="bio"
                      value={editData.bio}
                      onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                      placeholder="Tell us about yourself..."
                      className="mt-1 bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-500"
                      rows={3}
                    />
                    <div className="text-right mt-1">
                      <span className={`text-sm ${bioCharCount > maxChars ? 'text-red-400' : 'text-gray-400'}`}>
                        {bioCharCount}/{maxChars}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-300 mt-1">{user.bio || "No bio added yet"}</p>
                )}
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Joined {formatDate(user.joinDate)}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-gray-300"><strong>{user.followers_count}</strong> followers</span>
                  <span className="text-gray-300"><strong>{user.following_count}</strong> following</span>
                </div>
              </div>
            </div>
          </div>

          <Separator className="bg-gray-700" />

          {/* Profile Stats */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-500" />
              Profile Statistics
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gradient-to-br from-blue-600/20 to-blue-800/20 rounded-lg border border-blue-500/30">
                <Trophy className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
                <div className="text-2xl font-bold text-white">{user.level}</div>
                <div className="text-sm text-gray-400">Level</div>
              </div>
              
              <div className="text-center p-4 bg-gradient-to-br from-green-600/20 to-green-800/20 rounded-lg border border-green-500/30">
                <Target className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                <div className="text-2xl font-bold text-white">{user.points.toLocaleString()}</div>
                <div className="text-sm text-gray-400">Points</div>
              </div>
              
              <div className="text-center p-4 bg-gradient-to-br from-purple-600/20 to-purple-800/20 rounded-lg border border-purple-500/30">
                <Calendar className="h-8 w-8 mx-auto mb-2 text-green-500" />
                <div className="text-2xl font-bold text-white">{user.tasksCompleted}</div>
                <div className="text-sm text-gray-400">Tasks Done</div>
              </div>
              
              <div className="text-center p-4 bg-gradient-to-br from-orange-600/20 to-orange-800/20 rounded-lg border border-orange-500/30">
                <Flame className="h-8 w-8 mx-auto mb-2 text-orange-500" />
                <div className="text-2xl font-bold text-white">{user.currentStreak}</div>
                <div className="text-sm text-gray-400">Current Streak</div>
              </div>
            </div>
          </div>

          <Separator className="bg-gray-700" />

          {/* Additional Information */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Additional Information</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Longest streak:</span>
                <p className="font-medium text-white">{user.longestStreak} days</p>
              </div>
              
              {user.totalPointsEarned && (
                <div>
                  <span className="text-gray-400">Total earned:</span>
                  <p className="font-medium text-white">{user.totalPointsEarned.toLocaleString()} points</p>
                </div>
              )}
              
              {user.averageTaskRating && (
                <div>
                  <span className="text-gray-400">Avg. rating:</span>
                  <p className="font-medium text-white">{user.averageTaskRating}/5.0</p>
                </div>
              )}
              
              {user.favoriteCategory && (
                <div>
                  <span className="text-gray-400">Favorite category:</span>
                  <Badge variant="secondary" className="mt-1 bg-gray-700 text-white">
                    {user.favoriteCategory}
                  </Badge>
                </div>
              )}
              
              {user.completionRate && (
                <div>
                  <span className="text-gray-400">Success rate:</span>
                  <p className="font-medium text-white">{user.completionRate}%</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bird Badge Display with Enhanced Features */}
      <ProfileBirdDisplay 
        userId={user.id}
        activeReferrals={user.active_referrals_count}
        totalReferrals={user.total_referrals_count}
      />

      {/* Bird Level Benefits Card */}
      <Card className="bg-gradient-to-br from-indigo-900/50 to-purple-900/50 border-indigo-500/30 shadow-xl">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
            <Trophy className="h-6 w-6 text-yellow-500" />
            Your Bird Tier Benefits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white/10 rounded-lg p-4">
              <h4 className="font-semibold text-white mb-2">Current Tier Perks</h4>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• Priority task access</li>
                <li>• Enhanced profile visibility</li>
                <li>• Exclusive community features</li>
              </ul>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <h4 className="font-semibold text-white mb-2">Next Tier Preview</h4>
              <p className="text-sm text-gray-300">
                Keep growing to unlock VIP status, premium rewards, and exclusive perks!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
