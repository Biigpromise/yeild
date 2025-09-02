import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Link, Instagram, Twitter, Facebook, Youtube, Plus, X, ExternalLink } from 'lucide-react';

export interface SocialLink {
  platform: string;
  url: string;
  description?: string;
}

export interface SocialLinksData {
  website?: string;
  socialProfiles: SocialLink[];
  engagementPosts: string[];
  hashtags: string[];
  mentionRequirements: string[];
}

interface SocialLinksSectionProps {
  socialLinks: SocialLinksData;
  onSocialLinksChange: (links: SocialLinksData) => void;
}

export const SocialLinksSection: React.FC<SocialLinksSectionProps> = ({
  socialLinks,
  onSocialLinksChange
}) => {
  const platformIcons: { [key: string]: React.ReactNode } = {
    instagram: <Instagram className="w-4 h-4" />,
    twitter: <Twitter className="w-4 h-4" />,
    facebook: <Facebook className="w-4 h-4" />,
    youtube: <Youtube className="w-4 h-4" />,
    tiktok: <div className="w-4 h-4 text-sm font-bold">TT</div>,
    linkedin: <div className="w-4 h-4 text-sm font-bold">in</div>,
  };

  const updateWebsite = (website: string) => {
    onSocialLinksChange({ ...socialLinks, website });
  };

  const addSocialProfile = () => {
    const newProfile: SocialLink = { platform: 'instagram', url: '', description: '' };
    onSocialLinksChange({
      ...socialLinks,
      socialProfiles: [...socialLinks.socialProfiles, newProfile]
    });
  };

  const updateSocialProfile = (index: number, field: keyof SocialLink, value: string) => {
    const updated = [...socialLinks.socialProfiles];
    updated[index] = { ...updated[index], [field]: value };
    onSocialLinksChange({ ...socialLinks, socialProfiles: updated });
  };

  const removeSocialProfile = (index: number) => {
    const updated = socialLinks.socialProfiles.filter((_, i) => i !== index);
    onSocialLinksChange({ ...socialLinks, socialProfiles: updated });
  };

  const addEngagementPost = () => {
    onSocialLinksChange({
      ...socialLinks,
      engagementPosts: [...socialLinks.engagementPosts, '']
    });
  };

  const updateEngagementPost = (index: number, url: string) => {
    const updated = [...socialLinks.engagementPosts];
    updated[index] = url;
    onSocialLinksChange({ ...socialLinks, engagementPosts: updated });
  };

  const removeEngagementPost = (index: number) => {
    const updated = socialLinks.engagementPosts.filter((_, i) => i !== index);
    onSocialLinksChange({ ...socialLinks, engagementPosts: updated });
  };

  const updateHashtags = (hashtagsText: string) => {
    const hashtags = hashtagsText
      .split(/[\s,]+/)
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0)
      .map(tag => tag.startsWith('#') ? tag : `#${tag}`);
    onSocialLinksChange({ ...socialLinks, hashtags });
  };

  const validateUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link className="w-5 h-5" />
          Social Links & Online Presence
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Add your social media links and engagement requirements. These will be displayed to users when they view your campaign tasks.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Website */}
        <div className="space-y-2">
          <Label htmlFor="website" className="text-sm font-medium">
            Website/Landing Page
            <span className="text-xs text-muted-foreground ml-2">(Required)</span>
          </Label>
          <div className="relative">
            <Input
              id="website"
              type="url"
              value={socialLinks.website || ''}
              onChange={(e) => updateWebsite(e.target.value)}
              placeholder="https://yourwebsite.com"
              className={socialLinks.website && !validateUrl(socialLinks.website) ? 'border-destructive' : ''}
            />
            {socialLinks.website && validateUrl(socialLinks.website) && (
              <ExternalLink className="absolute right-3 top-3 w-4 h-4 text-green-600" />
            )}
          </div>
          {socialLinks.website && !validateUrl(socialLinks.website) && (
            <p className="text-xs text-destructive">Please enter a valid URL</p>
          )}
          <p className="text-xs text-muted-foreground">
            Your main website or landing page that users should visit
          </p>
        </div>

        {/* Social Media Profiles */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">
              Social Media Profiles
              <span className="text-xs text-muted-foreground ml-2">(Required - Add at least one)</span>
            </Label>
            <Button variant="outline" size="sm" onClick={addSocialProfile}>
              <Plus className="w-4 h-4 mr-2" />
              Add Platform
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Add your social media accounts that users should follow or engage with
          </p>
          
          {socialLinks.socialProfiles.map((profile, index) => (
            <div key={index} className="p-4 border border-border rounded-lg bg-muted/50 space-y-3">
              <div className="flex gap-3 items-start">
                <div className="flex items-center gap-2 min-w-[140px]">
                  {platformIcons[profile.platform]}
                  <select
                    value={profile.platform}
                    onChange={(e) => updateSocialProfile(index, 'platform', e.target.value)}
                    className="px-2 py-1 border border-border rounded bg-background text-sm"
                  >
                    <option value="instagram">Instagram</option>
                    <option value="twitter">Twitter/X</option>
                    <option value="facebook">Facebook</option>
                    <option value="youtube">YouTube</option>
                    <option value="tiktok">TikTok</option>
                    <option value="linkedin">LinkedIn</option>
                  </select>
                </div>
                
                <div className="flex-1 space-y-2">
                  <div className="relative">
                    <Input
                      type="url"
                      value={profile.url}
                      onChange={(e) => updateSocialProfile(index, 'url', e.target.value)}
                      placeholder={`https://${profile.platform}.com/yourprofile`}
                      className={profile.url && !validateUrl(profile.url) ? 'border-destructive' : ''}
                    />
                    {profile.url && validateUrl(profile.url) && (
                      <ExternalLink className="absolute right-3 top-3 w-4 h-4 text-green-600" />
                    )}
                  </div>
                  <Input
                    value={profile.description || ''}
                    onChange={(e) => updateSocialProfile(index, 'description', e.target.value)}
                    placeholder="What should users do? (e.g., Follow, Like recent posts)"
                  />
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeSocialProfile(index)}
                  className="text-destructive hover:text-destructive mt-1"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              {/* Preview how this will appear to users */}
              {profile.url && validateUrl(profile.url) && (
                <div className="mt-2 p-2 bg-background rounded border-l-4 border-l-primary">
                  <p className="text-xs text-muted-foreground">Preview for users:</p>
                  <div className="flex items-center gap-2 mt-1">
                    {platformIcons[profile.platform]}
                    <span className="text-sm font-medium capitalize">{profile.platform}</span>
                    <ExternalLink className="w-3 h-3 text-muted-foreground" />
                  </div>
                  {profile.description && (
                    <p className="text-xs text-muted-foreground mt-1">{profile.description}</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Specific Posts for Engagement */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">
              Specific Posts to Engage With
              <span className="text-xs text-muted-foreground ml-2">(Optional)</span>
            </Label>
            <Button variant="outline" size="sm" onClick={addEngagementPost}>
              <Plus className="w-4 h-4 mr-2" />
              Add Post
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Link to specific posts you want users to like, comment on, or share
          </p>
          
          {socialLinks.engagementPosts.map((post, index) => (
            <div key={index} className="flex gap-3 items-center">
              <Input
                type="url"
                value={post}
                onChange={(e) => updateEngagementPost(index, e.target.value)}
                placeholder="https://instagram.com/p/post-id or https://twitter.com/user/status/id"
                className={post && !validateUrl(post) ? 'border-destructive' : ''}
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeEngagementPost(index)}
                className="text-destructive hover:text-destructive"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
          {socialLinks.engagementPosts.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Add specific posts you want creators to like, comment on, or share
            </p>
          )}
        </div>

        {/* Hashtags */}
        <div className="space-y-2">
          <Label htmlFor="hashtags">Required Hashtags</Label>
          <Textarea
            id="hashtags"
            value={socialLinks.hashtags.join(' ')}
            onChange={(e) => updateHashtags(e.target.value)}
            placeholder="#brandname #campaign #yourhashtag"
            rows={3}
          />
          <p className="text-sm text-muted-foreground">
            Enter hashtags separated by spaces or commas. # will be added automatically.
          </p>
          {socialLinks.hashtags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {socialLinks.hashtags.map((tag, index) => (
                <span key={index} className="px-2 py-1 bg-primary/10 text-primary rounded-md text-sm">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Mention Requirements */}
        <div className="space-y-2">
          <Label htmlFor="mentions">Mention Requirements</Label>
          <Textarea
            id="mentions"
            value={socialLinks.mentionRequirements.join('\n') || ''}
            onChange={(e) => onSocialLinksChange({
              ...socialLinks,
              mentionRequirements: e.target.value.split('\n').filter(req => req.trim())
            })}
            placeholder="Specify any accounts that must be mentioned in posts (e.g., @yourbrand, @partner)"
            rows={2}
          />
        </div>
      </CardContent>
    </Card>
  );
};