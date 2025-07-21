
export const APP_CONFIG = {
  // Custom domain configuration - set this to your production domain
  customDomain: 'https://yeildsocials.com', // Replace with your actual domain
  
  // Fallback domain detection for development
  domain: typeof window !== 'undefined' 
    ? window.location.origin 
    : 'http://localhost:5173',
  
  // Get the appropriate domain based on environment
  getAppDomain: () => {
    // In production or when custom domain is set, use custom domain
    if (APP_CONFIG.customDomain) {
      return APP_CONFIG.customDomain;
    }
    
    // For development, use current origin but check if it's a Lovable project URL
    const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';
    
    // If it's a Lovable project URL, use the custom domain instead
    if (currentOrigin.includes('.lovableproject.com')) {
      return APP_CONFIG.customDomain || 'https://yeildsocials.com';
    }
    
    return currentOrigin;
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

// Helper function to generate referral links with custom domain
export const generateReferralLink = (referralCode: string): string => {
  const domain = APP_CONFIG.getAppDomain();
  return `${domain}/signup?ref=${referralCode}`;
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
