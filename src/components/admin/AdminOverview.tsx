
import React from "react";
import { AdminSystemMetrics } from "./AdminSystemMetrics";
import { AdminQuickActions } from "./AdminQuickActions";
import { AdminDashboardStatsComponent } from "./AdminDashboardStats";
import { AdminUserActions } from "./AdminUserActions";
import { AdminRecentActivity } from "./AdminRecentActivity";
import { AdminTaskOverview } from "./AdminTaskOverview";
import { AdminPlatformStats } from "./AdminPlatformStats";

export const AdminOverview = () => {
  return (
    <div className="space-y-6">
      {/* Real Dashboard Stats */}
      <AdminDashboardStatsComponent />

      {/* System Metrics */}
      <AdminSystemMetrics />

      {/* User Management Actions */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">User Management</h3>
        <AdminUserActions />
      </div>

      {/* Quick Actions */}
      <AdminQuickActions />

      {/* User Management and Task Management */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent User Activity */}
        <AdminRecentActivity />

        {/* Task Management */}
        <AdminTaskOverview />
      </div>

      {/* Platform Statistics */}
      <AdminPlatformStats />
    </div>
  );
};
