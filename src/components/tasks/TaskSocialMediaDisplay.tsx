
import React from "react";
import { Button } from "@/components/ui/button";
import { Facebook, Twitter, Instagram, Linkedin, Youtube, ExternalLink, Music } from "lucide-react";

interface TaskSocialMediaDisplayProps {
  socialLinks: Record<string, string> | string | null;
  taskTitle: string;
}

export const TaskSocialMediaDisplay: React.FC<TaskSocialMediaDisplayProps> = ({
  socialLinks,
  taskTitle
}) => {
  console.log('TaskSocialMediaDisplay - socialLinks:', socialLinks);
  
  if (!socialLinks) return null;

  // Handle multiple data formats for social links
  let linksObject: Record<string, string> = {};
  
  if (typeof socialLinks === 'string') {
    try {
      // Try to parse JSON string
      const parsed = JSON.parse(socialLinks);
      linksObject = typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
    } catch {
      // If parsing fails, treat as empty
      linksObject = {};
    }
  } else if (typeof socialLinks === 'object' && !Array.isArray(socialLinks)) {
    linksObject = socialLinks;
  }

  const platforms = [
    { key: 'facebook', icon: Facebook, color: 'bg-brand-blue hover:bg-brand-blue-dark text-white', name: 'Facebook' },
    { key: 'twitter', icon: Twitter, color: 'bg-blue-400 hover:bg-blue-500 text-white', name: 'Twitter' },
    { key: 'instagram', icon: Instagram, color: 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white', name: 'Instagram' },
    { key: 'linkedin', icon: Linkedin, color: 'bg-blue-700 hover:bg-blue-800 text-white', name: 'LinkedIn' },
    { key: 'youtube', icon: Youtube, color: 'bg-red-600 hover:bg-red-700 text-white', name: 'YouTube' },
    { key: 'tiktok', icon: Music, color: 'bg-foreground hover:bg-foreground/80 text-background', name: 'TikTok' }
  ];

  const activePlatforms = platforms.filter(platform => {
    const value = linksObject[platform.key];
    return value && String(value).trim() !== '' && String(value) !== 'null' && String(value) !== 'undefined';
  });

  console.log('TaskSocialMediaDisplay - activePlatforms:', activePlatforms);

  if (activePlatforms.length === 0) {
    // Show a subtle message if task has empty social media requirements
    return (
      <div className="mt-4 p-3 bg-muted/30 rounded-lg border border-border/40">
        <p className="text-xs text-muted-foreground text-center">
          💡 This task doesn't require social media actions
        </p>
      </div>
    );
  }

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
    <div className="mt-4 p-4 bg-gradient-to-r from-primary/10 to-accent/20 rounded-lg border border-border/60">
      <h4 className="text-sm font-semibold mb-3 text-foreground flex items-center gap-2">
        <ExternalLink className="h-4 w-4 text-primary" />
        Required Social Media Actions
      </h4>
      <div className="flex flex-wrap gap-2 mb-3">
        {activePlatforms.map((platform) => {
          const Icon = platform.icon;
          return (
            <Button
              key={platform.key}
              variant="secondary"
              size="sm"
              className={`${platform.color} transition-all duration-200 hover:scale-105 hover:-translate-y-0.5 shadow-md hover:shadow-lg`}
              onClick={() => handleLinkClick(String(linksObject[platform.key]), platform.name)}
            >
              <Icon className="h-4 w-4 mr-2" />
              <span className="text-xs font-medium">Visit {platform.name}</span>
            </Button>
          );
        })}
      </div>
      <div className="bg-warning/10 border border-warning/20 p-3 rounded-lg">
        <p className="text-xs text-muted-foreground">
          <strong className="text-warning">Instructions:</strong> Click the buttons above to visit the required social media pages. Complete the actions described in the task description, then submit your evidence below.
        </p>
      </div>
    </div>
  );
};
