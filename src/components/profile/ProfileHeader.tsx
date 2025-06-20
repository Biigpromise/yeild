
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Link as LinkIcon } from "lucide-react";
import { ProfileAvatar } from "./ProfileAvatar";
import { ProfileBirdBadge } from "@/components/referral/ProfileBirdBadge";

interface ProfileHeaderProps {
  user: {
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
  isUploadingAvatar: boolean;
  onAvatarUpload: () => void;
  onRemoveAvatar: () => void;
  onFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const ProfileHeader = ({
  user,
  isOwnProfile = false,
  isUploadingAvatar,
  onAvatarUpload,
  onRemoveAvatar,
  onFileSelect,
}: ProfileHeaderProps) => {
  return (
    <Card>
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
                <h1 className="text-2xl font-bold">{user.name}</h1>
                {user.id && (
                  <ProfileBirdBadge userId={user.id} size="lg" showName />
                )}
              </div>
              <p className="text-muted-foreground">{user.email}</p>
              {user.bio && (
                <p className="text-sm mt-2">{user.bio}</p>
              )}
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              {user.joinDate && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Joined {new Date(user.joinDate).toLocaleDateString()}</span>
                </div>
              )}
              <div className="flex items-center gap-4">
                <span><strong>{user.followers_count || 0}</strong> followers</span>
                <span><strong>{user.following_count || 0}</strong> following</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Badge variant="secondary">Level {user.level}</Badge>
              <Badge variant="outline">{user.points} points</Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
