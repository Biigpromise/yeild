
import React from 'react';
import { UserProfile } from '@/contexts/AuthContext';
import { ProfileBirdBadge } from '@/components/referral/ProfileBirdBadge';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Bell, LogOut, Settings, User, Search } from 'lucide-react';

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
    <div className="flex items-center justify-between mb-4 p-4 bg-card rounded-lg shadow-sm">
      <div className="flex items-center space-x-4">
        <Avatar className="h-10 w-10">
          <AvatarImage 
            src={userProfile?.profile_picture_url} 
            alt={userProfile?.name || user?.email} 
          />
          <AvatarFallback>
            {(userProfile?.name || user?.email)?.charAt(0)?.toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">
              Welcome back, {userProfile?.name || 'User'}!
            </h2>
            {user?.id && (
              <ProfileBirdBadge userId={user.id} size="md" showName />
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            Ready to earn some points today?
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        {/* Search Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setActiveTab('user-search')}
          className="relative"
        >
          <Search className="h-5 w-5" />
        </Button>

        {/* Notifications */}
        <Popover open={isNotificationsOpen} onOpenChange={setIsNotificationsOpen}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0">
            <div className="p-4 border-b">
              <h4 className="font-semibold">Notifications</h4>
            </div>
            <div className="p-4">
              <p className="text-sm text-muted-foreground text-center">
                No new notifications
              </p>
            </div>
          </PopoverContent>
        </Popover>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <User className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={() => setActiveTab('profile')}>
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
