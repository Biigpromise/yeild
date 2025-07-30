import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTour } from '@/hooks/useTour';
import { WelcomeTour } from './WelcomeTour';

interface TourContextType {
  showTour: () => void;
  completeTour: () => void;
  resetTour: () => void;
  isLoading: boolean;
}

const TourContext = createContext<TourContextType | undefined>(undefined);

export const useTourContext = () => {
  const context = useContext(TourContext);
  if (!context) {
    throw new Error('useTourContext must be used within a TourProvider');
  }
  return context;
};

interface TourProviderProps {
  children: React.ReactNode;
}

export const TourProvider: React.FC<TourProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const { shouldShowTour, completeTour, resetTour, isLoading } = useTour();
  const [forceShowTour, setForceShowTour] = useState(false);

  const showTour = () => {
    setForceShowTour(true);
  };

  const handleCompleteTour = () => {
    setForceShowTour(false);
    completeTour();
  };

  const handleSkipTour = () => {
    setForceShowTour(false);
    completeTour();
  };

  const value: TourContextType = {
    showTour,
    completeTour,
    resetTour,
    isLoading
  };

  return (
    <TourContext.Provider value={value}>
      {children}
      
      {/* Tour Component */}
      {user && (
        <WelcomeTour
          isOpen={shouldShowTour || forceShowTour}
          onComplete={handleCompleteTour}
          onSkip={handleSkipTour}
        />
      )}
    </TourContext.Provider>
  );
};