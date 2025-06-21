
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

  const handleLinkClick = (url: string, platform: string) => {
    // Ensure URL has proper protocol
    let finalUrl = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      finalUrl = `https://${url}`;
    }
    
    console.log(`Opening ${platform} link:`, finalUrl);
    window.open(finalUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border">
      <h4 className="text-sm font-semibold mb-3 text-gray-700 flex items-center gap-2">
        <ExternalLink className="h-4 w-4" />
        Required Social Media Actions
      </h4>
      <div className="flex flex-wrap gap-2">
        {activePlatforms.map((platform) => {
          const Icon = platform.icon;
          return (
            <Button
              key={platform.key}
              size="sm"
              className={`${platform.color} text-white transition-all duration-200 hover:scale-105 cursor-pointer`}
              onClick={() => handleLinkClick(socialLinks[platform.key], platform.name)}
            >
              <Icon className="h-4 w-4 mr-2" />
              <span className="text-xs">Visit {platform.name}</span>
            </Button>
          );
        })}
      </div>
      <p className="text-xs text-gray-600 mt-2 bg-yellow-50 p-2 rounded border-l-2 border-yellow-400">
        <strong>Instructions:</strong> Click the buttons above to visit the required social media pages. Complete the actions described in the task description, then submit your evidence below.
      </p>
    </div>
  );
};
