
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const streakData = [
  { days: "1 day", users: 750 },
  { days: "2-3 days", users: 420 },
  { days: "4-7 days", users: 280 },
  { days: "8-14 days", users: 155 },
  { days: "15-30 days", users: 95 },
  { days: "31+ days", users: 40 },
];

const streakRewards = [
  { days: 3, reward: "5 points", description: "3-day login streak" },
  { days: 7, reward: "15 points", description: "Weekly streak" },
  { days: 14, reward: "30 points + badge", description: "2-week streak" },
  { days: 30, reward: "100 points + exclusive task", description: "Monthly streak" },
  { days: 90, reward: "500 points + tier upgrade", description: "Quarterly streak" },
];

export const AdminStreaks = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>User Streak Distribution</CardTitle>
            <CardDescription>Current active streak lengths across platform users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={streakData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="days" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="users" fill="#FFDE59" name="Users" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Streak Statistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted/20 rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Average Streak</p>
              <h3 className="text-2xl font-bold">4.3 days</h3>
            </div>
            <div className="bg-muted/20 rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Longest Active Streak</p>
              <h3 className="text-2xl font-bold">78 days</h3>
              <p className="text-sm">by user: michael94</p>
            </div>
            <div className="bg-muted/20 rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Weekly Retention Rate</p>
              <h3 className="text-2xl font-bold">68%</h3>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Streak Reward Configuration</CardTitle>
          <Button variant="outline">Add New Reward</Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Days Required</TableHead>
                  <TableHead>Reward</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {streakRewards.map((reward, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{reward.days} days</TableCell>
                    <TableCell>{reward.reward}</TableCell>
                    <TableCell>{reward.description}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline">Edit</Button>
                        <Button size="sm" variant="outline" className="text-red-600">Remove</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Manual Streak Management</CardTitle>
          <CardDescription>Manually update or reset user streaks</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">User ID or Email</label>
              <Input placeholder="Enter user ID or email" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Streak Action</label>
              <select className="w-full h-10 border rounded-md px-3">
                <option>Set streak value</option>
                <option>Add days</option>
                <option>Reset streak</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Value</label>
              <Input type="number" placeholder="Enter days" />
            </div>
          </div>
          <div className="flex justify-end">
            <Button>Apply Changes</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
