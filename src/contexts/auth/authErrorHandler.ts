
// Enhanced error handler for auth operations
export const handleAuthError = (error: any, operation: string): string => {
  console.error(`Auth ${operation} error:`, error);
  
  // Common error messages mapping
  const errorMessages: { [key: string]: string } = {
    'Invalid login credentials': 'Invalid email or password. Please check your credentials.',
    'Email not confirmed': 'Please check your email and confirm your account before signing in.',
    'User already registered': 'An account with this email already exists. Please sign in instead.',
    'Signup requires a valid password': 'Password must be at least 6 characters long.',
    'Invalid email': 'Please enter a valid email address.',
    'Network error': 'Network connection failed. Please check your internet connection.',
    'Too many requests': 'Too many attempts. Please wait a moment before trying again.',
  };

  // Check for specific error patterns
  for (const [pattern, message] of Object.entries(errorMessages)) {
    if (error?.message?.includes(pattern)) {
      return message;
    }
  }

  // Fallback error message
  return error?.message || `${operation} failed. Please try again.`;
};
