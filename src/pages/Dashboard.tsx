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
        // First try to get from user_tasks table
        const { data: userTasksData, error: userTasksError } = await supabase
          .from('user_tasks')
          .select(`
            id,
            points_earned,
            completed_at,
            tasks(title, points, category, brand_name)
          `)
          .eq('user_id', user.id)
          .eq('status', 'completed')
          .order('completed_at', { ascending: false })
          .limit(5);

        if (userTasksError) {
          console.error('Error fetching user tasks:', userTasksError);
          
          // Fallback to task_submissions table
          const { data: submissionsData, error: submissionsError } = await supabase
            .from('task_submissions')
            .select(`
              id,
              task_id,
              submitted_at,
              tasks(title, points, category, brand_name)
            `)
            .eq('user_id', user.id)
            .eq('status', 'approved')
            .order('submitted_at', { ascending: false })
            .limit(5);

          if (submissionsError) {
            console.error('Error fetching task submissions:', submissionsError);
            setUserTasks([]);
          } else {
            // Transform the data to match expected format
            const transformedData = submissionsData?.map(task => ({
              id: task.id,
              tasks: task.tasks,
              points_earned: task.tasks?.points || 0,
              completed_at: task.submitted_at
            })) || [];
            setUserTasks(transformedData);
          }
        } else {
          setUserTasks(userTasksData || []);
        }
      } catch (error) {
        console.error('Unexpected error:', error);
        setUserTasks([]);
      }
    };

    fetchUserTasks();
  }, [user]);

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

  if (isMobile) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="space-y-4">
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
                  {userTasks.slice(0, 2).map((task, index) => (
                    <div key={task.id || index} className="text-sm">
                      <div className="flex justify-between items-center">
                        <span className="truncate text-xs">{task.tasks?.title || 'Task completed'}</span>
                        <span className="text-muted-foreground text-xs">+{task.points_earned || task.tasks?.points || 0} pts</span>
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

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
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
                    {userTasks.slice(0, 3).map((task, index) => (
                      <div key={task.id || index} className="text-sm">
                        <div className="flex justify-between items-center">
                          <span className="truncate">{task.tasks?.title || 'Task completed'}</span>
                          <span className="text-muted-foreground">+{task.points_earned || task.tasks?.points || 0} pts</span>
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
