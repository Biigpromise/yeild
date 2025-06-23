
import React from 'react';
import { Button } from "@/components/ui/button";
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
  HelpCircle 
} from "lucide-react";

interface MobileTabNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const MobileTabNavigation: React.FC<MobileTabNavigationProps> = ({
  activeTab,
  onTabChange
}) => {
  const tabs = [
    { id: "tasks", label: "Tasks", icon: CheckSquare },
    { id: "stories", label: "Stories", icon: Camera },
    { id: "profile", label: "Profile", icon: User },
    { id: "referrals", label: "Referrals", icon: Users },
    { id: "achievements", label: "Badges", icon: Trophy },
    { id: "leaderboard", label: "Leaderboard", icon: BarChart3 },
    { id: "wallet", label: "Wallet", icon: Wallet },
    { id: "rewards", label: "Rewards", icon: Gift },
    { id: "history", label: "History", icon: History },
    { id: "community", label: "Chat", icon: MessageCircle },
    { id: "search", label: "Search", icon: Search },
    { id: "support", label: "Support", icon: HelpCircle }
  ];

  const primaryTabs = tabs.slice(0, 4);
  const secondaryTabs = tabs.slice(4);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-700 z-50 safe-area-bottom">
      {/* Primary navigation */}
      <div className="flex justify-around items-center py-2">
        {primaryTabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "ghost"}
              size="sm"
              onClick={() => onTabChange(tab.id)}
              className="flex flex-col items-center gap-1 h-auto py-2 px-3"
            >
              <Icon className="h-4 w-4" />
              <span className="text-xs">{tab.label}</span>
            </Button>
          );
        })}
      </div>
      
      {/* Secondary navigation - scrollable */}
      <div className="overflow-x-auto">
        <div className="flex gap-2 px-4 py-2 min-w-max">
          {secondaryTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "default" : "outline"}
                size="sm"
                onClick={() => onTabChange(tab.id)}
                className="flex items-center gap-2 whitespace-nowrap"
              >
                <Icon className="h-3 w-3" />
                {tab.label}
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
