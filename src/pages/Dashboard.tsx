
import React from 'react';
import { Loader2 } from 'lucide-react';
import { useDashboard } from '@/hooks/useDashboard';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { TasksTab } from '@/components/dashboard/TasksTab';
import { DashboardErrorBoundary, DashboardErrorFallback } from '@/components/dashboard/DashboardErrorBoundary';

const Dashboard: React.FC = () => {
  const {
    userStats,
    userTasks,
    userSubmissions,
    completedTasks,
    totalPointsEarned,
    withdrawalStats,
    loading,
    error,
    loadUserData
  } = useDashboard();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <DashboardErrorFallback 
        error={error} 
        onRetry={loadUserData}
      />
    );
  }

  return (
    <DashboardErrorBoundary>
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back! Here's your progress overview.</p>
          </div>
        </div>
        
        <DashboardStats 
          userStats={userStats}
          totalPointsEarned={totalPointsEarned}
          withdrawalStats={withdrawalStats}
        />
        
        <TasksTab 
          userStats={userStats}
          userTasks={userTasks}
          userSubmissions={userSubmissions}
          loadUserData={loadUserData}
        />
      </div>
    </DashboardErrorBoundary>
  );
};

export default Dashboard;
