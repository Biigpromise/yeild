
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Mail, Calendar, Trophy, Target, Users, Activity } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface UserProfileData {
  id: string;
  email: string;
  name: string;
  profile_picture_url?: string;
  created_at: string;
  last_login_at?: string;
  points: number;
  level: number;
  tasks_completed: number;
  followers_count: number;
  following_count: number;
  active_referrals_count: number;
  user_roles: Array<{ role: string }>;
  user_streaks?: Array<{ current_streak: number }>;
}

interface UserProfileDialogProps {
  user: UserProfileData | null;
  isOpen: boolean;
  onClose: () => void;
}

export const UserProfileDialog: React.FC<UserProfileDialogProps> = ({
  user,
  isOpen,
  onClose,
}) => {
  if (!user) return null;

  const getUserRole = () => {
    return user.user_roles[0]?.role || 'user';
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-500 text-white';
      case 'brand': return 'bg-blue-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>User Profile</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={user.profile_picture_url} />
                  <AvatarFallback>
                    {user.name?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{user.name || 'Anonymous User'}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    {user.email}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className={getRoleBadgeColor(getUserRole())}>
                      {getUserRole()}
                    </Badge>
                    <Badge variant="outline">Level {user.level}</Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Joined {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}</span>
                </div>
                {user.last_login_at && (
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-muted-foreground" />
                    <span>Last active {formatDistanceToNow(new Date(user.last_login_at), { addSuffix: true })}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{user.points}</div>
                  <div className="text-sm text-muted-foreground">Points</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{user.tasks_completed}</div>
                  <div className="text-sm text-muted-foreground">Tasks Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{user.followers_count}</div>
                  <div className="text-sm text-muted-foreground">Followers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{user.active_referrals_count}</div>
                  <div className="text-sm text-muted-foreground">Referrals</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Activity & Engagement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Current Streak</span>
                  <Badge variant="outline">
                    {user.user_streaks?.[0]?.current_streak || 0} days
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Following</span>
                  <span className="font-medium">{user.following_count}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">User ID</span>
                  <span className="font-mono text-xs text-muted-foreground">{user.id}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};
