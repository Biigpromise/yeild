
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const STORY_BUCKET_NAME = 'stories';
const PROFILE_PICTURE_BUCKET_NAME = 'profile-pictures';

export const fileUploadService = {
  async uploadStoryMedia(file: File): Promise<string | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('You must be logged in to upload files.');
        return null;
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(STORY_BUCKET_NAME)
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from(STORY_BUCKET_NAME)
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error: any) {
      console.error('Error uploading file:', error);
      toast.error(error.message || 'Failed to upload file.');
      return null;
    }
  },

  async uploadProfilePicture(file: File, userId: string): Promise<{ url: string } | null> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(PROFILE_PICTURE_BUCKET_NAME)
        .upload(filePath, file, {
          upsert: true,
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from(PROFILE_PICTURE_BUCKET_NAME)
        .getPublicUrl(filePath);
      
      return { url: data.publicUrl };
    } catch (error: any) {
      console.error('Error uploading profile picture:', error);
      toast.error(error.message || 'Failed to upload profile picture.');
      return null;
    }
  },

  async deleteProfilePicture(filePath: string): Promise<boolean> {
    try {
      const { error } = await supabase.storage
        .from(PROFILE_PICTURE_BUCKET_NAME)
        .remove([filePath]);

      if (error) {
        throw error;
      }
      return true;
    } catch (error: any) {
      console.error('Error deleting profile picture:', error);
      toast.error(error.message || 'Failed to delete profile picture.');
      return false;
    }
  },
};
