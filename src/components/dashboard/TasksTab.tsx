
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TaskFilter from '@/components/TaskFilter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Target, Gift, Wallet } from 'lucide-react';
import { CompactBirdBatch } from '@/components/ui/CompactBirdBatch';
import { useIsMobile } from '@/hooks/use-mobile';

interface TasksTabProps {
  userStats?: { tasksCompleted: number };
  userTasks?: any[];
  loadUserData?: () => void;
}

export const TasksTab: React.FC<TasksTabProps> = ({
  userStats = { tasksCompleted: 0 },
  userTasks = [],
}) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  // Local state for filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  
  const taskCounts = {
    available: 0,
    in_progress: 0,
    completed: userStats.tasksCompleted,
    total: userStats.tasksCompleted
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedDifficulty('');
    setSelectedStatus('');
  };

  if (isMobile) {
    return (
      <div className="space-y-3">
        {/* Mobile-optimized layout */}
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
        
        {/* Fallback categories if loading fails */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" onClick={() => navigate('/tasks')}>Browse All</Button>
              <Button variant="outline" size="sm" onClick={() => navigate('/tasks')}>Get Started</Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Mobile progress card */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Your Progress</CardTitle>
              <CompactBirdBatch count={userStats.tasksCompleted} />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {userStats.tasksCompleted === 0 ? (
              <div className="text-center py-3">
                <Target className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                <h4 className="font-medium mb-1 text-sm">Ready to earn?</h4>
                <p className="text-xs text-muted-foreground mb-2">
                  Complete your first task to start earning!
                </p>
                <Button size="sm" onClick={() => navigate('/tasks')} className="w-full">
                  Get Started
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {userTasks.slice(0, 2).map((task) => (
                  <div key={task.id} className="text-sm">
                    <div className="flex justify-between items-center">
                      <span className="truncate text-xs">{task.tasks?.title || 'Task completed'}</span>
                      <span className="text-muted-foreground text-xs">+{task.points_earned || 0} pts</span>
                    </div>
                  </div>
                ))}
                {userTasks.length === 0 && (
                  <p className="text-xs text-muted-foreground">No recent activity</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Mobile quick actions - horizontal layout */}
        <div className="grid grid-cols-3 gap-2">
          <Button size="sm" variant="outline" onClick={() => navigate('/tasks')} className="text-xs">
            <Target className="h-3 w-3 mr-1" />
            Tasks
          </Button>
          <Button size="sm" variant="outline" className="text-xs">
            <Gift className="h-3 w-3 mr-1" />
            Rewards
          </Button>
          <Button size="sm" variant="outline" className="text-xs">
            <Wallet className="h-3 w-3 mr-1" />
            Wallet
          </Button>
        </div>
      </div>
    );
  }

  // Desktop layout
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
      <div className="lg:col-span-3 space-y-4">
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
        
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="grid grid-cols-3 gap-2">
              <Button variant="outline" size="sm" onClick={() => navigate('/tasks')}>Browse All Tasks</Button>
              <Button variant="outline" size="sm" onClick={() => navigate('/tasks')}>Get Started</Button>
              <Button variant="outline" size="sm" onClick={() => navigate('/tasks')}>View Featured</Button>
            </div>
          </CardContent>
        </Card>
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
            <Button variant="outline" size="sm" className="w-full justify-start">
              <Gift className="h-4 w-4 mr-2" />
              View Rewards
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start">
              <Wallet className="h-4 w-4 mr-2" />
              Wallet
            </Button>
          </CardContent>
        </Card>

        {/* Progress Card */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Your Progress</CardTitle>
              <CompactBirdBatch count={userStats.tasksCompleted} />
            </div>
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
