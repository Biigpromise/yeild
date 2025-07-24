
import { toast } from 'sonner';

export class InputValidator {
  static email(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address');
      return false;
    }
    return true;
  }

  static password(password: string): boolean {
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return false;
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      toast.error('Password must contain at least one uppercase letter, one lowercase letter, and one number');
      return false;
    }
    return true;
  }

  static required(value: string, fieldName: string): boolean {
    if (!value || value.trim().length === 0) {
      toast.error(`${fieldName} is required`);
      return false;
    }
    return true;
  }

  static url(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      toast.error('Please enter a valid URL');
      return false;
    }
  }

  static sanitizeInput(input: string): string {
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+=/gi, '')
      .replace(/data:/gi, '')
      .replace(/vbscript:/gi, '')
      .replace(/expression\(/gi, '')
      .trim();
  }

  static sanitizeUrl(url: string): string {
    // Enhanced URL sanitization
    const cleanUrl = url.trim().replace(/[<>"']/g, '');
    
    // Validate against dangerous protocols
    const dangerous = ['javascript:', 'data:', 'vbscript:', 'file:', 'ftp:'];
    const lowerUrl = cleanUrl.toLowerCase();
    
    for (const protocol of dangerous) {
      if (lowerUrl.startsWith(protocol)) {
        return '';
      }
    }
    
    return cleanUrl;
  }

  static sanitizeText(text: string): string {
    return this.sanitizeInput(text);
  }

  static isValidUrl(url: string): boolean {
    return this.url(url);
  }

  static maxLength(value: string, max: number, fieldName: string): boolean {
    if (value.length > max) {
      toast.error(`${fieldName} must be less than ${max} characters`);
      return false;
    }
    return true;
  }

  static minLength(value: string, min: number, fieldName: string): boolean {
    if (value.length < min) {
      toast.error(`${fieldName} must be at least ${min} characters`);
      return false;
    }
    return true;
  }

  // Enhanced security validation methods
  static isSecurePassword(password: string): boolean {
    // Check for common patterns
    if (password.toLowerCase().includes('password') || 
        password.toLowerCase().includes('123456') ||
        /(.)\1{3,}/.test(password)) {
      toast.error('Password contains common patterns. Please choose a stronger password');
      return false;
    }
    
    return this.password(password);
  }

  static validateRedirectUrl(url: string): boolean {
    try {
      const parsedUrl = new URL(url);
      const allowedOrigins = [
        window.location.origin,
        'https://yeildsocials.com',
        'https://yeild.lovable.app'
      ];
      
      if (!allowedOrigins.includes(parsedUrl.origin)) {
        toast.error('Invalid redirect URL');
        return false;
      }
      
      return true;
    } catch {
      toast.error('Invalid URL format');
      return false;
    }
  }

  static preventXSS(input: string): string {
    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }
}
