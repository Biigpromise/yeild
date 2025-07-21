
export const APP_CONFIG = {
  // Use the current domain from window.location or fallback to localhost for development
  domain: typeof window !== 'undefined' 
    ? window.location.origin 
    : 'http://localhost:5173',
  
  // Application name and branding
  name: 'YIELD',
  
  // Referral system configuration
  referral: {
    codeLength: 8,
    minPointsForActivation: 50,
    minTasksForActivation: 1,
  }
};

// Helper function to generate referral links
export const generateReferralLink = (referralCode: string): string => {
  return `${APP_CONFIG.domain}/signup?ref=${referralCode}`;
};
