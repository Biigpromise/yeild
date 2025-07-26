
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const adminVerification = {
  /**
   * Verify and grant admin access to a specific email address
   * Uses secure database function with enhanced validation and logging
   */
  async grantAdminAccess(email: string): Promise<boolean> {
    try {
      // Enhanced input validation
      if (!email || !email.includes('@') || email.length < 5) {
        toast.error('Invalid email address provided');
        return false;
      }

      // Log the admin access attempt
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.rpc('log_security_event_enhanced', {
          user_id_param: user.id,
          event_type: 'admin_access_attempt',
          event_details: {
            target_email: email,
            timestamp: new Date().toISOString()
          },
          severity_param: 'medium'
        });
      }

      const { data, error } = await supabase.rpc('verify_admin_access_secure', {
        user_email: email
      });

      if (error) {
        console.error('Error granting admin access:', error);
        toast.error('Failed to grant admin access: ' + error.message);
        return false;
      }

      if (data) {
        toast.success('Admin access granted successfully');
        
        // Log successful admin creation
        if (user) {
          await supabase.rpc('log_security_event_enhanced', {
            user_id_param: user.id,
            event_type: 'admin_access_granted',
            event_details: {
              target_email: email,
              granted_by: user.email,
              timestamp: new Date().toISOString()
            },
            severity_param: 'high'
          });
        }
        
        return true;
      } else {
        toast.error('User not found with that email or email not verified');
        return false;
      }
    } catch (error) {
      console.error('Error granting admin access:', error);
      toast.error('Failed to grant admin access');
      return false;
    }
  },

  /**
   * Check if current user has admin role with enhanced security
   */
  async isCurrentUserAdmin(): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      // Use secure role checking function
      const { data, error } = await supabase.rpc('check_user_role_secure', {
        check_user_id: user.id,
        required_role: 'admin'
      });

      if (error) {
        console.error('Error checking admin status:', error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  }
};

/**
 * Enhanced security utilities for admin management
 */
export const securityUtils = {
  /**
   * Validate admin session and log security events
   */
  async validateAdminSession(): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const isAdmin = await adminVerification.isCurrentUserAdmin();
      
      if (isAdmin) {
        // Log admin session validation
        await supabase.rpc('log_security_event_enhanced', {
          user_id_param: user.id,
          event_type: 'admin_session_validated',
          event_details: {
            timestamp: new Date().toISOString(),
            session_id: user.id
          },
          severity_param: 'low'
        });
      }

      return isAdmin;
    } catch (error) {
      console.error('Error validating admin session:', error);
      return false;
    }
  },

  /**
   * Log suspicious admin activity
   */
  async logSuspiciousActivity(activity: string, details: any): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.rpc('log_security_event_enhanced', {
        user_id_param: user.id,
        event_type: 'suspicious_admin_activity',
        event_details: {
          activity,
          details,
          timestamp: new Date().toISOString(),
          user_agent: navigator.userAgent,
          url: window.location.href
        },
        severity_param: 'high'
      });
    } catch (error) {
      console.error('Error logging suspicious activity:', error);
    }
  }
};

// SECURITY NOTE: Admin verification should only be used through secure channels
// For one-time admin setup, contact system administrator
// All admin access attempts are logged for security auditing
