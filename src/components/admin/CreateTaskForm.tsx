
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
import { BudgetEstimateCalculator } from "@/components/brand/BudgetEstimateCalculator";

interface CreateTaskFormProps {
  onTaskCreated: () => void;
}

const FORM_DRAFT_KEY = "adminCreateTaskDraft";

export const CreateTaskForm: React.FC<CreateTaskFormProps> = ({ onTaskCreated }) => {
  const [categories, setCategories] = useState<TaskCategory[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
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
      console.log('Loading categories for task creation...');
      const data = await taskService.getCategories();
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
    console.log('Submitting task with data:', formData);
    
    // Validate required fields - only title, description, and points are required
    const pointsValue = Number(formData.points);
    if (
      !formData.title.trim() ||
      !formData.description.trim() ||
      !formData.points ||
      isNaN(pointsValue) ||
      pointsValue < 300
    ) {
      toast.error("Please fill in all required fields. Minimum task value is 300 points.");
      return;
    }

    setIsSubmitting(true);
    try {
      const taskData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        points: parseInt(formData.points, 10),
        expires_at: formData.expires_at ? new Date(formData.expires_at).toISOString() : null,
        status: 'active',
        // Optional fields - only include if they have values
        ...(formData.category_id && formData.category_id !== 'none' && { category_id: formData.category_id }),
        ...(formData.difficulty && formData.difficulty !== 'none' && { difficulty: formData.difficulty }),
        ...(formData.brand_name?.trim() && { brand_name: formData.brand_name.trim() }),
        ...(formData.brand_logo_url?.trim() && { brand_logo_url: formData.brand_logo_url.trim() }),
        ...(formData.estimated_time?.trim() && { estimated_time: formData.estimated_time.trim() })
      };
      
      console.log('Final task data to submit:', taskData);

      const success = await taskService.admin.createTask(taskData);
      if (success) {
        // Reset form
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
      }
    } catch (error: any) {
      console.error("Error creating task:", error);
      // Error handling is done in the service
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    console.log(`Updating field ${field} with value:`, value);
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
    <div className="space-y-6">
      {/* Budget Calculator */}
      <BudgetEstimateCalculator />

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
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="points">Points Reward * (Min: 300)</Label>
                  <Input
                    id="points"
                    type="number"
                    value={formData.points}
                    onChange={(e) => handleInputChange('points', e.target.value)}
                    placeholder="300"
                    min="300"
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">Minimum 300 points per task</p>
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
                          : "Select category (optional)"
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Category</SelectItem>
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
                          No categories available (tasks can still be created)
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
                      <SelectItem value="none">No Difficulty</SelectItem>
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
                required
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
    </div>
  );
};
