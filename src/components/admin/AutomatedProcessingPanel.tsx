
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { automatedTaskProcessingService } from "@/services/admin/automatedTaskProcessingService";
import { toast } from "sonner";
import { Play, Settings, AlertTriangle, CheckCircle, Clock, Zap } from "lucide-react";

export const AutomatedProcessingPanel = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastProcessResult, setLastProcessResult] = useState<{
    processed: number;
    approved: number;
    errors: string[];
    timestamp: Date;
  } | null>(null);
  const [processingStats, setProcessingStats] = useState({
    totalPending: 0,
    flaggedCount: 0,
    autoApprovalRate: 0
  });

  useEffect(() => {
    loadProcessingStats();
    // Set up interval to refresh stats every 30 seconds
    const interval = setInterval(loadProcessingStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadProcessingStats = async () => {
    try {
      const { supabase } = await import("@/integrations/supabase/client");
      
      // Get pending submissions count
      const { data: pendingSubmissions, error: pendingError } = await supabase
        .from('task_submissions')
        .select('id')
        .eq('status', 'pending');

      // Get flagged submissions count
      const { data: flaggedSubmissions, error: flaggedError } = await supabase
        .from('task_submissions')
        .select('id')
        .eq('status', 'flagged');

      // Get today's approval stats
      const today = new Date().toISOString().split('T')[0];
      const { data: todaySubmissions, error: todayError } = await supabase
        .from('task_submissions')
        .select('status, admin_notes')
        .gte('submitted_at', `${today}T00:00:00`)
        .lt('submitted_at', `${today}T23:59:59`);

      if (!pendingError && !flaggedError && !todayError) {
        const autoApproved = todaySubmissions?.filter(s => 
          s.status === 'approved' && s.admin_notes?.includes('Auto-approved')
        ).length || 0;
        const totalApproved = todaySubmissions?.filter(s => s.status === 'approved').length || 0;
        
        setProcessingStats({
          totalPending: pendingSubmissions?.length || 0,
          flaggedCount: flaggedSubmissions?.length || 0,
          autoApprovalRate: totalApproved > 0 ? Math.round((autoApproved / totalApproved) * 100) : 0
        });
      }
    } catch (error) {
      console.error('Error loading processing stats:', error);
    }
  };

  const handleRunAutomation = async () => {
    setIsProcessing(true);
    try {
      const result = await automatedTaskProcessingService.processAutomaticApprovals();
      setLastProcessResult({
        ...result,
        timestamp: new Date()
      });
      
      if (result.approved > 0) {
        toast.success(`Successfully auto-approved ${result.approved} out of ${result.processed} submissions!`);
      } else {
        toast.info(`Processed ${result.processed} submissions, none met auto-approval criteria`);
      }
      
      // Refresh stats
      await loadProcessingStats();
    } catch (error) {
      console.error('Error running automation:', error);
      toast.error('Failed to run automatic processing');
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Processing Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Automated Task Processing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{processingStats.totalPending}</div>
              <div className="text-sm text-blue-600">Pending Submissions</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{processingStats.flaggedCount}</div>
              <div className="text-sm text-orange-600">Flagged for Review</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{processingStats.autoApprovalRate}%</div>
              <div className="text-sm text-green-600">Auto-Approval Rate</div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button 
              onClick={handleRunAutomation} 
              disabled={isProcessing}
              className="flex-1"
            >
              {isProcessing ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Run Automation
                </>
              )}
            </Button>
            <Button variant="outline" disabled>
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Processing Results */}
      {lastProcessResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Last Processing Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Processed at {lastProcessResult.timestamp.toLocaleTimeString()}
              </span>
              <Badge className={getStatusColor(lastProcessResult.errors.length > 0 ? 'warning' : 'success')}>
                {lastProcessResult.errors.length > 0 ? 'With Errors' : 'Success'}
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Processed</div>
                <div className="text-2xl font-bold">{lastProcessResult.processed}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Approved</div>
                <div className="text-2xl font-bold text-green-600">{lastProcessResult.approved}</div>
              </div>
            </div>

            {lastProcessResult.processed > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Approval Rate</span>
                  <span>{Math.round((lastProcessResult.approved / lastProcessResult.processed) * 100)}%</span>
                </div>
                <Progress value={(lastProcessResult.approved / lastProcessResult.processed) * 100} />
              </div>
            )}

            {lastProcessResult.errors.length > 0 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="font-medium">Processing Errors ({lastProcessResult.errors.length}):</div>
                  <div className="mt-1 text-sm">
                    {lastProcessResult.errors.slice(0, 3).map((error, index) => (
                      <div key={index} className="text-red-600">• {error}</div>
                    ))}
                    {lastProcessResult.errors.length > 3 && (
                      <div className="text-muted-foreground">... and {lastProcessResult.errors.length - 3} more</div>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Auto-Processing Rules */}
      <Card>
        <CardHeader>
          <CardTitle>Auto-Processing Rules</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {automatedTaskProcessingService.getDefaultRules().map((rule) => (
              <div key={rule.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{rule.taskType.replace('_', ' ').toUpperCase()}</span>
                  <Badge className={rule.autoApprove ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                    {rule.autoApprove ? 'Auto-Approve' : 'Manual Review'}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground space-y-1">
                  <div>Quality Score: {rule.defaultQualityScore}</div>
                  {rule.conditions.minEvidenceLength && (
                    <div>Min Evidence Length: {rule.conditions.minEvidenceLength} characters</div>
                  )}
                  {rule.conditions.requiredKeywords && (
                    <div>Required Keywords: {rule.conditions.requiredKeywords.join(', ')}</div>
                  )}
                  {rule.conditions.autoApproveTimeLimit && (
                    <div>Time Limit: {rule.conditions.autoApproveTimeLimit} minutes</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
