
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Bell, LogOut, Settings, User, Menu } from "lucide-react";
import { CompactBirdBatch } from "@/components/ui/CompactBirdBatch";

interface DashboardHeaderProps {
  userProfile: any;
  user: any;
  unreadCount: number;
  isNotificationsOpen: boolean;
  setIsNotificationsOpen: (open: boolean) => void;
  handleLogout: () => void;
  setActiveTab: (tab: string) => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  userProfile,
  user,
  unreadCount,
  isNotificationsOpen,
  setIsNotificationsOpen,
  handleLogout,
  setActiveTab
}) => {
  return (
    <div className="flex items-center justify-between p-2 sm:p-4 bg-background border-b">
      <div className="flex items-center space-x-3">
        {/* YEILD Brand Logo */}
        <div className="flex items-center space-x-2">
          <div className="text-2xl font-bold text-yellow-500">YEILD</div>
          <div className="text-xs text-muted-foreground hidden sm:block">Social Task Platform</div>
        </div>
        
        <div className="flex items-center space-x-2">
          <h1 className="text-lg sm:text-xl font-bold text-foreground">
            Welcome back, {userProfile?.name || user?.email?.split('@')[0] || 'User'}!
          </h1>
          {userProfile && (
            <CompactBirdBatch 
              count={userProfile.tasks_completed || 0} 
              className="scale-90 sm:scale-100"
            />
          )}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        {/* Notifications */}
        <Popover open={isNotificationsOpen} onOpenChange={setIsNotificationsOpen}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                >
                  {unreadCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-3">
              <h4 className="font-medium">Notifications</h4>
              <div className="text-sm text-muted-foreground">
                No new notifications
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <User className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setActiveTab('profile')}>
              <User className="h-4 w-4 mr-2" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setActiveTab('wallet')}>
              <Settings className="h-4 w-4 mr-2" />
              Wallet
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
