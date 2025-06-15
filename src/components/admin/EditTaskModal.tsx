
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { toast } from "sonner";
import { Task } from "@/services/taskService";

interface EditTaskModalProps {
  open: boolean;
  onClose: () => void;
  task: Task | null;
  onTaskUpdated: () => void;
}

const difficulties = [
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" }
];
const statuses = [
  { value: "active", label: "Active" },
  { value: "draft", label: "Draft" },
  { value: "paused", label: "Paused" },
  { value: "completed", label: "Completed" },
];

export const EditTaskModal: React.FC<EditTaskModalProps> = ({ open, onClose, task, onTaskUpdated }) => {
  const [form, setForm] = useState<Task | null>(task);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    setForm(task);
  }, [task]);

  if (!form) return null;

  const handleChange = (field: keyof Task, value: any) => {
    setForm(prev =>
      prev ? { ...prev, [field]: value } : prev
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // POST/PATCH to Supabase - basic task fields
      const { supabase } = await import("@/integrations/supabase/client");
      const { error } = await supabase
        .from("tasks")
        .update({
          title: form.title,
          description: form.description,
          category: form.category,
          points: form.points,
          difficulty: form.difficulty,
          status: form.status,
          estimated_time: form.estimated_time,
          brand_name: form.brand_name,
          brand_logo_url: form.brand_logo_url,
          expires_at: form.expires_at,
          task_type: form.task_type,
        })
        .eq("id", form.id);

      if (error) {
        toast.error("Failed to update task");
      } else {
        toast.success("Task updated");
        onTaskUpdated();
        onClose();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={open => { if (!open) onClose(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input label="Title" value={form.title} onChange={e => handleChange("title", e.target.value)} required />
          <Textarea label="Description" value={form.description ?? ""} onChange={e => handleChange("description", e.target.value)} />
          <Input label="Category" value={form.category ?? ""} onChange={e => handleChange("category", e.target.value)} />
          <Input label="Points" type="number" value={form.points} onChange={e => handleChange("points", Number(e.target.value))} min={1} />
          <Select value={form.difficulty ?? ""} onValueChange={value => handleChange("difficulty", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Difficulty" />
            </SelectTrigger>
            <SelectContent>
              {difficulties.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={form.status ?? ""} onValueChange={value => handleChange("status", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {statuses.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input label="Brand Name" value={form.brand_name ?? ""} onChange={e => handleChange("brand_name", e.target.value)} />
          <Input label="Brand Logo URL" value={form.brand_logo_url ?? ""} onChange={e => handleChange("brand_logo_url", e.target.value)} />
          <Input label="Estimated Time" value={form.estimated_time ?? ""} onChange={e => handleChange("estimated_time", e.target.value)} />
          <Input label="Expires At" type="datetime-local"
            value={form.expires_at ? new Date(form.expires_at).toISOString().slice(0, 16) : ""}
            onChange={e => handleChange("expires_at", e.target.value ? new Date(e.target.value).toISOString() : "")}
          />
          <Input label="Task Type" value={form.task_type ?? ""} onChange={e => handleChange("task_type", e.target.value)} />
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Save Changes"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
