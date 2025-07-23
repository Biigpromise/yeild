
import React from 'react';
import { useNavigate } from 'react-router-dom';

interface DashboardNavTabsProps {
  activeTab?: string;
}

export const DashboardNavTabs: React.FC<DashboardNavTabsProps> = ({ activeTab = 'tasks' }) => {
  const navigate = useNavigate();

  const tabs = [
    { id: 'tasks', label: 'Tasks', onClick: () => navigate('/tasks') },
    { id: 'wallet', label: 'Wallet', onClick: () => navigate('/dashboard?tab=wallet') },
    { id: 'referral', label: 'Referral', onClick: () => navigate('/dashboard?tab=referral') },
    { id: 'leaderboard', label: 'Leaderboard', onClick: () => navigate('/leaderboard') },
    { id: 'social', label: 'Social', onClick: () => navigate('/dashboard?tab=social') },
    { id: 'profile', label: 'Profile', onClick: () => navigate('/dashboard?tab=profile') },
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
