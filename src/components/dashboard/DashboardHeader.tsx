
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { NotificationCenter } from '@/components/NotificationCenter';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Bell,
  Target,
  LogOut,
  User,
  ChevronDown,
  Users
} from 'lucide-react';

interface DashboardHeaderProps {
  userProfile: any;
  user: any;
  unreadCount: number;
  isNotificationsOpen: boolean;
  setIsNotificationsOpen: (isOpen: boolean) => void;
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
  setActiveTab,
}) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  return (
    <div className="flex justify-between items-center mb-2 sm:mb-3">
      <div className="min-w-0 flex-1">
        <h1 className="text-lg sm:text-xl font-bold mb-1 truncate">Dashboard</h1>
        <p className="text-xs text-muted-foreground truncate">
          Welcome back, {userProfile?.name || user?.email}!
        </p>
      </div>
      <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
        {/* Notifications */}
        <Popover open={isNotificationsOpen} onOpenChange={setIsNotificationsOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="relative">
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <Badge variant="destructive" className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-xs">
                  {unreadCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 sm:w-96 p-0" align="end">
            <NotificationCenter />
          </PopoverContent>
        </Popover>

        {/* Browse Tasks Button - Hidden on mobile */}
        {!isMobile && (
          <Button size="sm" onClick={() => navigate('/tasks')}>
            <Target className="h-4 w-4 mr-1" />
            Browse Tasks
          </Button>
        )}

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <User className="h-4 w-4" />
              {!isMobile && <ChevronDown className="h-3 w-3" />}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => window.location.href = "/profile"}>
              <User className="h-4 w-4 mr-2" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/tasks')}>
              <Target className="h-4 w-4 mr-2" />
              Browse Tasks
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setActiveTab('referrals')}>
              <Users className="h-4 w-4 mr-2" />
              Referrals
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
