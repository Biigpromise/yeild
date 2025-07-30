
import React, { useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Camera, Trash2 } from "lucide-react";
import { ProfileBirdBadge } from "@/components/referral/ProfileBirdBadge";

interface ProfileAvatarProps {
  user: {
    id?: string;
    name: string;
    avatar?: string;
  };
  isUploadingAvatar: boolean;
  onAvatarUpload: () => void;
  onRemoveAvatar: () => void;
  onFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onAvatarClick?: () => void;
}

export const ProfileAvatar = ({ 
  user, 
  isUploadingAvatar, 
  onAvatarUpload, 
  onRemoveAvatar, 
  onFileSelect,
  onAvatarClick
}: ProfileAvatarProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={onFileSelect}
        className="hidden"
      />
      
      <div className="relative">
        <Avatar 
          className="h-24 w-24 border-2 border-gray-600 cursor-pointer hover:border-primary transition-colors"
          onClick={onAvatarClick}
        >
          <AvatarImage src={user.avatar} alt={user.name} />
          <AvatarFallback className="text-2xl bg-gray-700 text-white">
            {user.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        
        {/* Bird Badge Overlay */}
        {user.id && (
          <div className="absolute -top-2 -right-2">
            <ProfileBirdBadge userId={user.id} size="sm" />
          </div>
        )}
        
        <div className="absolute -bottom-2 -right-2 flex gap-1">
          <Button
            size="sm"
            className="h-8 w-8 rounded-full bg-blue-600 hover:bg-blue-700 text-white"
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
              onClick={onRemoveAvatar}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </>
  );
};
