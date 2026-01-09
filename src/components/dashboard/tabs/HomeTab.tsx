import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { OperatorRankDisplay } from '@/components/operator/OperatorRankDisplay';
import { DashboardProgress } from '@/components/dashboard/DashboardProgress';
import { GettingStartedChecklist } from '@/components/engagement/GettingStartedChecklist';
import { DailyLoginBonus } from '@/components/engagement/DailyLoginBonus';
import { DailySpinWheel } from '@/components/engagement/DailySpinWheel';
import { PayoutProof } from '@/components/engagement/PayoutProof';
import { 
  Trophy, 
  Zap, 
  Target, 
  Users, 
  ArrowUpRight, 
  TrendingUp,
  Clock,
  Star,
  Store
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface HomeTabProps {
  userStats?: {
    points: number;
    level: number;
    tasksCompleted: number;
    currentStreak: number;
    referrals: number;
  };
  userProfile?: any;
  onExploreMarket?: () => void;
}

export const HomeTab: React.FC<HomeTabProps> = ({ userStats, userProfile, onExploreMarket }) => {
  const navigate = useNavigate();
  
  const currentLevel = userStats?.level || 1;
  const currentPoints = userStats?.points || 0;
  const pointsToNextLevel = (currentLevel * 1000) - currentPoints;
  const progressToNextLevel = Math.min(100, (currentPoints % 1000) / 10);

  const quickActions = [
    {
      title: 'Find Execution Orders',
      description: 'Browse available opportunities',
      icon: Zap,
      color: 'bg-primary/10 text-primary border-primary/20',
      onClick: () => navigate('/execution-orders'),
      comingSoon: false
    },
    {
      title: 'Operator Rank',
      description: 'Check your rank progress',
      icon: Target,
      color: 'bg-green-500/10 text-green-600 border-green-500/20',
      onClick: () => navigate('/operator-ranks'),
      comingSoon: false
    },
    {
      title: 'Discovery',
      description: 'Explore marketplace listings',
      icon: Store,
      color: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
      onClick: onExploreMarket,
      comingSoon: false
    }
  ];

  const stats = [
    {
      title: 'Total Credits',
      value: userStats?.points || 0,
      icon: Star,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-500/10'
    },
    {
      title: 'Orders Completed',
      value: userStats?.tasksCompleted || 0,
      icon: Trophy,
      color: 'text-green-600',
      bgColor: 'bg-green-500/10'
    },
    {
      title: 'Current Streak',
      value: userStats?.currentStreak || 0,
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-500/10'
    },
    {
      title: 'Network',
      value: userStats?.referrals || 0,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-500/10'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="text-center lg:text-left">
          <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Welcome back, {userProfile?.name || 'User'}!
          </h1>
          <p className="text-muted-foreground mt-2">
            You're at level {currentLevel}. Complete execution orders to advance!
          </p>
        </div>
      </motion.div>

      {/* Daily Login Bonus */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <DailyLoginBonus />
      </motion.div>

      {/* Getting Started Checklist */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18 }}
      >
        <GettingStartedChecklist />
      </motion.div>

      {/* Bird Progress & Level */}
      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <OperatorRankDisplay />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <DashboardProgress 
            userStats={{
              tasksCompleted: userStats?.tasksCompleted || 0,
              level: userStats?.level || 1
            }}
          />
        </motion.div>
      </div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title} className="relative overflow-hidden">
                <CardContent className="p-4">
                  <div className={`w-8 h-8 rounded-lg ${stat.bgColor} flex items-center justify-center mb-3`}>
                    <Icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-2xl font-bold">{stat.value.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">{stat.title}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Button
                    key={action.title}
                    variant="outline"
                    onClick={action.onClick}
                    className={`h-auto p-4 justify-start ${action.color} hover:shadow-md transition-all duration-200`}
                  >
                    <Icon className="h-5 w-5 mr-3" />
                    <div className="flex-1 text-left">
                      <div className="font-medium flex items-center gap-2">
                        {action.title}
                        {action.comingSoon && (
                          <Badge variant="secondary" className="text-xs">Soon</Badge>
                        )}
                      </div>
                      <div className="text-xs opacity-70">{action.description}</div>
                    </div>
                    <ArrowUpRight className="h-4 w-4 opacity-50" />
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {onExploreMarket && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
        >
          <Card className="border-dashed border-primary/40 bg-primary/5">
            <CardContent className="p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Store className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Explore the Market</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Discover brand offers, listings, and campaigns tailored for YEILD users.
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={onExploreMarket}
                className="whitespace-nowrap"
              >
                Go to Market
                <ArrowUpRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Daily Spin Wheel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <DailySpinWheel />
      </motion.div>

      {/* Payout Proof - Social Proof */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55 }}
      >
        <PayoutProof />
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {/* Placeholder for recent activity */}
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Your recent activity will appear here</p>
                <p className="text-sm">Complete tasks to see your progress!</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};