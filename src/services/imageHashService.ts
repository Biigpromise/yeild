
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

export interface DuplicateImageFlag {
  id: string;
  original_hash_id: string;
  duplicate_hash_id: string;
  flagged_at: string;
  reviewed: boolean;
  admin_notes?: string;
}

export const imageHashService = {
  // Generate MD5 hash from file
  async generateFileHash(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('MD5', arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  },

  // Check if hash already exists and flag if duplicate
  async checkForDuplicate(hash: string, userId: string, taskId?: string): Promise<{ isDuplicate: boolean; originalSubmission?: ImageHash }> {
    try {
      const { data: existingHash, error } = await supabase
        .from('image_hashes')
        .select('*')
        .eq('hash_value', hash)
        .neq('user_id', userId) // Don't flag if same user (they might resubmit)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error checking for duplicate:', error);
        return { isDuplicate: false };
      }

      if (existingHash) {
        // Create duplicate flag
        await this.createDuplicateFlag(existingHash.id, hash, userId, taskId);
        return { isDuplicate: true, originalSubmission: existingHash };
      }

      return { isDuplicate: false };
    } catch (error) {
      console.error('Error in duplicate check:', error);
      return { isDuplicate: false };
    }
  },

  // Store image hash
  async storeImageHash(hash: string, userId: string, fileUrl: string, taskId?: string, submissionId?: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('image_hashes')
        .insert({
          hash_value: hash,
          user_id: userId,
          task_id: taskId,
          submission_id: submissionId,
          file_url: fileUrl
        });

      if (error) {
        console.error('Error storing image hash:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error storing image hash:', error);
      return false;
    }
  },

  // Create duplicate flag for admin review
  async createDuplicateFlag(originalHashId: string, duplicateHash: string, userId: string, taskId?: string): Promise<void> {
    try {
      // First, store the duplicate hash
      const { data: duplicateHashRecord, error: hashError } = await supabase
        .from('image_hashes')
        .insert({
          hash_value: duplicateHash,
          user_id: userId,
          task_id: taskId,
          file_url: 'DUPLICATE_FLAGGED'
        })
        .select()
        .single();

      if (hashError || !duplicateHashRecord) {
        console.error('Error storing duplicate hash:', hashError);
        return;
      }

      // Create the duplicate flag
      const { error: flagError } = await supabase
        .from('duplicate_image_flags')
        .insert({
          original_hash_id: originalHashId,
          duplicate_hash_id: duplicateHashRecord.id
        });

      if (flagError) {
        console.error('Error creating duplicate flag:', flagError);
      }
    } catch (error) {
      console.error('Error creating duplicate flag:', error);
    }
  },

  // Admin functions
  admin: {
    // Get all duplicate flags for admin dashboard
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

    // Mark duplicate flag as reviewed
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
    }
  }
};
