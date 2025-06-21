
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { fraudDetectionService, FraudFlagWithUserData } from '@/services/fraudDetectionService';
import { AlertTriangle, Users, CheckCircle, XCircle, Clock, MapPin } from 'lucide-react';
import { toast } from 'sonner';

export const DuplicateReferralManager = () => {
  const [fraudFlags, setFraudFlags] = useState<FraudFlagWithUserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState<string>('');

  useEffect(() => {
    loadFraudFlags();
  }, []);

  const loadFraudFlags = async () => {
    try {
      setLoading(true);
      const flags = await fraudDetectionService.admin.getFraudFlagsByType('duplicate_referral');
      setFraudFlags(flags);
    } catch (error) {
      console.error('Error loading fraud flags:', error);
      toast.error('Failed to load fraud flags');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (flagId: string, status: string) => {
    const success = await fraudDetectionService.admin.updateFraudFlagStatus(
      flagId, 
      status, 
      adminNotes
    );
    
    if (success) {
      setReviewingId(null);
      setAdminNotes('');
      loadFraudFlags();
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-blue-100 text-blue-800';
      case 'reviewed':
        return 'bg-purple-100 text-purple-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'dismissed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'resolved':
        return <CheckCircle className="h-4 w-4" />;
      case 'dismissed':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const parseEvidence = (evidence: any) => {
    if (!evidence) return null;
    
    try {
      return typeof evidence === 'string' ? JSON.parse(evidence) : evidence;
    } catch {
      return evidence;
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading duplicate referral flags...</div>;
  }

  const pendingFlags = fraudFlags.filter(flag => flag.status === 'pending');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Users className="h-6 w-6" />
          Duplicate Referral Detection
        </h2>
        <Badge variant={pendingFlags.length > 0 ? 'destructive' : 'secondary'}>
          {pendingFlags.length} Pending Reviews
        </Badge>
      </div>

      {fraudFlags.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center p-8">
            <div className="text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Duplicate Referrals Detected</h3>
              <p className="text-muted-foreground">All referrals appear to be legitimate.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {fraudFlags.map((flag) => {
            const evidence = parseEvidence(flag.evidence);
            
            return (
              <Card key={flag.id} className="border-orange-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-orange-500" />
                      Suspected Duplicate Referral
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge className={getSeverityColor(flag.severity)}>
                        {flag.severity.toUpperCase()}
                      </Badge>
                      <Badge className={getStatusColor(flag.status)}>
                        {getStatusIcon(flag.status)}
                        <span className="ml-1">{flag.status}</span>
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      {flag.flag_reason}
                    </AlertDescription>
                  </Alert>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Referrer</h4>
                      <div className="p-3 bg-gray-50 rounded border">
                        <p><strong>Name:</strong> {flag.user_profile?.name || 'Unknown'}</p>
                        <p><strong>Email:</strong> {flag.user_profile?.email || 'Unknown'}</p>
                        <p><strong>User ID:</strong> {flag.user_id}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Referred User</h4>
                      <div className="p-3 bg-red-50 rounded border border-red-200">
                        <p><strong>Name:</strong> {flag.related_user_profile?.name || 'Unknown'}</p>
                        <p><strong>Email:</strong> {flag.related_user_profile?.email || 'Unknown'}</p>
                        <p><strong>User ID:</strong> {flag.related_user_id}</p>
                      </div>
                    </div>
                  </div>

                  {evidence && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Evidence</h4>
                      <div className="p-3 bg-yellow-50 rounded border border-yellow-200">
                        {evidence.referrer_ip && evidence.referred_ip && (
                          <p className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            <strong>Same IP Address:</strong> {evidence.referrer_ip}
                          </p>
                        )}
                        {evidence.device_fingerprint && (
                          <p><strong>Device Fingerprint:</strong> {evidence.device_fingerprint}</p>
                        )}
                        {evidence.referrer_signup && evidence.referred_signup && (
                          <div className="mt-2">
                            <p><strong>Referrer Signup:</strong> {formatDate(evidence.referrer_signup)}</p>
                            <p><strong>Referred Signup:</strong> {formatDate(evidence.referred_signup)}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="text-sm text-muted-foreground">
                    <p>Flagged: {formatDate(flag.created_at)}</p>
                    {flag.reviewed_at && (
                      <p>Reviewed: {formatDate(flag.reviewed_at)}</p>
                    )}
                  </div>

                  {flag.status === 'pending' && (
                    <>
                      {reviewingId === flag.id ? (
                        <div className="space-y-3">
                          <Textarea
                            placeholder="Add admin notes about this review..."
                            value={adminNotes}
                            onChange={(e) => setAdminNotes(e.target.value)}
                            rows={3}
                          />
                          <div className="flex gap-2">
                            <Button 
                              onClick={() => handleUpdateStatus(flag.id, 'resolved')}
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                            >
                              Mark as Resolved
                            </Button>
                            <Button 
                              onClick={() => handleUpdateStatus(flag.id, 'dismissed')}
                              size="sm"
                              variant="outline"
                            >
                              Dismiss
                            </Button>
                            <Button 
                              variant="outline" 
                              onClick={() => {
                                setReviewingId(null);
                                setAdminNotes('');
                              }}
                              size="sm"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button 
                          onClick={() => setReviewingId(flag.id)}
                          variant="outline"
                        >
                          Review This Flag
                        </Button>
                      )}
                    </>
                  )}

                  {flag.admin_notes && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Admin Notes</h4>
                      <div className="p-3 bg-blue-50 rounded border border-blue-200">
                        <p className="text-sm">{flag.admin_notes}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
