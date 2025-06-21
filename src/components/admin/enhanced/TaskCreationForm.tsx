
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { enhancedTaskManagementService } from "@/services/admin/enhancedTaskManagementService";
import { toast } from "sonner";
import { CalendarIcon, ImageIcon, DollarSign, Facebook, Twitter, Instagram, Linkedin, Youtube } from "lucide-react";

interface TaskCreationFormProps {
  taskToEdit?: any;
  onTaskCreated: () => void;
  onCancel: () => void;
}

const initialFormData = {
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
    youtube: ""
  }
};

export const TaskCreationForm: React.FC<TaskCreationFormProps> = ({
  taskToEdit,
  onTaskCreated,
  onCancel
}) => {
  const [categories, setCategories] = useState<any[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [formData, setFormData] = useState(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formMounted, setFormMounted] = useState(false);

  useEffect(() => {
    console.log('TaskCreationForm mounted');
    setFormMounted(true);
    
    // Load categories in the background, but don't block the form
    loadCategoriesAsync();
    
    if (taskToEdit) {
      console.log('Editing task:', taskToEdit);
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
    } else {
      setFormData(initialFormData);
    }
  }, [taskToEdit]);

  const loadCategoriesAsync = async () => {
    try {
      setCategoriesLoading(true);
      console.log('Loading categories...');
      const data = await enhancedTaskManagementService.getTaskCategories();
      console.log('Categories loaded:', data);
      setCategories(data || []);
    } catch (error: any) {
      console.error("Error loading categories:", error);
      // Don't show error toast for categories since they're optional
      setCategories([]);
    } finally {
      setCategoriesLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Form submission started');
    
    // Basic validation
    if (!formData.title?.trim()) {
      toast.error("Task title is required");
      return;
    }

    if (!formData.description?.trim()) {
      toast.error("Task description is required");
      return;
    }

    if (!formData.points || parseInt(formData.points) <= 0) {
      toast.error("Points must be greater than 0");
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('Creating task with form data:', formData);
      
      // Prepare social media links
      const socialLinks = Object.entries(formData.social_media_links)
        .filter(([_, value]) => value && value.trim() !== '')
        .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {});

      // Prepare task data
      const taskData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        points: parseInt(formData.points),
        difficulty: formData.difficulty || 'medium',
        brand_name: formData.brand_name?.trim() || null,
        brand_logo_url: formData.brand_logo_url?.trim() || null,
        estimated_time: formData.estimated_time?.trim() || null,
        expires_at: formData.expires_at ? new Date(formData.expires_at).toISOString() : null,
        status: formData.status,
        task_type: formData.task_type,
        social_media_links: formData.task_type === 'social_media' && Object.keys(socialLinks).length > 0 ? socialLinks : null,
        category_id: formData.category_id && formData.category_id.trim() !== '' ? formData.category_id : null
      };

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
        onTaskCreated();
        toast.success(taskToEdit ? "Task updated successfully!" : "Task created successfully!");
      } else {
        console.error('Task operation failed');
        toast.error("Failed to save task. Please try again.");
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

  // Show loading state until form is mounted
  if (!formMounted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading Task Form...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const validCategories = categories.filter(category =>
    category &&
    category.id &&
    typeof category.id === 'string' &&
    category.id.trim() !== '' &&
    category.name &&
    typeof category.name === 'string' &&
    category.name.trim() !== ''
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>
          {taskToEdit ? "Edit Task" : "Create New Task"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Task Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter task title"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="points">Points Reward *</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="points"
                    type="number"
                    value={formData.points}
                    onChange={(e) => handleInputChange('points', e.target.value)}
                    placeholder="50"
                    min="1"
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="category">Category (Optional)</Label>
                <Select
                  value={formData.category_id}
                  onValueChange={(value) => handleInputChange('category_id', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No Category</SelectItem>
                    {categoriesLoading ? (
                      <SelectItem value="loading" disabled>Loading categories...</SelectItem>
                    ) : validCategories.length > 0 ? (
                      validCategories.map((category) => (
                        <SelectItem key={`category-${category.id}`} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-categories" disabled>No categories available</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="difficulty">Difficulty</Label>
                <Select value={formData.difficulty} onValueChange={(value) => handleInputChange('difficulty', value)}>
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
                <Label htmlFor="task_type">Task Type</Label>
                <Select value={formData.task_type} onValueChange={(value) => handleInputChange('task_type', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select task type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="social_media">Social Media</SelectItem>
                    <SelectItem value="survey">Survey</SelectItem>
                    <SelectItem value="review">Review</SelectItem>
                    <SelectItem value="download">App Download</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="brand_name">Brand Name (Optional)</Label>
                <Input
                  id="brand_name"
                  value={formData.brand_name}
                  onChange={(e) => handleInputChange('brand_name', e.target.value)}
                  placeholder="Brand or company name"
                />
              </div>
              
              <div>
                <Label htmlFor="brand_logo_url">Brand Logo URL (Optional)</Label>
                <div className="relative">
                  <ImageIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="brand_logo_url"
                    value={formData.brand_logo_url}
                    onChange={(e) => handleInputChange('brand_logo_url', e.target.value)}
                    placeholder="https://example.com/logo.png"
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="estimated_time">Estimated Time (Optional)</Label>
                <Input
                  id="estimated_time"
                  value={formData.estimated_time}
                  onChange={(e) => handleInputChange('estimated_time', e.target.value)}
                  placeholder="e.g., 5 minutes, 1 hour"
                />
              </div>
              
              <div>
                <Label htmlFor="expires_at">Expiration Date (Optional)</Label>
                <div className="relative">
                  <CalendarIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="expires_at"
                    type="datetime-local"
                    value={formData.expires_at}
                    onChange={(e) => handleInputChange('expires_at', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="status"
                  checked={formData.status === 'active'}
                  onCheckedChange={(checked) => handleInputChange('status', checked ? 'active' : 'draft')}
                />
                <Label htmlFor="status">Active Task</Label>
              </div>
            </div>
          </div>
          
          {formData.task_type === 'social_media' && (
            <div className="space-y-4">
              <Label>Social Media Links (Optional)</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <Facebook className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={formData.social_media_links.facebook}
                    onChange={(e) => handleSocialLinkChange('facebook', e.target.value)}
                    placeholder="Facebook URL"
                    className="pl-10"
                  />
                </div>
                <div className="relative">
                  <Twitter className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={formData.social_media_links.twitter}
                    onChange={(e) => handleSocialLinkChange('twitter', e.target.value)}
                    placeholder="Twitter URL"
                    className="pl-10"
                  />
                </div>
                <div className="relative">
                  <Instagram className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={formData.social_media_links.instagram}
                    onChange={(e) => handleSocialLinkChange('instagram', e.target.value)}
                    placeholder="Instagram URL"
                    className="pl-10"
                  />
                </div>
                <div className="relative">
                  <Linkedin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={formData.social_media_links.linkedin}
                    onChange={(e) => handleSocialLinkChange('linkedin', e.target.value)}
                    placeholder="LinkedIn URL"
                    className="pl-10"
                  />
                </div>
                <div className="relative">
                  <Youtube className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={formData.social_media_links.youtube}
                    onChange={(e) => handleSocialLinkChange('youtube', e.target.value)}
                    placeholder="YouTube URL"
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
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
            <Button type="button" variant="outline" onClick={onCancel}>
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
