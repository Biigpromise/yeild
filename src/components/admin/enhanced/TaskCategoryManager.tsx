
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

export const TaskCategoryManager = () => {
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

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await enhancedTaskManagementService.getTaskCategories();
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
    
    if (!formData.name) {
      toast.error("Category name is required");
      return;
    }

    try {
      let success;
      if (editingCategory) {
        success = await enhancedTaskManagementService.updateTaskCategory(editingCategory.id, formData);
      } else {
        success = await enhancedTaskManagementService.createTaskCategory(formData);
      }

      if (success) {
        loadCategories();
        resetForm();
        setIsDialogOpen(false);
      }
    } catch (error) {
      console.error("Error saving category:", error);
    }
  };

  const handleEdit = (category: any) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || "",
      icon: category.icon || "",
      color: category.color || "#3B82F6"
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (categoryId: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;
    
    try {
      const success = await enhancedTaskManagementService.deleteTaskCategory(categoryId);
      if (success) {
        loadCategories();
      }
    } catch (error) {
      console.error("Error deleting category:", error);
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
    resetForm();
    setIsDialogOpen(true);
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
            <Button onClick={handleCreateNew}>
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
                      {new Date(category.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleEdit(category)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleDelete(category.id)}
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
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Enter category description"
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Icon</label>
                <Input
                  value={formData.icon}
                  onChange={(e) => setFormData({...formData, icon: e.target.value})}
                  placeholder="e.g., 📱, 🎮, 💰"
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
                  />
                  <Input
                    value={formData.color}
                    onChange={(e) => setFormData({...formData, color: e.target.value})}
                    placeholder="#3B82F6"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editingCategory ? "Update Category" : "Create Category"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};
