
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const adminAccessService = {
  // Check if current user has admin access
  async checkAdminAccess(): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('No user found');
        return false;
      }

      console.log('Checking admin access for user:', user.email);

      // Check database for admin role - removed hardcoded email check for security
      const { data: roles, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin');

      if (error) {
        console.error('Error checking admin role:', error);
        return false;
      }

      const hasAdminRole = roles && roles.length > 0;
      console.log('Has admin role in database:', hasAdminRole);

      // Log admin access check for security audit
      if (hasAdminRole) {
        await this.logSecurityEvent(user.id, 'admin_access_verified', {
          user_email: user.email,
          access_granted: true
        });
      }

      return hasAdminRole;
    } catch (error) {
      console.error('Error checking admin access:', error);
      return false;
    }
  },

  // Secure admin role assignment using database function
  async grantAdminAccess(userEmail: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('verify_admin_access_secure', {
        user_email: userEmail
      });

      if (error) {
        console.error('Error granting admin access:', error);
        toast.error('Failed to grant admin access: ' + error.message);
        return false;
      }

      if (data) {
        toast.success('Admin access granted successfully');
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

  // Enhanced security event logging
  async logSecurityEvent(userId: string, eventType: string, details: any): Promise<void> {
    try {
      await supabase.rpc('log_security_event', {
        user_id_param: userId,
        event_type: eventType,
        event_details: details
      });
    } catch (error) {
      console.error('Error logging security event:', error);
    }
  },

  // Validate user session and check for suspicious activity
  async validateUserSession(): Promise<boolean> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) return false;

      // Check for session anomalies
      const lastActivity = localStorage.getItem('last_admin_activity');
      const currentTime = Date.now();
      
      if (lastActivity) {
        const timeDiff = currentTime - parseInt(lastActivity);
        // If more than 4 hours of inactivity, require re-authentication
        if (timeDiff > 4 * 60 * 60 * 1000) {
          await this.logSecurityEvent(user.id, 'session_timeout_detected', {
            last_activity: lastActivity,
            current_time: currentTime
          });
          return false;
        }
      }

      localStorage.setItem('last_admin_activity', currentTime.toString());
      return true;
    } catch (error) {
      console.error('Error validating user session:', error);
      return false;
    }
  }
};
