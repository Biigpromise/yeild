import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, ExternalLink, Instagram, Twitter, Facebook, Youtube, Link as LinkIcon } from 'lucide-react';
import type { SocialLinksData } from './SocialLinksSection';

interface SocialLinksPreviewProps {
  socialLinks: SocialLinksData;
  campaignTitle: string;
}

export const SocialLinksPreview: React.FC<SocialLinksPreviewProps> = ({
  socialLinks,
  campaignTitle
}) => {
  const platformIcons: { [key: string]: React.ReactNode } = {
    instagram: <Instagram className="w-4 h-4" />,
    twitter: <Twitter className="w-4 h-4" />,
    facebook: <Facebook className="w-4 h-4" />,
    youtube: <Youtube className="w-4 h-4" />,
    tiktok: <div className="w-4 h-4 text-sm font-bold">TT</div>,
    linkedin: <div className="w-4 h-4 text-sm font-bold">in</div>,
  };

  const hasAnyContent = socialLinks.website || 
    socialLinks.socialProfiles.length > 0 ||
    socialLinks.engagementPosts.length > 0 ||
    socialLinks.hashtags.length > 0 ||
    socialLinks.mentionRequirements.length > 0;

  if (!hasAnyContent) {
    return (
      <Card className="border-warning/50 bg-warning/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-warning">
            <Eye className="w-5 h-5" />
            Preview: How Users Will See Your Task
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-muted/30 rounded-lg border border-border/40 text-center">
            <p className="text-sm text-muted-foreground">
              💡 Add social links above to see how they'll appear to users
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/50 bg-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <Eye className="w-5 h-5" />
          Preview: How Users Will See Your Task
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          This is exactly how your social media requirements will appear to users
        </p>
      </CardHeader>
      <CardContent>
        <div className="p-4 bg-gradient-to-r from-primary/10 to-accent/20 rounded-lg border border-border/60">
          <h4 className="text-sm font-semibold mb-3 text-foreground flex items-center gap-2">
            <ExternalLink className="h-4 w-4 text-primary" />
            Required Social Media Actions
          </h4>
          
          {/* Website */}
          {socialLinks.website && (
            <div className="mb-3">
              <Button
                variant="secondary"
                size="sm"
                className="bg-brand-blue hover:bg-brand-blue-dark text-white transition-all duration-200 hover:scale-105 hover:-translate-y-0.5 shadow-md hover:shadow-lg"
              >
                <LinkIcon className="h-4 w-4 mr-2" />
                <span className="text-xs font-medium">Visit Website</span>
              </Button>
            </div>
          )}
          
          {/* Social Media Profiles */}
          {socialLinks.socialProfiles.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {socialLinks.socialProfiles.filter(profile => profile.url.trim()).map((profile, index) => {
                const platformColors = {
                  facebook: 'bg-brand-blue hover:bg-brand-blue-dark text-white',
                  twitter: 'bg-blue-400 hover:bg-blue-500 text-white',
                  instagram: 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white',
                  linkedin: 'bg-blue-700 hover:bg-blue-800 text-white',
                  youtube: 'bg-red-600 hover:bg-red-700 text-white',
                  tiktok: 'bg-foreground hover:bg-foreground/80 text-background'
                };
                
                return (
                  <Button
                    key={index}
                    variant="secondary"
                    size="sm"
                    className={`${platformColors[profile.platform as keyof typeof platformColors] || 'bg-secondary'} transition-all duration-200 hover:scale-105 hover:-translate-y-0.5 shadow-md hover:shadow-lg`}
                  >
                    {platformIcons[profile.platform]}
                    <span className="text-xs font-medium ml-2">Visit {profile.platform.charAt(0).toUpperCase() + profile.platform.slice(1)}</span>
                  </Button>
                );
              })}
            </div>
          )}
          
          {/* Requirements */}
          <div className="bg-warning/10 border border-warning/20 p-3 rounded-lg">
            <p className="text-xs text-muted-foreground">
              <strong className="text-warning">Instructions:</strong> Click the buttons above to visit the required social media pages. Complete the actions described in the task description, then submit your evidence below.
            </p>
            
            {/* Show hashtags if any */}
            {socialLinks.hashtags.length > 0 && (
              <div className="mt-2">
                <p className="text-xs font-medium text-foreground mb-1">Required Hashtags:</p>
                <div className="flex flex-wrap gap-1">
                  {socialLinks.hashtags.map((tag, index) => (
                    <span key={index} className="px-2 py-1 bg-primary/10 text-primary rounded text-xs">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* Show mention requirements if any */}
            {socialLinks.mentionRequirements.length > 0 && (
              <div className="mt-2">
                <p className="text-xs font-medium text-foreground mb-1">Required Mentions:</p>
                <div className="text-xs text-muted-foreground">
                  {socialLinks.mentionRequirements.map((mention, index) => (
                    <div key={index}>{mention}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};