
import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Paperclip, Send, X } from 'lucide-react';
import { ChatPrivacyToggle } from './ChatPrivacyToggle';

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  return (
    <div className="border-t border-gray-800 p-3 bg-gray-900">
      <ChatPrivacyToggle />
      
      {mediaPreview && (
        <div className="mb-3 relative inline-block">
          <div className="relative">
            {mediaFile?.type.startsWith('video/') ? (
              <video src={mediaPreview} className="max-h-20 rounded border" />
            ) : (
              <img src={mediaPreview} alt="Preview" className="max-h-20 rounded border" />
            )}
            <Button
              size="sm"
              variant="destructive"
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
              onClick={onRemoveMedia}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )}
      
      <form onSubmit={onSendMessage} className="flex items-center gap-2">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*,video/*"
          className="hidden"
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          className="flex-shrink-0"
        >
          <Paperclip className="h-4 w-4" />
        </Button>
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 bg-gray-800 border-gray-700 text-white"
          disabled={sending}
        />
        <Button type="submit" disabled={sending || (!newMessage.trim() && !mediaFile)}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
};
