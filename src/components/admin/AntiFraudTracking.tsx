
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle, Search, Ban } from 'lucide-react';
import { toast } from 'sonner';

interface SuspiciousActivity {
  id: string;
  userId: string;
  userName: string;
  activity: string;
  riskLevel: 'low' | 'medium' | 'high';
  ipAddress: string;
  deviceInfo: string;
  timestamp: string;
  status: 'pending' | 'reviewed' | 'flagged';
}

export const AntiFraudTracking: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suspiciousActivities] = useState<SuspiciousActivity[]>([
    {
      id: '1',
      userId: 'user-123',
      userName: 'john_doe',
      activity: 'Multiple referrals from same IP',
      riskLevel: 'high',
      ipAddress: '192.168.1.1',
      deviceInfo: 'Chrome 120 on Windows',
      timestamp: '2024-01-20 14:30:00',
      status: 'pending'
    },
    {
      id: '2',
      userId: 'user-456',
      userName: 'jane_smith',
      activity: 'Rapid referral creation',
      riskLevel: 'medium',
      ipAddress: '10.0.0.1',
      deviceInfo: 'Safari 17 on iPhone',
      timestamp: '2024-01-20 13:15:00',
      status: 'reviewed'
    }
  ]);

  const getRiskBadgeColor = (level: string) => {
    switch (level) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-blue-100 text-blue-800';
      case 'reviewed':
        return 'bg-green-100 text-green-800';
      case 'flagged':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleFlagUser = (userId: string, userName: string) => {
    toast.warning(
      <div className="flex items-center gap-2">
        <Ban className="h-5 w-5" />
        <div>
          <p className="font-semibold">User Flagged</p>
          <p className="text-sm">{userName} has been flagged for review</p>
        </div>
      </div>
    );
  };

  const handleReviewComplete = (activityId: string) => {
    toast.success('Review completed and marked as resolved');
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">High Risk Activities</p>
                <p className="text-xl font-bold text-red-600">3</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Shield className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending Reviews</p>
                <p className="text-xl font-bold text-yellow-600">8</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Shield className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Resolved Today</p>
                <p className="text-xl font-bold text-green-600">12</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Anti-fraud system monitors IP addresses, device fingerprints, and referral patterns to detect suspicious activity.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Suspicious Activities
            </span>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search activities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Activity</TableHead>
                  <TableHead>Risk Level</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Device</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {suspiciousActivities.map((activity) => (
                  <TableRow key={activity.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{activity.userName}</p>
                        <p className="text-xs text-muted-foreground">{activity.userId}</p>
                      </div>
                    </TableCell>
                    <TableCell>{activity.activity}</TableCell>
                    <TableCell>
                      <Badge className={getRiskBadgeColor(activity.riskLevel)}>
                        {activity.riskLevel.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{activity.ipAddress}</TableCell>
                    <TableCell className="text-sm">{activity.deviceInfo}</TableCell>
                    <TableCell>
                      <Badge className={getStatusBadgeColor(activity.status)}>
                        {activity.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReviewComplete(activity.id)}
                        >
                          Review
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleFlagUser(activity.userId, activity.userName)}
                        >
                          Flag
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
