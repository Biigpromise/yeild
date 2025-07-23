
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  Clock, 
  DollarSign,
  Target,
  CheckCircle,
  ExternalLink,
  AlertCircle
} from 'lucide-react';
import { taskService } from '@/services/taskService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface Task {
  id: string;
  title: string;
  description: string;
  points: number;
  category: string;
  difficulty: string;
  estimated_time?: string;
  brand_name?: string;
  brand_logo_url?: string;
  expires_at?: string;
  status: string;
  created_at: string;
}

const Tasks: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');

  useEffect(() => {
    loadTasks();
    loadCategories();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const tasksData = await taskService.getTasks();
      setTasks(tasksData);
    } catch (error) {
      console.error('Error loading tasks:', error);
      setError('Failed to load tasks');
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const categoriesData = await taskService.getCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || !selectedCategory || task.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'all' || !selectedDifficulty || task.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'bg-green-100 text-green-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'hard': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const handleTaskClick = (taskId: string) => {
    navigate(`/tasks/${taskId}`);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
          <h2 className="text-xl font-bold mb-2">Authentication Required</h2>
          <p className="text-gray-400 mb-4">Please log in to view available tasks</p>
          <Button onClick={() => navigate('/login')}>
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/dashboard')}
              className="text-white hover:bg-gray-800"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Available Tasks</h1>
              <p className="text-gray-400">Complete tasks to earn points and rewards</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6 bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filter Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-gray-800 border-gray-600 text-white"
                />
              </div>
              
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                  <SelectValue placeholder="All Difficulties" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Difficulties</SelectItem>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tasks Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yeild-yellow mx-auto mb-4"></div>
            <p className="text-gray-400">Loading tasks...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
            <h3 className="text-lg font-semibold mb-2 text-white">Error Loading Tasks</h3>
            <p className="text-gray-400 mb-4">{error}</p>
            <Button onClick={loadTasks} variant="outline">
              Try Again
            </Button>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-12">
            <Target className="h-12 w-12 mx-auto mb-4 text-gray-500" />
            <h3 className="text-lg font-semibold mb-2 text-white">No Tasks Found</h3>
            <p className="text-gray-400">
              {searchQuery || selectedCategory || selectedDifficulty 
                ? 'Try adjusting your filters to find more tasks'
                : 'No tasks are currently available'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTasks.map((task) => (
              <Card 
                key={task.id} 
                className="bg-gray-900 border-gray-700 hover:bg-gray-800 transition-colors cursor-pointer"
                onClick={() => handleTaskClick(task.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-white text-lg mb-2 line-clamp-2">
                        {task.title}
                      </CardTitle>
                      {task.brand_name && (
                        <p className="text-sm text-gray-400 mb-1">
                          by {task.brand_name}
                        </p>
                      )}
                    </div>
                    <ExternalLink className="h-4 w-4 text-gray-400 flex-shrink-0 ml-2" />
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <p className="text-gray-300 text-sm mb-4 line-clamp-3">
                    {task.description}
                  </p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-yeild-yellow" />
                      <span className="text-yeild-yellow font-semibold">
                        {task.points} points
                      </span>
                    </div>
                    
                    {task.estimated_time && (
                      <div className="flex items-center gap-1 text-gray-400 text-sm">
                        <Clock className="h-3 w-3" />
                        {task.estimated_time}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      <Badge variant="outline" className="text-xs">
                        {task.category}
                      </Badge>
                      <Badge className={`text-xs ${getDifficultyColor(task.difficulty)}`}>
                        {task.difficulty}
                      </Badge>
                    </div>
                    
                    {task.expires_at && (
                      <div className="text-xs text-gray-400">
                        Expires: {new Date(task.expires_at).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Tasks;
