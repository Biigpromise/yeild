
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

interface DesktopTabNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const DesktopTabNavigation: React.FC<DesktopTabNavigationProps> = ({
  activeTab,
  onTabChange
}) => {
  const tabs = [
    { id: "tasks", label: "Tasks", icon: CheckSquare },
    { id: "stories", label: "Stories", icon: Camera },
    { id: "profile", label: "Profile", icon: User },
    { id: "referrals", label: "Referrals", icon: Users },
    { id: "achievements", label: "Achievements", icon: Trophy },
    { id: "leaderboard", label: "Leaderboard", icon: BarChart3 },
    { id: "wallet", label: "Wallet", icon: Wallet },
    { id: "rewards", label: "Rewards", icon: Gift },
    { id: "history", label: "History", icon: History },
    { id: "community", label: "Community", icon: MessageCircle },
    { id: "search", label: "Search", icon: Search },
    { id: "support", label: "Support", icon: HelpCircle }
  ];

  return (
    <div className="space-y-2">
      {tabs.map((tab) => {
        const Icon = tab.icon;
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
  );
};
