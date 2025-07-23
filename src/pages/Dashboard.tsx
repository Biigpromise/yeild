
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { TasksTab } from '@/components/dashboard/TasksTab';
import { WalletTab } from '@/components/dashboard/WalletTab';
import { ReferralTab } from '@/components/dashboard/ReferralTab';
import { SocialTab } from '@/components/dashboard/SocialTab';
import { Target, Wallet, Users, MessageCircle } from 'lucide-react';

interface UserStats {
  points: number;
  level: number;
  tasksCompleted: number;
  activeReferrals: number;
  totalReferrals: number;
  currentStreak: number;
  rank: number;
  referrals: number;
  followers: number;
  following: number;
}

interface Task {
  id: string;
  title: string;
  description: string;
  points: number;
  status: string;
  created_at: string;
  [key: string]: any;
}

interface TaskSubmission {
  id: string;
  task_id: string;
  user_id: string;
  status: string;
  submitted_at: string;
  tasks?: Task;
  [key: string]: any;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [userStats, setUserStats] = useState<UserStats>({
    points: 0,
    level: 1,
    tasksCompleted: 0,
    activeReferrals: 0,
    totalReferrals: 0,
    currentStreak: 0,
    rank: 0,
    referrals: 0,
    followers: 0,
    following: 0
  });
  const [userTasks, setUserTasks] = useState<Task[]>([]);
  const [userSubmissions, setUserSubmissions] = useState<TaskSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  // Get active tab from URL params, default to 'tasks'
  const activeTab = searchParams.get('tab') || 'tasks';

  const handleTabChange = (tab: string) => {
    setSearchParams({ tab });
  };

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Load user profile data
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profile) {
        const newStats: UserStats = {
          points: profile.points || 0,
          level: profile.level || 1,
          tasksCompleted: profile.tasks_completed || 0,
          activeReferrals: profile.active_referrals_count || 0,
          totalReferrals: profile.total_referrals_count || 0,
          currentStreak: 0,
          rank: 0,
          referrals: profile.active_referrals_count || 0,
          followers: profile.followers_count || 0,
          following: profile.following_count || 0
        };
        setUserStats(newStats);
      }

      // Load user tasks
      const { data: tasks } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id);

      if (tasks) {
        setUserTasks(tasks);
      }

      // Load user submissions
      const { data: submissions } = await supabase
        .from('task_submissions')
        .select(`
          *,
          tasks (
            title,
            points,
            description
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (submissions) {
        setUserSubmissions(submissions);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-semibold mb-2">Please sign in</h2>
            <p className="text-muted-foreground">
              You need to be signed in to access your dashboard.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's your activity overview.
          </p>
        </div>

        <DashboardStats 
          userStats={userStats} 
          totalPointsEarned={userStats.points}
          withdrawalStats={{
            pendingWithdrawals: 0,
            completedWithdrawals: 0
          }}
        />

        <Tabs value={activeTab} onValueChange={handleTabChange} className="mt-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="tasks" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              <span className="hidden sm:inline">Tasks</span>
            </TabsTrigger>
            <TabsTrigger value="wallet" className="flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              <span className="hidden sm:inline">Wallet</span>
            </TabsTrigger>
            <TabsTrigger value="referral" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Referral</span>
            </TabsTrigger>
            <TabsTrigger value="social" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Social</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tasks" className="mt-6">
            <TasksTab
              userStats={userStats}
              userTasks={userTasks}
              userSubmissions={userSubmissions}
              loadUserData={loadUserData}
            />
          </TabsContent>

          <TabsContent value="wallet" className="mt-6">
            <WalletTab />
          </TabsContent>

          <TabsContent value="referral" className="mt-6">
            <ReferralTab />
          </TabsContent>

          <TabsContent value="social" className="mt-6">
            <SocialTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
