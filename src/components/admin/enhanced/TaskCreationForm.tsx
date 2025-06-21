
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { enhancedTaskManagementService } from "@/services/admin/enhancedTaskManagementService";
import { toast } from "sonner";
import { TaskFormFields } from "./TaskFormFields";
import { TaskCategorySelector } from "./TaskCategorySelector";
import { TaskSocialMediaLinks } from "./TaskSocialMediaLinks";
import { validateTaskForm, prepareTaskData, TaskFormData } from "./TaskFormValidation";
import { useSimpleFormPersistence } from "@/hooks/useSimpleFormPersistence";

interface TaskCreationFormProps {
  taskToEdit?: any;
  onTaskCreated: () => void;
  onCancel: () => void;
  initialData?: any;
}

const initialFormData: TaskFormData = {
  title: "",
  description: "",
  points: "",
  category_id: "",
  difficulty: "medium",
  brand_name: "",
  brand_logo_url: "",
  estimated_time: "",
  expires_at: "",
  status: "active",
  task_type: "general",
  social_media_links: {
    facebook: "",
    twitter: "",
    instagram: "",
    linkedin: "",
    youtube: "",
    tiktok: ""
  }
};

export const TaskCreationForm: React.FC<TaskCreationFormProps> = ({
  taskToEdit,
  onTaskCreated,
  onCancel,
  initialData
}) => {
  const [categories, setCategories] = useState<any[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [formData, setFormData] = useState<TaskFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Add form persistence
  const { clearDraft } = useSimpleFormPersistence({
    formData,
    setFormData,
    storageKey: taskToEdit ? `edit-task-${taskToEdit.id}` : 'create-task-draft',
    enabled: true,
    excludeKeys: ['social_media_links']
  });

  console.log('TaskCreationForm rendering');

  useEffect(() => {
    console.log('TaskCreationForm useEffect - loading categories');
    
    const loadCategories = async () => {
      try {
        setCategoriesLoading(true);
        console.log('Loading categories...');
        const data = await enhancedTaskManagementService.getTaskCategories();
        console.log('Categories loaded:', data);
        setCategories(data || []);
      } catch (error) {
        console.error("Error loading categories:", error);
        setCategories([]);
        console.log("Categories failed to load, continuing without them");
      } finally {
        setCategoriesLoading(false);
      }
    };

    loadCategories();
    
    // Apply initial data from template if provided
    if (initialData) {
      console.log('Applying initial data from template:', initialData);
      setFormData({
        ...initialFormData,
        title: initialData.title || "",
        description: initialData.description || "",
        points: initialData.points?.toString() || "",
        difficulty: initialData.difficulty || "medium",
        estimated_time: initialData.estimated_time || "",
        task_type: initialData.task_type || "general"
      });
    } else if (taskToEdit) {
      console.log('Setting form data for editing:', taskToEdit);
      setFormData({
        title: taskToEdit.title || "",
        description: taskToEdit.description || "",
        points: taskToEdit.points?.toString() || "",
        category_id: taskToEdit.category_id || "",
        difficulty: taskToEdit.difficulty || "medium",
        brand_name: taskToEdit.brand_name || "",
        brand_logo_url: taskToEdit.brand_logo_url || "",
        estimated_time: taskToEdit.estimated_time || "",
        expires_at: taskToEdit.expires_at ? new Date(taskToEdit.expires_at).toISOString().slice(0, 16) : "",
        status: taskToEdit.status || "active",
        task_type: taskToEdit.task_type || "general",
        social_media_links: taskToEdit.social_media_links || initialFormData.social_media_links,
      });
    }
  }, [taskToEdit, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Form submission started with data:', formData);
    
    if (!validateTaskForm(formData)) {
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('Creating/updating task with form data:', formData);
      
      const taskData = prepareTaskData(formData);
      console.log('Final task data:', taskData);

      let success;
      if (taskToEdit) {
        success = await enhancedTaskManagementService.updateTask(taskToEdit.id, taskData);
      } else {
        success = await enhancedTaskManagementService.createTask(taskData);
      }

      if (success) {
        console.log('Task operation successful');
        setFormData(initialFormData);
        clearDraft();
        onTaskCreated();
        // Toast is handled in the service now
      } else {
        console.error('Task operation failed');
        // Error toast is handled in the service
      }
    } catch (error) {
      console.error("Error saving task:", error);
      toast.error("Failed to save task. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    console.log(`Updating field ${field} with value:`, value);
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSocialLinkChange = (platform: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      social_media_links: {
        ...prev.social_media_links,
        [platform]: value
      }
    }));
  };

  const handleCancel = () => {
    clearDraft();
    onCancel();
  };

  console.log('Rendering TaskCreationForm with current form data:', formData);

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>
          {taskToEdit ? "Edit Task" : "Create New Task"}
        </CardTitle>
      </CardHeader>
      <CardContent>
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
            <Label htmlFor="description">Task Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe what users need to do to complete this task..."
              rows={4}
              required
            />
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : (taskToEdit ? "Update Task" : "Create Task")}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default TaskCreationForm;
