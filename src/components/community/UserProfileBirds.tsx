
import React from "react";
import { Badge } from "@/components/ui/badge";

interface UserProfileBirdsProps {
  points: number;
  tasksCompleted: number;
  level: number;
  compact?: boolean;
}

export const UserProfileBirds: React.FC<UserProfileBirdsProps> = ({
  points,
  tasksCompleted,
  level,
  compact = false
}) => {
  const getBirdTier = () => {
    if (points >= 10000) return { tier: "Legendary", bird: "🦅", color: "bg-yellow-500" };
    if (points >= 5000) return { tier: "Epic", bird: "🦜", color: "bg-purple-500" };
    if (points >= 2000) return { tier: "Rare", bird: "🐦", color: "bg-blue-500" };
    if (points >= 500) return { tier: "Common", bird: "🐤", color: "bg-green-500" };
    return { tier: "Beginner", bird: "🐣", color: "bg-gray-400" };
  };

  const birdData = getBirdTier();
  const birdCount = Math.floor(tasksCompleted / 5) + 1; // 1 bird per 5 tasks completed

  if (compact) {
    return (
      <div className="flex items-center gap-1">
        <span className="text-sm">{birdData.bird}</span>
        <Badge 
          variant="secondary" 
          className={`text-xs text-white ${birdData.color}`}
        >
          Lv.{level}
        </Badge>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2 p-3 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border">
      <div className="flex items-center gap-2">
        <div className="text-2xl">{birdData.bird}</div>
        <div className="text-center">
          <Badge 
            className={`text-white ${birdData.color} mb-1`}
          >
            {birdData.tier}
          </Badge>
          <div className="text-xs text-gray-600">Level {level}</div>
        </div>
      </div>
      
      <div className="flex items-center gap-1 flex-wrap justify-center">
        {Array.from({ length: Math.min(birdCount, 10) }, (_, index) => (
          <span key={index} className="text-xs opacity-75">
            {birdData.bird}
          </span>
        ))}
        {birdCount > 10 && (
          <span className="text-xs text-gray-500">+{birdCount - 10}</span>
        )}
      </div>
      
      <div className="text-xs text-center text-gray-500">
        <div>{points} points • {tasksCompleted} tasks</div>
      </div>
    </div>
  );
};
