import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useDashboard } from '@/hooks/useDashboard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { YieldLogo } from '@/components/ui/YieldLogo';
import { 
  Home, 
  Zap, 
  User, 
  Wallet,
  Bell,
  Menu,
  X,
  LogOut,
  ArrowUpRight,
  Clock,
  Trophy,
  Target,
  Store
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { HomeTab } from './tabs/HomeTab';
import { EarnTab } from './tabs/EarnTab';
import { ProfileTab } from './tabs/ProfileTab';
import { WalletTab } from './tabs/WalletTab';
import { LiveNotifications } from './LiveNotifications';
import EarnPage from '@/components/EarnPage';
import { MarketplaceBrowser } from '@/components/marketplace/MarketplaceBrowser';
import { MobileBottomNav } from './MobileBottomNav';

type TabType = 'home' | 'earn' | 'marketplace' | 'wallet' | 'profile';

interface SimplifiedDashboardProps {
  className?: string;
}

export const SimplifiedDashboard: React.FC<SimplifiedDashboardProps> = ({ className }) => {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const { signOut, user } = useAuth();
  const { 
    userProfile, 
    userStats, 
    userTasks, 
    loading, 
    error,
    loadUserData 
  } = useDashboard();

  // Live data updates every 30 seconds
  useEffect(() => {
    const interval = setInterval(loadUserData, 30000);
    return () => clearInterval(interval);
  }, [loadUserData]);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Error signing out');
    }
  };

  const tabs = [
    {
      id: 'home' as TabType,
      name: 'Home',
      icon: Home,
      description: 'Overview & progress'
    },
    {
      id: 'earn' as TabType,
      name: 'Earn',
      icon: Zap,
      description: 'Tasks & opportunities'
    },
    {
      id: 'marketplace' as TabType,
      name: 'Market',
      icon: Store,
      description: 'Browse listings'
    },
    {
      id: 'wallet' as TabType,
      name: 'Wallet',
      icon: Wallet,
      description: 'Earnings & withdrawals'
    },
    {
      id: 'profile' as TabType,
      name: 'Profile',
      icon: User,
      description: 'Settings & birds'
    }
  ];

  if (loading && !userProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
        <div className="text-center space-y-4">
          <YieldLogo size={48} className="mx-auto animate-pulse" />
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
        <div className="text-center space-y-4 p-6">
          <div className="text-destructive text-lg">⚠️</div>
          <h3 className="font-semibold">Something went wrong</h3>
          <p className="text-sm text-muted-foreground max-w-md">{error}</p>
          <Button onClick={loadUserData} variant="outline" size="sm">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'home':
        return <HomeTab userStats={userStats} userProfile={userProfile} />;
      case 'earn':
        return <EarnPage />;
      case 'marketplace':
        return <MarketplaceBrowser />;
      case 'wallet':
        return <WalletTab userProfile={userProfile} userStats={userStats} />;
      case 'profile':
        return <ProfileTab userProfile={userProfile} userStats={userStats} />;
      default:
        return null;
    }
  };

  return (
    <div className={cn("min-h-screen bg-gradient-to-br from-background via-background to-primary/5", className)}>
      {/* Mobile Header */}
      <div className="lg:hidden sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border/60">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden"
            >
              <Menu className="h-4 w-4" />
            </Button>
            <YieldLogo size={32} />
            <span className="font-bold text-lg bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              YEILD
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <LiveNotifications unreadCount={unreadCount} onUnreadCountChange={setUnreadCount} />
          </div>
        </div>
      </div>

      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border/60 transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <div className="flex flex-col h-full">
            {/* Sidebar Header */}
            <div className="p-6 border-b border-border/60">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <YieldLogo size={32} />
                  <span className="font-bold text-lg bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                    YEILD
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarOpen(false)}
                  className="lg:hidden"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* User Info */}
            <div className="p-6 border-b border-border/60">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">
                    {userProfile?.name || user?.email?.split('@')[0] || 'User'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Level {userStats.level}
                  </p>
                </div>
              </div>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="bg-primary/5 rounded-lg p-3">
                  <div className="text-lg font-bold text-primary">{userStats.points}</div>
                  <div className="text-xs text-muted-foreground">Points</div>
                </div>
                <div className="bg-accent/10 rounded-lg p-3">
                  <div className="text-lg font-bold text-accent-foreground">{userStats.tasksCompleted}</div>
                  <div className="text-xs text-muted-foreground">Tasks</div>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4">
              <div className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                        setSidebarOpen(false);
                      }}
                      className={cn(
                        "w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 group",
                        isActive 
                          ? "bg-primary text-primary-foreground shadow-md" 
                          : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                      )}
                    >
                      <Icon className={cn(
                        "h-4 w-4 transition-transform duration-200",
                        isActive && "scale-110"
                      )} />
                      <div className="text-left">
                        <div className={cn("font-medium", isActive && "text-primary-foreground")}>
                          {tab.name}
                        </div>
                        <div className={cn(
                          "text-xs", 
                          isActive ? "text-primary-foreground/80" : "text-muted-foreground"
                        )}>
                          {tab.description}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </nav>

            {/* Desktop Notifications */}
            <div className="hidden lg:block p-4 border-t border-border/60">
              <LiveNotifications unreadCount={unreadCount} onUnreadCountChange={setUnreadCount} />
            </div>

            {/* Sidebar Footer */}
            <div className="p-4 border-t border-border/60">
              <Button
                onClick={handleSignOut}
                variant="ghost"
                size="sm"
                className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </aside>

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-background/80 backdrop-blur lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 lg:ml-0 pb-20 lg:pb-0">
          <div className="max-w-6xl mx-auto p-4 lg:p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {renderTabContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};