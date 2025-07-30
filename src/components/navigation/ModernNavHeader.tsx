import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Menu, Search, User } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { NotificationCenter } from '@/components/dashboard/NotificationCenter';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface ModernNavHeaderProps {
  onToggleSidebar?: () => void;
  unreadCount?: number;
  onUnreadCountChange?: (count: number) => void;
  isSidebarCollapsed?: boolean;
  showSearch?: boolean;
  title?: string;
}

export const ModernNavHeader: React.FC<ModernNavHeaderProps> = ({
  onToggleSidebar,
  unreadCount = 0,
  onUnreadCountChange,
  isSidebarCollapsed = false,
  showSearch = true,
  title = "YEILD"
}) => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          {onToggleSidebar && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleSidebar}
              className="lg:hidden"
            >
              <Menu className="h-4 w-4" />
            </Button>
          )}
          
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              {title}
            </h1>
          </div>
        </div>

        {/* Center Section - Search */}
        {showSearch && (
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search..."
                className="pl-10 bg-muted/50 border-muted focus:bg-background"
              />
            </div>
          </div>
        )}

        {/* Right Section */}
        <div className="flex items-center gap-2">
          <Popover>
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
            <PopoverContent className="w-80 p-0" align="end">
              <NotificationCenter onUnreadCountChange={onUnreadCountChange} />
            </PopoverContent>
          </Popover>

          <Button variant="ghost" size="sm">
            <User className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
};