
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const userGrowthData = [
  { month: 'Jan', users: 1200 },
  { month: 'Feb', users: 1900 },
  { month: 'Mar', users: 3000 },
  { month: 'Apr', users: 5000 },
  { month: 'May', users: 8100 },
  { month: 'Jun', users: 10500 },
  { month: 'Jul', users: 13203 },
];

const taskCompletionData = [
  { week: 'Week 1', tasks: 1450 },
  { week: 'Week 2', tasks: 2100 },
  { week: 'Week 3', tasks: 1800 },
  { week: 'Week 4', tasks: 2400 },
  { week: 'Week 5', tasks: 3200 },
  { week: 'Week 6', tasks: 2700 },
  { week: 'Week 7', tasks: 3100 },
];

const referralSourceData = [
  { name: 'Direct', value: 35 },
  { name: 'Social Media', value: 25 },
  { name: 'Referral', value: 20 },
  { name: 'SEO', value: 15 },
  { name: 'Ads', value: 5 },
];

const COLORS = ['#FFDE59', '#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export const AdminAnalytics = () => {
  const [timeRange, setTimeRange] = useState("30d");
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Analytics Dashboard</h3>
        <select 
          className="h-10 border border-input rounded-md px-3"
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
          <option value="12m">Last 12 months</option>
        </select>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">13,203</div>
            <p className="text-sm text-green-600">↑ 24.8% vs previous period</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Task Completion Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">78.5%</div>
            <p className="text-sm text-green-600">↑ 4.2% vs previous period</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Average User Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">$24.50</div>
            <p className="text-sm text-red-600">↓ 1.8% vs previous period</p>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="users">
        <TabsList className="mb-6">
          <TabsTrigger value="users">User Growth</TabsTrigger>
          <TabsTrigger value="tasks">Task Completion</TabsTrigger>
          <TabsTrigger value="referrals">Referrals</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
        </TabsList>
        
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Growth</CardTitle>
              <CardDescription>Monthly user acquisition</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={userGrowthData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="users" 
                      stroke="#FFDE59" 
                      strokeWidth={2}
                      activeDot={{ r: 8 }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="bg-muted/20 rounded-lg p-4 text-center">
                  <p className="text-sm text-muted-foreground">New Users (Today)</p>
                  <h3 className="text-2xl font-bold">145</h3>
                </div>
                <div className="bg-muted/20 rounded-lg p-4 text-center">
                  <p className="text-sm text-muted-foreground">Retention Rate</p>
                  <h3 className="text-2xl font-bold">64%</h3>
                </div>
                <div className="bg-muted/20 rounded-lg p-4 text-center">
                  <p className="text-sm text-muted-foreground">Churn Rate</p>
                  <h3 className="text-2xl font-bold">8.3%</h3>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="tasks">
          <Card>
            <CardHeader>
              <CardTitle>Task Completion</CardTitle>
              <CardDescription>Weekly task completion metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={taskCompletionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="tasks" fill="#FFDE59" name="Completed Tasks" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="bg-muted/20 rounded-lg p-4 text-center">
                  <p className="text-sm text-muted-foreground">Tasks Today</p>
                  <h3 className="text-2xl font-bold">342</h3>
                </div>
                <div className="bg-muted/20 rounded-lg p-4 text-center">
                  <p className="text-sm text-muted-foreground">Popular Task</p>
                  <h3 className="text-xl font-bold">Survey Completion</h3>
                </div>
                <div className="bg-muted/20 rounded-lg p-4 text-center">
                  <p className="text-sm text-muted-foreground">Avg. Time</p>
                  <h3 className="text-2xl font-bold">5.2 min</h3>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="referrals">
          <Card>
            <CardHeader>
              <CardTitle>Referral Analysis</CardTitle>
              <CardDescription>User acquisition channels</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-1/2 h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={referralSourceData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {referralSourceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="w-full md:w-1/2 space-y-4">
                  <div className="bg-muted/20 rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">Referral Conversion</p>
                    <h3 className="text-2xl font-bold">38.2%</h3>
                    <p className="text-sm">of invited users complete signup</p>
                  </div>
                  
                  <div className="bg-muted/20 rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">Average Referrals</p>
                    <h3 className="text-2xl font-bold">3.8</h3>
                    <p className="text-sm">referrals per active user</p>
                  </div>
                  
                  <div className="bg-muted/20 rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">Top Referrer</p>
                    <h3 className="text-xl font-bold">jane_smith94</h3>
                    <p className="text-sm">145 successful referrals</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="engagement">
          <Card>
            <CardHeader>
              <CardTitle>User Engagement</CardTitle>
              <CardDescription>Active users and session metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <h3 className="text-lg font-medium mb-2">Engagement Analytics Coming Soon</h3>
                <p className="text-muted-foreground">User engagement analytics are under development</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
