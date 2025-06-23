
import { fraudDetectionService } from './fraudDetectionService';
import { imageHashService } from './imageHashService';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface FraudDetectionStats {
  totalFlags: number;
  pendingFlags: number;
  highSeverityFlags: number;
  duplicateReferrals: number;
  duplicateImages: number;
}

export const integratedFraudDetectionService = {
  // Initialize fraud detection for a new user
  async initializeUserFraudDetection(userId: string): Promise<void> {
    try {
      // Store signup data
      await fraudDetectionService.storeSignupData(userId);
      console.log('Fraud detection initialized for user:', userId);
    } catch (error) {
      console.error('Failed to initialize fraud detection:', error);
    }
  },

  // Process task submission for image fraud detection
  async processTaskSubmission(
    userId: string, 
    taskId: string, 
    submissionId: string, 
    imageUrl: string
  ): Promise<void> {
    try {
      // Store image hash and check for duplicates
      await imageHashService.storeImageHash(userId, taskId, submissionId, imageUrl);
      console.log('Task submission processed for fraud detection');
    } catch (error) {
      console.error('Failed to process task submission for fraud detection:', error);
    }
  },

  // Get comprehensive fraud detection stats
  async getFraudDetectionStats(): Promise<FraudDetectionStats> {
    try {
      const [fraudFlags, duplicateImageFlags] = await Promise.all([
        fraudDetectionService.admin.getFraudFlagsByType(''),
        imageHashService.admin.getDuplicateFlags()
      ]);

      const pendingFlags = fraudFlags.filter(flag => flag.status === 'pending');
      const highSeverityFlags = fraudFlags.filter(flag => flag.severity === 'high');
      const duplicateReferrals = fraudFlags.filter(flag => flag.flag_type === 'duplicate_referral');

      return {
        totalFlags: fraudFlags.length + duplicateImageFlags.length,
        pendingFlags: pendingFlags.length + duplicateImageFlags.filter(flag => !flag.reviewed).length,
        highSeverityFlags: highSeverityFlags.length,
        duplicateReferrals: duplicateReferrals.length,
        duplicateImages: duplicateImageFlags.length
      };
    } catch (error) {
      console.error('Failed to get fraud detection stats:', error);
      return {
        totalFlags: 0,
        pendingFlags: 0,
        highSeverityFlags: 0,
        duplicateReferrals: 0,
        duplicateImages: 0
      };
    }
  },

  // Monitor and alert for new fraud flags
  async checkForNewFraudAlerts(): Promise<void> {
    try {
      const { data: recentFlags } = await supabase
        .from('fraud_flags')
        .select('*')
        .eq('status', 'pending')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()); // Last 24 hours

      if (recentFlags && recentFlags.length > 0) {
        const highSeverityCount = recentFlags.filter(flag => flag.severity === 'high').length;
        
        if (highSeverityCount > 0) {
          toast.warning(`${highSeverityCount} high-severity fraud alerts detected in the last 24 hours`);
        }
      }
    } catch (error) {
      console.error('Failed to check for fraud alerts:', error);
    }
  }
};
