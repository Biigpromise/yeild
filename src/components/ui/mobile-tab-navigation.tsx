
import React from 'react';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  Home, 
  Gift, 
  Award, 
  Wallet, 
  Trophy, 
  MessageCircle 
} from 'lucide-react';

interface MobileTabNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  className?: string;
}

const tabs = [
  { value: 'tasks', label: 'Home', icon: Home },
  { value: 'rewards', label: 'Rewards', icon: Gift },
  { value: 'achievements', label: 'Achievements', icon: Award },
  { value: 'wallet', label: 'Wallet', icon: Wallet },
  { value: 'leaderboard', label: 'Leaderboard', icon: Trophy },
  { value: 'community-chat', label: 'Chat', icon: MessageCircle },
];

export const MobileTabNavigation: React.FC<MobileTabNavigationProps> = ({
  activeTab,
  onTabChange,
  className
}) => {
  const isMobile = useIsMobile();

  if (!isMobile) return null;

  return (
    <div className={cn(
      "fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50",
      className
    )}>
      <TabsList className="w-full h-16 bg-background p-0 grid grid-cols-6 rounded-none border-0">
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            onClick={() => onTabChange(tab.value)}
            className={cn(
              "flex-col h-full gap-1 data-[state=active]:bg-transparent rounded-none relative",
              "transition-colors duration-200",
              activeTab === tab.value 
                ? "text-primary" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <tab.icon className="h-5 w-5" />
            <span className="text-xs font-medium">{tab.label}</span>
            {activeTab === tab.value && (
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-primary rounded-b" />
            )}
          </TabsTrigger>
        ))}
      </TabsList>
    </div>
  );
};
