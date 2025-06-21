
import React from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TaskCategorySelectorProps {
  categoryId: string;
  categories: any[];
  categoriesLoading: boolean;
  onCategoryChange: (value: string) => void;
}

export const TaskCategorySelector: React.FC<TaskCategorySelectorProps> = ({
  categoryId,
  categories,
  categoriesLoading,
  onCategoryChange
}) => {
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
    <div>
      <Label htmlFor="category">Category (Optional)</Label>
      <Select
        value={categoryId}
        onValueChange={onCategoryChange}
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
  );
};
