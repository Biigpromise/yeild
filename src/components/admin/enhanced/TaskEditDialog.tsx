
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { TaskFormFields } from "./TaskFormFields";
import { TaskCategorySelector } from "./TaskCategorySelector";
import { TaskSocialMediaLinks } from "./TaskSocialMediaLinks";
import { validateTaskForm, prepareTaskData, TaskFormData } from "./TaskFormValidation";
import { enhancedTaskManagementService } from "@/services/admin/enhancedTaskManagementService";

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
        const data = await enhancedTaskManagementService.getTaskCategories();
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
    
    if (!formData || !validateTaskForm(formData)) {
      return;
    }

    setIsSubmitting(true);
    try {
      const taskData = prepareTaskData(formData);
      const success = await enhancedTaskManagementService.updateTask(task.id, taskData);

      if (success) {
        onTaskUpdated();
        onClose();
        toast.success("Task updated successfully!");
      } else {
        toast.error("Failed to update task. Please try again.");
      }
    } catch (error) {
      console.error("Error updating task:", error);
      toast.error("Failed to update task. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    if (formData) {
      setFormData(prev => prev ? ({ ...prev, [field]: value }) : null);
    }
  };

  const handleSocialLinkChange = (platform: string, value: string) => {
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
          <DialogTitle>Edit Task</DialogTitle>
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
          
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
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
