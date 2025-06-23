
import React, { useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, Image } from 'lucide-react';
import { FilePreview } from './FilePreview';
import { toast } from 'sonner';

interface MessageInputFormProps {
  newMessage: string;
  setNewMessage: (message: string) => void;
  selectedFile: File | null;
  filePreview: string | null;
  sending: boolean;
  uploading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveFile: () => void;
}

export const MessageInputForm: React.FC<MessageInputFormProps> = ({
  newMessage,
  setNewMessage,
  selectedFile,
  filePreview,
  sending,
  uploading,
  onSubmit,
  onFileSelect,
  onRemoveFile
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

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

    onFileSelect(event);
  };

  return (
    <div className="border-t border-gray-700 p-4">
      {filePreview && selectedFile && (
        <FilePreview
          filePreview={filePreview}
          selectedFile={selectedFile}
          onRemove={onRemoveFile}
        />
      )}
      
      <form onSubmit={onSubmit} className="flex gap-2">
        <div className="flex-1 flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            disabled={sending || uploading}
            maxLength={500}
            className="flex-1 bg-gray-800 border-gray-600 text-white placeholder:text-gray-400"
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={sending || uploading}
            className="px-3 border-gray-600 text-white hover:bg-gray-700"
          >
            <Image className="h-4 w-4" />
          </Button>
        </div>
        <Button 
          type="submit" 
          disabled={(!newMessage.trim() && !selectedFile) || sending || uploading}
          size="sm"
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          {sending || uploading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </form>
      <div className="text-xs text-gray-400 mt-2">
        {newMessage.length}/500 characters
      </div>
    </div>
  );
};
