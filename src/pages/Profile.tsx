
import React, { useState, useEffect } from "react";
import { UserProfile } from "@/components/UserProfile";
import { AchievementSystem } from "@/components/AchievementSystem";
import { StatsDashboard } from "@/components/StatsDashboard";
import { StreakTracker } from "@/components/StreakTracker";
import TaskHistory from "@/components/TaskHistory";
import { RedemptionHistory } from "@/components/rewards/RedemptionHistory";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { taskService } from "@/services/taskService";
import { userService } from "@/services/userService";
import { toast } from "sonner";
import { 
  User, 
  Trophy, 
  BarChart3, 
  Flame,
  History,
  Gift,
  Settings,
  ArrowLeft,
  Target,
  Award,
  TrendingUp
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [completedTasks, setCompletedTasks] = useState<any[]>([]);
  
  // Enhanced user data with real stats
  const [userData, setUserData] = useState({
    id: "user-123",
    name: "John Doe",
    email: "john.doe@example.com",
    bio: "Passionate about completing tasks and earning rewards. Love trying new products and sharing feedback!",
    avatar: "",
    level: 12,
    points: 2450,
    tasksCompleted: 38,
    currentStreak: 5,
    longestStreak: 12,
    joinDate: "2024-01-15",
    totalPointsEarned: 3200,
    averageTaskRating: 4.8,
    favoriteCategory: "Social Media",
    completionRate: 92
  });

  useEffect(() => {
    loadUserData();
  }, [user]);

  const loadUserData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Fetch user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (profileError) {
        console.error('Error fetching profile:', profileError);
        return;
      }
      
      setUserProfile(profile);
      
      // Update userData with real profile data
      setUserData(prev => ({
        ...prev,
        id: user.id,
        name: profile.name || user.email || "User",
        email: user.email || "",
        bio: profile.bio || prev.bio,
        avatar: profile.profile_picture_url || "",
        level: profile.level || 1,
        points: profile.points || 0,
        tasksCompleted: profile.tasks_completed || 0,
        joinDate: profile.created_at ? new Date(profile.created_at).toISOString().split('T')[0] : prev.joinDate
      }));

      // Fetch user tasks
      const tasksData = await taskService.getUserTasks();
      setCompletedTasks(tasksData);
      
      // Calculate additional stats
      const totalPointsEarned = tasksData.reduce((sum, task) => sum + (task.points_earned || 0), 0);
      const completionRate = tasksData.length > 0 ? Math.round((tasksData.length / (tasksData.length + 3)) * 100) : 0;
      
      setUserData(prev => ({
        ...prev,
        totalPointsEarned,
        completionRate
      }));
      
    } catch (error) {
      console.error('Error loading user data:', error);
      toast.error("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (updatedData: Partial<typeof userData>) => {
    setUserData(prev => ({ ...prev, ...updatedData }));
    
    // Update profile in database
    if (user) {
      const updatePayload: any = {};
      
      if (updatedData.name !== undefined) updatePayload.name = updatedData.name;
      if (updatedData.bio !== undefined) updatePayload.bio = updatedData.bio;
      if (updatedData.avatar !== undefined) updatePayload.profile_picture_url = updatedData.avatar;
      
      if (Object.keys(updatePayload).length > 0) {
        const { error } = await supabase
          .from('profiles')
          .update({
            ...updatePayload,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id);

        if (error) {
          console.error('Error updating profile:', error);
          toast.error("Failed to update profile");
        }
      }
    }
  };

  // Calculate level progress
  const currentLevelPoints = userData.level * 1000;
  const nextLevelPoints = (userData.level + 1) * 1000;
  const progressToNextLevel = ((userData.points - currentLevelPoints) / (nextLevelPoints - currentLevelPoints)) * 100;

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold">My Profile</h1>
              <p className="text-muted-foreground">
                Manage your profile, view achievements, and track your progress
              </p>
            </div>
          </div>

          {/* Quick Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4 text-center">
                <Target className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                <div className="text-2xl font-bold text-blue-600">{userData.points.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Total Points</div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4 text-center">
                <Trophy className="h-6 w-6 mx-auto mb-2 text-yellow-500" />
                <div className="text-2xl font-bold text-yellow-600">Level {userData.level}</div>
                <div className="text-sm text-muted-foreground">Current Level</div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4 text-center">
                <Award className="h-6 w-6 mx-auto mb-2 text-green-500" />
                <div className="text-2xl font-bold text-green-600">{userData.tasksCompleted}</div>
                <div className="text-sm text-muted-foreground">Tasks Done</div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4 text-center">
                <TrendingUp className="h-6 w-6 mx-auto mb-2 text-purple-500" />
                <div className="text-2xl font-bold text-purple-600">{userData.completionRate}%</div>
                <div className="text-sm text-muted-foreground">Success Rate</div>
              </CardContent>
            </Card>
          </div>

          {/* Level Progress */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Level {userData.level} Progress</span>
                <span className="text-sm text-muted-foreground">
                  {userData.points - currentLevelPoints} / {nextLevelPoints - currentLevelPoints} points
                </span>
              </div>
              <Progress value={Math.max(0, Math.min(100, progressToNextLevel))} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {Math.max(0, nextLevelPoints - userData.points)} points to Level {userData.level + 1}
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full max-w-2xl grid-cols-6">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="achievements" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Badges
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Stats
            </TabsTrigger>
            <TabsTrigger value="streaks" className="flex items-center gap-2">
              <Flame className="h-4 w-4" />
              Streaks
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              History
            </TabsTrigger>
            <TabsTrigger value="rewards" className="flex items-center gap-2">
              <Gift className="h-4 w-4" />
              Rewards
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <UserProfile 
              user={userData} 
              onUpdate={handleProfileUpdate}
            />
          </TabsContent>

          <TabsContent value="achievements">
            <AchievementSystem 
              userStats={{
                tasksCompleted: userData.tasksCompleted,
                currentStreak: userData.currentStreak,
                longestStreak: userData.longestStreak,
                points: userData.points,
                level: userData.level
              }}
            />
          </TabsContent>

          <TabsContent value="stats">
            <StatsDashboard 
              userStats={{
                level: userData.level,
                points: userData.points,
                tasksCompleted: userData.tasksCompleted,
                currentStreak: userData.currentStreak,
                longestStreak: userData.longestStreak
              }}
            />
          </TabsContent>

          <TabsContent value="streaks">
            <StreakTracker 
              currentStreak={userData.currentStreak}
              longestStreak={userData.longestStreak}
              todayCompleted={true}
              weeklyGoal={7}
              weeklyProgress={5}
            />
          </TabsContent>

          <TabsContent value="history">
            <TaskHistory
              completedTasks={completedTasks}
              totalPointsEarned={userData.totalPointsEarned}
              totalTasksCompleted={userData.tasksCompleted}
            />
          </TabsContent>

          <TabsContent value="rewards">
            <RedemptionHistory />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;
