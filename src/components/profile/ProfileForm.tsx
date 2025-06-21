
import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";

interface ProfileFormProps {
  onUpdate: () => void;
}

export const ProfileForm = ({ onUpdate }: ProfileFormProps) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    onUpdate();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Full Name</label>
          <Input
            placeholder="Enter your name"
            className="mt-1"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Email</label>
          <Input
            type="email"
            placeholder="Enter your email"
            className="mt-1"
            disabled
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">Bio</label>
        <Textarea
          placeholder="Tell us about yourself..."
          className="mt-1"
          rows={3}
        />
      </div>
      
      <Button type="submit" className="w-full">
        Update Profile
      </Button>
    </form>
  );
};
