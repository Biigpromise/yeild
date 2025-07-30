import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "@/contexts/AuthContext";
import { useDashboard } from "@/hooks/useDashboard";
import { toast } from "sonner";
import { EmailConfirmationBanner } from "@/components/EmailConfirmationBanner";
import { StatsDashboard } from "@/components/StatsDashboard";
import { ModernOverviewTab } from "@/components/dashboard/ModernOverviewTab";
import { TasksTab } from "@/components/dashboard/TasksTab";
import { SettingsTab } from "@/components/dashboard/SettingsTab";
import { SocialTab } from "@/components/dashboard/SocialTab";
import { WalletTab } from "@/components/dashboard/WalletTab";
import { ReferralsTab } from "@/components/dashboard/ReferralsTab";
import { ProfileEditModal } from "@/components/dashboard/ProfileEditModal";
import { ModernDashboardSidebar } from "@/components/dashboard/ModernDashboardSidebar";
import { ModernDashboardHeader } from "@/components/dashboard/ModernDashboardHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { userProfile, userStats, loading, error, loadUserData } = useDashboard();
  const [unreadCount, setUnreadCount] = useState(0);

  const handleSignOut = async () => {
    try {
      console.log('Signing out user');
      await signOut();
      navigate('/auth');
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('Failed to sign out');
    }
  };

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => loadUserData()}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <ModernOverviewTab userStats={userStats ? {
          points: userStats.points,
          level: userStats.level.toString(),
          tasksCompleted: userStats.tasksCompleted
        } : undefined} />;
      case 'tasks':
        return <TasksTab />;
      case 'social':
        return <SocialTab />;
      case 'wallet':
        return <WalletTab />;
      case 'referral':
        return <ReferralsTab />;
      case 'settings':
        return <SettingsTab />;
      default:
        return <StatsDashboard userStats={userStats ? {
          points: userStats.points,
          level: userStats.level.toString(),
          tasksCompleted: userStats.tasksCompleted
        } : undefined} />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex" data-onboarding="dashboard">
      <EmailConfirmationBanner />
      
      {/* Modern Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0",
        isSidebarCollapsed ? "w-16" : "w-64"
      )}>
        <ModernDashboardSidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          userProfile={userProfile}
          userStats={userStats}
          unreadCount={unreadCount}
          onSignOut={handleSignOut}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={handleToggleSidebar}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Modern Header */}
        <ModernDashboardHeader
          onToggleSidebar={handleToggleSidebar}
          unreadCount={unreadCount}
          onUnreadCountChange={setUnreadCount}
          isSidebarCollapsed={isSidebarCollapsed}
        />

        {/* Content */}
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto">
            {/* Breadcrumb */}
            <div className="mb-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Dashboard</span>
                <span>/</span>
                <span className="text-foreground font-medium capitalize">{activeTab}</span>
              </div>
            </div>

            {/* Tab Content */}
            <div className="animate-in fade-in-50 duration-200">
              {renderContent()}
            </div>
          </div>
        </main>
      </div>
      
      {/* Profile Modal */}
      <ProfileEditModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        userProfile={userProfile}
        onProfileUpdate={loadUserData}
      />
    </div>
  );
}
