
import React from 'react';
import { useNavigate } from 'react-router-dom';

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
    { id: 'dashboard', label: 'Dashboard', onClick: () => onTabChange?.('dashboard') },
    { id: 'tasks', label: 'Tasks', onClick: () => navigate('/tasks') },
    { id: 'stories', label: 'Stories', onClick: () => onTabChange?.('stories') },
    { id: 'wallet', label: 'Wallet', onClick: () => onTabChange?.('wallet') },
    { id: 'referral', label: 'Referral', onClick: () => onTabChange?.('referral') },
    { id: 'leaderboard', label: 'Leaderboard', onClick: () => onTabChange?.('leaderboard') },
    { id: 'social', label: 'Social', onClick: () => onTabChange?.('social') },
    { id: 'profile', label: 'Profile', onClick: () => onTabChange?.('profile') },
  ];

  return (
    <div className="flex overflow-x-auto gap-2 mb-6 pb-2">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={tab.onClick}
          className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
            activeTab === tab.id
              ? 'bg-yellow-400 text-black'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};
