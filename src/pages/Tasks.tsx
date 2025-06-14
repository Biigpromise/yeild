
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TaskCategories from "@/components/TaskCategories";
import TaskFilter from "@/components/TaskFilter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Filter, Grid, List } from "lucide-react";
import { taskService } from "@/services/taskService";
import { toast } from "sonner";

const Tasks = () => {
  const navigate = useNavigate();
  const [userSubmissions, setUserSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Task filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const submissionsData = await taskService.getUserSubmissions();
      setUserSubmissions(submissionsData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error("Failed to load task data");
    } finally {
      setLoading(false);
    }
  };

  // Calculate task counts
  const taskCounts = {
    available: 45, // This would come from a real API call
    in_progress: userSubmissions.filter(s => s.status === 'pending').length,
    completed: userSubmissions.filter(s => s.status === 'approved').length,
    total: 50
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedDifficulty("all");
    setSelectedStatus("all");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-6 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-4 py-4 max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
            
            <div className="flex-1">
              <h1 className="text-2xl font-bold">Browse Tasks</h1>
              <p className="text-sm text-muted-foreground">
                Discover and complete tasks to earn points and rewards
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-3 text-center">
                <div className="text-xl font-bold text-green-600">{taskCounts.available}</div>
                <div className="text-xs text-muted-foreground">Available Tasks</div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-3 text-center">
                <div className="text-xl font-bold text-blue-600">{taskCounts.in_progress}</div>
                <div className="text-xs text-muted-foreground">In Progress</div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-3 text-center">
                <div className="text-xl font-bold text-purple-600">{taskCounts.completed}</div>
                <div className="text-xs text-muted-foreground">Completed</div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-3 text-center">
                <div className="text-xl font-bold text-orange-600">{taskCounts.total}</div>
                <div className="text-xs text-muted-foreground">Total Tasks</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Filters and Tasks */}
        <div className="space-y-6">
          <TaskFilter
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            selectedDifficulty={selectedDifficulty}
            onDifficultyChange={setSelectedDifficulty}
            selectedStatus={selectedStatus}
            onStatusChange={setSelectedStatus}
            taskCounts={taskCounts}
            onClearFilters={handleClearFilters}
          />

          <TaskCategories onCategorySelect={handleCategorySelect} />
        </div>
      </div>
    </div>
  );
};

export default Tasks;
