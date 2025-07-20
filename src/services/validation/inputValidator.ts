
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
      .trim();
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
}
