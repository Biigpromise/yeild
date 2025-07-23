
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Bell, Settings, User, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { BirdStatusDisplay } from '@/components/bird/BirdStatusDisplay';
import { BirdProgressionModal } from '@/components/bird/BirdProgressionModal';
import { useBirdLevel } from '@/hooks/useBirdLevel';

interface DashboardHeaderProps {
  user: any;
  onTabChange: (tab: string) => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ user, onTabChange }) => {
  const { signOut } = useAuth();
  const [showBirdModal, setShowBirdModal] = useState(false);
  const { currentBird, userStats } = useBirdLevel();

  const handleSignOut = async () => {
    await signOut();
  };

  const handleBirdClick = () => {
    setShowBirdModal(true);
  };

  return (
    <>
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-yeild-yellow">YIELD</h1>
            <span className="text-gray-400">Dashboard</span>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Clickable Bird Status */}
            <div 
              onClick={handleBirdClick}
              className="cursor-pointer transition-transform hover:scale-105"
            >
              <BirdStatusDisplay />
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onTabChange('profile')}
              className="text-gray-300 hover:text-white hover:bg-gray-700"
            >
              <User className="h-4 w-4 mr-2" />
              Profile
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-300 hover:text-white hover:bg-gray-700"
            >
              <Bell className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-300 hover:text-white hover:bg-gray-700"
            >
              <Settings className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="text-gray-300 hover:text-white hover:bg-gray-700"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Bird Progression Modal */}
      {currentBird && (
        <BirdProgressionModal
          isOpen={showBirdModal}
          onClose={() => setShowBirdModal(false)}
          currentBird={currentBird}
          userStats={userStats}
        />
      )}
    </>
  );
};
