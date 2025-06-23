
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface MediaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mediaUrl: string | null;
}

export const MediaModal: React.FC<MediaModalProps> = ({
  open,
  onOpenChange,
  mediaUrl
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] bg-black border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white">Media Viewer</DialogTitle>
        </DialogHeader>
        <div className="flex items-center justify-center p-4">
          {mediaUrl && (
            mediaUrl.includes('.mp4') || mediaUrl.includes('.webm') ? (
              <video
                src={mediaUrl}
                controls
                className="max-w-full max-h-[70vh] rounded"
              />
            ) : (
              <img
                src={mediaUrl}
                alt="Viewed media"
                className="max-w-full max-h-[70vh] rounded object-contain"
              />
            )
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
