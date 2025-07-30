import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { AppSidebar } from '@/components/AppSidebar';
import { ModernNavHeader } from '@/components/navigation/ModernNavHeader';
import { useAuth } from '@/contexts/AuthContext';
import { useDashboard } from '@/hooks/useDashboard';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export const AppLayout: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const { userProfile, userStats } = useDashboard();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/auth');
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('Failed to sign out');
    }
  };

  const handleToggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleToggleSidebarVisibility = () => {
    setSidebarVisible(!sidebarVisible);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navigation Header */}
      <ModernNavHeader
        onToggleSidebar={handleToggleSidebarVisibility}
        unreadCount={unreadCount}
        onUnreadCountChange={setUnreadCount}
        isSidebarCollapsed={sidebarCollapsed}
      />

      <div className="flex flex-1">
        {/* Sidebar */}
        {sidebarVisible && (
          <div className={cn(
            "fixed inset-y-0 left-0 z-40 transition-all duration-300 ease-in-out lg:relative lg:translate-x-0",
            sidebarCollapsed ? "w-16" : "w-64",
            "lg:block mt-16 lg:mt-0"
          )}>
            <AppSidebar
              userProfile={userProfile}
              userStats={userStats}
              unreadCount={unreadCount}
              onSignOut={handleSignOut}
              isCollapsed={sidebarCollapsed}
              onToggleCollapse={handleToggleSidebar}
              onProfileClick={() => navigate('/dashboard')}
            />
          </div>
        )}

        {/* Backdrop for mobile */}
        {sidebarVisible && (
          <div 
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={handleToggleSidebarVisibility}
          />
        )}

        {/* Main Content */}
        <div className={cn(
          "flex-1 min-w-0 transition-all duration-300",
          !sidebarVisible && "lg:ml-0",
          sidebarVisible && sidebarCollapsed && "lg:ml-16",
          sidebarVisible && !sidebarCollapsed && "lg:ml-64"
        )}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};