
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface UserSignupData {
  id: string;
  user_id: string;
  ip_address?: string | null;
  device_fingerprint?: string;
  user_agent?: string;
  signup_timestamp: string;
  location_country?: string;
  location_city?: string;
  created_at: string;
}

export interface FraudFlag {
  id: string;
  flag_type: string;
  user_id: string;
  related_user_id?: string | null;
  flag_reason: string;
  evidence?: any;
  severity: string | null;
  status: string | null;
  admin_notes?: string | null;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
  created_at: string | null;
}

export interface FraudFlagWithUserData extends FraudFlag {
  user_profile?: {
    name?: string;
    email?: string;
  };
  related_user_profile?: {
    name?: string;
    email?: string;
  };
}

// Generate a simple device fingerprint from browser data
export const generateDeviceFingerprint = (): string => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('Device fingerprint', 2, 2);
  }
  
  const fingerprint = {
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
    screenResolution: `${screen.width}x${screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    canvasFingerprint: canvas.toDataURL(),
    hardwareConcurrency: navigator.hardwareConcurrency,
    cookieEnabled: navigator.cookieEnabled
  };
  
  // Create a simple hash of the fingerprint data
  const fingerprintString = JSON.stringify(fingerprint);
  let hash = 0;
  for (let i = 0; i < fingerprintString.length; i++) {
    const char = fingerprintString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  return Math.abs(hash).toString(16);
};

// Get user's IP address (this would typically be done server-side)
export const getUserIPAddress = async (): Promise<string | null> => {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.error('Error getting IP address:', error);
    return null;
  }
};

export const fraudDetectionService = {
  // Store user signup data for fraud detection
  async storeSignupData(userId: string): Promise<boolean> {
    try {
      const deviceFingerprint = generateDeviceFingerprint();
      const ipAddress = await getUserIPAddress();
      
      const { error } = await supabase
        .from('user_signup_data')
        .insert({
          user_id: userId,
          ip_address: ipAddress,
          device_fingerprint: deviceFingerprint,
          user_agent: navigator.userAgent,
          signup_timestamp: new Date().toISOString()
        });

      if (error) {
        console.error('Error storing signup data:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in storeSignupData:', error);
      return false;
    }
  },

  // Admin functions
  admin: {
    // Get all fraud flags with user data
    async getFraudFlags(): Promise<FraudFlagWithUserData[]> {
      try {
        const { data: flagsData, error } = await supabase
          .from('fraud_flags')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching fraud flags:', error);
          return [];
        }

        if (!flagsData) return [];

        // Manually fetch user profiles for each flag
        const flagsWithUserData: FraudFlagWithUserData[] = [];
        
        for (const flag of flagsData) {
          const flagWithUserData: FraudFlagWithUserData = { ...flag };
          
          // Get user profile for the main user
          if (flag.user_id) {
            const { data: userProfile } = await supabase
              .from('profiles')
              .select('name, email')
              .eq('id', flag.user_id)
              .single();
            
            flagWithUserData.user_profile = userProfile || undefined;
          }

          // Get user profile for the related user if exists
          if (flag.related_user_id) {
            const { data: relatedUserProfile } = await supabase
              .from('profiles')
              .select('name, email')
              .eq('id', flag.related_user_id)
              .single();
            
            flagWithUserData.related_user_profile = relatedUserProfile || undefined;
          }

          flagsWithUserData.push(flagWithUserData);
        }

        return flagsWithUserData;
      } catch (error) {
        console.error('Error fetching fraud flags:', error);
        return [];
      }
    },

    // Get fraud flags by type
    async getFraudFlagsByType(flagType: string): Promise<FraudFlagWithUserData[]> {
      try {
        const { data: flagsData, error } = await supabase
          .from('fraud_flags')
          .select('*')
          .eq('flag_type', flagType)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching fraud flags by type:', error);
          return [];
        }

        if (!flagsData) return [];

        // Manually fetch user profiles for each flag
        const flagsWithUserData: FraudFlagWithUserData[] = [];
        
        for (const flag of flagsData) {
          const flagWithUserData: FraudFlagWithUserData = { ...flag };
          
          // Get user profile for the main user
          if (flag.user_id) {
            const { data: userProfile } = await supabase
              .from('profiles')
              .select('name, email')
              .eq('id', flag.user_id)
              .single();
            
            flagWithUserData.user_profile = userProfile || undefined;
          }

          // Get user profile for the related user if exists
          if (flag.related_user_id) {
            const { data: relatedUserProfile } = await supabase
              .from('profiles')
              .select('name, email')
              .eq('id', flag.related_user_id)
              .single();
            
            flagWithUserData.related_user_profile = relatedUserProfile || undefined;
          }

          flagsWithUserData.push(flagWithUserData);
        }

        return flagsWithUserData;
      } catch (error) {
        console.error('Error fetching fraud flags by type:', error);
        return [];
      }
    },

    // Update fraud flag status
    async updateFraudFlagStatus(
      flagId: string, 
      status: string, 
      adminNotes?: string
    ): Promise<boolean> {
      try {
        const { error } = await supabase
          .from('fraud_flags')
          .update({
            status,
            admin_notes: adminNotes,
            reviewed_by: (await supabase.auth.getUser()).data.user?.id,
            reviewed_at: new Date().toISOString()
          })
          .eq('id', flagId);

        if (error) {
          console.error('Error updating fraud flag:', error);
          toast.error('Failed to update fraud flag');
          return false;
        }

        toast.success('Fraud flag updated successfully');
        return true;
      } catch (error) {
        console.error('Error updating fraud flag:', error);
        toast.error('Failed to update fraud flag');
        return false;
      }
    },

    // Get signup data for analysis
    async getSignupData(): Promise<UserSignupData[]> {
      try {
        const { data, error } = await supabase
          .from('user_signup_data')
          .select('*')
          .order('signup_timestamp', { ascending: false });

        if (error) {
          console.error('Error fetching signup data:', error);
          return [];
        }

        // Transform the data to match our interface
        const transformedData: UserSignupData[] = (data || []).map(item => ({
          ...item,
          ip_address: item.ip_address?.toString() || null
        }));

        return transformedData;
      } catch (error) {
        console.error('Error fetching signup data:', error);
        return [];
      }
    }
  }
};
