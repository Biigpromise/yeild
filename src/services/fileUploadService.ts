
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface UploadResult {
  url: string;
  path: string;
}

export const fileUploadService = {
  // Upload profile picture
  async uploadProfilePicture(file: File, userId: string): Promise<UploadResult | null> {
    try {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Please upload a JPEG, PNG, WebP, or GIF image.",
          variant: "destructive"
        });
        return null;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload an image smaller than 5MB.",
          variant: "destructive"
        });
        return null;
      }

      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/profile-${Date.now()}.${fileExt}`;

      // Delete existing profile picture if it exists
      await this.deleteExistingProfilePicture(userId);

      // Upload new file
      const { data, error } = await supabase.storage
        .from('profile-pictures')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(fileName);

      return {
        url: publicUrl,
        path: fileName
      };
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload profile picture. Please try again.",
        variant: "destructive"
      });
      return null;
    }
  },

  // Delete existing profile picture
  async deleteExistingProfilePicture(userId: string): Promise<void> {
    try {
      const { data: files } = await supabase.storage
        .from('profile-pictures')
        .list(userId);

      if (files && files.length > 0) {
        const filesToDelete = files.map(file => `${userId}/${file.name}`);
        await supabase.storage
          .from('profile-pictures')
          .remove(filesToDelete);
      }
    } catch (error) {
      console.error('Error deleting existing profile picture:', error);
    }
  },

  // Delete profile picture
  async deleteProfilePicture(filePath: string): Promise<boolean> {
    try {
      const { error } = await supabase.storage
        .from('profile-pictures')
        .remove([filePath]);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting profile picture:', error);
      toast({
        title: "Delete failed",
        description: "Failed to delete profile picture.",
        variant: "destructive"
      });
      return false;
    }
  }
};
