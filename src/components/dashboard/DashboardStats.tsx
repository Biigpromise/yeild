
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Trophy, 
  Target, 
  Zap, 
  Users, 
  TrendingUp, 
  Star,
  Award,
  Flame,
  Wallet
} from 'lucide-react';

interface DashboardStatsProps {
  userStats: {
    points: number;
    level: number;
    tasksCompleted: number;
    currentStreak: number;
    rank: number;
    referrals: number;
    followers: number;
    following: number;
  };
  totalPointsEarned?: number;
  withdrawalStats?: {
    pendingWithdrawals: number;
    completedWithdrawals: number;
  };
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ 
  userStats, 
  totalPointsEarned,
  withdrawalStats
}) => {
  const statCards = [
    {
      title: 'Total Points',
      value: userStats.points?.toLocaleString() || '0',
      icon: Zap,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      badge: userStats.points > 1000 ? 'High Earner' : 'Getting Started'
    },
    {
      title: 'Level',
      value: userStats.level || 1,
      icon: Trophy,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      badge: `Level ${userStats.level || 1}`
    },
    {
      title: 'Tasks Completed',
      value: userStats.tasksCompleted || 0,
      icon: Target,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      badge: userStats.tasksCompleted > 10 ? 'Active' : 'Beginner'
    },
    {
      title: 'Current Streak',
      value: userStats.currentStreak || 0,
      icon: Flame,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      badge: userStats.currentStreak > 7 ? 'On Fire!' : 'Building'
    },
    {
      title: 'Referrals',
      value: userStats.referrals || 0,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      badge: userStats.referrals > 5 ? 'Networker' : 'Growing'
    },
    {
      title: 'Rank',
      value: userStats.rank || 'Unranked',
      icon: Award,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      badge: userStats.rank ? `#${userStats.rank}` : 'Unranked'
    }
  ];

  // Add withdrawal stats if available
  if (withdrawalStats) {
    statCards.push({
      title: 'Pending Withdrawals',
      value: `$${withdrawalStats.pendingWithdrawals.toLocaleString()}`,
      icon: Wallet,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      badge: withdrawalStats.pendingWithdrawals > 0 ? 'Pending' : 'None'
    });
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-full ${stat.bgColor}`}>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground mb-1">
                {stat.value}
              </div>
              <Badge variant="secondary" className="text-xs">
                {stat.badge}
              </Badge>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
