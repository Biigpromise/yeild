
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { Bell, LogOut, Settings, User } from "lucide-react";
import { ProfileBirdBadge } from "@/components/referral/ProfileBirdBadge";

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
    <div className="flex items-start justify-between mb-6">
      <div className="flex items-start space-x-4">
        <div className="relative flex-shrink-0">
          <Avatar className="h-12 w-12">
            <AvatarImage src={userProfile?.profile_picture_url} alt={userProfile?.name} />
            <AvatarFallback className="text-lg font-semibold">
              {userProfile?.name?.charAt(0)?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          {user?.id && (
            <div className="absolute -top-2 -right-2">
              <ProfileBirdBadge userId={user.id} size="sm" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="mb-2">
            <h1 className="text-2xl font-bold text-foreground mb-1">
              Welcome back, {userProfile?.name || 'User'}!
            </h1>
            <p className="text-sm text-muted-foreground">
              Ready to earn some points?
            </p>
          </div>
          {user?.id && (
            <div className="mt-3">
              <ProfileBirdBadge userId={user.id} size="md" showName />
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-3 flex-shrink-0">
        {/* Notifications */}
        <Popover open={isNotificationsOpen} onOpenChange={setIsNotificationsOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="relative">
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
                  {unreadCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-4">
              <h4 className="font-medium leading-none">Notifications</h4>
              <div className="text-sm text-muted-foreground">
                No new notifications
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setActiveTab('profile')}>
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
