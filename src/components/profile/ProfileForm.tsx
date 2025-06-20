
import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Users } from "lucide-react";

interface ProfileFormProps {
  user: {
    name: string;
    email: string;
    bio?: string;
    followers_count: number;
    following_count: number;
  };
  editData: {
    name: string;
    bio: string;
  };
  isEditing: boolean;
  bioCharCount: number;
  maxChars: number;
  onNameChange: (value: string) => void;
  onBioChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export const ProfileForm = ({ 
  user, 
  editData, 
  isEditing, 
  bioCharCount, 
  maxChars, 
  onNameChange, 
  onBioChange 
}: ProfileFormProps) => {
  return (
    <div className="flex-1 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Full Name</label>
          {isEditing ? (
            <Input
              value={editData.name}
              onChange={(e) => onNameChange(e.target.value)}
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
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Bio</label>
          {isEditing && (
            <span className={`text-xs ${bioCharCount > maxChars ? 'text-red-500' : 'text-muted-foreground'}`}>
              {bioCharCount}/{maxChars} characters
            </span>
          )}
        </div>
        {isEditing ? (
          <div>
            <Textarea
              value={editData.bio}
              onChange={onBioChange}
              placeholder="Tell us about yourself..."
              className={`mt-1 ${bioCharCount > maxChars ? 'border-red-500' : ''}`}
              rows={3}
              maxLength={maxChars}
            />
            {bioCharCount > maxChars && (
              <p className="text-xs text-red-500 mt-1">
                Bio exceeds the {maxChars} character limit. Please shorten it.
              </p>
            )}
          </div>
        ) : (
          <p className="text-muted-foreground mt-1">
            {user.bio || "No bio provided yet."}
          </p>
        )}
      </div>
      
      <div className="flex items-center gap-6 text-sm text-muted-foreground pt-2">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          <span><span className="font-bold">{user.followers_count ?? 0}</span> followers</span>
        </div>
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          <span><span className="font-bold">{user.following_count ?? 0}</span> following</span>
        </div>
      </div>
    </div>
  );
};
