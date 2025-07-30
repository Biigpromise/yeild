
import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { userService } from "@/services/userService";

interface UserProfileBirdsProps {
  points: number;
  tasksCompleted: number;
  level: number;
  activeReferrals?: number;
  compact?: boolean;
}

export const UserProfileBirds: React.FC<UserProfileBirdsProps> = ({
  points,
  tasksCompleted,
  level,
  activeReferrals = 0,
  compact = false
}) => {
  const [birdLevel, setBirdLevel] = useState({
    id: 1,
    name: 'Dove',
    icon: '🕊️',
    color: '#64748b',
    min_referrals: 0,
    min_points: 0,
    description: 'Starting your journey - Welcome to the family!',
    benefits: ['Basic task access', 'Community participation']
  });

  useEffect(() => {
    const loadBirdLevel = async () => {
      const level = await userService.getBirdLevel(activeReferrals, points);
      setBirdLevel(level);
    };
    loadBirdLevel();
  }, [activeReferrals, points]);

  const getBirdEmoji = (levelName: string) => {
    switch (levelName.toLowerCase()) {
      case 'dove':
        return '🕊️';
      case 'sparrow':
        return '🐦';
      case 'hawk':
        return '🦅';
      case 'eagle':
        return '🦅';
      case 'falcon':
        return '🦅';
      case 'phoenix':
        return '🔥';
      default:
        return '🐦';
    }
  };

  const birdEmoji = getBirdEmoji(birdLevel.name);
  const birdCount = Math.floor(tasksCompleted / 5) + 1; // 1 bird per 5 tasks completed

  if (compact) {
    return (
      <div className="flex items-center gap-1">
        <span className="text-sm">{birdEmoji}</span>
        <Badge 
          variant="secondary" 
          className={`text-xs text-white`}
          style={{ backgroundColor: birdLevel.color }}
        >
          {birdLevel.name} Lv.{level}
        </Badge>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2 p-3 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border">
      <div className="flex items-center gap-2">
        <div className="text-2xl">{birdEmoji}</div>
        <div className="text-center">
          <Badge 
            className="text-white mb-1"
            style={{ backgroundColor: birdLevel.color }}
          >
            {birdLevel.name}
          </Badge>
          <div className="text-xs text-gray-600">Level {level}</div>
        </div>
      </div>
      
      <div className="flex items-center gap-1 flex-wrap justify-center">
        {Array.from({ length: Math.min(birdCount, 10) }, (_, index) => (
          <span key={index} className="text-xs opacity-75">
            {birdEmoji}
          </span>
        ))}
        {birdCount > 10 && (
          <span className="text-xs text-gray-500">+{birdCount - 10}</span>
        )}
      </div>
      
      <div className="text-xs text-center text-gray-500">
        <div>{points} points • {tasksCompleted} tasks • {activeReferrals} referrals</div>
        <div className="text-xs mt-1 text-gray-400">{birdLevel.description}</div>
      </div>
    </div>
  );
};
