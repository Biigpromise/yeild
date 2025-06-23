
import { supabase } from "@/integrations/supabase/client";

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
  }
};
