import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard,
  Users,
  Building2,
  Megaphone,
  FileText,
  BarChart3,
  DollarSign,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

const navigationItems = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'users', label: 'User Management', icon: Users },
  { id: 'brands', label: 'Brand Management', icon: Building2 },
  { id: 'campaigns', label: 'Campaign Management', icon: Megaphone },
  { id: 'submissions', label: 'Task Submissions', icon: FileText },
  { id: 'analytics', label: 'Analytics & Reports', icon: BarChart3 },
  { id: 'financial', label: 'Financial Management', icon: DollarSign },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'settings', label: 'Platform Settings', icon: Settings },
];

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  onTabChange,
  collapsed,
  onToggleCollapse,
}) => {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Error signing out');
    }
  };

  return (
    <div className={cn(
      "h-full bg-card border-r border-border transition-all duration-300 flex flex-col shadow-sm",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between bg-gradient-to-r from-primary/5 to-primary/10">
        {!collapsed && (
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Admin Panel
            </h1>
            <p className="text-sm text-muted-foreground">Platform Management</p>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleCollapse}
          className="h-8 w-8 p-0 hover:bg-primary/10"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <Button
              key={item.id}
              variant={isActive ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start gap-3 h-12 rounded-lg transition-all duration-200",
                collapsed && "justify-center px-2",
                isActive && "bg-primary/15 text-primary border-l-4 border-primary shadow-md hover:bg-primary/20",
                !isActive && "hover:bg-muted/60 hover:scale-[1.02]"
              )}
              onClick={() => onTabChange(item.id)}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {!collapsed && (
                <span className="text-sm font-medium">{item.label}</span>
              )}
            </Button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-border bg-muted/30">
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start gap-3 h-12 rounded-lg text-destructive hover:text-destructive hover:bg-destructive/10 transition-all duration-200",
            collapsed && "justify-center px-2"
          )}
          onClick={handleSignOut}
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {!collapsed && <span className="text-sm font-medium">Sign Out</span>}
        </Button>
      </div>
    </div>
  );
};