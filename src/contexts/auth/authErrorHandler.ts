
// Enhanced error handler for auth operations with security logging
export const handleAuthError = (error: any, operation: string): string => {
  console.error(`Auth ${operation} error:`, error);
  
  // Log security-relevant errors
  if (error?.message) {
    const suspiciousPatterns = [
      'Invalid login credentials',
      'Too many requests',
      'Network error',
      'Load failed'
    ];
    
    if (suspiciousPatterns.some(pattern => error.message.includes(pattern))) {
      // Import security service dynamically to avoid circular imports
      import('@/services/security/securityService').then(({ securityService }) => {
        securityService.logSecurityEvent({
          event_type: 'auth_error',
          details: { 
            operation, 
            error_message: error.message,
            error_code: error.code || 'unknown'
          },
          severity: error.message.includes('Too many requests') ? 'high' : 'medium'
        });
      });
    }
  }
  
  // Common error messages mapping
  const errorMessages: { [key: string]: string } = {
    'Invalid login credentials': operation === 'sign in' 
      ? 'Invalid email or password. If you signed up with Google, please use "Continue with Google" instead.'
      : 'Invalid email or password. Please check your credentials.',
    'Email not confirmed': 'Please check your email and confirm your account before signing in.',
    'User already registered': 'An account with this email already exists. Try signing in instead, or use "Continue with Google" if you signed up with Google.',
    'user_already_exists': 'An account with this email already exists. Try signing in instead, or use "Continue with Google" if you signed up with Google.',
    'Signup requires a valid password': 'Password must be at least 8 characters long with uppercase, lowercase, and numbers.',
    'Invalid email': 'Please enter a valid email address.',
    'Network error': 'Network connection failed. Please check your internet connection.',
    'Load failed': 'Network connection failed. Please check your internet connection and try again.',
    'Too many requests': 'Too many attempts detected. Please wait 15 minutes before trying again.',
    'weak_password': 'Password is too weak. Please use at least 8 characters with uppercase, lowercase, and numbers.',
    'rate_limit_exceeded': 'Too many attempts. Please wait before trying again.',
    'For security purposes, you can only request this once every 60 seconds': 'Please wait 60 seconds before requesting another password reset.',
    'Unable to validate email address: invalid format': 'Please enter a valid email address.',
    'Password reset requested': 'Password reset email sent successfully. Please check your inbox.',
  };

  // Check for specific error patterns
  for (const [pattern, message] of Object.entries(errorMessages)) {
    if (error?.message?.includes(pattern)) {
      return message;
    }
  }

  // Special handling for password reset success (Supabase returns success as "error")
  if (operation === 'password reset' && !error?.message?.includes('error') && !error?.message?.includes('fail')) {
    return 'Password reset email sent successfully. Please check your inbox.';
  }

  // Fallback error message
  return error?.message || `${operation} failed. Please try again.`;
};

// Check if an email exists in the auth system
export const checkEmailExists = async (email: string): Promise<{ exists: boolean; isOAuthOnly: boolean }> => {
  try {
    // Import supabase client
    const { supabase } = await import('@/integrations/supabase/client');
    
    // Check if user exists in profiles table (which is created for all users)
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('email', email)
      .maybeSingle();
    
    if (profile) {
      // For now, we'll assume that if a user exists, we can't easily determine 
      // if they're OAuth-only without admin privileges, so we'll return conservative values
      return { exists: true, isOAuthOnly: false };
    }
    
    return { exists: false, isOAuthOnly: false };
  } catch (error) {
    console.error('Error checking email existence:', error);
    return { exists: false, isOAuthOnly: false };
  }
};
