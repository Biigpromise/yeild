
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
    if (!pointTransactions.length) {
      // Return empty data for new users
      return [];
    }
    
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
                <div className="text-center">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p>No point history available yet</p>
                  <p className="text-sm">Complete tasks to see your progress over time</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {userStats.tasksCompleted > 0 ? (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <Award className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p>Activity tracking coming soon</p>
                  <p className="text-sm">Your daily activity will be displayed here</p>
                </div>
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p>No activity yet</p>
                  <p className="text-sm">Complete your first task to get started!</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Point Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {pointTransactions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p>No transactions yet</p>
                  <p className="text-sm">Your point history will appear here</p>
                </div>
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
            <CardTitle>Getting Started</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center p-6">
                <Target className="h-16 w-16 mx-auto mb-4 text-blue-500" />
                <h3 className="font-semibold mb-2">Ready to earn points?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Browse available tasks and start earning points today!
                </p>
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                    Complete simple tasks
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    Earn points instantly
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                    Redeem for rewards
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
