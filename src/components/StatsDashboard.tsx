
import React, { useEffect, useState } from "react";
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
import { userService, UserStats } from "@/services/userService";

interface StatsDashboardProps {
  userStats?: UserStats;
}

export const StatsDashboard = ({ userStats: propUserStats }: StatsDashboardProps) => {
  const [userStats, setUserStats] = useState<UserStats | null>(propUserStats || null);
  const [pointTransactions, setPointTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const [stats, transactions] = await Promise.all([
        userService.getUserStats(),
        userService.getPointTransactions()
      ]);
      
      setUserStats(stats);
      setPointTransactions(transactions);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Generate chart data from real transactions
  const pointsOverTime = React.useMemo(() => {
    if (!pointTransactions.length) return [];
    
    const last6Months = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('en', { month: 'short' });
      
      const monthTransactions = pointTransactions.filter(t => {
        const transactionDate = new Date(t.created_at);
        return transactionDate.getMonth() === date.getMonth() && 
               transactionDate.getFullYear() === date.getFullYear();
      });
      
      const totalPoints = monthTransactions.reduce((sum, t) => sum + (t.points > 0 ? t.points : 0), 0);
      last6Months.push({ date: monthName, points: totalPoints });
    }
    
    return last6Months;
  }, [pointTransactions]);

  // Mock data for categories and weekly activity (you can implement real data later)
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-8 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!userStats) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">No statistics available yet.</p>
          <p className="text-sm text-muted-foreground mt-1">Complete some tasks to see your stats!</p>
        </CardContent>
      </Card>
    );
  }

  const totalTasks = tasksPerCategory.reduce((sum, cat) => sum + cat.completed, 0);
  const completionRate = tasksPerCategory.reduce((sum, cat) => sum + cat.total, 0);
  const avgPointsPerTask = userStats.tasksCompleted > 0 ? Math.round(userStats.points / userStats.tasksCompleted) : 0;

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Target className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Points</p>
                <p className="text-2xl font-bold">{userStats.points.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Award className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-sm text-muted-foreground">Current Level</p>
                <p className="text-2xl font-bold">{userStats.level}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Tasks Completed</p>
                <p className="text-2xl font-bold">{userStats.tasksCompleted}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Avg Points/Task</p>
                <p className="text-2xl font-bold">{avgPointsPerTask}</p>
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
            {pointsOverTime.length > 0 ? (
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
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No point history available yet
              </div>
            )}
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
            <CardTitle>Point Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {pointTransactions.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No transactions yet</p>
              ) : (
                pointTransactions.slice(0, 10).map((transaction, index) => (
                  <div key={transaction.id || index} className="flex justify-between items-center p-2 border rounded">
                    <div>
                      <span className="text-sm font-medium">{transaction.description}</span>
                      <div className="text-xs text-muted-foreground">
                        {new Date(transaction.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <Badge variant={transaction.points > 0 ? "default" : "secondary"}>
                      {transaction.points > 0 ? '+' : ''}{transaction.points} pts
                    </Badge>
                  </div>
                ))
              )}
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
