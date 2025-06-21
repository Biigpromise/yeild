
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { imageHashService, DuplicateImageFlag } from '@/services/imageHashService';
import { AlertTriangle, Eye, CheckCircle, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

interface DuplicateFlag extends DuplicateImageFlag {
  original_hash: {
    user_id: string;
    task_id?: string;
    file_url: string;
    created_at: string;
  };
  duplicate_hash: {
    user_id: string;
    task_id?: string;
    file_url: string;
    created_at: string;
  };
}

export const DuplicateImageManager = () => {
  const [duplicateFlags, setDuplicateFlags] = useState<DuplicateFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState<string>('');

  useEffect(() => {
    loadDuplicateFlags();
  }, []);

  const loadDuplicateFlags = async () => {
    try {
      setLoading(true);
      const flags = await imageHashService.admin.getDuplicateFlags();
      setDuplicateFlags(flags as DuplicateFlag[]);
    } catch (error) {
      console.error('Error loading duplicate flags:', error);
      toast.error('Failed to load duplicate image flags');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsReviewed = async (flagId: string) => {
    const success = await imageHashService.admin.markAsReviewed(flagId, adminNotes);
    if (success) {
      setReviewingId(null);
      setAdminNotes('');
      loadDuplicateFlags();
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading duplicate image flags...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Duplicate Image Detection</h2>
        <Badge variant={duplicateFlags.length > 0 ? 'destructive' : 'secondary'}>
          {duplicateFlags.length} Pending Reviews
        </Badge>
      </div>

      {duplicateFlags.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center p-8">
            <div className="text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Duplicate Images Found</h3>
              <p className="text-muted-foreground">All submitted images are unique.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {duplicateFlags.map((flag) => (
            <Card key={flag.id} className="border-orange-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                    Possible Duplicate Screenshot
                  </CardTitle>
                  <Badge variant="outline">
                    Flagged {formatDate(flag.flagged_at)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    The same image hash was detected across different submissions. Please review to confirm if this is a legitimate reuse.
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Original Submission</h4>
                    <div className="p-3 bg-gray-50 rounded border">
                      <p><strong>User ID:</strong> {flag.original_hash.user_id}</p>
                      <p><strong>Task ID:</strong> {flag.original_hash.task_id || 'N/A'}</p>
                      <p><strong>Submitted:</strong> {formatDate(flag.original_hash.created_at)}</p>
                      {flag.original_hash.file_url !== 'DUPLICATE_FLAGGED' && (
                        <Button size="sm" variant="outline" className="mt-2" asChild>
                          <a href={flag.original_hash.file_url} target="_blank" rel="noopener noreferrer">
                            <Eye className="h-4 w-4 mr-1" />
                            View Image
                            <ExternalLink className="h-3 w-3 ml-1" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Duplicate Submission</h4>
                    <div className="p-3 bg-red-50 rounded border border-red-200">
                      <p><strong>User ID:</strong> {flag.duplicate_hash.user_id}</p>
                      <p><strong>Task ID:</strong> {flag.duplicate_hash.task_id || 'N/A'}</p>
                      <p><strong>Submitted:</strong> {formatDate(flag.duplicate_hash.created_at)}</p>
                      {flag.duplicate_hash.file_url !== 'DUPLICATE_FLAGGED' && (
                        <Button size="sm" variant="outline" className="mt-2" asChild>
                          <a href={flag.duplicate_hash.file_url} target="_blank" rel="noopener noreferrer">
                            <Eye className="h-4 w-4 mr-1" />
                            View Image
                            <ExternalLink className="h-3 w-3 ml-1" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

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
                        onClick={() => handleMarkAsReviewed(flag.id)}
                        size="sm"
                      >
                        Mark as Reviewed
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
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
