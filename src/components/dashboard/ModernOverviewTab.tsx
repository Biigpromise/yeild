import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  Target, 
  Award, 
  Zap, 
  Users, 
  Clock,
  ArrowUpRight,
  Trophy
} from 'lucide-react';
import { YieldLogo } from '@/components/ui/YieldLogo';
import { StatsDashboard } from '@/components/StatsDashboard';

interface ModernOverviewTabProps {
  userStats?: {
    points: number;
    level: string;
    tasksCompleted: number;
  };
}

export const ModernOverviewTab: React.FC<ModernOverviewTabProps> = ({ userStats }) => {
  const level = parseInt(userStats?.level || '1');
  const pointsToNextLevel = (level * 1000) - (userStats?.points || 0);
  const progressToNextLevel = Math.min(100, ((userStats?.points || 0) % 1000) / 10);

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-background border border-primary/20 p-8">
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
              <YieldLogo size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Welcome back!</h1>
              <p className="text-muted-foreground">Here's your progress summary</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Points Card */}
            <div className="p-6 rounded-xl bg-background/60 backdrop-blur border border-border/60">
              <div className="flex items-center gap-3 mb-2">
                <Target className="h-5 w-5 text-blue-500" />
                <span className="text-sm font-medium text-muted-foreground">Total Points</span>
              </div>
              <div className="text-2xl font-bold text-foreground">{userStats?.points?.toLocaleString() || 0}</div>
              <div className="text-xs text-muted-foreground">Keep up the great work!</div>
            </div>

            {/* Level Card */}
            <div className="p-6 rounded-xl bg-background/60 backdrop-blur border border-border/60">
              <div className="flex items-center gap-3 mb-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                <span className="text-sm font-medium text-muted-foreground">Current Level</span>
              </div>
              <div className="text-2xl font-bold text-foreground">{level}</div>
              <div className="text-xs text-muted-foreground">{pointsToNextLevel > 0 ? `${pointsToNextLevel} pts to next level` : 'Max level!'}</div>
            </div>

            {/* Tasks Card */}
            <div className="p-6 rounded-xl bg-background/60 backdrop-blur border border-border/60">
              <div className="flex items-center gap-3 mb-2">
                <Award className="h-5 w-5 text-green-500" />
                <span className="text-sm font-medium text-muted-foreground">Tasks Completed</span>
              </div>
              <div className="text-2xl font-bold text-foreground">{userStats?.tasksCompleted || 0}</div>
              <div className="text-xs text-muted-foreground">Great job!</div>
            </div>
          </div>
        </div>

        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl"></div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="group hover:shadow-lg transition-all duration-200 cursor-pointer border-border/60">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors">
                <Target className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <div className="font-semibold">Browse Tasks</div>
                <div className="text-sm text-muted-foreground">Find new opportunities</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-lg transition-all duration-200 cursor-pointer border-border/60">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10 group-hover:bg-green-500/20 transition-colors">
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <div className="font-semibold">View Analytics</div>
                <div className="text-sm text-muted-foreground">Track your progress</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-lg transition-all duration-200 cursor-pointer border-border/60">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10 group-hover:bg-purple-500/20 transition-colors">
                <Users className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <div className="font-semibold">Invite Friends</div>
                <div className="text-sm text-muted-foreground">Earn referral bonuses</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-lg transition-all duration-200 cursor-pointer border-border/60">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-500/10 group-hover:bg-orange-500/20 transition-colors">
                <Zap className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <div className="font-semibold">Quick Withdraw</div>
                <div className="text-sm text-muted-foreground">Cash out your points</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Section */}
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Level Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Level {level}</span>
              <span className="text-sm text-muted-foreground">Level {level + 1}</span>
            </div>
            <Progress value={progressToNextLevel} className="h-2" />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{userStats?.points || 0} points</span>
              <span>{pointsToNextLevel > 0 ? `${pointsToNextLevel} points to go` : 'Max level reached!'}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Recent Activity
            </div>
            <Button variant="ghost" size="sm">
              View All
              <ArrowUpRight className="h-4 w-4 ml-1" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-center py-8 text-muted-foreground">
              <p>No recent activity to display</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Stats */}
      <StatsDashboard userStats={userStats} />
    </div>
  );
};