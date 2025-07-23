
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Home, 
  CheckSquare, 
  BookOpen, 
  Wallet, 
  Users, 
  Trophy, 
  MessageCircle, 
  User 
} from 'lucide-react';

interface DashboardNavTabsProps {
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
}

export const DashboardNavTabs: React.FC<DashboardNavTabsProps> = ({ 
  activeTab = 'dashboard', 
  onTabChange 
}) => {
  const navigate = useNavigate();

  const tabs = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: Home,
      onClick: () => onTabChange?.('dashboard') 
    },
    { 
      id: 'tasks', 
      label: 'Tasks', 
      icon: CheckSquare,
      onClick: () => navigate('/tasks') 
    },
    { 
      id: 'stories', 
      label: 'Stories', 
      icon: BookOpen,
      onClick: () => onTabChange?.('stories') 
    },
    { 
      id: 'wallet', 
      label: 'Wallet', 
      icon: Wallet,
      onClick: () => onTabChange?.('wallet') 
    },
    { 
      id: 'referral', 
      label: 'Referral', 
      icon: Users,
      onClick: () => onTabChange?.('referral') 
    },
    { 
      id: 'leaderboard', 
      label: 'Leaderboard', 
      icon: Trophy,
      onClick: () => onTabChange?.('leaderboard') 
    },
    { 
      id: 'social', 
      label: 'Social', 
      icon: MessageCircle,
      onClick: () => onTabChange?.('social') 
    },
    { 
      id: 'profile', 
      label: 'Profile', 
      icon: User,
      onClick: () => onTabChange?.('profile') 
    },
  ];

  return (
    <div className="flex overflow-x-auto gap-1 mb-6 pb-2 px-2">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        
        return (
          <button
            key={tab.id}
            onClick={tab.onClick}
            className={`flex flex-col items-center justify-center min-w-[60px] px-2 py-3 rounded-lg transition-colors ${
              isActive
                ? 'text-yellow-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            <Icon 
              size={24} 
              className={`mb-1 ${isActive ? 'text-yellow-400' : 'text-gray-400'}`}
            />
            <span className="text-xs font-medium text-center leading-tight">
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};
