
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  ChevronUp,
  Lock,
  Activity,
  Bell
} from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useExperienceLevel } from '@/hooks/useExperienceLevel';
import { FeatureUnlockPopup } from '../dashboard/FeatureUnlockPopup';

interface MobileTabNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  tasksCompleted?: number;
  referralsCount?: number;
}

export const MobileTabNavigation: React.FC<MobileTabNavigationProps> = ({
  activeTab,
  onTabChange,
  tasksCompleted = 0,
  referralsCount = 0
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showUnlockPopup, setShowUnlockPopup] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState('');
  
  const { isFeatureUnlocked, tasksToNextTier, referralsToNextTier, nextTier } = useExperienceLevel(
    tasksCompleted, 
    tasksCompleted, 
    referralsCount
  );

  const allTabs = [
    { id: "tasks", label: "Tasks", icon: CheckSquare, tier: "beginner" },
    { id: "referrals", label: "Referrals", icon: Users, tier: "beginner" },
    { id: "stories", label: "Stories", icon: Camera, tier: "intermediate" },
    { id: "wallet", label: "Wallet", icon: Wallet, tier: "beginner" },
    { id: "community", label: "Chat", icon: MessageCircle, tier: "intermediate" },
    { id: "achievements", label: "Badges", icon: Trophy, tier: "advanced" },
    { id: "leaderboard", label: "Leaderboard", icon: BarChart3, tier: "intermediate" },
    { id: "profile", label: "Profile", icon: User, tier: "beginner" },
    { id: "rewards", label: "Rewards", icon: Gift, tier: "advanced" },
    { id: "history", label: "History", icon: History, tier: "advanced" },
    { id: "search", label: "Search", icon: Search, tier: "advanced" },
    { id: "support", label: "Support", icon: HelpCircle, tier: "beginner" },
    { id: "activity", label: "Activity", icon: Activity, tier: "advanced" },
    { id: "notifications", label: "Notifications", icon: Bell, tier: "advanced" }
  ];

  const handleLockedFeatureClick = (featureName: string) => {
    setSelectedFeature(featureName);
    setShowUnlockPopup(true);
  };

  // Filter tabs based on experience level for primary tabs (always show unlocked ones)
  const unlockedTabs = allTabs.filter(tab => isFeatureUnlocked(tab.id));
  const primaryTabs = unlockedTabs.slice(0, 3); // Show first 3 unlocked tabs
  const secondaryTabs = unlockedTabs.slice(3); // Rest go in the dropdown
  
  // Include some locked tabs in secondary to show progress
  const lockedTabs = allTabs.filter(tab => !isFeatureUnlocked(tab.id)).slice(0, 3);

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
              
              {/* Locked tabs preview */}
              {lockedTabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <Button
                    key={tab.id}
                    variant="outline"
                    size="sm"
                    onClick={() => handleLockedFeatureClick(tab.label)}
                    className="relative flex items-center gap-1 whitespace-nowrap text-xs py-1 px-2 h-auto opacity-50"
                  >
                    <Lock className="h-3 w-3" />
                    {tab.label}
                    <Badge 
                      variant="outline" 
                      className="text-xs px-1 ml-1"
                    >
                      {tasksToNextTier + referralsToNextTier}
                    </Badge>
                  </Button>
                );
              })}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
      
      <FeatureUnlockPopup
        isOpen={showUnlockPopup}
        onClose={() => setShowUnlockPopup(false)}
        nextTier={nextTier}
        tasksToNextTier={tasksToNextTier}
        referralsToNextTier={referralsToNextTier}
        featureName={selectedFeature}
      />
    </div>
  );
};
