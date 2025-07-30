import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  Target, 
  Wallet, 
  Users, 
  Gift,
  Heart,
  Settings,
  Bell,
  LogOut,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

interface ModernDashboardSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  userProfile: any;
  userStats: any;
  unreadCount: number;
  onSignOut: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const ModernDashboardSidebar: React.FC<ModernDashboardSidebarProps> = ({
  activeTab,
  onTabChange,
  userProfile,
  userStats,
  unreadCount,
  onSignOut,
  isCollapsed,
  onToggleCollapse
}) => {
  const { user } = useAuth();

  const navigationItems = [
    {
      id: 'overview',
      label: 'Overview',
      icon: BarChart3,
      description: 'Dashboard & Analytics'
    },
    {
      id: 'tasks',
      label: 'Tasks',
      icon: Target,
      description: 'Available Tasks'
    },
    {
      id: 'social',
      label: 'Social',
      icon: Heart,
      description: 'Community & Feed'
    },
    {
      id: 'wallet',
      label: 'Wallet',
      icon: Wallet,
      description: 'Points & Earnings'
    },
    {
      id: 'referral',
      label: 'Referrals',
      icon: Gift,
      description: 'Invite Friends'
    }
  ];

  const bottomItems = [
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      description: 'Account Settings'
    }
  ];

  const displayName = userProfile?.display_name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'User';

  return (
    <div className={cn(
      "relative flex flex-col h-full bg-gradient-to-b from-card via-card to-muted/20 border-r border-border/60 transition-all duration-300 ease-in-out",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="p-4 border-b border-border/60">
        <div className="flex items-center justify-between mb-4">
          {!isCollapsed && (
            <div className="flex items-center gap-3">
              <div className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                YIELD
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            className="h-8 w-8 p-0 hover:bg-muted"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* User Profile */}
        <div className={cn(
          "flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20",
          isCollapsed && "justify-center p-2"
        )}>
          <Avatar className="h-10 w-10 border-2 border-primary/20">
            <AvatarImage 
              src={userProfile?.profile_picture_url || user?.user_metadata?.avatar_url} 
              alt="Profile picture" 
            />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {displayName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm truncate text-foreground">
                {displayName}
              </div>
              <div className="text-xs text-muted-foreground">
                Level {userStats?.level || 1}
              </div>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        {!isCollapsed && (
          <div className="grid grid-cols-3 gap-2 mt-4">
            <div className="text-center p-2 rounded-lg bg-muted/50">
              <div className="text-lg font-bold text-primary">{userStats?.points || 0}</div>
              <div className="text-xs text-muted-foreground">Points</div>
            </div>
            <div className="text-center p-2 rounded-lg bg-muted/50">
              <div className="text-lg font-bold text-green-500">{userStats?.tasksCompleted || 0}</div>
              <div className="text-xs text-muted-foreground">Tasks</div>
            </div>
            <div className="text-center p-2 rounded-lg bg-muted/50">
              <div className="text-lg font-bold text-blue-500">{userStats?.level || 1}</div>
              <div className="text-xs text-muted-foreground">Level</div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex-1 py-4">
        <nav className="space-y-1 px-3">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-left",
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-md" 
                    : "hover:bg-muted/60 text-muted-foreground hover:text-foreground",
                  isCollapsed && "justify-center"
                )}
              >
                <Icon className={cn("h-5 w-5", isActive && "text-primary-foreground")} />
                {!isCollapsed && (
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{item.label}</div>
                    <div className="text-xs opacity-70">{item.description}</div>
                  </div>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Navigation */}
      <div className="p-3 border-t border-border/60 space-y-1">
        {bottomItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-left",
                isActive 
                  ? "bg-primary text-primary-foreground shadow-md" 
                  : "hover:bg-muted/60 text-muted-foreground hover:text-foreground",
                isCollapsed && "justify-center"
              )}
            >
              <Icon className={cn("h-5 w-5", isActive && "text-primary-foreground")} />
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{item.label}</div>
                  <div className="text-xs opacity-70">{item.description}</div>
                </div>
              )}
            </button>
          );
        })}

        {/* Notifications */}
        <button
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-left hover:bg-muted/60 text-muted-foreground hover:text-foreground relative",
            isCollapsed && "justify-center"
          )}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-red-500 text-white hover:bg-red-600"
            >
              {unreadCount}
            </Badge>
          )}
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm">Notifications</div>
              <div className="text-xs opacity-70">
                {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
              </div>
            </div>
          )}
        </button>

        {/* Sign Out */}
        <button
          onClick={onSignOut}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-left hover:bg-destructive/10 text-muted-foreground hover:text-destructive",
            isCollapsed && "justify-center"
          )}
        >
          <LogOut className="h-5 w-5" />
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm">Sign Out</div>
              <div className="text-xs opacity-70">Exit your account</div>
            </div>
          )}
        </button>
      </div>
    </div>
  );
};