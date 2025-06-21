
import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";

interface ProfileFormProps {
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
  if (!isEditing) {
    return (
      <div className="flex-1 space-y-4">
        <div>
          <h2 className="text-2xl font-bold">{user.name}</h2>
          <p className="text-muted-foreground">{user.email}</p>
        </div>
        
        {user.bio && (
          <div>
            <h3 className="font-semibold mb-2">About</h3>
            <p className="text-muted-foreground">{user.bio}</p>
          </div>
        )}
        
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{user.followers_count} followers</span>
          </div>
          <span>•</span>
          <span>{user.following_count} following</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Full Name</label>
          <Input
            value={editData.name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="Enter your name"
            className="mt-1"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Email</label>
          <Input
            type="email"
            value={user.email}
            placeholder="Enter your email"
            className="mt-1"
            disabled
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">Bio</label>
        <Textarea
          value={editData.bio}
          onChange={onBioChange}
          placeholder="Tell us about yourself..."
          className="mt-1"
          rows={3}
        />
        <div className="flex justify-between items-center mt-1">
          <p className="text-xs text-muted-foreground">
            Share a bit about yourself, your interests, or what motivates you.
          </p>
          <span className={`text-xs ${bioCharCount > maxChars ? 'text-red-500' : 'text-muted-foreground'}`}>
            {bioCharCount}/{maxChars}
          </span>
        </div>
      </div>
    </div>
  );
};
