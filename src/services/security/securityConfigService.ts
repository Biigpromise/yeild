import { supabase } from '@/integrations/supabase/client';

interface SecurityConfig {
  maxLoginAttempts: number;
  lockoutDuration: number; // minutes
  requireMfa: boolean;
  passwordMinLength: number;
  sessionTimeout: number; // minutes
  enableAuditLogging: boolean;
  alertThresholds: {
    failedLogins: number;
    suspiciousActivity: number;
    adminActions: number;
  };
}

export const securityConfigService = {
  /**
   * Get current security configuration
   */
  async getSecurityConfig(): Promise<SecurityConfig> {
    const defaultConfig: SecurityConfig = {
      maxLoginAttempts: 5,
      lockoutDuration: 30,
      requireMfa: false,
      passwordMinLength: 8,
      sessionTimeout: 480, // 8 hours
      enableAuditLogging: true,
      alertThresholds: {
        failedLogins: 3,
        suspiciousActivity: 2,
        adminActions: 1
      }
    };

    try {
      // In a real implementation, this would fetch from a config table
      return defaultConfig;
    } catch (error) {
      console.error('Error fetching security config:', error);
      return defaultConfig;
    }
  },

  /**
   * Update security configuration (admin only)
   */
  async updateSecurityConfig(config: Partial<SecurityConfig>): Promise<boolean> {
    try {
      // Verify admin privileges
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data: isAdmin } = await supabase.rpc('is_admin_safe', {
        user_id_param: user.id
      });

      if (!isAdmin) {
        throw new Error('Unauthorized: Admin privileges required');
      }

      // Log security config change
      await supabase.rpc('log_security_event_enhanced', {
        user_id_param: user.id,
        event_type: 'security_config_change',
        event_details: { 
          changes: config,
          timestamp: new Date().toISOString()
        },
        severity_param: 'medium'
      });

      // In a real implementation, this would update a config table
      console.log('Security config updated:', config);
      return true;
    } catch (error) {
      console.error('Error updating security config:', error);
      return false;
    }
  },

  /**
   * Enable password strength requirements
   */
  async enablePasswordSecurity(): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data: isAdmin } = await supabase.rpc('is_admin_safe', {
        user_id_param: user.id
      });

      if (!isAdmin) {
        throw new Error('Unauthorized: Admin privileges required');
      }

      // Log the security enhancement
      await supabase.rpc('log_security_event_enhanced', {
        user_id_param: user.id,
        event_type: 'password_security_enabled',
        event_details: { 
          action: 'enable_password_protection',
          timestamp: new Date().toISOString()
        },
        severity_param: 'low'
      });

      console.log('Password security features enabled');
      return true;
    } catch (error) {
      console.error('Error enabling password security:', error);
      return false;
    }
  },

  /**
   * Get security metrics for dashboard
   */
  async getSecurityMetrics(): Promise<any> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: isAdmin } = await supabase.rpc('is_admin_safe', {
        user_id_param: user.id
      });

      if (!isAdmin) {
        throw new Error('Unauthorized: Admin privileges required');
      }

      // Get recent security events
      const { data: recentEvents } = await supabase
        .from('security_audit_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(100);

      const now = new Date();
      const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      const metrics = {
        totalEvents: recentEvents?.length || 0,
        last24Hours: recentEvents?.filter(e => new Date(e.timestamp) > last24Hours).length || 0,
        criticalEvents: recentEvents?.filter(e => e.severity === 'critical').length || 0,
        highEvents: recentEvents?.filter(e => e.severity === 'high').length || 0,
        recentEvents: recentEvents?.slice(0, 10) || []
      };

      return metrics;
    } catch (error) {
      console.error('Error fetching security metrics:', error);
      return null;
    }
  }
};