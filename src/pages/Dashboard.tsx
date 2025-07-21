
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { EmailConfirmationRequired } from "@/components/auth/EmailConfirmationRequired";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TasksTab } from "@/components/dashboard/TasksTab";
import { WalletTab } from "@/components/dashboard/WalletTab";
import { ReferralsTab } from "@/components/dashboard/ReferralsTab";
import { MessagingTab } from "@/components/dashboard/MessagingTab";
import { QuickActionsPanel } from "@/components/dashboard/QuickActionsPanel";
import { useDashboard } from "@/hooks/useDashboard";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CompactBirdBatch } from "@/components/ui/CompactBirdBatch";
import { Target, Wallet, Users, MessageSquare, TrendingUp } from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [emailConfirmed, setEmailConfirmed] = useState<boolean | null>(null);
  const [checkingEmailStatus, setCheckingEmailStatus] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const isMobile = useIsMobile();
  
  const {
    userStats,
    userTasks,
    loadUserData
  } = useDashboard();

  useEffect(() => {
    const checkEmailConfirmation = async () => {
      if (!user) {
        setCheckingEmailStatus(false);
        return;
      }

      const { data: authUser, error } = await supabase.auth.getUser();
      
      if (error) {
        console.error('Error checking user:', error);
        setEmailConfirmed(false);
      } else if (authUser.user?.email_confirmed_at) {
        setEmailConfirmed(true);
      } else {
        setEmailConfirmed(false);
      }
      
      setCheckingEmailStatus(false);
    };

    if (!loading) {
      checkEmailConfirmation();
    }
  }, [user, loading]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'find-tasks':
        navigate('/tasks');
        break;
      case 'check-rewards':
        setActiveTab('wallet');
        break;
      case 'invite-friends':
        setActiveTab('referrals');
        break;
      case 'create-post':
        setActiveTab('community');
        break;
      default:
        break;
    }
  };

  if (loading || checkingEmailStatus) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    navigate("/auth");
    return null;
  }

  if (emailConfirmed === false) {
    return <EmailConfirmationRequired email={user.email || ''} userType="user" />;
  }

  // Overview tab content
  const OverviewTab = () => (
    <div className="space-y-6">
      {/* Welcome Section */}
      <Card className="border-0 shadow-sm bg-gradient-to-r from-primary/5 to-blue-500/5">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Welcome back!</h2>
              <p className="text-muted-foreground">
                You've completed {userStats.tasksCompleted} tasks and earned {userStats.points} points.
              </p>
            </div>
            <CompactBirdBatch count={userStats.tasksCompleted} />
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <Target className="h-8 w-8 mx-auto mb-2 text-blue-500" />
            <p className="text-2xl font-bold">{userStats.tasksCompleted}</p>
            <p className="text-sm text-muted-foreground">Tasks Done</p>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <p className="text-2xl font-bold">{userStats.points}</p>
            <p className="text-sm text-muted-foreground">Points</p>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <Users className="h-8 w-8 mx-auto mb-2 text-purple-500" />
            <p className="text-2xl font-bold">{userStats.referrals}</p>
            <p className="text-sm text-muted-foreground">Referrals</p>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <Wallet className="h-8 w-8 mx-auto mb-2 text-orange-500" />
            <p className="text-2xl font-bold">Level {userStats.level}</p>
            <p className="text-sm text-muted-foreground">Current Level</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {userTasks.length > 0 ? (
            <div className="space-y-3">
              {userTasks.slice(0, 5).map((task, index) => (
                <div key={task.id || index} className="flex justify-between items-center py-2 border-b border-border/50 last:border-0">
                  <div>
                    <p className="font-medium text-sm">{task.tasks?.title || 'Task completed'}</p>
                    <p className="text-xs text-muted-foreground">
                      {task.completed_at ? new Date(task.completed_at).toLocaleDateString() : 'Recently'}
                    </p>
                  </div>
                  <span className="text-sm font-medium text-green-600">
                    +{task.points_earned || task.tasks?.points || 0} pts
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-4">
              No recent activity. Start completing tasks to see your progress here!
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );

  if (isMobile) {
    return (
      <div className="min-h-screen bg-background">
        <div className="p-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5 mb-4">
              <TabsTrigger value="overview" className="text-xs">Home</TabsTrigger>
              <TabsTrigger value="tasks" className="text-xs">Tasks</TabsTrigger>
              <TabsTrigger value="wallet" className="text-xs">Wallet</TabsTrigger>
              <TabsTrigger value="referrals" className="text-xs">Refer</TabsTrigger>
              <TabsTrigger value="community" className="text-xs">Chat</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview">
              <OverviewTab />
            </TabsContent>
            
            <TabsContent value="tasks">
              <TasksTab userStats={userStats} userTasks={userTasks} loadUserData={loadUserData} />
            </TabsContent>
            
            <TabsContent value="wallet">
              <WalletTab />
            </TabsContent>
            
            <TabsContent value="referrals">
              <ReferralsTab />
            </TabsContent>
            
            <TabsContent value="community">
              <MessagingTab />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 max-w-md mx-auto mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="wallet">Wallet</TabsTrigger>
            <TabsTrigger value="referrals">Referrals</TabsTrigger>
            <TabsTrigger value="community">Community</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <OverviewTab />
          </TabsContent>
          
          <TabsContent value="tasks">
            <TasksTab userStats={userStats} userTasks={userTasks} loadUserData={loadUserData} />
          </TabsContent>
          
          <TabsContent value="wallet">
            <WalletTab />
          </TabsContent>
          
          <TabsContent value="referrals">
            <ReferralsTab />
          </TabsContent>
          
          <TabsContent value="community">
            <MessagingTab />
          </TabsContent>
        </Tabs>
        
        <QuickActionsPanel onTabChange={handleTabChange} onAction={handleQuickAction} />
      </div>
    </div>
  );
};

export default Dashboard;
