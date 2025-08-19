import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X, Image, Video, File } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface MediaAsset {
  id: string;
  type: 'image' | 'video' | 'document';
  url: string;
  name: string;
  category: 'brand_asset' | 'reference' | 'campaign_visual' | 'video_brief';
  size: number;
}

interface MediaUploadSectionProps {
  mediaAssets: MediaAsset[];
  onMediaAssetsChange: (assets: MediaAsset[]) => void;
}

export const MediaUploadSection: React.FC<MediaUploadSectionProps> = ({
  mediaAssets,
  onMediaAssetsChange
}) => {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = useCallback(async (files: FileList, category: MediaAsset['category']) => {
    if (!user) return;
    
    setUploading(true);
    const newAssets: MediaAsset[] = [];

    try {
      for (const file of Array.from(files)) {
        // Validate file type and size
        const maxSize = 50 * 1024 * 1024; // 50MB
        if (file.size > maxSize) {
          toast.error(`File ${file.name} is too large. Maximum size is 50MB.`);
          continue;
        }

        const fileType = file.type.startsWith('image/') ? 'image' : 
                        file.type.startsWith('video/') ? 'video' : 'document';

        // Upload to Supabase Storage
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}-${file.name}`;
        const bucket = category === 'brand_asset' ? 'campaign-assets' : 'campaign-media';

        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(fileName, file);

        if (uploadError) {
          toast.error(`Failed to upload ${file.name}: ${uploadError.message}`);
          continue;
        }

        // Get public URL
        const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);

        newAssets.push({
          id: `${Date.now()}-${Math.random()}`,
          type: fileType,
          url: data.publicUrl,
          name: file.name,
          category,
          size: file.size
        });
      }

      onMediaAssetsChange([...mediaAssets, ...newAssets]);
      toast.success(`Uploaded ${newAssets.length} file(s) successfully`);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload files');
    } finally {
      setUploading(false);
    }
  }, [user, mediaAssets, onMediaAssetsChange]);

  const removeAsset = (assetId: string) => {
    onMediaAssetsChange(mediaAssets.filter(asset => asset.id !== assetId));
  };

  const getIconForType = (type: MediaAsset['type']) => {
    switch (type) {
      case 'image': return <Image className="w-4 h-4" />;
      case 'video': return <Video className="w-4 h-4" />;
      default: return <File className="w-4 h-4" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Media Assets
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Upload Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Brand Assets */}
          <div className="space-y-2">
            <Label>Brand Assets</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
              <Input
                type="file"
                multiple
                accept="image/*,video/*,.pdf,.doc,.docx"
                onChange={(e) => e.target.files && handleFileUpload(e.target.files, 'brand_asset')}
                className="hidden"
                id="brand-assets"
              />
              <label htmlFor="brand-assets" className="cursor-pointer">
                <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Upload logos, product images, brand guidelines
                </p>
              </label>
            </div>
          </div>

          {/* Campaign Visuals */}
          <div className="space-y-2">
            <Label>Campaign Visuals</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
              <Input
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={(e) => e.target.files && handleFileUpload(e.target.files, 'campaign_visual')}
                className="hidden"
                id="campaign-visuals"
              />
              <label htmlFor="campaign-visuals" className="cursor-pointer">
                <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Upload banners, graphics, videos
                </p>
              </label>
            </div>
          </div>

          {/* Reference Materials */}
          <div className="space-y-2">
            <Label>Reference Materials</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
              <Input
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={(e) => e.target.files && handleFileUpload(e.target.files, 'reference')}
                className="hidden"
                id="references"
              />
              <label htmlFor="references" className="cursor-pointer">
                <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Upload examples of desired content
                </p>
              </label>
            </div>
          </div>

          {/* Video Briefs */}
          <div className="space-y-2">
            <Label>Video Briefs</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
              <Input
                type="file"
                multiple
                accept="video/*"
                onChange={(e) => e.target.files && handleFileUpload(e.target.files, 'video_brief')}
                className="hidden"
                id="video-briefs"
              />
              <label htmlFor="video-briefs" className="cursor-pointer">
                <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Upload instruction videos
                </p>
              </label>
            </div>
          </div>
        </div>

        {/* Uploaded Files List */}
        {mediaAssets.length > 0 && (
          <div className="space-y-3">
            <Label>Uploaded Media ({mediaAssets.length})</Label>
            <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto">
              {mediaAssets.map((asset) => (
                <div key={asset.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getIconForType(asset.type)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{asset.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {asset.category.replace('_', ' ')} • {formatFileSize(asset.size)}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeAsset(asset.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {uploading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            Uploading files...
          </div>
        )}
      </CardContent>
    </Card>
  );
};