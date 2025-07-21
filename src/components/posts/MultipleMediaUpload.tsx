
import React, { useRef, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Plus, X, Upload } from "lucide-react";
import { toast } from "sonner";

interface MultipleMediaUploadProps {
  onFilesSelect: (files: File[]) => void;
  disabled: boolean;
  maxFiles?: number;
  selectedFiles: File[];
}

export const MultipleMediaUpload: React.FC<MultipleMediaUploadProps> = ({
  onFilesSelect,
  disabled,
  maxFiles = 20,
  selectedFiles
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const validateFile = async (file: File): Promise<boolean> => {
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');

    if (!isImage && !isVideo) {
      toast.error(`${file.name}: Please select an image or video file`);
      return false;
    }

    if (file.size > 15 * 1024 * 1024) {
      toast.error(`${file.name}: File should be less than 15MB`);
      return false;
    }

    if (isVideo) {
      return new Promise((resolve) => {
        const video = document.createElement('video');
        video.preload = 'metadata';
        
        video.onloadedmetadata = () => {
          URL.revokeObjectURL(video.src);
          const duration = video.duration;
          if (duration > 30) {
            toast.error(`${file.name}: Video must be 30 seconds or less`);
            resolve(false);
          } else {
            resolve(true);
          }
        };
        
        video.onerror = () => {
          toast.error(`${file.name}: Invalid video file`);
          resolve(false);
        };
        
        video.src = URL.createObjectURL(file);
      });
    }

    return true;
  };

  const handleFileSelect = async (newFiles: FileList | null) => {
    if (!newFiles) return;

    const filesArray = Array.from(newFiles);
    const totalFiles = selectedFiles.length + filesArray.length;

    if (totalFiles > maxFiles) {
      toast.error(`You can only upload up to ${maxFiles} files. You're trying to add ${filesArray.length} files but already have ${selectedFiles.length}.`);
      return;
    }

    const validFiles: File[] = [];
    for (const file of filesArray) {
      const isValid = await validateFile(file);
      if (isValid) {
        validFiles.push(file);
      }
    }

    if (validFiles.length > 0) {
      onFilesSelect([...selectedFiles, ...validFiles]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (disabled) return;
    
    const files = e.dataTransfer.files;
    handleFileSelect(files);
  };

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    onFilesSelect(newFiles);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 transition-colors ${
          dragActive 
            ? 'border-primary bg-primary/5' 
            : 'border-muted-foreground/25 hover:border-primary/50'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={!disabled ? openFileDialog : undefined}
      >
        <div className="text-center">
          <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground mb-2">
            Drop files here or click to browse
          </p>
          <p className="text-xs text-muted-foreground">
            Up to {maxFiles} images/videos, max 15MB each
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled}
            className="mt-2"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Files ({selectedFiles.length}/{maxFiles})
          </Button>
        </div>
      </div>

      {/* File Preview Grid */}
      {selectedFiles.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {selectedFiles.map((file, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                {file.type.startsWith('image/') ? (
                  <img
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <video
                    src={URL.createObjectURL(file)}
                    className="w-full h-full object-cover"
                    muted
                  />
                )}
              </div>
              <button
                onClick={() => removeFile(index)}
                disabled={disabled}
                className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </button>
              <p className="text-xs text-muted-foreground mt-1 truncate">
                {file.name}
              </p>
            </div>
          ))}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
        disabled={disabled}
      />
    </div>
  );
};
