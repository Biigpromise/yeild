
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { userService, ReferralBirdLevel } from '@/services/userService';
import { PhoenixWelcomeOverlay } from './PhoenixWelcomeOverlay';

interface PhoenixUserContextType {
  isPhoenix: boolean;
  phoenixBorderClass: string;
  phoenixTagClass: string;
}

const PhoenixUserContext = createContext<PhoenixUserContextType>({
  isPhoenix: false,
  phoenixBorderClass: '',
  phoenixTagClass: ''
});

export const usePhoenixUser = () => useContext(PhoenixUserContext);

interface PhoenixUserProviderProps {
  children: React.ReactNode;
}

export const PhoenixUserProvider: React.FC<PhoenixUserProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [isPhoenix, setIsPhoenix] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    if (!user) return;

    const checkPhoenixStatus = async () => {
      try {
        const profile = await userService.getUserProfile(user.id);
        if (profile) {
          setUserProfile(profile);
          const activeReferrals = profile.active_referrals_count || 0;
          const userPoints = profile.points || 0;
          const birdLevel = userService.getBirdLevel(activeReferrals, userPoints);
          
          const isPhoenixUser = birdLevel.icon === 'phoenix';
          setIsPhoenix(isPhoenixUser);
          
          // Show welcome overlay for Phoenix users on login
          if (isPhoenixUser && !sessionStorage.getItem('phoenix_welcome_shown')) {
            setShowWelcome(true);
            sessionStorage.setItem('phoenix_welcome_shown', 'true');
          }
        }
      } catch (error) {
        console.error('Error checking Phoenix status:', error);
      }
    };

    checkPhoenixStatus();
  }, [user]);

  const phoenixBorderClass = isPhoenix 
    ? 'ring-2 ring-orange-400/50 border-orange-300 shadow-lg shadow-orange-200/50' 
    : '';

  const phoenixTagClass = isPhoenix 
    ? 'bg-gradient-to-r from-red-100 to-orange-100 text-red-800 border-red-300' 
    : '';

  return (
    <PhoenixUserContext.Provider 
      value={{ 
        isPhoenix, 
        phoenixBorderClass, 
        phoenixTagClass 
      }}
    >
      {children}
      
      {/* Phoenix Welcome Overlay */}
      {showWelcome && userProfile && (
        <PhoenixWelcomeOverlay
          userName={userProfile.name || 'Phoenix User'}
          referralCount={userProfile.active_referrals_count || 0}
          onClose={() => setShowWelcome(false)}
        />
      )}
    </PhoenixUserContext.Provider>
  );
};
