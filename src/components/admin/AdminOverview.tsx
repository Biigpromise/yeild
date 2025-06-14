
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AdminSystemMetrics } from "./AdminSystemMetrics";
import { AdminQuickActions } from "./AdminQuickActions";
import { AdminDashboardStatsComponent } from "./AdminDashboardStats";

export const AdminOverview = () => {
  return (
    <div className="space-y-6">
      {/* Real Dashboard Stats */}
      <AdminDashboardStatsComponent />

      {/* System Metrics */}
      <AdminSystemMetrics />

      {/* Quick Actions */}
      <AdminQuickActions />

      {/* User Management and Task Management */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent User Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent User Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input placeholder="Search users" />
            
            <div className="flex justify-end">
              <Button variant="outline">View All Users</Button>
            </div>
            
            <div className="border rounded-md">
              <div className="grid grid-cols-3 p-3 border-b bg-muted/50">
                <div className="font-medium">User</div>
                <div className="font-medium">Email</div>
                <div className="font-medium">Status</div>
              </div>
              
              <div className="p-8 text-center text-muted-foreground">
                <p>No user activity yet</p>
                <p className="text-sm">User activity will appear here once users start joining</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Task Management */}
        <Card>
          <CardHeader>
            <CardTitle>Task Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-muted/20 rounded-lg">
                <div className="text-2xl font-bold">0</div>
                <div className="text-sm text-muted-foreground">Pending Approval</div>
              </div>
              <div className="text-center p-4 bg-muted/20 rounded-lg">
                <div className="text-2xl font-bold">0</div>
                <div className="text-sm text-muted-foreground">Active Tasks</div>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Button variant="outline" className="flex-1" disabled>Approve Pending</Button>
              <Button className="flex-1">Create New Task</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Platform Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <h4 className="font-medium">User Levels Distribution</h4>
              <div className="space-y-1">
                <div className="flex justify-between items-center bg-muted/20 px-3 py-2 rounded-md">
                  <div>Level 1</div>
                  <div className="text-sm text-muted-foreground">0 users</div>
                </div>
                <div className="flex justify-between items-center bg-muted/20 px-3 py-2 rounded-md">
                  <div>Level 2</div>
                  <div className="text-sm text-muted-foreground">0 users</div>
                </div>
                <div className="flex justify-between items-center bg-muted/20 px-3 py-2 rounded-md">
                  <div>Level 3+</div>
                  <div className="text-sm text-muted-foreground">0 users</div>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Total Payouts</h4>
              <div className="text-3xl font-bold">$0</div>
              <Button variant="outline" className="w-full">View All Payouts</Button>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Support Tickets</h4>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-sm">Open</span>
                  <span className="font-medium">0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">In Progress</span>
                  <span className="font-medium">0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Resolved Today</span>
                  <span className="font-medium">0</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
