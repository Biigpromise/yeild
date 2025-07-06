import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { Activity, Clock, Users, Eye } from "lucide-react";

interface ActivityLog {
  id: string;
  user_id: string;
  action: string;
  details: any;
  ip_address: string;
  user_agent: string;
  created_at: string;
  profiles?: {
    name: string;
    email: string;
  };
}

export const UserActivityMonitor: React.FC = () => {
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState("24h");
  const [actionFilter, setActionFilter] = useState("all");

  useEffect(() => {
    loadActivityLogs();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('activity-logs-monitor')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_activity_logs'
        },
        () => {
          loadActivityLogs();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [timeFilter, actionFilter]);

  const loadActivityLogs = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('user_activity_logs')
        .select(`
          id,
          user_id,
          action,
          details,
          ip_address,
          user_agent,
          created_at,
          profiles!user_activity_logs_user_id_fkey (
            name,
            email
          )
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      // Apply time filter
      if (timeFilter !== "all") {
        const timeAgo = new Date();
        switch (timeFilter) {
          case "1h":
            timeAgo.setHours(timeAgo.getHours() - 1);
            break;
          case "24h":
            timeAgo.setHours(timeAgo.getHours() - 24);
            break;
          case "7d":
            timeAgo.setDate(timeAgo.getDate() - 7);
            break;
          case "30d":
            timeAgo.setDate(timeAgo.getDate() - 30);
            break;
        }
        query = query.gte('created_at', timeAgo.toISOString());
      }

      // Apply action filter
      if (actionFilter !== "all") {
        query = query.eq('action', actionFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      // Transform data to match interface
      const transformedData: ActivityLog[] = (data || []).map(item => ({
        id: item.id,
        user_id: item.user_id,
        action: item.action,
        details: item.details,
        ip_address: item.ip_address as string || 'N/A',
        user_agent: item.user_agent || 'N/A',
        created_at: item.created_at,
        profiles: item.profiles && typeof item.profiles === 'object' && !Array.isArray(item.profiles) && 'name' in item.profiles && 'email' in item.profiles
          ? item.profiles as { name: string; email: string }
          : undefined
      }));
      
      setActivityLogs(transformedData);
    } catch (error) {
      console.error('Error loading activity logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case 'login':
        return 'bg-green-100 text-green-800';
      case 'logout':
        return 'bg-gray-100 text-gray-800';
      case 'task_submit':
        return 'bg-blue-100 text-blue-800';
      case 'task_complete':
        return 'bg-purple-100 text-purple-800';
      case 'message_send':
        return 'bg-cyan-100 text-cyan-800';
      case 'profile_update':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case 'login':
      case 'logout':
        return <Users className="h-4 w-4" />;
      case 'task_submit':
      case 'task_complete':
        return <Activity className="h-4 w-4" />;
      case 'profile_update':
        return <Clock className="h-4 w-4" />;
      default:
        return <Eye className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-4">
        <Select value={timeFilter} onValueChange={setTimeFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1h">Last Hour</SelectItem>
            <SelectItem value="24h">Last 24 Hours</SelectItem>
            <SelectItem value="7d">Last 7 Days</SelectItem>
            <SelectItem value="30d">Last 30 Days</SelectItem>
            <SelectItem value="all">All Time</SelectItem>
          </SelectContent>
        </Select>

        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Action type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            <SelectItem value="login">Login</SelectItem>
            <SelectItem value="logout">Logout</SelectItem>
            <SelectItem value="task_submit">Task Submit</SelectItem>
            <SelectItem value="task_complete">Task Complete</SelectItem>
            <SelectItem value="message_send">Message Send</SelectItem>
            <SelectItem value="profile_update">Profile Update</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Activity Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Activities</p>
                <p className="text-xl font-bold">{activityLogs.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Active Users</p>
                <p className="text-xl font-bold">
                  {new Set(activityLogs.map(log => log.user_id)).size}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Recent Activity</p>
                <p className="text-xl font-bold">
                  {activityLogs.filter(log => 
                    new Date(log.created_at) > new Date(Date.now() - 60 * 60 * 1000)
                  ).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Most Active</p>
                <p className="text-sm font-medium">
                  {(() => {
                    const mostActiveCount = Object.entries(
                      activityLogs.reduce((acc: any, log) => {
                        acc[log.user_id] = (acc[log.user_id] || 0) + 1;
                        return acc;
                      }, {})
                    ).sort(([,a], [,b]) => (b as number) - (a as number))[0]?.[1];
                    return typeof mostActiveCount === 'number' ? `${mostActiveCount} actions` : '0 actions';
                  })()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>IP Address</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activityLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No activity logs found for the selected filters
                    </TableCell>
                  </TableRow>
                ) : (
                  activityLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {log.profiles?.name || 'Unknown User'}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {log.profiles?.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getActionIcon(log.action)}
                          <Badge className={getActionColor(log.action)}>
                            {log.action.replace('_', ' ')}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate text-sm text-muted-foreground">
                          {log.details && typeof log.details === 'object' 
                            ? JSON.stringify(log.details).slice(0, 50) + '...' 
                            : log.details ? String(log.details).slice(0, 50) + '...' 
                            : 'No details'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {log.ip_address || 'N/A'}
                        </code>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};