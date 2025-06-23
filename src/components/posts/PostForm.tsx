
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { fileUploadService } from "@/services/fileUploadService";
import { PostFormContent } from './PostFormContent';
import { MediaUpload } from './MediaUpload';

interface PostFormProps {
  newPost: string;
  setNewPost: (value: string) => void;
  handlePostSubmit: (e: React.FormEvent, mediaUrl?: string) => Promise<void>;
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

  const handleFileSelect = (file: File, type: 'image' | 'video') => {
    setMediaFile(file);
    setMediaType(type);
    setMediaPreview(URL.createObjectURL(file));
  };

  const removeMedia = () => {
    if (mediaPreview) {
      URL.revokeObjectURL(mediaPreview);
    }
    setMediaFile(null);
    setMediaPreview(null);
    setMediaType(null);
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

    setIsUploading(true);
    
    try {
      let mediaUrl: string | undefined;

      if (mediaFile) {
        console.log('Uploading media file...');
        mediaUrl = await fileUploadService.uploadStoryMedia(mediaFile);
        console.log('Media uploaded:', mediaUrl);
        if (!mediaUrl) {
          toast.error("Failed to upload media");
          return;
        }
      }

      console.log('Calling handlePostSubmit with mediaUrl:', mediaUrl);
      await handlePostSubmit(e, mediaUrl);
      
      // Clear form after successful post
      removeMedia();
      console.log('Post submitted successfully');
    } catch (error) {
      console.error('Error submitting post:', error);
      toast.error("Failed to create post");
    } finally {
      setIsUploading(false);
    }
  };

  const isDisabled = !userId || isUploading;

  return (
    <div className="sticky top-16 z-10 bg-background/95 backdrop-blur-sm border-b p-4">
      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
        <div className="flex gap-3">
          <PostFormContent
            newPost={newPost}
            setNewPost={setNewPost}
            mediaPreview={mediaPreview}
            mediaType={mediaType}
            onRemoveMedia={removeMedia}
            disabled={isDisabled}
          />
        </div>
        
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2">
            <MediaUpload
              onFileSelect={handleFileSelect}
              disabled={isDisabled}
            />
          </div>
          
          <Button
            type="submit"
            disabled={(!newPost.trim() && !mediaFile) || isDisabled}
            className="px-6"
          >
            {isUploading ? "Posting..." : "Post"}
          </Button>
        </div>
      </form>
    </div>
  );
};
