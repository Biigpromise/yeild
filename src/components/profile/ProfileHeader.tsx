
import React from "react";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit2, Save, X } from "lucide-react";

interface ProfileHeaderProps {
  isEditing: boolean;
  onEditClick: () => void;
  onSave: () => void;
  onCancel: () => void;
}

export const ProfileHeader = ({ isEditing, onEditClick, onSave, onCancel }: ProfileHeaderProps) => {
  return (
    <CardHeader>
      <div className="flex items-center justify-between">
        <CardTitle>Profile Information</CardTitle>
        {!isEditing ? (
          <Button
            variant="outline"
            size="sm"
            onClick={onEditClick}
          >
            <Edit2 className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button size="sm" onClick={onSave}>
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
            <Button variant="outline" size="sm" onClick={onCancel}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </div>
        )}
      </div>
    </CardHeader>
  );
};
