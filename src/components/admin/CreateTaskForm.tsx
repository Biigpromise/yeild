import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { taskService, TaskCategory } from "@/services/taskService";
import { toast } from "sonner";

interface CreateTaskFormProps {
  onTaskCreated: () => void;
}

export const CreateTaskForm: React.FC<CreateTaskFormProps> = ({ onTaskCreated }) => {
  const [categories, setCategories] = useState<TaskCategory[]>([]);
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

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await taskService.getCategories();
      setCategories(data);
    } catch (error) {
      console.error("Error loading categories:", error);
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Task</CardTitle>
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
                <Select value={formData.category_id} onValueChange={(value) => handleInputChange('category_id', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.filter(c => c && c.id).map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
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
          
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline">
              Save as Draft
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create & Publish Task"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
