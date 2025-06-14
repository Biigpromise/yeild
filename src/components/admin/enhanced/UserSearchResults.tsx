import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UserActivityData } from "@/services/admin/enhancedUserManagementService";
import { 
  CheckCircle, 
  Clock, 
  Ban, 
  Activity, 
  UserCheck, 
  UserX, 
  Calendar,
  TrendingUp,
  Award
} from "lucide-react";

interface UserSearchResultsProps {
  users: UserActivityData[];
  selectedUsers: string[];
  onSelectUser: (userId: string, selected: boolean) => void;
  onSelectAll: (selected: boolean) => void;
  onUserAction: (userId: string, action: 'suspend' | 'ban' | 'unsuspend') => void;
  loading?: boolean;
}

export const UserSearchResults: React.FC<UserSearchResultsProps> = ({
  users,
  selectedUsers,
  onSelectUser,
  onSelectAll,
  onUserAction,
  loading = false
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'suspended':
        return 'bg-yellow-100 text-yellow-800';
      case 'banned':
        return 'bg-red-100 text-red-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-3 w-3" />;
      case 'suspended':
        return <Clock className="h-3 w-3" />;
      case 'banned':
        return <Ban className="h-3 w-3" />;
      default:
        return <Activity className="h-3 w-3" />;
    }
  };

  const getLevelBadge = (points: number) => {
    if (points >= 5000) return { level: 'Platinum', color: 'bg-purple-100 text-purple-800' };
    if (points >= 2000) return { level: 'Gold', color: 'bg-yellow-100 text-yellow-800' };
    if (points >= 500) return { level: 'Silver', color: 'bg-gray-100 text-gray-800' };
    return { level: 'Bronze', color: 'bg-amber-100 text-amber-800' };
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const isAllSelected = selectedUsers.length === users.length && users.length > 0;
  const isIndeterminate = selectedUsers.length > 0 && selectedUsers.length < users.length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            Search Results ({users.length} users found)
          </CardTitle>
          {users.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{selectedUsers.length} selected</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {users.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No users found matching your search criteria.
          </div>
        ) : (
          <div className="overflow-x-auto border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={isAllSelected}
                      onCheckedChange={(checked) => onSelectAll(!!checked)}
                      className={isIndeterminate ? "data-[state=checked]:bg-primary/50" : ""}
                    />
                  </TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Status & Level</TableHead>
                  <TableHead>Activity</TableHead>
                  <TableHead>Performance</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => {
                  const levelInfo = getLevelBadge(user.pointsEarned);
                  return (
                    <TableRow key={user.userId}>
                      <TableCell>
                        <Checkbox
                          checked={selectedUsers.includes(user.userId)}
                          onCheckedChange={(checked) => onSelectUser(user.userId, !!checked)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{user.userName}</div>
                          <div className="text-sm text-muted-foreground">{user.email}</div>
                          <div className="text-xs text-muted-foreground">ID: {user.userId.slice(0, 8)}...</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          <Badge className={`${getStatusColor(user.accountStatus)} flex items-center gap-1 w-fit`}>
                            {getStatusIcon(user.accountStatus)}
                            {user.accountStatus}
                          </Badge>
                          <Badge className={`${levelInfo.color} flex items-center gap-1 w-fit`}>
                            <Award className="h-3 w-3" />
                            {levelInfo.level}
                          </Badge>
                          {user.suspensionReason && (
                            <div className="text-xs text-red-600 max-w-32 truncate" title={user.suspensionReason}>
                              {user.suspensionReason}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center gap-1">
                            <Activity className="h-3 w-3" />
                            {user.totalLogins} logins
                          </div>
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" />
                            {user.streakDays} day streak
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Last: {user.lastActive ? new Date(user.lastActive).toLocaleDateString() : 'Never'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 text-sm">
                          <div className="font-medium text-green-600">
                            {user.pointsEarned.toLocaleString()} points
                          </div>
                          <div className="text-muted-foreground">
                            {user.tasksCompleted} tasks completed
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Avg: {user.tasksCompleted > 0 ? Math.round(user.pointsEarned / user.tasksCompleted) : 0} pts/task
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Joined: {new Date(user.joinDate).toLocaleDateString()}
                          </div>
                          {user.lastLogin && (
                            <div>
                              Last login: {new Date(user.lastLogin).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {user.accountStatus === 'suspended' ? (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => onUserAction(user.userId, 'unsuspend')}
                              className="text-green-600 text-xs px-2 py-1 h-6"
                            >
                              <UserCheck className="h-3 w-3 mr-1" />
                              Unsuspend
                            </Button>
                          ) : user.accountStatus === 'banned' ? (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => onUserAction(user.userId, 'unsuspend')}
                              className="text-green-600 text-xs px-2 py-1 h-6"
                            >
                              <UserCheck className="h-3 w-3 mr-1" />
                              Unban
                            </Button>
                          ) : (
                            <>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => onUserAction(user.userId, 'suspend')}
                                className="text-yellow-600 text-xs px-2 py-1 h-6"
                              >
                                <Clock className="h-3 w-3 mr-1" />
                                Suspend
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => onUserAction(user.userId, 'ban')}
                                className="text-red-600 text-xs px-2 py-1 h-6"
                              >
                                <UserX className="h-3 w-3 mr-1" />
                                Ban
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
