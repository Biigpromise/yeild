import React, { useRef, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Plus, X, Upload, Camera, Video, FileText } from "lucide-react";
import { toast } from "sonner";

type FileCategory = 'all' | 'screenshots' | 'videos' | 'documents';

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
  const [activeCategory, setActiveCategory] = useState<FileCategory>('all');

  const getFileCategory = (file: File): FileCategory => {
    if (file.type.startsWith('image/')) return 'screenshots';
    if (file.type.startsWith('video/')) return 'videos';
    return 'documents';
  };

  const validateFile = async (file: File): Promise<boolean> => {
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    const isDocument = file.type.includes('pdf') || file.type.includes('document') || file.type.includes('text');

    if (!isImage && !isVideo && !isDocument) {
      toast.error(`${file.name}: Please select an image, video, or document file`);
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

  const openFileDialog = (category?: FileCategory) => {
    if (category && category !== 'all') {
      setActiveCategory(category);
    }
    fileInputRef.current?.click();
  };

  const getAcceptString = (category: FileCategory) => {
    switch (category) {
      case 'screenshots':
        return 'image/*';
      case 'videos':
        return 'video/*';
      case 'documents':
        return '.pdf,.doc,.docx,.txt';
      default:
        return 'image/*,video/*,.pdf,.doc,.docx,.txt';
    }
  };

  const filteredFiles = selectedFiles.filter(file => {
    if (activeCategory === 'all') return true;
    return getFileCategory(file) === activeCategory;
  });

  const getFileCountByCategory = (category: FileCategory) => {
    if (category === 'all') return selectedFiles.length;
    return selectedFiles.filter(file => getFileCategory(file) === category).length;
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-xl p-8 transition-all duration-300 ${
          dragActive 
            ? 'border-primary bg-primary/5 scale-105' 
            : 'border-muted-foreground/25 hover:border-primary/50'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={!disabled ? () => openFileDialog() : undefined}
      >
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
            <Upload className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Drop files here or click to browse</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Up to {maxFiles} images/videos, max 15MB each
          </p>
          <Button
            type="button"
            variant="outline"
            size="lg"
            disabled={disabled}
            className="text-base px-8"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Files ({selectedFiles.length}/{maxFiles})
          </Button>
        </div>
      </div>

      {/* Category Filter Buttons */}
      <div className="grid grid-cols-3 gap-4">
        <Button
          variant={activeCategory === 'screenshots' ? 'default' : 'outline'}
          onClick={() => {
            setActiveCategory('screenshots');
            openFileDialog('screenshots');
          }}
          disabled={disabled}
          className="h-20 flex-col gap-2 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 border-blue-200 dark:border-blue-800"
        >
          <Camera className="h-6 w-6 text-blue-600" />
          <div className="text-center">
            <div className="font-medium text-blue-600">Screenshots</div>
            <div className="text-xs text-blue-500">({getFileCountByCategory('screenshots')})</div>
          </div>
        </Button>

        <Button
          variant={activeCategory === 'videos' ? 'default' : 'outline'}
          onClick={() => {
            setActiveCategory('videos');
            openFileDialog('videos');
          }}
          disabled={disabled}
          className="h-20 flex-col gap-2 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 border-purple-200 dark:border-purple-800"
        >
          <Video className="h-6 w-6 text-purple-600" />
          <div className="text-center">
            <div className="font-medium text-purple-600">Videos</div>
            <div className="text-xs text-purple-500">({getFileCountByCategory('videos')})</div>
          </div>
        </Button>

        <Button
          variant={activeCategory === 'documents' ? 'default' : 'outline'}
          onClick={() => {
            setActiveCategory('documents');
            openFileDialog('documents');
          }}
          disabled={disabled}
          className="h-20 flex-col gap-2 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 border-green-200 dark:border-green-800"
        >
          <FileText className="h-6 w-6 text-green-600" />
          <div className="text-center">
            <div className="font-medium text-green-600">Documents</div>
            <div className="text-xs text-green-500">({getFileCountByCategory('documents')})</div>
          </div>
        </Button>
      </div>

      {/* File Preview Grid */}
      {filteredFiles.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">
              {activeCategory === 'all' ? 'All Files' : 
               activeCategory === 'screenshots' ? 'Screenshots' :
               activeCategory === 'videos' ? 'Videos' : 'Documents'} 
              ({filteredFiles.length})
            </h4>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveCategory('all')}
            >
              Show All
            </Button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {filteredFiles.map((file, index) => {
              const actualIndex = selectedFiles.findIndex(f => f === file);
              return (
                <div key={actualIndex} className="relative group">
                  <div className="aspect-square bg-muted rounded-lg overflow-hidden border-2 border-transparent group-hover:border-primary/50 transition-colors">
                    {file.type.startsWith('image/') ? (
                      <img
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        className="w-full h-full object-cover"
                      />
                    ) : file.type.startsWith('video/') ? (
                      <video
                        src={URL.createObjectURL(file)}
                        className="w-full h-full object-cover"
                        muted
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                        <FileText className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => removeFile(actualIndex)}
                    disabled={disabled}
                    className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <p className="text-xs text-muted-foreground mt-2 truncate font-medium">
                    {file.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(1)} MB
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={getAcceptString(activeCategory)}
        multiple
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
        disabled={disabled}
      />
    </div>
  );
};