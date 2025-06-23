
import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Image, X } from 'lucide-react';
import { toast } from 'sonner';

interface ChatInputProps {
  newMessage: string;
  setNewMessage: (message: string) => void;
  mediaFile: File | null;
  mediaPreview: string | null;
  sending: boolean;
  onSendMessage: (e: React.FormEvent) => void;
  onFileSelect: (file: File) => void;
  onRemoveMedia: () => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  newMessage,
  setNewMessage,
  mediaFile,
  mediaPreview,
  sending,
  onSendMessage,
  onFileSelect,
  onRemoveMedia
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      toast.error('Please select an image or video file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    onFileSelect(file);
  };

  return (
    <div className="flex-shrink-0 border-t border-gray-700 p-3 bg-gray-900">
      {mediaPreview && (
        <div className="mb-2 relative inline-block">
          {mediaFile?.type.startsWith('image/') ? (
            <img
              src={mediaPreview}
              alt="Preview"
              className="max-w-24 max-h-24 rounded border"
            />
          ) : (
            <video
              src={mediaPreview}
              className="max-w-24 max-h-24 rounded border"
              preload="metadata"
            />
          )}
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute -top-1 -right-1 h-5 w-5 p-0 rounded-full"
            onClick={onRemoveMedia}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}

      <form onSubmit={onSendMessage} className="flex gap-2">
        <Textarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          disabled={sending}
          maxLength={500}
          className="min-h-[50px] max-h-[100px] resize-none flex-1 bg-gray-800 border-gray-600 text-white placeholder:text-gray-400"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              onSendMessage(e);
            }
          }}
        />
        
        <div className="flex flex-col gap-1 flex-shrink-0">
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
            disabled={sending}
            className="border-gray-600 text-white hover:bg-gray-700 w-9 h-9 p-0"
          >
            <Image className="h-4 w-4" />
          </Button>
          <Button
            type="submit"
            disabled={(!newMessage.trim() && !mediaFile) || sending}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 w-9 h-9 p-0"
          >
            {sending ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </form>
      
      <div className="text-xs text-gray-400 mt-1">
        {newMessage.length}/500 • Enter to send, Shift+Enter for new line
      </div>
    </div>
  );
};
