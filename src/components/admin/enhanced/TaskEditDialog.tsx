
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { TaskFormFields } from "./TaskFormFields";
import { TaskCategorySelector } from "./TaskCategorySelector";
import { TaskSocialMediaLinks } from "./TaskSocialMediaLinks";
import { validateTaskForm, prepareTaskData, TaskFormData } from "./TaskFormValidation";
import { supabase } from "@/integrations/supabase/client";

interface TaskEditDialogProps {
  task: any;
  isOpen: boolean;
  onClose: () => void;
  onTaskUpdated: () => void;
}

export const TaskEditDialog: React.FC<TaskEditDialogProps> = ({
  task,
  isOpen,
  onClose,
  onTaskUpdated
}) => {
  const [categories, setCategories] = useState<any[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [formData, setFormData] = useState<TaskFormData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setCategoriesLoading(true);
        const { data, error } = await supabase
          .from('task_categories')
          .select('*')
          .order('name');

        if (error) throw error;
        setCategories(data || []);
      } catch (error) {
        console.error("Error loading categories:", error);
        setCategories([]);
      } finally {
        setCategoriesLoading(false);
      }
    };

    if (isOpen) {
      loadCategories();
      
      if (task) {
        console.log('Setting form data for task edit:', task);
        setFormData({
          title: task.title || "",
          description: task.description || "",
          points: task.points?.toString() || "",
          category_id: task.category_id || "",
          difficulty: task.difficulty || "medium",
          brand_name: task.brand_name || "",
          brand_logo_url: task.brand_logo_url || "",
          estimated_time: task.estimated_time || "",
          expires_at: task.expires_at ? new Date(task.expires_at).toISOString().slice(0, 16) : "",
          status: task.status || "active",
          task_type: task.task_type || "general",
          social_media_links: task.social_media_links || {
            facebook: "",
            twitter: "",
            instagram: "",
            linkedin: "",
            youtube: ""
          }
        });
      }
    }
  }, [isOpen, task]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Task edit form submission started');
    console.log('Form data:', formData);
    console.log('Task to update:', task);
    
    if (!formData || !validateTaskForm(formData)) {
      console.error('Form validation failed');
      return;
    }

    if (!task?.id) {
      console.error('No task ID found');
      toast.error("No task ID found");
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('Preparing task data for update...');
      const taskData = prepareTaskData(formData);
      console.log('Prepared task data:', taskData);
      
      // Update task directly using Supabase
      const { data, error } = await supabase
        .from('tasks')
        .update(taskData)
        .eq('id', task.id)
        .select()
        .single();

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      console.log('Task updated successfully:', data);
      onTaskUpdated();
      onClose();
      toast.success("Task updated successfully!");
    } catch (error) {
      console.error("Error updating task:", error);
      const errorMessage = error?.message || "Failed to update task. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    console.log(`Updating field ${field} with value:`, value);
    if (formData) {
      setFormData(prev => prev ? ({ ...prev, [field]: value }) : null);
    }
  };

  const handleSocialLinkChange = (platform: string, value: string) => {
    console.log(`Updating social link ${platform} with value:`, value);
    if (formData) {
      setFormData(prev => prev ? ({
        ...prev,
        social_media_links: {
          ...prev.social_media_links,
          [platform]: value
        }
      }) : null);
    }
  };

  if (!formData) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Task: {task?.title}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <TaskFormFields
            formData={formData}
            onInputChange={handleInputChange}
          />
          
          <TaskCategorySelector
            categoryId={formData.category_id}
            categories={categories}
            categoriesLoading={categoriesLoading}
            onCategoryChange={(value) => handleInputChange('category_id', value)}
          />
          
          {formData.task_type === 'social_media' && (
            <TaskSocialMediaLinks
              socialLinks={formData.social_media_links}
              onSocialLinkChange={handleSocialLinkChange}
            />
          )}
          
          <div>
            <Label htmlFor="edit-description">Task Description *</Label>
            <Textarea
              id="edit-description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe what users need to do to complete this task..."
              rows={4}
              required
            />
          </div>
          
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Update Task"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
