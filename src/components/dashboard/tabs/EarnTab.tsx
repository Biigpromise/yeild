import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Filter, 
  Zap, 
  Clock, 
  Star, 
  ArrowUpRight,
  Trophy,
  Target,
  Briefcase
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface Task {
  id: string;
  title: string;
  description: string;
  points: number;
  category: string;
  difficulty: string;
  estimated_time: string;
  brand_name?: string;
}

interface EarnTabProps {
  userTasks?: any[];
  userStats?: {
    points: number;
    level: number;
    tasksCompleted: number;
  };
}

export const EarnTab: React.FC<EarnTabProps> = ({ userTasks, userStats }) => {
  const [availableTasks, setAvailableTasks] = useState<Task[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Load available tasks
  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setAvailableTasks(data || []);
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { id: 'all', name: 'All Tasks', icon: Briefcase },
    { id: 'Social Media', name: 'Social Media', icon: Star },
    { id: 'Survey', name: 'Surveys', icon: Target },
    { id: 'Review', name: 'Reviews', icon: Trophy }
  ];

  const filteredTasks = availableTasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || task.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'medium': return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
      case 'hard': return 'bg-red-500/10 text-red-600 border-red-500/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const handleTaskClick = (task: Task) => {
    // Navigate to task details or start task
    navigate(`/tasks/${task.id}`);
  };

  return (
    <div className="h-full max-h-screen overflow-y-auto">
      <div className="space-y-4 sm:space-y-6 px-4 sm:px-0">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center lg:text-left"
      >
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          Earn Points
        </h1>
        <p className="text-muted-foreground mt-2 text-sm sm:text-base">
          Complete tasks and earn points to level up your account
        </p>
      </motion.div>

      {/* Earning Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="p-3 sm:p-4 text-center">
              <Zap className="h-5 w-5 sm:h-6 sm:w-6 text-primary mx-auto mb-2" />
              <p className="text-lg sm:text-2xl font-bold text-primary">{userStats?.points || 0}</p>
              <p className="text-xs text-muted-foreground">Total Points</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-3 sm:p-4 text-center">
              <Trophy className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 mx-auto mb-2" />
              <p className="text-lg sm:text-2xl font-bold">{userStats?.tasksCompleted || 0}</p>
              <p className="text-xs text-muted-foreground">Tasks Completed</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-3 sm:p-4 text-center">
              <Star className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600 mx-auto mb-2" />
              <p className="text-lg sm:text-2xl font-bold">Level {userStats?.level || 1}</p>
              <p className="text-xs text-muted-foreground">Current Level</p>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              {/* Category Filter */}
              <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 min-w-0">
                {categories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <Button
                      key={category.id}
                      variant={selectedCategory === category.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(category.id)}
                      className="whitespace-nowrap"
                    >
                      <Icon className="h-4 w-4 mr-1" />
                      {category.name}
                    </Button>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Task List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {loading ? (
          <div className="grid gap-4">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-3 bg-muted rounded w-full"></div>
                      <div className="flex gap-2">
                        <div className="h-6 bg-muted rounded w-16"></div>
                        <div className="h-6 bg-muted rounded w-20"></div>
                      </div>
                    </div>
                    <div className="h-8 bg-muted rounded w-16"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredTasks.length > 0 ? (
          <div className="grid gap-4">
            {filteredTasks.map((task) => (
              <Card key={task.id} className="hover:shadow-md transition-shadow cursor-pointer group">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold group-hover:text-primary transition-colors text-sm sm:text-base">
                          {task.title}
                        </h3>
                        <div className="flex items-center gap-1 text-primary font-bold text-sm">
                          <Star className="h-3 w-3 sm:h-4 sm:w-4" />
                          {task.points}
                        </div>
                      </div>
                      
                      <p className="text-xs sm:text-sm text-muted-foreground mb-3 line-clamp-2">
                        {task.description}
                      </p>
                      
                      <div className="flex flex-wrap gap-1 sm:gap-2">
                        <Badge variant="outline" className={getDifficultyColor(task.difficulty)}>
                          {task.difficulty}
                        </Badge>
                        
                        <Badge variant="outline">
                          <Clock className="h-3 w-3 mr-1" />
                          {task.estimated_time}
                        </Badge>
                        
                        {task.brand_name && (
                          <Badge variant="secondary">
                            {task.brand_name}
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <Button 
                      size="sm"
                      onClick={() => handleTaskClick(task)}
                      className="shrink-0 w-full sm:w-auto"
                    >
                      Start
                      <ArrowUpRight className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="font-semibold mb-2">No tasks found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {searchQuery || selectedCategory !== 'all' 
                  ? 'Try adjusting your search or filters'
                  : 'New tasks will appear here soon!'}
              </p>
              {(searchQuery || selectedCategory !== 'all') && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </motion.div>
      </div>
    </div>
  );
};