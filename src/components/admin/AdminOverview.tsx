
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LineChart, Line, ResponsiveContainer } from "recharts";

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
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Payouts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[70px]">
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

      {/* User Management and Task Management */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Filter Users */}
        <Card>
          <CardHeader>
            <CardTitle>Filter Users</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input placeholder="Search users" />
            
            <div className="flex justify-end">
              <Button variant="outline">Suspend</Button>
            </div>
            
            <div className="border rounded-md">
              <div className="grid grid-cols-3 p-3 border-b bg-muted/50">
                <div>User</div>
                <div>Email</div>
                <div>Referrals</div>
              </div>
              
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div key={item} className="grid grid-cols-3 p-3 border-b last:border-0">
                  <div className="bg-muted/30 rounded h-6 w-3/4"></div>
                  <div className="bg-muted/30 rounded h-6 w-3/4"></div>
                  <div className="bg-muted/30 rounded h-6 w-3/4"></div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Task Management */}
        <Card>
          <CardHeader>
            <CardTitle>Task Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-2">
              <Input placeholder="Task Name" className="flex-1" />
              <Button>Create</Button>
            </div>
            
            <div className="flex space-x-2">
              <Button variant="outline" className="flex-1">Approve</Button>
              <Button variant="outline" className="flex-1">Reject</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Wallet, Complaints, and Referrals */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Wallet & Payouts */}
        <Card>
          <CardHeader>
            <CardTitle>Wallet & Payouts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-3xl font-bold">$--</div>
            <Button variant="outline" className="w-full">View Payouts</Button>
          </CardContent>
        </Card>

        {/* Complaints */}
        <Card>
          <CardHeader>
            <CardTitle>Complaints</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="bg-muted/30 rounded h-6 w-full"></div>
            <div className="bg-muted/30 rounded h-6 w-3/4"></div>
            <div className="bg-muted/30 rounded h-6 w-full"></div>
          </CardContent>
        </Card>

        {/* Referral Levels */}
        <Card>
          <CardHeader>
            <CardTitle>Referral Levels</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between items-center border-b pb-2">
              <div>Bronze</div>
              <div>Less 2</div>
            </div>
            <div className="flex justify-between items-center border-b pb-2">
              <div>Silver</div>
              <div>Less 10</div>
            </div>
            <div className="flex justify-between items-center">
              <div>Gold</div>
              <div>Less 50</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Second Referral Levels */}
      <Card>
        <CardHeader>
          <CardTitle>Referral Levels</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between items-center bg-muted/20 px-4 py-2 rounded-md">
            <div>Bronze</div>
            <div>{'< 20'}</div>
          </div>
          <div className="flex justify-between items-center bg-muted/20 px-4 py-2 rounded-md">
            <div>Silver</div>
            <div>{'< 10X'}</div>
          </div>
          <div className="flex justify-between items-center bg-muted/20 px-4 py-2 rounded-md">
            <div>Gold</div>
            <div>{'< 50X'}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
