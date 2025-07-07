
import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  CheckSquare, 
  Camera, 
  User, 
  Users, 
  Trophy, 
  BarChart3, 
  Wallet, 
  Gift, 
  History, 
  MessageCircle, 
  Search, 
  HelpCircle,
  Activity,
  Bell,
  Lock
} from "lucide-react";
import { useExperienceLevel } from '@/hooks/useExperienceLevel';

interface DesktopTabNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  tasksCompleted?: number;
}

export const DesktopTabNavigation: React.FC<DesktopTabNavigationProps> = ({
  activeTab,
  onTabChange,
  tasksCompleted = 0
}) => {
  const { isFeatureUnlocked, nextTier, tasksToNextTier } = useExperienceLevel(tasksCompleted);

  const allTabs = [
    { id: "tasks", label: "Tasks", icon: CheckSquare, tier: "beginner" },
    { id: "profile", label: "Profile", icon: User, tier: "beginner" },
    { id: "wallet", label: "Wallet", icon: Wallet, tier: "beginner" },
    { id: "support", label: "Support", icon: HelpCircle, tier: "beginner" },
    { id: "community", label: "Community", icon: MessageCircle, tier: "intermediate" },
    { id: "stories", label: "Stories", icon: Camera, tier: "intermediate" },
    { id: "referrals", label: "Referrals", icon: Users, tier: "intermediate" },
    { id: "leaderboard", label: "Leaderboard", icon: BarChart3, tier: "intermediate" },
    { id: "achievements", label: "Achievements", icon: Trophy, tier: "advanced" },
    { id: "history", label: "History", icon: History, tier: "advanced" },
    { id: "activity", label: "Activity", icon: Activity, tier: "advanced" },
    { id: "notifications", label: "Notifications", icon: Bell, tier: "advanced" },
    { id: "search", label: "Search", icon: Search, tier: "advanced" },
    { id: "rewards", label: "Rewards", icon: Gift, tier: "advanced" },
  ];

  return (
    <TooltipProvider>
      <div className="space-y-2">
        {allTabs.map((tab) => {
          const Icon = tab.icon;
          const isUnlocked = isFeatureUnlocked(tab.id);
          
          if (!isUnlocked) {
            return (
              <Tooltip key={tab.id}>
                <TooltipTrigger asChild>
                  <div className="relative">
                    <Button
                      variant="ghost"
                      className="w-full justify-start opacity-40 cursor-not-allowed"
                      disabled
                    >
                      <Lock className="h-4 w-4 mr-2" />
                      {tab.label}
                    </Button>
                    {nextTier && (
                      <Badge 
                        variant="outline" 
                        className="absolute -top-1 -right-1 text-xs px-1"
                      >
                        {tasksToNextTier}
                      </Badge>
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <div className="text-sm">
                    <p className="font-medium">Complete {tasksToNextTier} more tasks</p>
                    <p className="text-muted-foreground">to unlock {tab.label}</p>
                  </div>
                </TooltipContent>
              </Tooltip>
            );
          }

          return (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => onTabChange(tab.id)}
            >
              <Icon className="h-4 w-4 mr-2" />
              {tab.label}
            </Button>
          );
        })}
      </div>
    </TooltipProvider>
  );
};
