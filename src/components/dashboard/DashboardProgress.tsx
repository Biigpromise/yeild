
import React from 'react';

interface DashboardProgressProps {
  userStats: {
    tasksCompleted: number;
    level: number;
  };
}

export const DashboardProgress: React.FC<DashboardProgressProps> = ({ userStats }) => {
  const getBirdEmoji = (level: number) => {
    if (level >= 5) return '🦅'; // Eagle
    if (level >= 3) return '🐦'; // Bird
    return '🥚'; // Egg
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 text-center">
      <h3 className="text-lg font-semibold text-white mb-4">Your Progress</h3>
      
      <div className="text-6xl mb-4">
        {getBirdEmoji(userStats.level)}
      </div>
      
      <div className="text-gray-400 mb-2">
        {userStats.tasksCompleted === 0 
          ? "Complete your first task to start earning!"
          : `You're at level ${userStats.level}! Keep going!`
        }
      </div>
      
      <div className="flex justify-center items-center gap-2">
        <div className="text-sm text-gray-500">Level {userStats.level}</div>
        <div className="w-20 bg-gray-700 rounded-full h-2">
          <div 
            className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(100, (userStats.tasksCompleted % 10) * 10)}%` }}
          />
        </div>
        <div className="text-sm text-gray-500">{userStats.tasksCompleted % 10}/10</div>
      </div>
    </div>
  );
};
