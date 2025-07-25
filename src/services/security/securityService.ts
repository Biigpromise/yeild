import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { InputValidator } from '@/services/validation/inputValidator';

export interface SecurityEvent {
  event_type: string;
  user_id?: string;
  ip_address?: string;
  user_agent?: string;
  details?: any;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export const securityService = {
  /**
   * Enhanced input validation with security logging
   */
  validateAndSanitize: {
    email: (email: string): { isValid: boolean; sanitized: string } => {
      const sanitized = InputValidator.sanitizeInput(email);
      const isValid = InputValidator.email(sanitized);
      
      if (!isValid) {
        securityService.logSecurityEvent({
          event_type: 'invalid_email_attempt',
          details: { original: email, sanitized },
          severity: 'low'
        });
      }
      
      return { isValid, sanitized };
    },

    password: (password: string): { isValid: boolean; sanitized: string } => {
      // Don't sanitize passwords, just validate
      const isValid = InputValidator.isSecurePassword(password);
      
      if (!isValid) {
        securityService.logSecurityEvent({
          event_type: 'weak_password_attempt',
          details: { password_length: password.length },
          severity: 'medium'
        });
      }
      
      return { isValid, sanitized: password };
    },

    text: (text: string, maxLength: number = 1000): { isValid: boolean; sanitized: string } => {
      const sanitized = InputValidator.sanitizeText(text);
      const isValid = InputValidator.maxLength(sanitized, maxLength, 'text');
      
      if (text !== sanitized) {
        securityService.logSecurityEvent({
          event_type: 'malicious_input_detected',
          details: { original_length: text.length, sanitized_length: sanitized.length },
          severity: 'high'
        });
      }
      
      return { isValid, sanitized };
    },

    url: (url: string): { isValid: boolean; sanitized: string } => {
      const sanitized = InputValidator.sanitizeUrl(url);
      const isValid = InputValidator.isValidUrl(sanitized);
      
      if (!isValid || url !== sanitized) {
        securityService.logSecurityEvent({
          event_type: 'suspicious_url_attempt',
          details: { original: url, sanitized },
          severity: 'high'
        });
      }
      
      return { isValid, sanitized };
    }
  },

  /**
   * Rate limiting service
   */
  rateLimiter: {
    attempts: new Map<string, { count: number; lastAttempt: number }>(),

    checkRateLimit: (key: string, maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000): boolean => {
      const now = Date.now();
      const record = securityService.rateLimiter.attempts.get(key);

      if (!record) {
        securityService.rateLimiter.attempts.set(key, { count: 1, lastAttempt: now });
        return true;
      }

      // Reset if window has passed
      if (now - record.lastAttempt > windowMs) {
        securityService.rateLimiter.attempts.set(key, { count: 1, lastAttempt: now });
        return true;
      }

      // Check if limit exceeded
      if (record.count >= maxAttempts) {
        securityService.logSecurityEvent({
          event_type: 'rate_limit_exceeded',
          details: { key, attempts: record.count, window_ms: windowMs },
          severity: 'high'
        });
        return false;
      }

      // Increment count
      record.count++;
      record.lastAttempt = now;
      return true;
    },

    clearAttempts: (key: string): void => {
      securityService.rateLimiter.attempts.delete(key);
    }
  },

  /**
   * Session security validation
   */
  validateSession: async (): Promise<boolean> => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        return false;
      }

      // Check if session is close to expiring
      const expiresAt = new Date(session.expires_at! * 1000);
      const now = new Date();
      const timeUntilExpiry = expiresAt.getTime() - now.getTime();
      
      // Refresh if expiring within 5 minutes
      if (timeUntilExpiry < 5 * 60 * 1000) {
        const { error: refreshError } = await supabase.auth.refreshSession();
        if (refreshError) {
          securityService.logSecurityEvent({
            event_type: 'session_refresh_failed',
            details: { error: refreshError.message },
            severity: 'medium'
          });
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Session validation error:', error);
      return false;
    }
  },

  /**
   * Security event logging
   */
  logSecurityEvent: async (event: SecurityEvent): Promise<void> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      await supabase.rpc('log_security_event', {
        user_id_param: event.user_id || user?.id || null,
        event_type: event.event_type,
        event_details: {
          ...event.details,
          severity: event.severity,
          timestamp: new Date().toISOString(),
          user_agent: navigator.userAgent,
          url: window.location.href
        }
      });
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  },

  /**
   * Detect suspicious activity patterns
   */
  detectSuspiciousActivity: {
    multipleFailedLogins: (email: string): boolean => {
      const key = `failed_login_${email}`;
      return !securityService.rateLimiter.checkRateLimit(key, 3, 15 * 60 * 1000);
    },

    rapidAccountCreation: (ip: string): boolean => {
      const key = `account_creation_${ip}`;
      return !securityService.rateLimiter.checkRateLimit(key, 2, 60 * 60 * 1000);
    },

    suspiciousUserAgent: (userAgent: string): boolean => {
      const suspicious = [
        /bot/i,
        /crawler/i,
        /spider/i,
        /scraper/i,
        /automated/i
      ];
      
      return suspicious.some(pattern => pattern.test(userAgent));
    }
  },

  /**
   * Content Security Policy helpers
   */
  csp: {
    validateImageUrl: (url: string): boolean => {
      try {
        const parsed = new URL(url);
        const allowedDomains = [
          'supabase.co',
          'githubusercontent.com',
          'unsplash.com',
          'pixabay.com',
          'pexels.com'
        ];
        
        return allowedDomains.some(domain => parsed.hostname.includes(domain));
      } catch {
        return false;
      }
    },

    sanitizeFileName: (fileName: string): string => {
      return fileName
        .replace(/[^a-zA-Z0-9._-]/g, '_')
        .substring(0, 100); // Limit length
    }
  }
};