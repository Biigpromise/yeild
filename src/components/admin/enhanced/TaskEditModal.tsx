
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Task {
  id: string;
  title: string;
  description: string;
  points: number;
  difficulty: string;
  category: string;
  status: string;
  estimated_time: string;
}

interface TaskEditModalProps {
  open: boolean;
  onClose: () => void;
  taskId?: string;
  onTaskUpdated?: () => void;
}

export const TaskEditModal: React.FC<TaskEditModalProps> = ({ 
  open, 
  onClose, 
  taskId, 
  onTaskUpdated 
}) => {
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open && taskId) {
      loadTask();
    }
  }, [open, taskId]);

  const loadTask = async () => {
    if (!taskId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', taskId)
        .single();

      if (error) throw error;
      setTask(data);
    } catch (error) {
      console.error('Error loading task:', error);
      toast.error('Failed to load task');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!task || !taskId) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('tasks')
        .update({
          title: task.title,
          description: task.description,
          points: task.points,
          difficulty: task.difficulty,
          category: task.category,
          status: task.status,
          estimated_time: task.estimated_time,
          updated_at: new Date().toISOString()
        })
        .eq('id', taskId);

      if (error) throw error;

      toast.success('Task updated successfully');
      onTaskUpdated?.();
      onClose();
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
        </DialogHeader>
        
        {loading ? (
          <div className="py-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading task...</p>
          </div>
        ) : task ? (
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={task.title}
                onChange={(e) => setTask({ ...task, title: e.target.value })}
                placeholder="Task title"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={task.description || ''}
                onChange={(e) => setTask({ ...task, description: e.target.value })}
                placeholder="Task description"
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="points">Points</Label>
                <Input
                  id="points"
                  type="number"
                  value={task.points}
                  onChange={(e) => setTask({ ...task, points: parseInt(e.target.value) || 0 })}
                  min="0"
                />
              </div>

              <div>
                <Label htmlFor="estimated_time">Estimated Time</Label>
                <Input
                  id="estimated_time"
                  value={task.estimated_time || ''}
                  onChange={(e) => setTask({ ...task, estimated_time: e.target.value })}
                  placeholder="e.g., 30 minutes"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="difficulty">Difficulty</Label>
                <Select
                  value={task.difficulty || ''}
                  onValueChange={(value) => setTask({ ...task, difficulty: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={task.status || ''}
                  onValueChange={(value) => setTask({ ...task, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={task.category || ''}
                onChange={(e) => setTask({ ...task, category: e.target.value })}
                placeholder="Task category"
              />
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            No task selected
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          {task && (
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
