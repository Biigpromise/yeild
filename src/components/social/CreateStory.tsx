import React, { useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Plus, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface CreateStoryProps {
  onStoryCreated: () => void;
}

export const CreateStory: React.FC<CreateStoryProps> = ({ onStoryCreated }) => {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [caption, setCaption] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      toast.error('Only image and video files are allowed');
      return;
    }

    if (file.size > 50 * 1024 * 1024) { // 50MB limit for stories
      toast.error('File size must be less than 50MB');
      return;
    }

    setMediaFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setMediaPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const uploadMedia = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}/${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('stories')
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('stories')
        .getPublicUrl(data.path);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading media:', error);
      toast.error('Failed to upload media');
      return null;
    }
  };

  const createStory = async () => {
    if (!user || !mediaFile) return;

    setUploading(true);

    try {
      const mediaUrl = await uploadMedia(mediaFile);
      if (!mediaUrl) {
        setUploading(false);
        return;
      }

      const { error } = await supabase
        .from('stories')
        .insert({
          user_id: user.id,
          media_url: mediaUrl,
          media_type: mediaFile.type.startsWith('video/') ? 'video' : 'image',
          caption: caption.trim() || null
        });

      if (error) throw error;

      // Clear form
      setMediaFile(null);
      setMediaPreview(null);
      setCaption('');
      onStoryCreated();
      toast.success('Story posted successfully!');
    } catch (error) {
      console.error('Error creating story:', error);
      toast.error('Failed to post story');
    } finally {
      setUploading(false);
    }
  };

  if (!user) return null;

  return (
    <Card className="relative h-32 border-2 border-dashed border-primary/20 hover:border-primary/40 transition-colors cursor-pointer">
      {!mediaPreview ? (
        <div 
          className="h-full flex flex-col items-center justify-center gap-2"
          onClick={() => fileInputRef.current?.click()}
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.user_metadata?.avatar_url} />
            <AvatarFallback>
              {user?.user_metadata?.full_name?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <Plus className="h-6 w-6 text-primary" />
          <span className="text-xs text-muted-foreground">Add Story</span>
        </div>
      ) : (
        <div className="h-full relative">
          {mediaFile?.type.startsWith('image/') ? (
            <img 
              src={mediaPreview} 
              alt="Story preview"
              className="w-full h-full object-cover rounded"
            />
          ) : (
            <video 
              src={mediaPreview} 
              className="w-full h-full object-cover rounded"
              muted
            />
          )}
          
          <div className="absolute inset-0 bg-black/50 flex flex-col justify-between p-2 rounded">
            <Button
              variant="destructive"
              size="sm"
              className="h-6 w-6 p-0 self-end"
              onClick={() => {
                setMediaFile(null);
                setMediaPreview(null);
                setCaption('');
              }}
            >
              <X className="h-3 w-3" />
            </Button>
            
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Add caption..."
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="w-full px-2 py-1 text-xs rounded bg-black/50 text-white placeholder-white/70 border-none"
                maxLength={100}
              />
              <Button 
                size="sm" 
                className="w-full h-6 text-xs"
                onClick={createStory}
                disabled={uploading}
              >
                {uploading ? 'Posting...' : 'Share Story'}
              </Button>
            </div>
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </Card>
  );
};