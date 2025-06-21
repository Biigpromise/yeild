
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Settings, Play, Pause, Trash2, Copy } from "lucide-react";
import { enhancedTaskManagementService } from "@/services/admin/enhancedTaskManagementService";

interface BulkTaskOperationsProps {
  tasks: any[];
  onTasksUpdated: () => void;
}

export const BulkTaskOperations: React.FC<BulkTaskOperationsProps> = ({
  tasks,
  onTasksUpdated
}) => {
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [bulkOperation, setBulkOperation] = useState<string>("");
  const [bulkPoints, setBulkPoints] = useState<string>("");
  const [bulkCategory, setBulkCategory] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleTaskSelection = (taskId: string, checked: boolean) => {
    if (checked) {
      setSelectedTasks(prev => [...prev, taskId]);
    } else {
      setSelectedTasks(prev => prev.filter(id => id !== taskId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTasks(tasks.map(task => task.id));
    } else {
      setSelectedTasks([]);
    }
  };

  const handleBulkOperation = async () => {
    if (selectedTasks.length === 0) {
      toast.error("Please select tasks to perform bulk operation");
      return;
    }

    if (!bulkOperation) {
      toast.error("Please select an operation");
      return;
    }

    setIsProcessing(true);
    try {
      let operationData: any = {};
      
      switch (bulkOperation) {
        case 'update_points':
          if (!bulkPoints || parseInt(bulkPoints) <= 0) {
            toast.error("Please enter valid points");
            setIsProcessing(false);
            return;
          }
          operationData = { points: parseInt(bulkPoints) };
          break;
        case 'update_category':
          if (!bulkCategory) {
            toast.error("Please select a category");
            setIsProcessing(false);
            return;
          }
          operationData = { category_id: bulkCategory };
          break;
      }

      const success = await enhancedTaskManagementService.performBulkTaskOperation({
        taskIds: selectedTasks,
        operation: bulkOperation as any,
        data: operationData
      });

      if (success) {
        onTasksUpdated();
        setSelectedTasks([]);
        setBulkOperation("");
        setBulkPoints("");
        setBulkCategory("");
        toast.success(`Bulk operation completed for ${selectedTasks.length} tasks`);
      }
    } catch (error) {
      console.error("Bulk operation error:", error);
      toast.error("Failed to perform bulk operation");
    } finally {
      setIsProcessing(false);
    }
  };

  const selectedTasksCount = selectedTasks.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Bulk Operations
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Task Selection */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={selectedTasks.length === tasks.length && tasks.length > 0}
              onCheckedChange={handleSelectAll}
            />
            <Label>Select All Tasks ({tasks.length})</Label>
            {selectedTasksCount > 0 && (
              <Badge variant="secondary">
                {selectedTasksCount} selected
              </Badge>
            )}
          </div>
          
          <div className="max-h-48 overflow-y-auto border rounded p-2 space-y-1">
            {tasks.map((task) => (
              <div key={task.id} className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={selectedTasks.includes(task.id)}
                  onCheckedChange={(checked) => handleTaskSelection(task.id, checked as boolean)}
                />
                <span className="flex-1 truncate">{task.title}</span>
                <Badge variant="outline" className="text-xs">
                  {task.points} pts
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Bulk Operations */}
        <div className="space-y-3">
          <div>
            <Label htmlFor="bulk-operation">Operation</Label>
            <Select value={bulkOperation} onValueChange={setBulkOperation}>
              <SelectTrigger>
                <SelectValue placeholder="Select operation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="activate">
                  <div className="flex items-center gap-2">
                    <Play className="h-4 w-4" />
                    Activate Tasks
                  </div>
                </SelectItem>
                <SelectItem value="deactivate">
                  <div className="flex items-center gap-2">
                    <Pause className="h-4 w-4" />
                    Deactivate Tasks
                  </div>
                </SelectItem>
                <SelectItem value="update_points">
                  <div className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Update Points
                  </div>
                </SelectItem>
                <SelectItem value="update_category">
                  <div className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Update Category
                  </div>
                </SelectItem>
                <SelectItem value="delete">
                  <div className="flex items-center gap-2">
                    <Trash2 className="h-4 w-4" />
                    Delete Tasks
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {bulkOperation === 'update_points' && (
            <div>
              <Label htmlFor="bulk-points">New Points Value</Label>
              <Input
                id="bulk-points"
                type="number"
                value={bulkPoints}
                onChange={(e) => setBulkPoints(e.target.value)}
                placeholder="Enter points"
                min="1"
              />
            </div>
          )}

          {bulkOperation === 'update_category' && (
            <div>
              <Label htmlFor="bulk-category">New Category</Label>
              <Select value={bulkCategory} onValueChange={setBulkCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="social_media">Social Media</SelectItem>
                  <SelectItem value="survey">Survey</SelectItem>
                  <SelectItem value="download">App Download</SelectItem>
                  <SelectItem value="review">Review</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <Button 
            onClick={handleBulkOperation}
            disabled={selectedTasksCount === 0 || !bulkOperation || isProcessing}
            className="w-full"
          >
            {isProcessing ? "Processing..." : `Apply to ${selectedTasksCount} Tasks`}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
