
import React from 'react';
import { Textarea } from "@/components/ui/textarea";
import { MediaPreview } from './MediaPreview';

interface PostFormContentProps {
  newPost: string;
  setNewPost: (value: string) => void;
  mediaPreview: string | null;
  mediaType: 'image' | 'video' | null;
  onRemoveMedia: () => void;
  disabled: boolean;
}

export const PostFormContent: React.FC<PostFormContentProps> = ({
  newPost,
  setNewPost,
  mediaPreview,
  mediaType,
  onRemoveMedia,
  disabled
}) => {
  return (
    <div className="flex-1">
      <Textarea
        value={newPost}
        onChange={(e) => setNewPost(e.target.value)}
        placeholder="What's on your mind?"
        className="min-h-[60px] resize-none border-0 shadow-none text-lg placeholder:text-muted-foreground"
        disabled={disabled}
      />
      
      {mediaPreview && mediaType && (
        <MediaPreview
          mediaPreview={mediaPreview}
          mediaType={mediaType}
          onRemove={onRemoveMedia}
        />
      )}
    </div>
  );
};
