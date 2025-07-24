
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Eye, 
  Check, 
  X, 
  AlertTriangle, 
  Image, 
  MessageCircle, 
  Users,
  Filter,
  Search
} from 'lucide-react';
import { adminContentService } from '@/services/admin/adminContentService';

interface ContentItem {
  id: string;
  type: 'image' | 'text' | 'video' | 'comment';
  userId: string;
  userName: string;
  content: string;
  mediaUrl?: string;
  reportCount: number;
  reportReasons: string[];
  status: 'pending' | 'approved' | 'rejected' | 'flagged';
  severity: 'low' | 'medium' | 'high';
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewNotes?: string;
}

interface ModerationStats {
  totalPending: number;
  reviewedToday: number;
  approvalRate: number;
  avgReviewTime: number;
}

export const ContentModerationQueue: React.FC = () => {
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [moderationStats, setModerationStats] = useState<ModerationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');

  useEffect(() => {
    loadModerationData();
  }, []);

  const loadModerationData = async () => {
    try {
      setLoading(true);
      
      // Mock data - in real implementation, this would come from the content service
      const mockItems: ContentItem[] = [
        {
          id: '1',
          type: 'image',
          userId: 'user1',
          userName: 'John Doe',
          content: 'Task submission screenshot',
          mediaUrl: 'https://example.com/image1.jpg',
          reportCount: 3,
          reportReasons: ['Inappropriate content', 'Spam'],
          status: 'pending',
          severity: 'medium',
          submittedAt: new Date().toISOString(),
        },
        {
          id: '2',
          type: 'text',
          userId: 'user2',
          userName: 'Jane Smith',
          content: 'This is a comment that might be inappropriate...',
          reportCount: 1,
          reportReasons: ['Harassment'],
          status: 'pending',
          severity: 'high',
          submittedAt: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: '3',
          type: 'comment',
          userId: 'user3',
          userName: 'Bob Johnson',
          content: 'Great task! Really enjoyed working on this.',
          reportCount: 0,
          reportReasons: [],
          status: 'approved',
          severity: 'low',
          submittedAt: new Date(Date.now() - 7200000).toISOString(),
          reviewedAt: new Date(Date.now() - 3600000).toISOString(),
          reviewedBy: 'Admin',
          reviewNotes: 'Positive feedback, approved'
        }
      ];

      setContentItems(mockItems);
      setModerationStats({
        totalPending: mockItems.filter(item => item.status === 'pending').length,
        reviewedToday: 25,
        approvalRate: 78,
        avgReviewTime: 15
      });
    } catch (error) {
      console.error('Error loading moderation data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleModerateContent = async (
    contentId: string, 
    action: 'approve' | 'reject', 
    notes: string
  ) => {
    try {
      await adminContentService.moderateContent(contentId, action, notes);
      
      setContentItems(prev =>
        prev.map(item =>
          item.id === contentId
            ? {
                ...item,
                status: action === 'approve' ? 'approved' : 'rejected',
                reviewedAt: new Date().toISOString(),
                reviewedBy: 'Admin',
                reviewNotes: notes
              }
            : item
        )
      );
      
      setSelectedItem(null);
      setReviewNotes('');
    } catch (error) {
      console.error('Error moderating content:', error);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'approved': return 'bg-green-500';
      case 'rejected': return 'bg-red-500';
      case 'flagged': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'image': return <Image className="h-4 w-4" />;
      case 'text': return <MessageCircle className="h-4 w-4" />;
      case 'video': return <Eye className="h-4 w-4" />;
      case 'comment': return <MessageCircle className="h-4 w-4" />;
      default: return <Eye className="h-4 w-4" />;
    }
  };

  const filteredItems = contentItems.filter(item => {
    if (activeTab === 'pending') return item.status === 'pending';
    if (activeTab === 'approved') return item.status === 'approved';
    if (activeTab === 'rejected') return item.status === 'rejected';
    return true;
  });

  if (loading) {
    return <div className="flex justify-center p-8">Loading moderation queue...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{moderationStats?.totalPending || 0}</div>
            <p className="text-xs text-muted-foreground">Awaiting moderation</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reviewed Today</CardTitle>
            <Check className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{moderationStats?.reviewedToday || 0}</div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approval Rate</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{moderationStats?.approvalRate || 0}%</div>
            <p className="text-xs text-muted-foreground">This week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Review Time</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{moderationStats?.avgReviewTime || 0}m</div>
            <p className="text-xs text-muted-foreground">Per item</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pending">Pending ({contentItems.filter(i => i.status === 'pending').length})</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
          <TabsTrigger value="all">All Content</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          <Card>
            <CardHeader>
              <CardTitle>Content Moderation Queue</CardTitle>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
                <Button size="sm" variant="outline">
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Content</TableHead>
                    <TableHead>Reports</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getTypeIcon(item.type)}
                          <span className="capitalize">{item.type}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{item.userName}</TableCell>
                      <TableCell className="max-w-xs truncate">{item.content}</TableCell>
                      <TableCell>
                        <Badge variant={item.reportCount > 0 ? 'destructive' : 'outline'}>
                          {item.reportCount}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getSeverityColor(item.severity)}>
                          {item.severity}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(item.status)}>
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(item.submittedAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedItem(item)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Review
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Content Review</DialogTitle>
                            </DialogHeader>
                            {selectedItem && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="text-sm font-medium">User</label>
                                    <p>{selectedItem.userName}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Type</label>
                                    <p className="capitalize">{selectedItem.type}</p>
                                  </div>
                                </div>
                                
                                <div>
                                  <label className="text-sm font-medium">Content</label>
                                  <p className="mt-1 p-3 bg-muted rounded">{selectedItem.content}</p>
                                </div>

                                {selectedItem.mediaUrl && (
                                  <div>
                                    <label className="text-sm font-medium">Media</label>
                                    <img 
                                      src={selectedItem.mediaUrl} 
                                      alt="Content" 
                                      className="mt-1 max-w-full h-48 object-cover rounded"
                                    />
                                  </div>
                                )}

                                {selectedItem.reportReasons.length > 0 && (
                                  <div>
                                    <label className="text-sm font-medium">Report Reasons</label>
                                    <div className="flex flex-wrap gap-2 mt-1">
                                      {selectedItem.reportReasons.map((reason, index) => (
                                        <Badge key={index} variant="outline">{reason}</Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                <div>
                                  <label className="text-sm font-medium">Review Notes</label>
                                  <Textarea
                                    value={reviewNotes}
                                    onChange={(e) => setReviewNotes(e.target.value)}
                                    placeholder="Add review notes..."
                                    className="mt-1"
                                  />
                                </div>

                                {selectedItem.status === 'pending' && (
                                  <div className="flex gap-2 pt-4">
                                    <Button
                                      onClick={() => handleModerateContent(selectedItem.id, 'approve', reviewNotes)}
                                      className="bg-green-500 hover:bg-green-600"
                                    >
                                      <Check className="h-4 w-4 mr-2" />
                                      Approve
                                    </Button>
                                    <Button
                                      onClick={() => handleModerateContent(selectedItem.id, 'reject', reviewNotes)}
                                      variant="destructive"
                                    >
                                      <X className="h-4 w-4 mr-2" />
                                      Reject
                                    </Button>
                                  </div>
                                )}
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
