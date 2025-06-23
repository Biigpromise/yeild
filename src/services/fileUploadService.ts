
import { supabase } from "@/integrations/supabase/client";

export const fileUploadService = {
  async uploadStoryMedia(file: File): Promise<string | null> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('stories')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Error uploading file:', uploadError);
        return null;
      }

      const { data } = supabase.storage
        .from('stories')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Error in uploadStoryMedia:', error);
      return null;
    }
  },

  async uploadTaskSubmission(file: File): Promise<string | null> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `submission_${Date.now()}.${fileExt}`;
      const filePath = `submissions/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('stories')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Error uploading submission file:', uploadError);
        return null;
      }

      const { data } = supabase.storage
        .from('stories')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Error in uploadTaskSubmission:', error);
      return null;
    }
  },

  async uploadProfilePicture(file: File, userId: string): Promise<{ url: string } | null> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('stories')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        console.error('Error uploading profile picture:', uploadError);
        return null;
      }

      const { data } = supabase.storage
        .from('stories')
        .getPublicUrl(filePath);

      return { url: data.publicUrl };
    } catch (error) {
      console.error('Error in uploadProfilePicture:', error);
      return null;
    }
  },

  async deleteProfilePicture(filePath: string): Promise<boolean> {
    try {
      const { error } = await supabase.storage
        .from('stories')
        .remove([filePath]);

      if (error) {
        console.error('Error deleting profile picture:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteProfilePicture:', error);
      return false;
    }
  },

  async uploadChatMedia(file: File): Promise<string | null> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `chat_${Date.now()}.${fileExt}`;
      const filePath = `chat/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('stories')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Error uploading chat media:', uploadError);
        return null;
      }

      const { data } = supabase.storage
        .from('stories')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Error in uploadChatMedia:', error);
      return null;
    }
  }
};
