
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
    <div className="bg-card rounded-lg p-6 text-center border border-border hover:border-muted-foreground/50 transition-colors">
      <h3 className="text-lg font-semibold text-foreground mb-4">Your Progress</h3>
      
      <div className="text-6xl mb-4">
        {getBirdEmoji(userStats.level)}
      </div>
      
      <div className="text-muted-foreground mb-2">
        {userStats.tasksCompleted === 0 
          ? "Complete your first task to start earning!"
          : `You're at level ${userStats.level}! Keep going!`
        }
      </div>
      
      <div className="flex justify-center items-center gap-2">
        <div className="text-sm text-muted-foreground">Level {userStats.level}</div>
        <div className="w-20 bg-muted rounded-full h-2">
          <div 
            className="bg-yeild-yellow h-2 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(100, (userStats.tasksCompleted % 10) * 10)}%` }}
          />
        </div>
        <div className="text-sm text-muted-foreground">{userStats.tasksCompleted % 10}/10</div>
      </div>
    </div>
  );
};
