
import React, { useState } from "react";
import { UserProfile } from "@/components/UserProfile";
import { AchievementSystem } from "@/components/AchievementSystem";
import { StatsDashboard } from "@/components/StatsDashboard";
import { StreakTracker } from "@/components/StreakTracker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User, 
  Trophy, 
  BarChart3, 
  Flame 
} from "lucide-react";

const Profile = () => {
  // Mock user data - in real app this would come from context/API
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
    joinDate: "2024-01-15"
  });

  const handleProfileUpdate = (updatedData: Partial<typeof userData>) => {
    setUserData(prev => ({ ...prev, ...updatedData }));
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Profile</h1>
          <p className="text-muted-foreground">
            Manage your profile, view achievements, and track your progress
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-4">
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
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;
