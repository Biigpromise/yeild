import React from 'react';
import { Home, Zap, Store, Wallet, User } from 'lucide-react';
import { cn } from '@/lib/utils';

type TabType = 'home' | 'earn' | 'marketplace' | 'wallet' | 'profile';

interface MobileBottomNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ 
  activeTab, 
  onTabChange 
}) => {
  const tabs = [
    { id: 'home' as TabType, name: 'Home', icon: Home },
    { id: 'earn' as TabType, name: 'Earn', icon: Zap },
    { id: 'marketplace' as TabType, name: 'Market', icon: Store },
    { id: 'wallet' as TabType, name: 'Wallet', icon: Wallet },
    { id: 'profile' as TabType, name: 'Profile', icon: User }
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border/60 z-50 safe-area-bottom">
      <div className="flex justify-around items-center py-2 px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "flex flex-col items-center gap-1 py-2 px-3 rounded-lg transition-all duration-200 min-w-[60px]",
                isActive 
                  ? "bg-primary/10 text-primary" 
                  : "text-muted-foreground active:bg-accent/50"
              )}
            >
              <Icon className={cn(
                "h-5 w-5 transition-transform duration-200",
                isActive && "scale-110"
              )} />
              <span className={cn(
                "text-xs font-medium",
                isActive && "text-primary"
              )}>
                {tab.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
