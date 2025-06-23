
import React from 'react';
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface MediaPreviewProps {
  mediaPreview: string;
  mediaType: 'image' | 'video';
  onRemove: () => void;
}

export const MediaPreview: React.FC<MediaPreviewProps> = ({
  mediaPreview,
  mediaType,
  onRemove
}) => {
  return (
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
        onClick={onRemove}
      >
        <X className="h-3 w-3" />
      </Button>
    </div>
  );
};
