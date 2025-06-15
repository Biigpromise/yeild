
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { taskService, TaskCategory } from "@/services/taskService";
import { toast } from "sonner";
import { useSimpleFormPersistence } from "@/hooks/useSimpleFormPersistence"; // <-- NEW

interface CreateTaskFormProps {
  onTaskCreated: () => void;
}

// Set a key unique to admin/task create form.
const FORM_DRAFT_KEY = "adminCreateTaskDraft";

export const CreateTaskForm: React.FC<CreateTaskFormProps> = ({ onTaskCreated }) => {
  const [categories, setCategories] = useState<TaskCategory[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
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

  // Draft persistence for all fields except expires_at (leave in for now)
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
      setLoadError(null);
      const data = await taskService.getCategories();
      if (!data || data.length === 0) {
        setLoadError("No categories found. Please add at least one category via the admin dashboard.");
        setCategories([]);
      } else {
        setCategories(data);
      }
    } catch (error: any) {
      setLoadError("There was an error loading categories. Please check your permissions and database.");
      setCategories([]);
    } finally {
      setCategoriesLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.points || !formData.category_id) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const taskData = {
        ...formData,
        points: parseInt(formData.points),
        expires_at: formData.expires_at ? new Date(formData.expires_at).toISOString() : null,
        status: 'active'
      };
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
      clearDraft(); // <-- Clear the draft after successful creation
      onTaskCreated();
    } catch (error) {
      console.error("Error creating task:", error);
      toast.error("Failed to create task");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Filter and validate categories - ensure they have valid IDs and names
  const validCategories = categories.filter(category =>
    category &&
    category.id &&
    typeof category.id === 'string' &&
    category.id.trim() !== '' &&
    category.name &&
    typeof category.name === 'string' &&
    category.name.trim() !== ''
  );

  // Show warning if categories are still empty after load (and not due to error)
  const showCategoryEmptyWarning = !categoriesLoading && !loadError && validCategories.length === 0;

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
          {loadError && (
            <div className="mb-4 p-2 bg-red-50 text-red-600 border border-red-200 rounded text-center text-sm">
              {loadError}
            </div>
          )}
          {showCategoryEmptyWarning && (
            <div className="mb-4 p-2 bg-yellow-50 text-yellow-700 border border-yellow-300 rounded text-center text-sm">
              No categories found. Please add one in "Task Categories" before creating a task.
            </div>
          )}
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
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category_id}
                    onValueChange={(value) => handleInputChange('category_id', value)}
                    disabled={categoriesLoading || !!loadError || validCategories.length === 0}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={
                        categoriesLoading
                          ? "Loading categories..."
                          : (loadError
                              ? "Failed to load"
                              : (validCategories.length === 0
                                  ? "No categories available"
                                  : "Select category"))
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      {categoriesLoading ? (
                        <SelectItem value="loading-placeholder" disabled>
                          Loading categories...
                        </SelectItem>
                      ) : loadError ? (
                        <SelectItem value="error" disabled>
                          {loadError}
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
              </div>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="brand_name">Brand Name</Label>
                  <Input
                    id="brand_name"
                    value={formData.brand_name}
                    onChange={(e) => handleInputChange('brand_name', e.target.value)}
                    placeholder="Brand or company name"
                  />
                </div>

                <div>
                  <Label htmlFor="brand_logo_url">Brand Logo URL</Label>
                  <Input
                    id="brand_logo_url"
                    value={formData.brand_logo_url}
                    onChange={(e) => handleInputChange('brand_logo_url', e.target.value)}
                    placeholder="https://example.com/logo.png"
                  />
                </div>

                <div>
                  <Label htmlFor="estimated_time">Estimated Time</Label>
                  <Input
                    id="estimated_time"
                    value={formData.estimated_time}
                    onChange={(e) => handleInputChange('estimated_time', e.target.value)}
                    placeholder="e.g., 5 minutes, 1 hour"
                  />
                </div>

                <div>
                  <Label htmlFor="expires_at">Expiration Date</Label>
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
                  // Manually show a toast to confirm saved!
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
