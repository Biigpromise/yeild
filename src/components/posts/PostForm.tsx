
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';

interface PostFormProps {
  newPost: string;
  setNewPost: (value: string) => void;
  handlePostSubmit: (e: React.FormEvent) => Promise<void>;
  userId: string | null;
}

export const PostForm: React.FC<PostFormProps> = ({ newPost, setNewPost, handlePostSubmit, userId }) => {
  return (
    <div className="p-4 border-b bg-muted">
      <form onSubmit={handlePostSubmit} className="flex gap-2">
        <Input
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
          placeholder="What's on your mind?"
          disabled={!userId}
          autoComplete="off"
        />
        <Button type="submit" disabled={!userId || newPost.trim() === ""}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
};
