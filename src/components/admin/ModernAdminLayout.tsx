import React, { useState } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { ModernNavHeader } from '@/components/navigation/ModernNavHeader';
import { cn } from '@/lib/utils';

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
          "transition-all duration-300",
          sidebarCollapsed ? "w-16" : "w-64"
        )}>
          <AdminSidebar
            activeTab={activeTab}
            onTabChange={onTabChange}
            collapsed={sidebarCollapsed}
            onToggleCollapse={handleToggleSidebar}
          />
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