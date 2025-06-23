
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Send, Image, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { fileUploadService } from '@/services/fileUploadService';

export const PostForm = () => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');

    if (!isImage && !isVideo) {
      toast.error('Please select an image or video file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast.error('File size must be less than 10MB');
      return;
    }

    setMediaFile(file);
    setMediaPreview(URL.createObjectURL(file));
  };

  const removeMedia = () => {
    if (mediaPreview) {
      URL.revokeObjectURL(mediaPreview);
    }
    setMediaFile(null);
    setMediaPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please log in to post');
      return;
    }

    if (!content.trim() && !mediaFile) {
      toast.error('Please write something or add media');
      return;
    }

    setIsSubmitting(true);
    
    try {
      let mediaUrl: string | null = null;

      if (mediaFile) {
        setIsUploading(true);
        try {
          mediaUrl = await fileUploadService.uploadStoryMedia(mediaFile);
          if (!mediaUrl) {
            toast.error('Failed to upload media');
            return;
          }
        } catch (error) {
          console.error('Error uploading media:', error);
          toast.error('Failed to upload media');
          return;
        } finally {
          setIsUploading(false);
        }
      }

      const { error } = await supabase
        .from('posts')
        .insert([{
          content: content.trim(),
          user_id: user.id,
          media_url: mediaUrl
        }]);

      if (error) {
        console.error('Error creating post:', error);
        toast.error('Failed to create post');
        return;
      }

      // Clear form
      setContent('');
      removeMedia();
      toast.success('Post created successfully!');

    } catch (error) {
      console.error('Error submitting post:', error);
      toast.error('Failed to create post');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isImage = mediaFile?.type.startsWith('image/');
  const isVideo = mediaFile?.type.startsWith('video/');

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            disabled={isSubmitting || isUploading}
            maxLength={500}
            className="min-h-[100px] resize-none bg-gray-800 border-gray-600 text-white placeholder:text-gray-400"
          />

          {mediaPreview && (
            <div className="relative">
              {isImage && (
                <img
                  src={mediaPreview}
                  alt="Preview"
                  className="max-w-full max-h-48 rounded-lg border object-cover"
                />
              )}
              {isVideo && (
                <video
                  src={mediaPreview}
                  controls
                  className="max-w-full max-h-48 rounded-lg border"
                />
              )}
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={removeMedia}
                className="absolute top-2 right-2"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <input
                type="file"
                accept="image/*,video/*"
                onChange={handleFileSelect}
                className="hidden"
                id="media-upload"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => document.getElementById('media-upload')?.click()}
                disabled={isSubmitting || isUploading}
                className="border-gray-600 text-white hover:bg-gray-700"
              >
                <Image className="h-4 w-4 mr-2" />
                Add Media
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">
                {content.length}/500
              </span>
              <Button
                type="submit"
                disabled={(!content.trim() && !mediaFile) || isSubmitting || isUploading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting || isUploading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Post
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
