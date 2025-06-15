
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Upload } from 'lucide-react';
import { fileUploadService } from '@/services/fileUploadService';
import { userService } from '@/services/userService';

interface AddStoryModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onStoryAdded: () => void;
}

export const AddStoryModal: React.FC<AddStoryModalProps> = ({ isOpen, onOpenChange, onStoryAdded }) => {
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = async () => {
    if (!file) return;
    setIsLoading(true);
    try {
      const mediaUrl = await fileUploadService.uploadStoryMedia(file);
      if (mediaUrl) {
        const success = await userService.createStory(mediaUrl, caption);
        if (success) {
          onStoryAdded();
          onOpenChange(false);
          resetForm();
        }
      }
    } catch (error) {
      console.error('Failed to add story', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const resetForm = () => {
      setFile(null);
      setCaption('');
      setPreview(null);
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
        resetForm();
    }
    onOpenChange(open);
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a new Story</DialogTitle>
          <DialogDescription>
            Upload a photo. It will be visible to your followers for 24 hours.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <Input type="file" accept="image/*" onChange={handleFileChange} disabled={isLoading} />
          {preview && (
            <div className="mt-4">
              <img src={preview} alt="Preview" className="max-h-60 w-full object-contain rounded-md" />
            </div>
          )}
          <Textarea
            placeholder="Add a caption... (optional)"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            disabled={isLoading}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!file || isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
            Post Story
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
