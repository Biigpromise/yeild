
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Target, Gift, Wallet, ArrowRight, Plus, CheckCircle, Trophy, Clock, AlertCircle } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useDashboard } from '@/hooks/useDashboard';

interface TasksTabProps {
  userStats?: { tasksCompleted: number; points: number };
  userTasks?: any[];
  userSubmissions?: any[];
  loadUserData?: () => void;
}

export const TasksTab: React.FC<TasksTabProps> = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { userStats, userTasks, userSubmissions, loading } = useDashboard();

  const completedTasksCount = userTasks?.filter(task => task.status === 'completed').length || 0;
  const pendingSubmissionsCount = userSubmissions?.filter(sub => sub.status === 'pending').length || 0;
  const approvedSubmissionsCount = userSubmissions?.filter(sub => sub.status === 'approved').length || 0;
  const rejectedSubmissionsCount = userSubmissions?.filter(sub => sub.status === 'rejected').length || 0;

  const recentSubmissions = userSubmissions?.slice(0, 5) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <AlertCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-32 bg-gray-200 rounded-lg mb-4"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-16 bg-gray-200 rounded-lg"></div>
            <div className="h-16 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (isMobile) {
    return (
      <div className="space-y-4">
        {/* Mobile Overview Card */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="text-center mb-4">
              <Target className="h-10 w-10 mx-auto mb-2 text-blue-500" />
              <h3 className="text-lg font-bold mb-1">Your Tasks</h3>
              <p className="text-sm text-muted-foreground">
                Complete tasks to earn points and level up!
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="text-center p-2 bg-green-50 rounded-lg">
                <div className="text-lg font-bold text-green-600">{approvedSubmissionsCount}</div>
                <div className="text-xs text-green-500">Approved</div>
              </div>
              <div className="text-center p-2 bg-yellow-50 rounded-lg">
                <div className="text-lg font-bold text-yellow-600">{pendingSubmissionsCount}</div>
                <div className="text-xs text-yellow-500">Pending</div>
              </div>
              <div className="text-center p-2 bg-red-50 rounded-lg">
                <div className="text-lg font-bold text-red-600">{rejectedSubmissionsCount}</div>
                <div className="text-xs text-red-500">Rejected</div>
              </div>
              <div className="text-center p-2 bg-blue-50 rounded-lg">
                <div className="text-lg font-bold text-blue-600">{userStats?.points || 0}</div>
                <div className="text-xs text-blue-500">Points</div>
              </div>
            </div>
            
            <Button onClick={() => navigate('/tasks')} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Find New Tasks
            </Button>
          </CardContent>
        </Card>

        {/* Recent Submissions */}
        {recentSubmissions.length > 0 && (
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Recent Submissions</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                {recentSubmissions.map((submission, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(submission.status)}
                      <span className="text-sm truncate">{submission.tasks?.title || 'Task'}</span>
                    </div>
                    <Badge className={getStatusColor(submission.status)}>
                      {submission.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        {/* Main Task Overview */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="text-center mb-6">
              <Target className="h-16 w-16 mx-auto mb-4 text-blue-500" />
              <h3 className="text-2xl font-bold mb-2">Complete Tasks & Earn Points</h3>
              <p className="text-muted-foreground mb-4">
                Browse available tasks, complete them, and earn points to level up your account.
              </p>
              <Button onClick={() => navigate('/tasks')} size="lg" className="px-8">
                <ArrowRight className="h-5 w-5 mr-2" />
                Browse All Tasks
              </Button>
            </div>

            {/* Task Statistics */}
            <div className="grid grid-cols-4 gap-4 mt-6">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{approvedSubmissionsCount}</div>
                <div className="text-sm text-green-500">Approved</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{pendingSubmissionsCount}</div>
                <div className="text-sm text-yellow-500">Pending Review</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{rejectedSubmissionsCount}</div>
                <div className="text-sm text-red-500">Rejected</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{userStats?.points || 0}</div>
                <div className="text-sm text-blue-500">Total Points</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Submissions */}
        {recentSubmissions.length > 0 && (
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Recent Submissions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentSubmissions.map((submission, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(submission.status)}
                      <div>
                        <div className="font-medium">{submission.tasks?.title || 'Task'}</div>
                        <div className="text-sm text-muted-foreground">
                          Submitted {new Date(submission.submitted_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(submission.status)}>
                        {submission.status}
                      </Badge>
                      {submission.status === 'approved' && (
                        <Badge variant="outline">
                          +{submission.tasks?.points || 0} pts
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      
      <div className="space-y-4">
        {/* Quick Actions */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 pt-0">
            <Button size="sm" className="w-full justify-start" onClick={() => navigate('/tasks')}>
              <Target className="h-4 w-4 mr-2" />
              Browse Tasks
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => navigate('/dashboard?tab=wallet')}>
              <Wallet className="h-4 w-4 mr-2" />
              View Wallet
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => navigate('/dashboard?tab=referral')}>
              <Gift className="h-4 w-4 mr-2" />
              Referral Program
            </Button>
          </CardContent>
        </Card>

        {/* Achievement Card */}
        <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-purple-50">
          <CardContent className="p-4 text-center">
            <Trophy className="h-8 w-8 mx-auto mb-2 text-blue-500" />
            <h4 className="font-semibold mb-1">Keep Going!</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Complete {Math.max(0, 10 - approvedSubmissionsCount)} more tasks to unlock new features
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, (approvedSubmissionsCount / 10) * 100)}%` }}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
