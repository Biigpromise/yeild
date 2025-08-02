import React, { useState } from 'react';
import { ModernNavHeader } from '@/components/navigation/ModernNavHeader';
import { cn } from '@/lib/utils';
import { Home, Users, FileText, Building, Activity } from 'lucide-react';

interface ModernAdminLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const ModernAdminLayout: React.FC<ModernAdminLayoutProps> = ({
  children,
  activeTab,
  onTabChange
}) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const handleToggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const navItems = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'tasks', label: 'Tasks', icon: FileText },
    { id: 'campaigns', label: 'Campaigns', icon: Building },
    { id: 'system', label: 'System Health', icon: Activity }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navigation Header */}
      <ModernNavHeader
        onToggleSidebar={handleToggleSidebar}
        unreadCount={unreadCount}
        onUnreadCountChange={setUnreadCount}
        isSidebarCollapsed={sidebarCollapsed}
        title="YIELD Admin"
        showSearch={false}
      />

      <div className="flex flex-1">
        {/* Sidebar */}
        <div className={cn(
          "transition-all duration-300 bg-card border-r border-border",
          sidebarCollapsed ? "w-16" : "w-64"
        )}>
          <div className="h-full p-4">
            <nav className="space-y-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    activeTab === item.id
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {!sidebarCollapsed && <span>{item.label}</span>}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0 bg-muted/30">
          <div className="h-full p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};