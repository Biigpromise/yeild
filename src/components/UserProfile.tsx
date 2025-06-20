
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { fileUploadService } from "@/services/fileUploadService";
import { useAuth } from "@/contexts/AuthContext";
import { ProfileHeader } from "./profile/ProfileHeader";
import { ProfileAvatar } from "./profile/ProfileAvatar";
import { ProfileForm } from "./profile/ProfileForm";
import { ProfileStats } from "./profile/ProfileStats";
import { ProfileAdditionalInfo } from "./profile/ProfileAdditionalInfo";

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

  // Count words in bio
  const countWords = (text: string) => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const bioWordCount = countWords(editData.bio);
  const maxWords = 90;

  const handleSave = () => {
    if (bioWordCount > maxWords) {
      toast({
        title: "Bio too long",
        description: `Please keep your bio to ${maxWords} words or less. Current: ${bioWordCount} words.`,
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

  const handleBioChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setEditData({ ...editData, bio: newValue });
  };

  const handleNameChange = (value: string) => {
    setEditData({ ...editData, name: value });
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
      <Card>
        <ProfileHeader
          isEditing={isEditing}
          onEditClick={() => setIsEditing(true)}
          onSave={handleSave}
          onCancel={handleCancel}
        />
        
        <CardContent className="space-y-6">
          <div className="flex items-start gap-6">
            <ProfileAvatar
              user={user}
              isUploadingAvatar={isUploadingAvatar}
              onAvatarUpload={() => {}}
              onRemoveAvatar={handleRemoveAvatar}
              onFileSelect={handleFileSelect}
            />
            
            <ProfileForm
              user={user}
              editData={editData}
              isEditing={isEditing}
              bioWordCount={bioWordCount}
              maxWords={maxWords}
              onNameChange={handleNameChange}
              onBioChange={handleBioChange}
            />
          </div>

          <Separator />

          <ProfileStats user={user} />

          <Separator />

          <ProfileAdditionalInfo user={user} formatDate={formatDate} />
        </CardContent>
      </Card>
    </div>
  );
};
