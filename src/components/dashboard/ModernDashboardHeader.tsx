import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Bell, Search, Menu } from "lucide-react";
import { NotificationCenter } from "@/components/dashboard/NotificationCenter";
import { AdminUserToggle } from "@/components/admin/AdminUserToggle";
import { cn } from "@/lib/utils";

interface ModernDashboardHeaderProps {
  onToggleSidebar: () => void;
  unreadCount: number;
  onUnreadCountChange: (count: number) => void;
  isSidebarCollapsed: boolean;
}

export const ModernDashboardHeader: React.FC<ModernDashboardHeaderProps> = ({
  onToggleSidebar,
  unreadCount,
  onUnreadCountChange,
  isSidebarCollapsed
}) => {
  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/60">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleSidebar}
            className="h-9 w-9 p-0 md:hidden"
          >
            <Menu className="h-4 w-4" />
          </Button>
          
          <div className="hidden md:flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search tasks, notifications..."
                className="pl-10 pr-4 py-2 w-80 bg-muted/50 border border-border/60 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Admin/User Toggle */}
          <AdminUserToggle />

          {/* Quick Stats - Hidden on mobile */}
          <div className="hidden lg:flex items-center gap-6">
            <div className="text-center">
              <div className="text-sm font-semibold text-foreground">Dashboard</div>
              <div className="text-xs text-muted-foreground">Welcome back!</div>
            </div>
          </div>

          {/* Notifications */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="relative h-9 w-9 p-0">
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <Badge 
                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-red-500 text-white hover:bg-red-600"
                  >
                    {unreadCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
              <NotificationCenter onUnreadCountChange={onUnreadCountChange} />
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </header>
  );
};