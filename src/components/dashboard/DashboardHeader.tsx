
import React, { useState } from "react";
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
import { Bell, LogOut, Settings, User, Search } from "lucide-react";
import { CompactBirdBatch } from "@/components/ui/CompactBirdBatch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ProfileBirdBadge } from "@/components/referral/ProfileBirdBadge";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { GlobalSearch } from "@/components/GlobalSearch";
import { useAuth } from "@/contexts/AuthContext";

interface DashboardHeaderProps {
  user: any;
  onTabChange?: (tab: string) => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ user, onTabChange }) => {
  const { signOut } = useAuth();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const handleProfileClick = () => {
    if (onTabChange) {
      onTabChange('profile');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="flex items-center justify-between p-2 sm:p-4 bg-background border-b">
      <div className="flex items-center space-x-4">
        {/* YEILD Logo */}
        <div className="flex items-center">
          <img 
            src="/lovable-uploads/cb163ee5-dbef-4122-b312-dacff15aa072.png" 
            alt="YEILD" 
            className="w-10 h-10 object-contain"
          />
        </div>
        
        {/* User Avatar and Bird Badge */}
        <div className="flex items-center space-x-3">
          <Avatar 
            className="h-12 w-12 border-2 border-primary/20 cursor-pointer hover:scale-105 transition-transform"
            onClick={handleProfileClick}
          >
            <AvatarImage 
              src={user?.profile_picture_url} 
              alt={user?.name || user?.email?.split('@')[0] || 'User'} 
            />
            <AvatarFallback className="text-lg font-semibold">
              {(user?.name || user?.email?.split('@')[0] || 'U').charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex items-center gap-2">
            {user?.id && (
              <ProfileBirdBadge userId={user.id} size="sm" showName />
            )}
            {user && (
              <CompactBirdBatch 
                count={user.tasks_completed || 0} 
                className="scale-90 sm:scale-100"
              />
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        {/* Global Search */}
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setIsSearchOpen(true)}
          className="relative"
        >
          <Search className="h-4 w-4" />
        </Button>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Notifications */}
        <Popover open={isNotificationsOpen} onOpenChange={setIsNotificationsOpen}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-4 w-4" />
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
              >
                0
              </Badge>
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
            <DropdownMenuItem onClick={handleProfileClick}>
              <User className="h-4 w-4 mr-2" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onTabChange && onTabChange('wallet')}>
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

      <GlobalSearch 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
      />
    </div>
  );
};
