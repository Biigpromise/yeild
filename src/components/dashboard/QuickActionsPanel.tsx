import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Plus, 
  Search, 
  Gift, 
  MessageSquare, 
  Trophy, 
  Users,
  FileText,
  Zap
} from "lucide-react";

interface QuickActionsPanelProps {
  onTabChange?: (tab: string) => void;
  onAction?: (action: string) => void;
}

export const QuickActionsPanel: React.FC<QuickActionsPanelProps> = ({ 
  onTabChange, 
  onAction 
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const quickActions = [
    {
      id: 'create-post',
      label: 'Create Post',
      icon: <MessageSquare className="h-4 w-4" />,
      action: () => {
        onTabChange?.('community');
        onAction?.('create-post');
      }
    },
    {
      id: 'find-tasks',
      label: 'Find Tasks',
      icon: <Search className="h-4 w-4" />,
      action: () => {
        onTabChange?.('tasks');
        onAction?.('find-tasks');
      }
    },
    {
      id: 'check-rewards',
      label: 'Check Rewards',
      icon: <Gift className="h-4 w-4" />,
      action: () => {
        onTabChange?.('rewards');
        onAction?.('check-rewards');
      }
    },
    {
      id: 'view-leaderboard',
      label: 'Leaderboard',
      icon: <Trophy className="h-4 w-4" />,
      action: () => {
        onTabChange?.('leaderboard');
        onAction?.('view-leaderboard');
      }
    },
    {
      id: 'invite-friends',
      label: 'Invite Friends',
      icon: <Users className="h-4 w-4" />,
      action: () => {
        onTabChange?.('referrals');
        onAction?.('invite-friends');
      }
    },
    {
      id: 'view-history',
      label: 'View History',
      icon: <FileText className="h-4 w-4" />,
      action: () => {
        onTabChange?.('history');
        onAction?.('view-history');
      }
    }
  ];

  return (
    <>
      {/* Desktop Quick Actions */}
      <div className="hidden lg:block fixed bottom-6 right-6 z-40">
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
          <DropdownMenuTrigger asChild>
            <Button 
              size="lg" 
              className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 bg-primary hover:bg-primary/90"
            >
              <Plus className={`h-6 w-6 transition-transform duration-300 ${isOpen ? 'rotate-45' : 'rotate-0'}`} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align="end" 
            className="w-48 mb-2"
            side="top"
          >
            <DropdownMenuLabel className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Quick Actions
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {quickActions.map((action) => (
              <DropdownMenuItem
                key={action.id}
                className="flex items-center gap-2 cursor-pointer"
                onClick={action.action}
              >
                {action.icon}
                {action.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Mobile Quick Actions Bar */}
      <div className="lg:hidden fixed bottom-20 left-4 right-4 z-40">
        <Card className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <CardContent className="p-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Quick Actions
              </span>
              <div className="flex gap-1">
                {quickActions.slice(0, 4).map((action) => (
                  <Button
                    key={action.id}
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={action.action}
                  >
                    {action.icon}
                  </Button>
                ))}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 mb-2">
                    {quickActions.slice(4).map((action) => (
                      <DropdownMenuItem
                        key={action.id}
                        className="flex items-center gap-2 cursor-pointer"
                        onClick={action.action}
                      >
                        {action.icon}
                        {action.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};