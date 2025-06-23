
import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Link as LinkIcon, Edit, Save, X } from "lucide-react";
import { ProfileAvatar } from "./ProfileAvatar";
import { ProfileBirdBadge } from "@/components/referral/ProfileBirdBadge";

interface ProfileHeaderProps {
  user?: {
    id?: string;
    name: string;
    email: string;
    bio?: string;
    avatar?: string;
    level: number;
    points: number;
    joinDate?: string;
    followers_count?: number;
    following_count?: number;
  };
  isOwnProfile?: boolean;
  isUploadingAvatar?: boolean;
  onAvatarUpload?: () => void;
  onRemoveAvatar?: () => void;
  onFileSelect?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  // New editing props
  isEditing?: boolean;
  onEditClick?: () => void;
  onSave?: () => void;
  onCancel?: () => void;
}

export const ProfileHeader = ({
  user,
  isOwnProfile = false,
  isUploadingAvatar = false,
  onAvatarUpload = () => {},
  onRemoveAvatar = () => {},
  onFileSelect = () => {},
  isEditing = false,
  onEditClick = () => {},
  onSave = () => {},
  onCancel = () => {},
}: ProfileHeaderProps) => {
  // If no user prop is passed, this is likely being used in a different context
  if (!user) {
    return (
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-white">Profile</h2>
          </div>
          {isOwnProfile && (
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button size="sm" onClick={onSave}>
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                  <Button size="sm" variant="outline" onClick={onCancel}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </>
              ) : (
                <Button size="sm" variant="outline" onClick={onEditClick}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              )}
            </div>
          )}
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-900 border-gray-700">
      <CardContent className="pt-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
          <ProfileAvatar
            user={user}
            isUploadingAvatar={isUploadingAvatar}
            onAvatarUpload={onAvatarUpload}
            onRemoveAvatar={onRemoveAvatar}
            onFileSelect={onFileSelect}
          />
          
          <div className="flex-1 space-y-3">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-white">{user.name}</h1>
                {user.id && (
                  <ProfileBirdBadge userId={user.id} size="lg" showName />
                )}
              </div>
              <p className="text-gray-300">{user.email}</p>
              {user.bio && (
                <p className="text-sm mt-2 text-gray-300">{user.bio}</p>
              )}
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-gray-400">
              {user.joinDate && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Joined {new Date(user.joinDate).toLocaleDateString()}</span>
                </div>
              )}
              <div className="flex items-center gap-4">
                <span className="text-gray-300"><strong>{user.followers_count || 0}</strong> followers</span>
                <span className="text-gray-300"><strong>{user.following_count || 0}</strong> following</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Badge variant="secondary" className="bg-gray-700 text-white">Level {user.level}</Badge>
              <Badge variant="outline" className="border-gray-600 text-gray-300">{user.points} points</Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
