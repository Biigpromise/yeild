
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { Plus, Edit, Trash } from "lucide-react";

type Announcement = {
  id: string;
  title: string;
  content: string;
  date: string;
  active: boolean;
};

export const AdminAnnouncements = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([
    {
      id: "1",
      title: "Platform Maintenance",
      content: "We will be performing maintenance on our servers this weekend. Please expect some downtime.",
      date: "2025-05-15",
      active: true,
    },
    {
      id: "2",
      title: "New Feature Release",
      content: "We're excited to announce our new dashboard features will be released next week!",
      date: "2025-05-20",
      active: false,
    },
  ]);

  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const handleCreateNew = () => {
    setIsCreating(true);
    setTitle("");
    setContent("");
    setEditingId(null);
  };

  const handleEdit = (announcement: Announcement) => {
    setIsCreating(false);
    setEditingId(announcement.id);
    setTitle(announcement.title);
    setContent(announcement.content);
  };

  const handleSave = () => {
    if (!title.trim() || !content.trim()) {
      toast({
        title: "Error",
        description: "Title and content are required",
        variant: "destructive",
      });
      return;
    }

    if (isCreating) {
      const newAnnouncement: Announcement = {
        id: Date.now().toString(),
        title,
        content,
        date: new Date().toISOString().split('T')[0],
        active: true,
      };

      setAnnouncements([newAnnouncement, ...announcements]);
      toast({
        title: "Success",
        description: "Announcement created successfully",
      });
    } else if (editingId) {
      setAnnouncements(
        announcements.map((a) =>
          a.id === editingId ? { ...a, title, content } : a
        )
      );
      toast({
        title: "Success",
        description: "Announcement updated successfully",
      });
    }

    setIsCreating(false);
    setEditingId(null);
    setTitle("");
    setContent("");
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingId(null);
    setTitle("");
    setContent("");
  };

  const handleDelete = (id: string) => {
    setAnnouncements(announcements.filter((a) => a.id !== id));
    toast({
      title: "Success",
      description: "Announcement deleted successfully",
    });
  };

  const toggleActive = (id: string) => {
    setAnnouncements(
      announcements.map((a) =>
        a.id === id ? { ...a, active: !a.active } : a
      )
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Announcement Management</h3>
        {!isCreating && !editingId && (
          <Button onClick={handleCreateNew} className="flex items-center gap-1">
            <Plus className="h-4 w-4" />
            <span>Create New</span>
          </Button>
        )}
      </div>

      {(isCreating || editingId) && (
        <Card className="p-4">
          <h4 className="text-md font-medium mb-4">
            {isCreating ? "Create New Announcement" : "Edit Announcement"}
          </h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="title">
                Title
              </label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter announcement title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="content">
                Content
              </label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter announcement content"
                rows={4}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button onClick={handleSave}>Save</Button>
            </div>
          </div>
        </Card>
      )}

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Content</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {announcements.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4">
                  No announcements found
                </TableCell>
              </TableRow>
            ) : (
              announcements.map((announcement) => (
                <TableRow key={announcement.id}>
                  <TableCell className="font-medium">{announcement.title}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    {announcement.content}
                  </TableCell>
                  <TableCell>{announcement.date}</TableCell>
                  <TableCell>
                    <Button
                      variant={announcement.active ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleActive(announcement.id)}
                      className="w-20"
                    >
                      {announcement.active ? "Active" : "Inactive"}
                    </Button>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(announcement)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(announcement.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
