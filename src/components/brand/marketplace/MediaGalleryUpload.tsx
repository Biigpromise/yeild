import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Upload, X, Image, Video, Loader2 } from 'lucide-react';

interface MediaItem {
  url: string;
  type: 'image' | 'video';
}

interface MediaGalleryUploadProps {
  media: MediaItem[];
  onChange: (media: MediaItem[]) => void;
  maxItems?: number;
}

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB for videos

export const MediaGalleryUpload: React.FC<MediaGalleryUploadProps> = ({
  media,
  onChange,
  maxItems = 5
}) => {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    if (media.length + files.length > maxItems) {
      toast.error(`Maximum ${maxItems} items allowed`);
      return;
    }

    setUploading(true);
    const newMedia: MediaItem[] = [];

    for (const file of Array.from(files)) {
      const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
      const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);

      if (!isImage && !isVideo) {
        toast.error(`Unsupported file type: ${file.name}`);
        continue;
      }

      if (file.size > MAX_FILE_SIZE) {
        toast.error(`File too large: ${file.name}. Maximum size is 50MB`);
        continue;
      }

      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${user?.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('marketplace-media')
          .upload(fileName, file);

        if (uploadError) {
          // If bucket doesn't exist, try the images bucket
          const { error: fallbackError } = await supabase.storage
            .from('marketplace-images')
            .upload(fileName, file);

          if (fallbackError) throw fallbackError;

          const { data: urlData } = supabase.storage
            .from('marketplace-images')
            .getPublicUrl(fileName);

          newMedia.push({
            url: urlData.publicUrl,
            type: isVideo ? 'video' : 'image'
          });
        } else {
          const { data: urlData } = supabase.storage
            .from('marketplace-media')
            .getPublicUrl(fileName);

          newMedia.push({
            url: urlData.publicUrl,
            type: isVideo ? 'video' : 'image'
          });
        }
      } catch (error) {
        console.error('Upload error:', error);
        toast.error(`Failed to upload ${file.name}`);
      }
    }

    if (newMedia.length > 0) {
      onChange([...media, ...newMedia]);
      toast.success(`Uploaded ${newMedia.length} file(s)`);
    }

    setUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeMedia = (index: number) => {
    onChange(media.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      {/* Upload Button */}
      <div className="flex items-center gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || media.length >= maxItems}
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Upload className="h-4 w-4 mr-2" />
          )}
          {uploading ? 'Uploading...' : 'Upload Media'}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept={[...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES].join(',')}
          multiple
          onChange={handleUpload}
          className="hidden"
        />
        <span className="text-sm text-muted-foreground">
          {media.length}/{maxItems} items • Images or videos up to 50MB
        </span>
      </div>

      {/* Media Grid */}
      {media.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {media.map((item, index) => (
            <div
              key={index}
              className="relative aspect-video bg-muted rounded-lg overflow-hidden border group"
            >
              {item.type === 'video' ? (
                <div className="relative w-full h-full">
                  <video
                    src={item.url}
                    className="w-full h-full object-cover"
                    muted
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <Video className="h-8 w-8 text-white" />
                  </div>
                </div>
              ) : (
                <img
                  src={item.url}
                  alt={`Media ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              )}
              
              {/* Type Badge */}
              <div className="absolute top-2 left-2">
                <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                  item.type === 'video' 
                    ? 'bg-purple-500/90 text-white' 
                    : 'bg-blue-500/90 text-white'
                }`}>
                  {item.type === 'video' ? (
                    <Video className="h-3 w-3" />
                  ) : (
                    <Image className="h-3 w-3" />
                  )}
                  {item.type === 'video' ? 'Video' : 'Image'}
                </div>
              </div>

              {/* Remove Button */}
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2 h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeMedia(index)}
              >
                <X className="h-4 w-4" />
              </Button>

              {/* First Item Badge */}
              {index === 0 && (
                <div className="absolute bottom-2 left-2 bg-primary/90 text-primary-foreground text-xs px-2 py-1 rounded">
                  Main
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
