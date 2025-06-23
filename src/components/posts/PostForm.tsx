
import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";
import { fileUploadService } from "@/services/fileUploadService";

interface PostFormProps {
  newPost: string;
  setNewPost: (value: string) => void;
  handlePostSubmit: (e: React.FormEvent, mediaUrl?: string) => void;
  userId: string | null;
}

export const PostForm: React.FC<PostFormProps> = ({
  newPost,
  setNewPost,
  handlePostSubmit,
  userId
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateVideo = (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      
      video.onloadedmetadata = () => {
        URL.revokeObjectURL(video.src);
        const duration = video.duration;
        if (duration > 30) {
          toast.error("Video must be 30 seconds or less");
          resolve(false);
        } else {
          resolve(true);
        }
      };
      
      video.onerror = () => {
        toast.error("Invalid video file");
        resolve(false);
      };
      
      video.src = URL.createObjectURL(file);
    });
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');

    if (!isImage && !isVideo) {
      toast.error("Please select an image or video file");
      return;
    }

    if (isVideo) {
      const isValidVideo = await validateVideo(file);
      if (!isValidVideo) return;
    }

    setMediaFile(file);
    setMediaType(isImage ? 'image' : 'video');
    setMediaPreview(URL.createObjectURL(file));
  };

  const removeMedia = () => {
    if (mediaPreview) {
      URL.revokeObjectURL(mediaPreview);
    }
    setMediaFile(null);
    setMediaPreview(null);
    setMediaType(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('PostForm handleSubmit called', { newPost: newPost.trim(), mediaFile, userId });
    
    if (!userId) {
      toast.error("Please log in to post");
      return;
    }

    if (!newPost.trim() && !mediaFile) {
      toast.error("Please write something or add media");
      return;
    }

    let mediaUrl: string | undefined;

    if (mediaFile) {
      setIsUploading(true);
      try {
        mediaUrl = await fileUploadService.uploadStoryMedia(mediaFile);
        if (!mediaUrl) {
          toast.error("Failed to upload media");
          setIsUploading(false);
          return;
        }
      } catch (error) {
        console.error('Error uploading media:', error);
        toast.error("Failed to upload media");
        setIsUploading(false);
        return;
      }
    }

    try {
      setIsUploading(true);
      await handlePostSubmit(e, mediaUrl);
      // Clear media after successful post
      removeMedia();
    } catch (error) {
      console.error('Error submitting post:', error);
      toast.error("Failed to create post");
    } finally {
      setIsUploading(false);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="sticky top-16 z-10 bg-background/95 backdrop-blur-sm border-b p-4">
      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
        <div className="flex gap-3">
          <div className="flex-1">
            <Textarea
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder="What's on your mind?"
              className="min-h-[60px] resize-none border-0 shadow-none text-lg placeholder:text-muted-foreground"
              disabled={!userId || isUploading}
            />
            
            {mediaPreview && (
              <div className="mt-3 relative inline-block">
                {mediaType === 'image' ? (
                  <img
                    src={mediaPreview}
                    alt="Upload preview"
                    className="max-w-full max-h-48 rounded-lg"
                  />
                ) : (
                  <video
                    src={mediaPreview}
                    controls
                    className="max-w-full max-h-48 rounded-lg"
                  />
                )}
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="absolute top-1 right-1 h-6 w-6 p-0"
                  onClick={removeMedia}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={openFileDialog}
              disabled={!userId || isUploading}
              className="text-primary hover:bg-primary/10"
            >
              <Plus className="h-4 w-4 mr-1" />
              Media
            </Button>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
          
          <Button
            type="submit"
            disabled={(!newPost.trim() && !mediaFile) || !userId || isUploading}
            className="px-6"
          >
            {isUploading ? "Posting..." : "Post"}
          </Button>
        </div>
      </form>
    </div>
  );
};
