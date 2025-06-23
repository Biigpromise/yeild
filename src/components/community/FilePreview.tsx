
import React from 'react';
import { Button } from '@/components/ui/button';

interface FilePreviewProps {
  filePreview: string;
  selectedFile: File;
  onRemove: () => void;
}

export const FilePreview: React.FC<FilePreviewProps> = ({
  filePreview,
  selectedFile,
  onRemove
}) => {
  return (
    <div className="mb-3 relative inline-block">
      {selectedFile.type.startsWith('image/') ? (
        <img
          src={filePreview}
          alt="Preview"
          className="max-w-32 max-h-32 rounded-lg border"
        />
      ) : (
        <video
          src={filePreview}
          className="max-w-32 max-h-32 rounded-lg border"
          preload="metadata"
        />
      )}
      <Button
        type="button"
        variant="secondary"
        size="sm"
        className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full"
        onClick={onRemove}
      >
        ×
      </Button>
    </div>
  );
};
