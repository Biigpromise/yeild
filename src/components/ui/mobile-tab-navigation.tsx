
import React, { useState } from 'react';
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
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface MobileTabNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const MobileTabNavigation: React.FC<MobileTabNavigationProps> = ({
  activeTab,
  onTabChange
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const tabs = [
    { id: "tasks", label: "Tasks", icon: CheckSquare },
    { id: "community", label: "Chat", icon: MessageCircle },
    { id: "stories", label: "Stories", icon: Camera }, // Replaced Profile with Stories
    { id: "profile", label: "Profile", icon: User }, // Moved to more menu
    { id: "referrals", label: "Referrals", icon: Users },
    { id: "achievements", label: "Badges", icon: Trophy },
    { id: "leaderboard", label: "Leaderboard", icon: BarChart3 },
    { id: "wallet", label: "Wallet", icon: Wallet },
    { id: "rewards", label: "Rewards", icon: Gift },
    { id: "history", label: "History", icon: History },
    { id: "search", label: "Search", icon: Search },
    { id: "support", label: "Support", icon: HelpCircle }
  ];

  const primaryTabs = tabs.slice(0, 4);
  const secondaryTabs = tabs.slice(4);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-700 z-50 safe-area-bottom">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        {/* Primary navigation with dropdown - made more compact */}
        <div className="flex justify-around items-center py-1">
          {primaryTabs.slice(0, 3).map((tab) => {
            const Icon = tab.icon;
            return (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "default" : "ghost"}
                size="sm"
                onClick={() => onTabChange(tab.id)}
                className="flex flex-col items-center gap-0.5 h-auto py-1.5 px-2 text-xs"
              >
                <Icon className="h-3.5 w-3.5" />
                <span className="text-xs">{tab.label}</span>
              </Button>
            );
          })}
          
          {/* Dropdown trigger - more compact */}
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="flex flex-col items-center gap-0.5 h-auto py-1.5 px-2 text-xs"
            >
              {isOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              <span className="text-xs">More</span>
            </Button>
          </CollapsibleTrigger>
        </div>
        
        {/* Collapsible content - more compact */}
        <CollapsibleContent>
          <div className="overflow-x-auto border-t border-gray-700">
            <div className="flex gap-1 px-2 py-1 min-w-max">
              {/* Fourth primary tab */}
              {primaryTabs.slice(3).map((tab) => {
                const Icon = tab.icon;
                return (
                  <Button
                    key={tab.id}
                    variant={activeTab === tab.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => onTabChange(tab.id)}
                    className="flex items-center gap-1 whitespace-nowrap text-xs py-1 px-2 h-auto"
                  >
                    <Icon className="h-3 w-3" />
                    {tab.label}
                  </Button>
                );
              })}
              
              {/* Secondary tabs */}
              {secondaryTabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <Button
                    key={tab.id}
                    variant={activeTab === tab.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => onTabChange(tab.id)}
                    className="flex items-center gap-1 whitespace-nowrap text-xs py-1 px-2 h-auto"
                  >
                    <Icon className="h-3 w-3" />
                    {tab.label}
                  </Button>
                );
              })}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};
