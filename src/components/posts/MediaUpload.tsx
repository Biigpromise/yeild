
import React, { useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";

interface MediaUploadProps {
  onFileSelect: (file: File, type: 'image' | 'video') => void;
  disabled: boolean;
}

export const MediaUpload: React.FC<MediaUploadProps> = ({
  onFileSelect,
  disabled
}) => {
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

    onFileSelect(file, isImage ? 'image' : 'video');
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={openFileDialog}
        disabled={disabled}
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
    </>
  );
};
