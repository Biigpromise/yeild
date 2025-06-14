
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { adminContentService } from "@/services/admin/adminContentService";
import { CheckCircle, XCircle, Eye, Clock } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export const ContentModerationQueue = () => {
  const [moderationQueue, setModerationQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [moderationReason, setModerationReason] = useState<string>('');
  const [selectedContent, setSelectedContent] = useState<string>('');

  useEffect(() => {
    loadModerationQueue();
  }, []);

  const loadModerationQueue = async () => {
    try {
      const data = await adminContentService.getContentModerationQueue();
      setModerationQueue(data);
    } catch (error) {
      console.error('Error loading moderation queue:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleModerate = async (contentId: string, action: 'approve' | 'reject') => {
    const success = await adminContentService.moderateContent(
      contentId, 
      action, 
      action === 'reject' ? moderationReason : undefined
    );
    
    if (success) {
      setModerationReason('');
      setSelectedContent('');
      loadModerationQueue();
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading moderation queue...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Content Moderation Queue
          </CardTitle>
        </CardHeader>
        <CardContent>
          {moderationQueue.length === 0 ? (
            <Alert>
              <AlertDescription>No content pending moderation.</AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              {moderationQueue.map((item) => (
                <Card key={item.id} className="border">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Pending
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {item.type} • {item.submittedBy}
                          </span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {new Date(item.submittedAt).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-medium">{item.title}</h4>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                        {item.evidence && (
                          <div className="p-2 bg-muted rounded text-sm">
                            <strong>Evidence:</strong> {item.evidence}
                          </div>
                        )}
                      </div>

                      {selectedContent === item.id && (
                        <div className="space-y-2">
                          <Textarea
                            placeholder="Enter moderation reason (required for rejection)"
                            value={moderationReason}
                            onChange={(e) => setModerationReason(e.target.value)}
                            rows={3}
                          />
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-green-600 hover:text-green-700"
                          onClick={() => handleModerate(item.id, 'approve')}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => {
                            if (selectedContent === item.id) {
                              handleModerate(item.id, 'reject');
                            } else {
                              setSelectedContent(item.id);
                              setModerationReason('');
                            }
                          }}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
