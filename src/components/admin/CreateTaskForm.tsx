
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { taskService, TaskCategory } from "@/services/taskService";
import { toast } from "sonner";
import { useSimpleFormPersistence } from "@/hooks/useSimpleFormPersistence";

interface CreateTaskFormProps {
  onTaskCreated: () => void;
}

const FORM_DRAFT_KEY = "adminCreateTaskDraft";

export const CreateTaskForm: React.FC<CreateTaskFormProps> = ({ onTaskCreated }) => {
  const [categories, setCategories] = useState<TaskCategory[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    points: "",
    category_id: "",
    difficulty: "",
    brand_name: "",
    brand_logo_url: "",
    estimated_time: "",
    expires_at: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { clearDraft } = useSimpleFormPersistence({
    formData,
    setFormData,
    storageKey: FORM_DRAFT_KEY,
    excludeKeys: [],
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setCategoriesLoading(true);
      const data = await taskService.getCategories();
      setCategories(data || []);
    } catch (error: any) {
      console.error("Error loading categories:", error);
      setCategories([]);
    } finally {
      setCategoriesLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields - category is now optional
    if (
      !formData.title.trim() ||
      !formData.description.trim() ||
      !formData.points ||
      formData.points === "0" ||
      isNaN(Number(formData.points))
    ) {
      toast.error("Please fill in all required fields (title, description, and points > 0)");
      return;
    }

    setIsSubmitting(true);
    try {
      const taskData = {
        ...formData,
        points: parseInt(formData.points, 10),
        expires_at: formData.expires_at ? new Date(formData.expires_at).toISOString() : null,
        status: 'active',
        // Only include category_id if it's selected
        ...(formData.category_id && { category_id: formData.category_id })
      };
      
      // Remove empty string values
      Object.keys(taskData).forEach(
        (k) => (taskData[k] === '' ? delete taskData[k] : undefined)
      );

      await taskService.admin.createTask(taskData);
      toast.success("Task created successfully!");
      setFormData({
        title: "",
        description: "",
        points: "",
        category_id: "",
        difficulty: "",
        brand_name: "",
        brand_logo_url: "",
        estimated_time: "",
        expires_at: ""
      });
      clearDraft();
      onTaskCreated();
    } catch (error: any) {
      console.error("Error creating task:", error);
      const message = error?.message || (typeof error === "string" ? error : "Failed to create task");
      toast.error(`Failed to create task: ${message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

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
    <div className="w-full flex justify-center items-center sm:p-4 p-0">
      <Card className="w-full max-w-2xl shadow-lg rounded-lg border sm:my-6 my-0 sm:p-6 p-0 bg-white">
        <CardHeader className="px-4 pt-4">
          <CardTitle>Create New Task</CardTitle>
        </CardHeader>
        <CardContent
          className="p-4 pt-0 overflow-y-auto"
          style={{ maxHeight: "80vh" }}
        >
          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Task Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter task title"
                  />
                </div>

                <div>
                  <Label htmlFor="points">Points Reward *</Label>
                  <Input
                    id="points"
                    type="number"
                    value={formData.points}
                    onChange={(e) => handleInputChange('points', e.target.value)}
                    placeholder="50"
                    min="1"
                  />
                </div>

                <div>
                  <Label htmlFor="category">Category (Optional)</Label>
                  <Select
                    value={formData.category_id}
                    onValueChange={(value) => handleInputChange('category_id', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={
                        categoriesLoading
                          ? "Loading categories..."
                          : validCategories.length === 0
                            ? "No categories available - task will have no category"
                            : "Select category (optional)"
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      {/* Add option to clear category selection */}
                      <SelectItem value="">No Category</SelectItem>
                      {categoriesLoading ? (
                        <SelectItem value="loading-placeholder" disabled>
                          Loading categories...
                        </SelectItem>
                      ) : validCategories.length > 0 ? (
                        validCategories.map((category) => (
                          <SelectItem key={`cat-${category.id}`} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-categories-placeholder" disabled>
                          No categories available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground mt-1">
                    Tasks can be created without a category
                  </p>
                </div>

                <div>
                  <Label htmlFor="difficulty">Difficulty (Optional)</Label>
                  <Select value={formData.difficulty} onValueChange={(value) => handleInputChange('difficulty', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select difficulty (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No Difficulty</SelectItem>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
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
                  <Input
                    id="brand_logo_url"
                    value={formData.brand_logo_url}
                    onChange={(e) => handleInputChange('brand_logo_url', e.target.value)}
                    placeholder="https://example.com/logo.png"
                  />
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
                  <Input
                    id="expires_at"
                    type="datetime-local"
                    value={formData.expires_at}
                    onChange={(e) => handleInputChange('expires_at', e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Task Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe what users need to do to complete this task..."
                rows={4}
              />
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
              <Button type="button" variant="outline" className="w-full sm:w-auto"
                onClick={() => {
                  toast.success("Draft saved! You can safely leave and come back to continue later.");
                }}>
                Save as Draft
              </Button>
              <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
                {isSubmitting ? "Creating..." : "Create & Publish Task"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
