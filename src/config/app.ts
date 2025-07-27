
export const APP_CONFIG = {
  // Custom domain configuration - set this to your production domain
  customDomain: 'https://yeildsocials.com', // Replace with your actual domain
  
  // Fallback domain detection for development
  domain: typeof window !== 'undefined' 
    ? window.location.origin 
    : 'http://localhost:5173',
  
  // Get the appropriate domain based on environment
  getAppDomain: () => {
    // For development environments (localhost or Lovable project URLs), use current origin
    const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';
    
    // If we're on localhost or a Lovable project URL, use the current origin for functionality
    if (currentOrigin.includes('localhost') || currentOrigin.includes('.lovableproject.com')) {
      return currentOrigin;
    }
    
    // For production, use the custom domain
    return APP_CONFIG.customDomain || currentOrigin;
  },
  
  // Get the display domain (what users see in referral links)
  getDisplayDomain: () => {
    // For development environments, use the current origin to ensure functionality
    const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';
    
    if (currentOrigin.includes('localhost') || currentOrigin.includes('.lovableproject.com')) {
      return currentOrigin;
    }
    
    // For production, use the custom domain
    return APP_CONFIG.customDomain || currentOrigin;
  },
  
  // Application name and branding
  name: 'YIELD',
  
  // Referral system configuration
  referral: {
    codeLength: 8,
    minPointsForActivation: 50,
    minTasksForActivation: 1,
    tiers: {
      bronze: { min: 0, pointsPerReferral: 10 },
      silver: { min: 5, pointsPerReferral: 20 },
      gold: { min: 15, pointsPerReferral: 30 }
    }
  }
};

// Helper function to generate referral links with proper domain handling
export const generateReferralLink = (referralCode: string): string => {
  const domain = APP_CONFIG.getDisplayDomain();
  return `${domain}/auth?mode=signup&ref=${referralCode}`;
};

// Helper function to extract referral code from URL
export const extractReferralCode = (url: string): string | null => {
  try {
    const urlObj = new URL(url);
    return urlObj.searchParams.get('ref');
  } catch {
    return null;
  }
};
