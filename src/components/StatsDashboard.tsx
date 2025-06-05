
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Target,
  Calendar,
  Clock,
  Award
} from "lucide-react";

interface StatsDashboardProps {
  userStats: {
    level: number;
    points: number;
    tasksCompleted: number;
    currentStreak: number;
    longestStreak: number;
  };
}

export const StatsDashboard = ({ userStats }: StatsDashboardProps) => {
  // Mock data for charts - in real app this would come from API
  const pointsOverTime = [
    { date: "Jan", points: 0 },
    { date: "Feb", points: 150 },
    { date: "Mar", points: 450 },
    { date: "Apr", points: 720 },
    { date: "May", points: 1100 },
    { date: "Jun", points: 1400 },
  ];

  const tasksPerCategory = [
    { category: "Social Media", completed: 12, total: 15 },
    { category: "Survey", completed: 8, total: 10 },
    { category: "Review", completed: 5, total: 8 },
    { category: "Video", completed: 3, total: 5 },
    { category: "Download", completed: 7, total: 9 },
  ];

  const weeklyActivity = [
    { day: "Mon", tasks: 2 },
    { day: "Tue", tasks: 1 },
    { day: "Wed", tasks: 3 },
    { day: "Thu", tasks: 2 },
    { day: "Fri", tasks: 4 },
    { day: "Sat", tasks: 1 },
    { day: "Sun", tasks: 2 },
  ];

  const difficultyBreakdown = [
    { name: "Easy", value: 45, color: "#22c55e" },
    { name: "Medium", value: 35, color: "#f59e0b" },
    { name: "Hard", value: 20, color: "#ef4444" },
  ];

  const totalTasks = tasksPerCategory.reduce((sum, cat) => sum + cat.completed, 0);
  const completionRate = tasksPerCategory.reduce((sum, cat) => sum + cat.total, 0);
  const avgPointsPerTask = totalTasks > 0 ? Math.round(userStats.points / totalTasks) : 0;

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Target className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Completion Rate</p>
                <p className="text-2xl font-bold">
                  {completionRate > 0 ? Math.round((totalTasks / completionRate) * 100) : 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Award className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-sm text-muted-foreground">Avg Points/Task</p>
                <p className="text-2xl font-bold">{avgPointsPerTask}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">This Week</p>
                <p className="text-2xl font-bold">
                  {weeklyActivity.reduce((sum, day) => sum + day.tasks, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Best Streak</p>
                <p className="text-2xl font-bold">{userStats.longestStreak} days</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Points Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={pointsOverTime}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="points"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Weekly Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyActivity}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="tasks" fill="#22c55e" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tasks by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tasksPerCategory.map((category) => {
                const percentage = (category.completed / category.total) * 100;
                return (
                  <div key={category.category} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{category.category}</span>
                      <Badge variant="outline">
                        {category.completed}/{category.total}
                      </Badge>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Task Difficulty</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={difficultyBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {difficultyBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
