
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  enhancedUserManagementService, 
  UserActivityData,
  UserSessionData,
  UserStreakData,
  UserActivityTimeline
} from "@/services/admin/enhancedUserManagementService";
import { 
  User, 
  Clock, 
  TrendingUp, 
  Monitor, 
  MapPin, 
  Activity,
  Target,
  Calendar,
  Flame,
  BarChart3,
  Eye
} from "lucide-react";

interface UserActivityProfileProps {
  userId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const UserActivityProfile: React.FC<UserActivityProfileProps> = ({
  userId,
  open,
  onOpenChange
}) => {
  const [profile, setProfile] = useState<UserActivityData | null>(null);
  const [sessions, setSessions] = useState<UserSessionData[]>([]);
  const [streaks, setStreaks] = useState<UserStreakData[]>([]);
  const [timeline, setTimeline] = useState<UserActivityTimeline[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && userId) {
      loadUserData();
    }
  }, [open, userId]);

  const loadUserData = async () => {
    setLoading(true);
    try {
      const [profileData, sessionsData, streaksData, timelineData] = await Promise.all([
        enhancedUserManagementService.getUserProfileWithActivity(userId),
        enhancedUserManagementService.getUserSessions(userId, 20),
        enhancedUserManagementService.getUserStreaks(userId),
        enhancedUserManagementService.getUserActivityTimeline(userId, 30)
      ]);

      setProfile(profileData);
      setSessions(sessionsData);
      setStreaks(streaksData);
      setTimeline(timelineData);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getDeviceIcon = (deviceType?: string) => {
    switch (deviceType?.toLowerCase()) {
      case 'mobile':
        return '📱';
      case 'tablet':
        return '📟';
      case 'desktop':
        return '🖥️';
      default:
        return '💻';
    }
  };

  if (!profile) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>User Activity Profile</DialogTitle>
          </DialogHeader>
          <div className="p-6">
            {loading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-64 bg-gray-200 rounded"></div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground">
                Failed to load user profile
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {profile.userName}'s Activity Profile
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* User Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Tasks Completed</p>
                    <p className="text-2xl font-bold text-green-600">{profile.tasksCompleted}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Completion Rate</p>
                    <p className="text-2xl font-bold text-blue-600">{profile.taskCompletionRate.toFixed(1)}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Flame className="h-4 w-4 text-orange-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Current Streak</p>
                    <p className="text-2xl font-bold text-orange-600">{profile.streakDays} days</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-purple-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Session</p>
                    <p className="text-2xl font-bold text-purple-600">{formatDuration(profile.averageSessionDuration)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Tabs */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="sessions">Login History</TabsTrigger>
              <TabsTrigger value="streaks">Streaks</TabsTrigger>
              <TabsTrigger value="timeline">Activity Timeline</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Profile Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Email:</span>
                      <span>{profile.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Joined:</span>
                      <span>{new Date(profile.joinDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Last Active:</span>
                      <span>{new Date(profile.lastActive).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Logins:</span>
                      <span>{profile.totalLogins}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Performance Metrics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Points Earned:</span>
                      <span className="font-medium text-green-600">{profile.pointsEarned.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Longest Streak:</span>
                      <span className="font-medium text-orange-600">{profile.longestStreak} days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Session Time:</span>
                      <span>{formatDuration(profile.totalSessionTime)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Login Streak:</span>
                      <span className="font-medium text-blue-600">{profile.currentLoginStreak} days</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="sessions" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Monitor className="h-4 w-4" />
                    Recent Login Sessions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date & Time</TableHead>
                          <TableHead>Duration</TableHead>
                          <TableHead>Device</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sessions.map((session) => (
                          <TableRow key={session.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">
                                  {new Date(session.sessionStart).toLocaleDateString()}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {new Date(session.sessionStart).toLocaleTimeString()}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              {session.duration ? formatDuration(session.duration) : 'Active'}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <span>{getDeviceIcon(session.deviceType)}</span>
                                <div>
                                  <div className="font-medium">{session.deviceType || 'Unknown'}</div>
                                  <div className="text-sm text-muted-foreground">{session.browser}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {session.locationCity && session.locationCountry 
                                  ? `${session.locationCity}, ${session.locationCountry}`
                                  : session.ipAddress || 'Unknown'
                                }
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={session.isActive ? "default" : "secondary"}>
                                {session.isActive ? "Active" : "Ended"}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="streaks" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {streaks.map((streak) => (
                  <Card key={streak.streakType}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 capitalize">
                        <Flame className="h-4 w-4" />
                        {streak.streakType.replace('_', ' ')} Streak
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Current Streak:</span>
                        <span className="font-bold text-orange-600">{streak.currentStreak} days</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Longest Streak:</span>
                        <span className="font-medium">{streak.longestStreak} days</span>
                      </div>
                      {streak.lastActivityDate && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Last Activity:</span>
                          <span>{new Date(streak.lastActivityDate).toLocaleDateString()}</span>
                        </div>
                      )}
                      {streak.streakStartDate && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Streak Started:</span>
                          <span>{new Date(streak.streakStartDate).toLocaleDateString()}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="timeline" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Activity Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {timeline.map((activity) => (
                      <div key={activity.id} className="flex items-start gap-3 p-3 border rounded-lg">
                        <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="font-medium">{activity.description}</p>
                            <span className="text-sm text-muted-foreground">
                              {new Date(activity.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {activity.activityType.replace('_', ' ')}
                            </Badge>
                            {activity.ipAddress && (
                              <span className="text-xs text-muted-foreground">
                                {activity.ipAddress}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};
