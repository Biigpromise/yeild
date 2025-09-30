import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SecurityEvent {
  type: 'failed_login' | 'suspicious_activity' | 'admin_action' | 'data_access';
  severity: 'low' | 'medium' | 'high' | 'critical';
  details: Record<string, any>;
  user_id?: string;
}

export const useSecurityMonitoring = () => {
  const { toast } = useToast();
  const [isMonitoring, setIsMonitoring] = useState(false);

  useEffect(() => {
    if (isMonitoring) {
      setupSecurityMonitoring();
    }
  }, [isMonitoring]);

  const logSecurityEvent = async (event: SecurityEvent) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Use enhanced security logging function
      await supabase.rpc('log_security_event_enhanced', {
        user_id_param: event.user_id || user?.id,
        event_type: event.type,
        event_details: {
          severity: event.severity,
          details: event.details,
          timestamp: new Date().toISOString(),
          user_agent: navigator.userAgent,
          url: window.location.href,
          referrer: document.referrer
        },
        severity_param: event.severity
      });

      // Send to external monitoring
      const { monitoringService } = await import('@/services/monitoringService');
      await monitoringService.warning(
        `Security event: ${event.type}`,
        event.severity,
        {
          userId: event.user_id || user?.id,
          eventType: event.type,
          details: event.details
        }
      );

      // Show immediate alert for high/critical events
      if (event.severity === 'high' || event.severity === 'critical') {
        toast({
          title: "🚨 Security Alert",
          description: `${event.type.replace('_', ' ').toUpperCase()} detected`,
          variant: "destructive"
        });
        
        // Notify admins for critical events
        if (event.severity === 'critical') {
          console.error('CRITICAL SECURITY EVENT:', event);
        }
      }
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  };

  const setupSecurityMonitoring = () => {
    // Monitor authentication events
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        logSecurityEvent({
          type: 'admin_action',
          severity: 'low',
          details: { action: 'login_success', email: session?.user?.email }
        });
      } else if (event === 'SIGNED_OUT') {
        logSecurityEvent({
          type: 'admin_action',
          severity: 'low',
          details: { action: 'logout' }
        });
      }
    });

    // Monitor for suspicious patterns
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const response = await originalFetch(...args);
      
      // Log failed API requests that might indicate attacks
      if (!response.ok && response.status === 401) {
        logSecurityEvent({
          type: 'failed_login',
          severity: 'medium',
          details: { 
            url: args[0], 
            status: response.status,
            statusText: response.statusText
          }
        });
      }

      // Log unusual data access patterns
      if (response.ok && typeof args[0] === 'string' && args[0].includes('/rest/v1/')) {
        const url = new URL(args[0], window.location.origin);
        if (url.pathname.includes('user_roles') || url.pathname.includes('admin')) {
          logSecurityEvent({
            type: 'data_access',
            severity: 'low',
            details: { accessed_resource: url.pathname }
          });
        }
      }

      return response;
    };

    return () => {
      subscription.unsubscribe();
      window.fetch = originalFetch;
    };
  };

  const startMonitoring = () => setIsMonitoring(true);
  const stopMonitoring = () => setIsMonitoring(false);

  const reportSuspiciousActivity = (details: Record<string, any>) => {
    logSecurityEvent({
      type: 'suspicious_activity',
      severity: 'high',
      details
    });
  };

  const logAdminAction = (action: string, target: string, details?: Record<string, any>) => {
    logSecurityEvent({
      type: 'admin_action',
      severity: 'medium',
      details: { action, target, ...details }
    });
  };

  return {
    startMonitoring,
    stopMonitoring,
    logSecurityEvent,
    reportSuspiciousActivity,
    logAdminAction,
    isMonitoring
  };
};