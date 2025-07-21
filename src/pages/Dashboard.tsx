import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { EmailConfirmationRequired } from "@/components/auth/EmailConfirmationRequired";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CompactBirdBatch } from "@/components/ui/CompactBirdBatch";
import { Target, Gift, Wallet, ArrowRight } from 'lucide-react';
import { useIsMobile } from "@/hooks/use-mobile";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [emailConfirmed, setEmailConfirmed] = useState<boolean | null>(null);
  const [checkingEmailStatus, setCheckingEmailStatus] = useState(true);
  const [userStats, setUserStats] = useState<{ tasksCompleted: number }>({ tasksCompleted: 0 });
  const [userTasks, setUserTasks] = useState<any[]>([]);
  const isMobile = useIsMobile();

  useEffect(() => {
    const fetchUserStats = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('tasks_completed')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching user stats:', error);
          toast.error('Failed to load user stats');
        } else {
          setUserStats({ tasksCompleted: data?.tasks_completed || 0 });
        }
      } catch (error) {
        console.error('Unexpected error:', error);
        toast.error('An unexpected error occurred');
      }
    };

    fetchUserStats();
  }, [user]);

  useEffect(() => {
    const fetchUserTasks = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('task_submissions')
          .select('tasks(title), points_earned, completed_at')
          .eq('user_id', user.id)
          .order('completed_at', { ascending: false })
          .limit(5);

        if (error) {
          console.error('Error fetching user tasks:', error);
          toast.error('Failed to load user tasks');
        } else {
          setUserTasks(data || []);
        }
      } catch (error) {
        console.error('Unexpected error:', error);
        toast.error('An unexpected error occurred');
      }
    };

    fetchUserTasks();
  }, [user]);

  // Check email confirmation status
  useEffect(() => {
    const checkEmailConfirmation = async () => {
      if (!user) {
        setCheckingEmailStatus(false);
        return;
      }

      // Check if email is confirmed in auth.users
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

  // Show loading while checking email status
  if (loading || checkingEmailStatus) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    navigate("/auth");
    return null;
  }

  // Show email confirmation required if email not confirmed
  if (emailConfirmed === false) {
    return <EmailConfirmationRequired email={user.email || ''} userType="user" />;
  }

  // Mobile layout
  if (isMobile) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="space-y-4">
          {/* Mobile quick start */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="text-center">
                <Target className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                <h4 className="font-medium mb-2">Ready to earn?</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Browse and complete tasks to earn points!
                </p>
                <Button onClick={() => navigate('/tasks')} className="w-full">
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Browse Tasks
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Mobile progress card */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Your Progress</CardTitle>
                <CompactBirdBatch count={userStats.tasksCompleted} />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {userStats.tasksCompleted === 0 ? (
                <p className="text-sm text-muted-foreground text-center">
                  Complete your first task to start earning!
                </p>
              ) : (
                <div className="space-y-2">
                  {userTasks.slice(0, 2).map((task) => (
                    <div key={task.id} className="text-sm">
                      <div className="flex justify-between items-center">
                        <span className="truncate text-xs">{task.tasks?.title || 'Task completed'}</span>
                        <span className="text-muted-foreground text-xs">+{task.points_earned || 0} pts</span>
                      </div>
                    </div>
                  ))}
                  {userTasks.length === 0 && (
                    <p className="text-xs text-muted-foreground">No recent activity</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Desktop layout
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {/* Main CTA */}
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6 text-center">
                <Target className="h-12 w-12 mx-auto mb-4 text-blue-500" />
                <h3 className="text-xl font-bold mb-2">Start Earning Today</h3>
                <p className="text-muted-foreground mb-4">
                  Browse available tasks and start earning points for completing them.
                </p>
                <Button onClick={() => navigate('/tasks')} size="lg" className="px-8">
                  <ArrowRight className="h-5 w-5 mr-2" />
                  Browse All Tasks
                </Button>
              </CardContent>
            </Card>
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
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Gift className="h-4 w-4 mr-2" />
                  View Rewards
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Wallet className="h-4 w-4 mr-2" />
                  Wallet
                </Button>
              </CardContent>
            </Card>

            {/* Progress Card */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Your Progress</CardTitle>
                  <CompactBirdBatch count={userStats.tasksCompleted} />
                </div>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                {userStats.tasksCompleted === 0 ? (
                  <div className="text-center p-4">
                    <p className="text-sm text-muted-foreground mb-3">
                      Complete your first task to start earning points!
                    </p>
                    <Button size="sm" onClick={() => navigate('/tasks')} variant="outline">
                      Get Started
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {userTasks.slice(0, 3).map((task) => (
                      <div key={task.id} className="text-sm">
                        <div className="flex justify-between items-center">
                          <span className="truncate">{task.tasks?.title || 'Task completed'}</span>
                          <span className="text-muted-foreground">+{task.points_earned || 0} pts</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {task.completed_at ? new Date(task.completed_at).toLocaleDateString() : 'Recently'}
                        </div>
                      </div>
                    ))}
                    {userTasks.length === 0 && (
                      <p className="text-sm text-muted-foreground">No recent activity</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
