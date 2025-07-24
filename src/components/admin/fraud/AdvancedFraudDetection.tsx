
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  AlertTriangle, 
  Eye, 
  Users, 
  TrendingUp,
  Search,
  Filter,
  Download
} from 'lucide-react';
import { integratedFraudDetectionService } from '@/services/integratedFraudDetectionService';

interface FraudFlag {
  id: string;
  userId: string;
  userName: string;
  flagType: 'duplicate_referral' | 'suspicious_activity' | 'duplicate_image' | 'fake_submission';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  evidence: any;
  status: 'pending' | 'investigating' | 'resolved' | 'dismissed';
  createdAt: string;
  reviewedAt?: string;
}

interface FraudStats {
  totalFlags: number;
  pendingReview: number;
  resolvedToday: number;
  criticalAlerts: number;
  flagsByType: Record<string, number>;
}

export const AdvancedFraudDetection: React.FC = () => {
  const [fraudFlags, setFraudFlags] = useState<FraudFlag[]>([]);
  const [fraudStats, setFraudStats] = useState<FraudStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadFraudData();
  }, []);

  const loadFraudData = async () => {
    try {
      setLoading(true);
      const stats = await integratedFraudDetectionService.getFraudDetectionStats();
      
      // Mock fraud flags data
      const mockFlags: FraudFlag[] = [
        {
          id: '1',
          userId: 'user1',
          userName: 'John Doe',
          flagType: 'duplicate_referral',
          severity: 'high',
          description: 'Multiple referrals from same IP address',
          evidence: { ipAddress: '192.168.1.1', referralCount: 5 },
          status: 'pending',
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          userId: 'user2',
          userName: 'Jane Smith',
          flagType: 'duplicate_image',
          severity: 'medium',
          description: 'Duplicate image submission detected',
          evidence: { imageHash: 'abc123', originalSubmission: 'task1' },
          status: 'investigating',
          createdAt: new Date(Date.now() - 3600000).toISOString()
        }
      ];

      setFraudFlags(mockFlags);
      setFraudStats({
        totalFlags: stats.totalFlags,
        pendingReview: stats.pendingFlags,
        resolvedToday: 12,
        criticalAlerts: stats.highSeverityFlags,
        flagsByType: {
          duplicate_referral: stats.duplicateReferrals,
          duplicate_image: stats.duplicateImages,
          suspicious_activity: 8,
          fake_submission: 3
        }
      });
    } catch (error) {
      console.error('Error loading fraud data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFlagAction = async (flagId: string, action: 'resolve' | 'dismiss' | 'investigate') => {
    setFraudFlags(prev =>
      prev.map(flag =>
        flag.id === flagId
          ? { ...flag, status: action === 'resolve' ? 'resolved' : action === 'dismiss' ? 'dismissed' : 'investigating' }
          : flag
      )
    );
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'investigating': return 'bg-blue-500';
      case 'resolved': return 'bg-green-500';
      case 'dismissed': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading fraud detection data...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Flags</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fraudStats?.totalFlags || 0}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">{fraudStats?.pendingReview || 0}</div>
            <p className="text-xs text-muted-foreground">Needs attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved Today</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{fraudStats?.resolvedToday || 0}</div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{fraudStats?.criticalAlerts || 0}</div>
            <p className="text-xs text-muted-foreground">High priority</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="flags">Fraud Flags</TabsTrigger>
          <TabsTrigger value="patterns">Patterns</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Fraud Types Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(fraudStats?.flagsByType || {}).map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between">
                      <span className="text-sm capitalize">{type.replace('_', ' ')}</span>
                      <Badge variant="outline">{count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {fraudFlags.slice(0, 5).map((flag) => (
                    <Alert key={flag.id}>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>{flag.userName}</strong> - {flag.description}
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={getSeverityColor(flag.severity)}>
                            {flag.severity}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(flag.createdAt).toLocaleString()}
                          </span>
                        </div>
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="flags">
          <Card>
            <CardHeader>
              <CardTitle>Fraud Flags Management</CardTitle>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
                <Button size="sm" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Flag Type</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fraudFlags.map((flag) => (
                    <TableRow key={flag.id}>
                      <TableCell className="font-medium">{flag.userName}</TableCell>
                      <TableCell className="capitalize">{flag.flagType.replace('_', ' ')}</TableCell>
                      <TableCell>
                        <Badge className={getSeverityColor(flag.severity)}>
                          {flag.severity}
                        </Badge>
                      </TableCell>
                      <TableCell>{flag.description}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(flag.status)}>
                          {flag.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(flag.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {flag.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleFlagAction(flag.id, 'investigate')}
                              >
                                Investigate
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleFlagAction(flag.id, 'resolve')}
                              >
                                Resolve
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="patterns">
          <Card>
            <CardHeader>
              <CardTitle>Fraud Patterns Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Pattern Analysis</h3>
                <p className="text-muted-foreground">
                  Advanced pattern recognition and fraud detection analytics coming soon.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Fraud Detection Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Download className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Detailed Reports</h3>
                <p className="text-muted-foreground">
                  Comprehensive fraud detection reports and analytics dashboard.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
