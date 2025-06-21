
import React from "react";
import { Button } from "@/components/ui/button";
import { Facebook, Twitter, Instagram, Linkedin, Youtube, ExternalLink } from "lucide-react";

interface TaskSocialMediaDisplayProps {
  socialLinks: Record<string, string> | null;
  taskTitle: string;
}

export const TaskSocialMediaDisplay: React.FC<TaskSocialMediaDisplayProps> = ({
  socialLinks,
  taskTitle
}) => {
  if (!socialLinks) return null;

  const platforms = [
    { key: 'facebook', icon: Facebook, color: 'bg-blue-600 hover:bg-blue-700', name: 'Facebook' },
    { key: 'twitter', icon: Twitter, color: 'bg-blue-400 hover:bg-blue-500', name: 'Twitter' },
    { key: 'instagram', icon: Instagram, color: 'bg-pink-500 hover:bg-pink-600', name: 'Instagram' },
    { key: 'linkedin', icon: Linkedin, color: 'bg-blue-700 hover:bg-blue-800', name: 'LinkedIn' },
    { key: 'youtube', icon: Youtube, color: 'bg-red-600 hover:bg-red-700', name: 'YouTube' }
  ];

  const activePlatforms = platforms.filter(platform => 
    socialLinks[platform.key] && socialLinks[platform.key].trim() !== ''
  );

  if (activePlatforms.length === 0) return null;

  return (
    <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border">
      <h4 className="text-sm font-semibold mb-3 text-gray-700 flex items-center gap-2">
        <ExternalLink className="h-4 w-4" />
        Social Media Links for {taskTitle}
      </h4>
      <div className="flex flex-wrap gap-2">
        {activePlatforms.map((platform) => {
          const Icon = platform.icon;
          return (
            <Button
              key={platform.key}
              asChild
              size="sm"
              className={`${platform.color} text-white transition-all duration-200 hover:scale-105`}
            >
              <a
                href={socialLinks[platform.key]}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <Icon className="h-4 w-4" />
                <span className="text-xs">{platform.name}</span>
              </a>
            </Button>
          );
        })}
      </div>
      <p className="text-xs text-gray-500 mt-2">
        Click on the links above to complete the social media tasks
      </p>
    </div>
  );
};
