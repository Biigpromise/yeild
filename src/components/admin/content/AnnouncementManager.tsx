
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { adminContentService, Announcement } from "@/services/admin/adminContentService";
import { Megaphone, Plus, Trash2, Send, Eye } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export const AnnouncementManager = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    content: '',
    type: 'info' as const,
    targetAudience: 'all' as const
  });

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    setLoading(true);
    try {
      const data = await adminContentService.getAnnouncements();
      setAnnouncements(data);
    } catch (error) {
      console.error('Error loading announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAnnouncement = async () => {
    if (!newAnnouncement.title || !newAnnouncement.content) {
      toast({
        title: "Error",
        description: "Please fill in both title and content.",
        variant: "destructive",
      });
      return;
    }

    const success = await adminContentService.createAnnouncement({
      ...newAnnouncement,
      isActive: true
    });

    if (success) {
      setNewAnnouncement({
        title: '',
        content: '',
        type: 'info',
        targetAudience: 'all'
      });
      loadAnnouncements();
    }
  };

  const handleBroadcast = async (announcementId: string, targetAudience: string) => {
    await adminContentService.broadcastAnnouncement(announcementId, targetAudience);
  };

  const handleDelete = async (announcementId: string) => {
    const success = await adminContentService.deleteAnnouncement(announcementId);
    if (success) {
      loadAnnouncements();
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'info': return 'bg-blue-100 text-blue-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'success': return 'bg-green-100 text-green-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create New Announcement
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="Announcement title"
              value={newAnnouncement.title}
              onChange={(e) => setNewAnnouncement({...newAnnouncement, title: e.target.value})}
            />
            <Select
              value={newAnnouncement.type}
              onValueChange={(value: any) => setNewAnnouncement({...newAnnouncement, type: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="info">Information</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="error">Error</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Select
            value={newAnnouncement.targetAudience}
            onValueChange={(value: any) => setNewAnnouncement({...newAnnouncement, targetAudience: value})}
          >
            <SelectTrigger>
              <SelectValue placeholder="Target audience" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Users</SelectItem>
              <SelectItem value="active">Active Users</SelectItem>
              <SelectItem value="new">New Users</SelectItem>
              <SelectItem value="inactive">Inactive Users</SelectItem>
            </SelectContent>
          </Select>

          <Textarea
            placeholder="Announcement content"
            value={newAnnouncement.content}
            onChange={(e) => setNewAnnouncement({...newAnnouncement, content: e.target.value})}
            rows={4}
          />

          <Button onClick={handleCreateAnnouncement} className="w-full">
            <Megaphone className="h-4 w-4 mr-2" />
            Create & Broadcast Announcement
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Previous Announcements</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Loading announcements...</div>
          ) : announcements.length === 0 ? (
            <Alert>
              <AlertDescription>No announcements found.</AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              {announcements.map((announcement) => (
                <Card key={announcement.id} className="border">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{announcement.title}</h3>
                          <Badge className={getTypeColor(announcement.type)}>
                            {announcement.type}
                          </Badge>
                          <Badge variant="outline">
                            {announcement.targetAudience}
                          </Badge>
                          {announcement.isActive && (
                            <Badge variant="default">Active</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {announcement.content}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Created: {new Date(announcement.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleBroadcast(announcement.id, announcement.targetAudience)}
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(announcement.id)}
                        >
                          <Trash2 className="h-4 w-4" />
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
