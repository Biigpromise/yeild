
import { useRole } from '@/hooks/useRole';

export interface UserProfile {
  id: string;
  name?: string;
  email?: string;
  profile_picture_url?: string;
  is_anonymous?: boolean;
  role?: string;
}

export interface DisplayNameOptions {
  showRealNameToAdmins?: boolean;
  fallbackName?: string;
  currentUserRole?: string;
}

/**
 * Centralized function to get display name for users
 * Handles privacy settings and role-based visibility
 */
export const getDisplayName = (
  user: UserProfile | null | undefined,
  options: DisplayNameOptions = {}
): string => {
  const {
    showRealNameToAdmins = true,
    fallbackName = 'Anonymous User',
    currentUserRole = 'user'
  } = options;

  // Handle null/undefined user
  if (!user) {
    return fallbackName;
  }

  // Check if user wants to be anonymous
  const isAnonymous = user.is_anonymous ?? false;
  
  // Admin/moderator override - can see real names if enabled
  const canSeeRealNames = showRealNameToAdmins && 
    (currentUserRole === 'admin' || currentUserRole === 'moderator');

  // If user is anonymous and viewer doesn't have override permissions
  if (isAnonymous && !canSeeRealNames) {
    return 'Anonymous';
  }

  // Return actual name or fallback
  const displayName = user.name?.trim();
  return displayName && displayName !== '' ? displayName : fallbackName;
};

/**
 * Get avatar fallback letter for display
 */
export const getAvatarFallback = (
  user: UserProfile | null | undefined,
  options: DisplayNameOptions = {}
): string => {
  const displayName = getDisplayName(user, options);
  return displayName.charAt(0)?.toUpperCase() || 'U';
};

/**
 * Check if current user should see real names
 */
export const canViewRealNames = (userRole: string): boolean => {
  return userRole === 'admin' || userRole === 'moderator';
};

/**
 * Hook to get display utilities with current user's role context
 */
export const useUserDisplay = () => {
  const { role: currentUserRole } = useRole();
  
  const getDisplayNameWithRole = (user: UserProfile | null | undefined, options: Omit<DisplayNameOptions, 'currentUserRole'> = {}) => {
    return getDisplayName(user, { ...options, currentUserRole });
  };

  const getAvatarFallbackWithRole = (user: UserProfile | null | undefined, options: Omit<DisplayNameOptions, 'currentUserRole'> = {}) => {
    return getAvatarFallback(user, { ...options, currentUserRole });
  };

  return {
    getDisplayName: getDisplayNameWithRole,
    getAvatarFallback: getAvatarFallbackWithRole,
    canViewRealNames: canViewRealNames(currentUserRole),
    currentUserRole
  };
};
