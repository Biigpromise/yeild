
import React from "react";
import { SearchInput } from "@/components/ui/search-input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TaskFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  selectedDifficulty: string;
  onDifficultyChange: (difficulty: string) => void;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  taskCounts: {
    available: number;
    in_progress: number;
    completed: number;
    total: number;
  };
  onClearFilters: () => void;
}

const TaskFilter: React.FC<TaskFilterProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedDifficulty,
  onDifficultyChange,
  selectedStatus,
  onStatusChange,
  taskCounts,
  onClearFilters,
}) => {
  const hasActiveFilters = selectedCategory !== "all" || selectedDifficulty !== "all" || selectedStatus !== "all" || searchQuery.length > 0;

  return (
    <div className="bg-card border rounded-lg p-4 mb-6 relative z-10">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="h-5 w-5 text-yeild-yellow" />
        <h3 className="text-lg font-semibold">Filter Tasks</h3>
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={onClearFilters}
            className="ml-auto"
          >
            <X className="h-4 w-4 mr-1" />
            Clear Filters
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <SearchInput
          placeholder="Search tasks..."
          value={searchQuery}
          onChange={onSearchChange}
          className="w-full"
        />

        <Select value={selectedCategory} onValueChange={onCategoryChange}>
          <SelectTrigger>
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="survey">Survey</SelectItem>
            <SelectItem value="app_testing">App Testing</SelectItem>
            <SelectItem value="content_creation">Content Creation</SelectItem>
            <SelectItem value="social_media">Social Media</SelectItem>
            <SelectItem value="research">Research</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedDifficulty} onValueChange={onDifficultyChange}>
          <SelectTrigger>
            <SelectValue placeholder="Difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Difficulties</SelectItem>
            <SelectItem value="easy">Easy</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="hard">Hard</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedStatus} onValueChange={onStatusChange}>
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tasks</SelectItem>
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-wrap gap-2">
        <Badge variant="outline" className="text-yeild-yellow border-yeild-yellow">
          Total: {taskCounts.total}
        </Badge>
        <Badge variant="outline" className="text-green-400 border-green-400">
          Available: {taskCounts.available}
        </Badge>
        <Badge variant="outline" className="text-blue-400 border-blue-400">
          In Progress: {taskCounts.in_progress}
        </Badge>
        <Badge variant="outline" className="text-purple-400 border-purple-400">
          Completed: {taskCounts.completed}
        </Badge>
      </div>
    </div>
  );
};

export default TaskFilter;
