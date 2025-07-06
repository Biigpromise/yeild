
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
  HelpCircle,
  Activity,
  Bell
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
    { id: "community", label: "Community", icon: MessageCircle },
    { id: "activity", label: "Activity", icon: Activity },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "search", label: "Search", icon: Search },
    { id: "support", label: "Support", icon: HelpCircle },
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
