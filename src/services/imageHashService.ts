
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ImageHash {
  id: string;
  hash_value: string;
  user_id: string;
  task_id?: string;
  submission_id?: string;
  file_url: string;
  created_at: string;
}

export interface GlobalImageUsage {
  id: string;
  hash_value: string;
  user_id: string;
  task_id?: string;
  submission_id?: string;
  file_url: string;
  used_at: string;
}

export interface DuplicateImageFlag {
  id: string;
  original_hash_id: string;
  duplicate_hash_id: string;
  flagged_at: string;
  reviewed: boolean;
  admin_notes?: string;
}

export const imageHashService = {
  // Generate SHA-256 hash from file
  async generateFileHash(file: File): Promise<string> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (error) {
      console.error('Hash generation failed:', error);
      return `fallback_${file.name}_${file.size}_${file.lastModified}`;
    }
  },

  // Check if hash already exists globally (across all users)
  async checkForGlobalDuplicate(hash: string, userId: string): Promise<{ isDuplicate: boolean; originalUser?: string }> {
    try {
      const { data: existingUsage, error } = await supabase
        .from('global_image_usage')
        .select('*')
        .eq('hash_value', hash)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking for global duplicate:', error);
        return { isDuplicate: false };
      }

      if (existingUsage) {
        return { 
          isDuplicate: true, 
          originalUser: existingUsage.user_id 
        };
      }

      return { isDuplicate: false };
    } catch (error) {
      console.error('Error in global duplicate check:', error);
      return { isDuplicate: false };
    }
  },

  // Check multiple files for duplicates
  async checkMultipleFilesForDuplicates(files: File[], userId: string): Promise<{ duplicates: string[], validFiles: File[] }> {
    const duplicates: string[] = [];
    const validFiles: File[] = [];

    for (const file of files) {
      const hash = await this.generateFileHash(file);
      const { isDuplicate } = await this.checkForGlobalDuplicate(hash, userId);
      
      if (isDuplicate) {
        duplicates.push(file.name);
      } else {
        validFiles.push(file);
      }
    }

    return { duplicates, validFiles };
  },

  // Store image hash in global usage table
  async storeGlobalImageUsage(hash: string, userId: string, fileUrl: string, taskId?: string, submissionId?: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('global_image_usage')
        .insert({
          hash_value: hash,
          user_id: userId,
          task_id: taskId,
          submission_id: submissionId,
          file_url: fileUrl
        });

      if (error) {
        console.error('Error storing global image usage:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error storing global image usage:', error);
      return false;
    }
  },

  // Store multiple files in global usage
  async storeMultipleGlobalUsage(files: File[], fileUrls: string[], userId: string, taskId?: string, submissionId?: string): Promise<boolean> {
    try {
      const usageRecords = [];

      for (let i = 0; i < files.length; i++) {
        const hash = await this.generateFileHash(files[i]);
        usageRecords.push({
          hash_value: hash,
          user_id: userId,
          task_id: taskId,
          submission_id: submissionId,
          file_url: fileUrls[i]
        });
      }

      const { error } = await supabase
        .from('global_image_usage')
        .insert(usageRecords);

      if (error) {
        console.error('Error storing multiple global image usage:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error storing multiple global image usage:', error);
      return false;
    }
  },

  // Legacy functions for backwards compatibility
  async checkForDuplicate(hash: string, userId: string, taskId?: string): Promise<{ isDuplicate: boolean; originalSubmission?: ImageHash }> {
    const { isDuplicate } = await this.checkForGlobalDuplicate(hash, userId);
    return { isDuplicate };
  },

  async storeImageHash(hash: string, userId: string, fileUrl: string, taskId?: string, submissionId?: string): Promise<boolean> {
    return this.storeGlobalImageUsage(hash, userId, fileUrl, taskId, submissionId);
  },

  // Admin functions
  admin: {
    async getDuplicateFlags(): Promise<DuplicateImageFlag[]> {
      try {
        const { data, error } = await supabase
          .from('duplicate_image_flags')
          .select(`
            *,
            original_hash:image_hashes!duplicate_image_flags_original_hash_id_fkey(*),
            duplicate_hash:image_hashes!duplicate_image_flags_duplicate_hash_id_fkey(*)
          `)
          .eq('reviewed', false)
          .order('flagged_at', { ascending: false });

        if (error) {
          console.error('Error fetching duplicate flags:', error);
          return [];
        }

        return data || [];
      } catch (error) {
        console.error('Error fetching duplicate flags:', error);
        return [];
      }
    },

    async markAsReviewed(flagId: string, adminNotes?: string): Promise<boolean> {
      try {
        const { error } = await supabase
          .from('duplicate_image_flags')
          .update({
            reviewed: true,
            admin_notes: adminNotes
          })
          .eq('id', flagId);

        if (error) {
          console.error('Error marking flag as reviewed:', error);
          toast.error('Failed to update duplicate flag');
          return false;
        }

        toast.success('Duplicate flag reviewed');
        return true;
      } catch (error) {
        console.error('Error marking flag as reviewed:', error);
        toast.error('Failed to update duplicate flag');
        return false;
      }
    },

    async getGlobalImageUsage(): Promise<GlobalImageUsage[]> {
      try {
        const { data, error } = await supabase
          .from('global_image_usage')
          .select('*')
          .order('used_at', { ascending: false });

        if (error) {
          console.error('Error fetching global image usage:', error);
          return [];
        }

        return data || [];
      } catch (error) {
        console.error('Error fetching global image usage:', error);
        return [];
      }
    }
  }
};
