
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Facebook, Twitter, Instagram, Linkedin, Youtube, Music } from "lucide-react";

interface TaskSocialMediaLinksProps {
  socialLinks: {
    facebook: string;
    twitter: string;
    instagram: string;
    linkedin: string;
    youtube: string;
    tiktok: string;
  };
  onSocialLinkChange: (platform: string, value: string) => void;
}

export const TaskSocialMediaLinks: React.FC<TaskSocialMediaLinksProps> = ({
  socialLinks,
  onSocialLinkChange
}) => {
  return (
    <div className="space-y-4">
      <Label>Social Media Links (Optional)</Label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <Facebook className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            value={socialLinks.facebook}
            onChange={(e) => onSocialLinkChange('facebook', e.target.value)}
            placeholder="Facebook URL"
            className="pl-10"
          />
        </div>
        <div className="relative">
          <Twitter className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            value={socialLinks.twitter}
            onChange={(e) => onSocialLinkChange('twitter', e.target.value)}
            placeholder="Twitter URL"
            className="pl-10"
          />
        </div>
        <div className="relative">
          <Instagram className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            value={socialLinks.instagram}
            onChange={(e) => onSocialLinkChange('instagram', e.target.value)}
            placeholder="Instagram URL"
            className="pl-10"
          />
        </div>
        <div className="relative">
          <Linkedin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            value={socialLinks.linkedin}
            onChange={(e) => onSocialLinkChange('linkedin', e.target.value)}
            placeholder="LinkedIn URL"
            className="pl-10"
          />
        </div>
        <div className="relative">
          <Youtube className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            value={socialLinks.youtube}
            onChange={(e) => onSocialLinkChange('youtube', e.target.value)}
            placeholder="YouTube URL"
            className="pl-10"
          />
        </div>
        <div className="relative">
          <Music className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            value={socialLinks.tiktok}
            onChange={(e) => onSocialLinkChange('tiktok', e.target.value)}
            placeholder="TikTok URL"
            className="pl-10"
          />
        </div>
      </div>
    </div>
  );
};
