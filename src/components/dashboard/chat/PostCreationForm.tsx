import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface PostCreationFormProps {
  newMessage: string;
  setNewMessage: (message: string) => void;
  mediaPreview: string | null;
  mediaFile: File | null;
  onFileSelect: (file: File) => void;
  onRemoveMedia: () => void;
  onSubmit: (e: React.FormEvent) => void;
  sending: boolean;
  userEmail?: string;
  userAvatarUrl?: string;
}

export const PostCreationForm: React.FC<PostCreationFormProps> = ({
  newMessage,
  setNewMessage,
  mediaPreview,
  mediaFile,
  onFileSelect,
  onRemoveMedia,
  onSubmit,
  sending,
  userEmail,
  userAvatarUrl
}) => {
  return (
    <div className="border-t border-gray-800 p-4 pb-32 lg:pb-4 bg-gray-900 flex-shrink-0">
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
              ×
            </Button>
          </div>
        </div>
      )}
      
      <form onSubmit={onSubmit} className="flex items-center gap-3">
        <Avatar className="h-10 w-10 flex-shrink-0">
          <AvatarImage src={userAvatarUrl} />
          <AvatarFallback className="bg-gray-700 text-white">
            {userEmail?.charAt(0)?.toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 flex items-center gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="What's on your mind?"
            className="flex-1 bg-gray-800 border-gray-700 text-white placeholder-gray-400 rounded-full"
            disabled={sending}
          />
          
          <input
            type="file"
            accept="image/*,video/*"
            className="hidden"
            id="media-upload"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onFileSelect(file);
            }}
          />
          
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => document.getElementById('media-upload')?.click()}
            className="text-gray-400 hover:text-white"
          >
            📷
          </Button>
          
          <Button 
            type="submit" 
            disabled={sending || (!newMessage.trim() && !mediaFile)}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6"
          >
            {sending ? '...' : 'Post'}
          </Button>
        </div>
      </form>
    </div>
  );
};