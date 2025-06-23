
import { supabase } from "@/integrations/supabase/client";

export interface FraudFlagWithUserData {
  id: string;
  user_id: string;
  related_user_id: string;
  flag_type: string;
  flag_reason: string;
  severity: string;
  status: string;
  evidence: any;
  created_at: string;
  reviewed_at?: string;
  admin_notes?: string;
  user_profile?: {
    id: string;
    name?: string;
    email?: string;
  };
  related_user_profile?: {
    id: string;
    name?: string;
    email?: string;
  };
}

export const fraudDetectionService = {
  async storeSignupData(userId: string) {
    try {
      // Get basic device/browser info
      const userAgent = navigator.userAgent;
      const deviceFingerprint = this.generateDeviceFingerprint();

      // Store the signup data
      const { error } = await supabase
        .from('user_signup_data')
        .insert({
          user_id: userId,
          user_agent: userAgent,
          device_fingerprint: deviceFingerprint,
          signup_timestamp: new Date().toISOString()
        });

      if (error) {
        console.error('Error storing signup data:', error);
      }
    } catch (error) {
      console.error('Error in storeSignupData:', error);
    }
  },

  generateDeviceFingerprint(): string {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillText('Device fingerprint', 2, 2);
      }
      
      const fingerprint = [
        navigator.userAgent,
        navigator.language,
        screen.width + 'x' + screen.height,
        new Date().getTimezoneOffset(),
        canvas.toDataURL()
      ].join('|');

      // Simple hash function
      let hash = 0;
      for (let i = 0; i < fingerprint.length; i++) {
        const char = fingerprint.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
      }
      
      return Math.abs(hash).toString(16);
    } catch (error) {
      console.error('Error generating device fingerprint:', error);
      return 'unknown';
    }
  },

  admin: {
    async getFraudFlagsByType(flagType: string): Promise<FraudFlagWithUserData[]> {
      try {
        // Mock implementation since we don't have the fraud_flags table
        return [];
      } catch (error) {
        console.error('Error getting fraud flags:', error);
        return [];
      }
    },

    async updateFraudFlagStatus(flagId: string, status: string, adminNotes: string): Promise<boolean> {
      try {
        // Mock implementation since we don't have the fraud_flags table
        return true;
      } catch (error) {
        console.error('Error updating fraud flag status:', error);
        return false;
      }
    }
  }
};
