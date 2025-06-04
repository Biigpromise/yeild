
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import { AdminSystemMetrics } from "./AdminSystemMetrics";
import { AdminQuickActions } from "./AdminQuickActions";

const data = [
  { name: "Jan", value: 400 },
  { name: "Feb", value: 300 },
  { name: "Mar", value: 600 },
  { name: "Apr", value: 500 },
  { name: "May", value: 700 },
  { name: "Jun", value: 900 },
  { name: "Jul", value: 800 }
];

export const AdminOverview = () => {
  return (
    <div className="space-y-6">
      {/* System Metrics */}
      <AdminSystemMetrics />

      {/* Metrics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">13,203</div>
            <p className="text-xs text-muted-foreground mt-1">
              +180 this week
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Tasks Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">45,780</div>
            <p className="text-xs text-muted-foreground mt-1">
              +2,341 this week
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Payouts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">$127,450</div>
            <div className="h-[40px] mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#FFDE59"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <AdminQuickActions />

      {/* User Management and Task Management */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Filter Users */}
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
              
              {[
                { name: "John Doe", email: "john@example.com", status: "Active" },
                { name: "Jane Smith", email: "jane@example.com", status: "Active" },
                { name: "Bob Wilson", email: "bob@example.com", status: "Inactive" },
                { name: "Alice Brown", email: "alice@example.com", status: "Active" },
                { name: "Mike Davis", email: "mike@example.com", status: "Suspended" },
                { name: "Sarah Johnson", email: "sarah@example.com", status: "Active" }
              ].map((user, index) => (
                <div key={index} className="grid grid-cols-3 p-3 border-b last:border-0 text-sm">
                  <div>{user.name}</div>
                  <div className="text-muted-foreground">{user.email}</div>
                  <div>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      user.status === "Active" ? "bg-green-100 text-green-800" :
                      user.status === "Inactive" ? "bg-gray-100 text-gray-800" :
                      "bg-red-100 text-red-800"
                    }`}>
                      {user.status}
                    </span>
                  </div>
                </div>
              ))}
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
                <div className="text-2xl font-bold">24</div>
                <div className="text-sm text-muted-foreground">Pending Approval</div>
              </div>
              <div className="text-center p-4 bg-muted/20 rounded-lg">
                <div className="text-2xl font-bold">156</div>
                <div className="text-sm text-muted-foreground">Active Tasks</div>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Button variant="outline" className="flex-1">Approve Pending</Button>
              <Button className="flex-1">Create New Task</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Referral Levels */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <h4 className="font-medium">Referral Levels Distribution</h4>
              <div className="space-y-1">
                <div className="flex justify-between items-center bg-muted/20 px-3 py-2 rounded-md">
                  <div>Bronze</div>
                  <div className="text-sm text-muted-foreground">{'8,520 users'}</div>
                </div>
                <div className="flex justify-between items-center bg-muted/20 px-3 py-2 rounded-md">
                  <div>Silver</div>
                  <div className="text-sm text-muted-foreground">{'3,240 users'}</div>
                </div>
                <div className="flex justify-between items-center bg-muted/20 px-3 py-2 rounded-md">
                  <div>Gold</div>
                  <div className="text-sm text-muted-foreground">{'1,443 users'}</div>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Recent Payouts</h4>
              <div className="text-3xl font-bold">$8,520</div>
              <Button variant="outline" className="w-full">View All Payouts</Button>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Support Tickets</h4>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-sm">Open</span>
                  <span className="font-medium">12</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">In Progress</span>
                  <span className="font-medium">8</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Resolved Today</span>
                  <span className="font-medium">15</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
