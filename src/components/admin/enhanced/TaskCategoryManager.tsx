
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { enhancedTaskManagementService } from "@/services/admin/enhancedTaskManagementService";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Palette } from "lucide-react";

interface TaskCategoryManagerProps {
  onCategoryUpdated?: () => void;
}

export const TaskCategoryManager: React.FC<TaskCategoryManagerProps> = ({ onCategoryUpdated }) => {
  const [categories, setCategories] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    icon: "",
    color: "#3B82F6"
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      console.log('Loading categories...');
      const data = await enhancedTaskManagementService.getTaskCategories();
      console.log('Categories loaded:', data);
      setCategories(data);
    } catch (error) {
      console.error("Error loading categories:", error);
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted with data:', formData);
    
    if (!formData.name.trim()) {
      toast.error("Category name is required");
      return;
    }

    try {
      setSubmitting(true);
      
      const categoryData = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        icon: formData.icon.trim() || null,
        color: formData.color
      };

      console.log('Submitting category data:', categoryData);
      
      let success;
      if (editingCategory) {
        console.log('Updating category:', editingCategory.id);
        success = await enhancedTaskManagementService.updateTaskCategory(editingCategory.id, categoryData);
      } else {
        console.log('Creating new category');
        success = await enhancedTaskManagementService.createTaskCategory(categoryData);
      }

      console.log('Operation result:', success);

      if (success) {
        console.log('Category operation successful, reloading...');
        await loadCategories();
        resetForm();
        setIsDialogOpen(false);
        if (onCategoryUpdated) onCategoryUpdated();
        toast.success(editingCategory ? "Category updated successfully" : "Category created successfully");
      } else {
        console.error('Category operation failed');
        toast.error("Failed to save category");
      }
    } catch (error) {
      console.error("Error saving category:", error);
      toast.error("Failed to save category: " + (error?.message || 'Unknown error'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (category: any) => {
    console.log('Editing category:', category);
    setEditingCategory(category);
    setFormData({
      name: category.name || "",
      description: category.description || "",
      icon: category.icon || "",
      color: category.color || "#3B82F6"
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (categoryId: string) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;
    
    try {
      console.log('Deleting category:', categoryId);
      const success = await enhancedTaskManagementService.deleteTaskCategory(categoryId);
      if (success) {
        await loadCategories();
        if (onCategoryUpdated) onCategoryUpdated();
        toast.success("Category deleted successfully");
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Failed to delete category");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      icon: "",
      color: "#3B82F6"
    });
    setEditingCategory(null);
  };

  const handleCreateNew = () => {
    console.log('Creating new category');
    resetForm();
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    if (!submitting) {
      setIsDialogOpen(false);
      resetForm();
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading categories...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Task Categories</CardTitle>
            <Button onClick={handleCreateNew} disabled={submitting}>
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Color</TableHead>
                  <TableHead>Icon</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {category.description || "No description"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: category.color || "#3B82F6" }}
                        />
                        <span className="text-sm">{category.color || "#3B82F6"}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {category.icon ? (
                        <Badge variant="outline">{category.icon}</Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">No icon</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {category.created_at ? new Date(category.created_at).toLocaleDateString() : "N/A"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleEdit(category)}
                          disabled={submitting}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleDelete(category.id)}
                          disabled={submitting}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {categories.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                      No categories found. Create your first category to get started.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Category Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "Edit Category" : "Create New Category"}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Category Name *</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Enter category name"
                disabled={submitting}
                required
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Enter category description"
                rows={3}
                disabled={submitting}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Icon</label>
                <Input
                  value={formData.icon}
                  onChange={(e) => setFormData({...formData, icon: e.target.value})}
                  placeholder="e.g., 📱, 🎮, 💰"
                  disabled={submitting}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({...formData, color: e.target.value})}
                    className="w-10 h-10 rounded border"
                    disabled={submitting}
                  />
                  <Input
                    value={formData.color}
                    onChange={(e) => setFormData({...formData, color: e.target.value})}
                    placeholder="#3B82F6"
                    disabled={submitting}
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleDialogClose}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting 
                  ? "Saving..." 
                  : editingCategory 
                    ? "Update Category" 
                    : "Create Category"
                }
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};
