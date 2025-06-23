
import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface ProfileFormProps {
  user: {
    name: string;
    email: string;
    bio?: string;
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
      <div>
        <Label htmlFor="name" className="text-white">Name</Label>
        {isEditing ? (
          <Input
            id="name"
            value={editData.name}
            onChange={(e) => onNameChange(e.target.value)}
            className="mt-1 bg-gray-800 border-gray-600 text-white"
          />
        ) : (
          <p className="text-xl font-bold text-white">{user.name}</p>
        )}
      </div>

      <div>
        <Label className="text-gray-300">Email</Label>
        <p className="text-gray-300">{user.email}</p>
      </div>

      <div>
        <Label htmlFor="bio" className="text-white">Bio</Label>
        {isEditing ? (
          <div>
            <Textarea
              id="bio"
              value={editData.bio}
              onChange={onBioChange}
              placeholder="Tell us about yourself..."
              className="mt-1 bg-gray-800 border-gray-600 text-white placeholder:text-gray-400"
              rows={3}
            />
            <div className="text-right mt-1">
              <span className={`text-sm ${bioCharCount > maxChars ? 'text-red-400' : 'text-gray-400'}`}>
                {bioCharCount}/{maxChars}
              </span>
            </div>
          </div>
        ) : (
          <p className="text-gray-300">{user.bio || "No bio yet"}</p>
        )}
      </div>
    </div>
  );
};
