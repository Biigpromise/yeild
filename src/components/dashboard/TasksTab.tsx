
import React from 'react';
import { useNavigate } from 'react-router-dom';
import TaskFilter from '@/components/TaskFilter';
import TaskCategories from '@/components/TaskCategories';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Target, Gift, Wallet } from 'lucide-react';

interface TasksTabProps {
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
  handleCategorySelect: (categoryId: string) => void;
  setActiveTab: (tab: string) => void;
  userStats: { tasksCompleted: number };
  userTasks: any[];
}

export const TasksTab: React.FC<TasksTabProps> = ({
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
  handleCategorySelect,
  setActiveTab,
  userStats,
  userTasks,
}) => {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
      <div className="lg:col-span-3 space-y-4">
        <TaskFilter
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          selectedCategory={selectedCategory}
          onCategoryChange={onCategoryChange}
          selectedDifficulty={selectedDifficulty}
          onDifficultyChange={onDifficultyChange}
          selectedStatus={selectedStatus}
          onStatusChange={onStatusChange}
          taskCounts={taskCounts}
          onClearFilters={onClearFilters}
        />
        <TaskCategories onCategorySelect={handleCategorySelect} />
      </div>
      <div className="space-y-4">
        {/* Quick Actions */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 pt-0">
            <Button size="sm" className="w-full justify-start" onClick={() => navigate('/tasks')}>
              <Target className="h-4 w-4 mr-2" />
              Browse Tasks
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => setActiveTab('rewards')}>
              <Gift className="h-4 w-4 mr-2" />
              View Rewards
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => setActiveTab('wallet')}>
              <Wallet className="h-4 w-4 mr-2" />
              Wallet
            </Button>
          </CardContent>
        </Card>

        {/* Getting Started */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Getting Started</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            {userStats.tasksCompleted === 0 ? (
              <div className="text-center p-4">
                <Target className="h-12 w-12 mx-auto mb-3 text-blue-500" />
                <h4 className="font-medium mb-2">Ready to earn?</h4>
                <p className="text-xs text-muted-foreground mb-3">
                  Complete your first task to start earning points!
                </p>
                <Button size="sm" onClick={() => navigate('/tasks')} className="w-full">
                  Get Started
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {userTasks.slice(0, 3).map((task) => (
                  <div key={task.id} className="text-sm">
                    <div className="flex justify-between items-center">
                      <span className="truncate">{task.tasks?.title || 'Task completed'}</span>
                      <span className="text-muted-foreground">+{task.points_earned || 0} pts</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {task.completed_at ? new Date(task.completed_at).toLocaleDateString() : 'Recently'}
                    </div>
                  </div>
                ))}
                {userTasks.length === 0 && (
                  <p className="text-sm text-muted-foreground">No recent activity</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
