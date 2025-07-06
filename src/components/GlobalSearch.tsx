import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Search, User, MessageSquare, CheckSquare, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface SearchResult {
  type: 'user' | 'message' | 'task';
  id: string;
  title: string;
  subtitle?: string;
  avatar?: string;
  metadata?: any;
}

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearch: React.FC<GlobalSearchProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (query.length >= 2) {
      performSearch();
    } else {
      setResults([]);
    }
  }, [query]);

  const performSearch = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const searchResults: SearchResult[] = [];

      // Search users
      const { data: users } = await supabase
        .from('profiles')
        .select('id, name, email, profile_picture_url, points, level')
        .or(`name.ilike.%${query}%,email.ilike.%${query}%`)
        .limit(5);

      if (users) {
        users.forEach(user => {
          searchResults.push({
            type: 'user',
            id: user.id,
            title: user.name || 'Anonymous User',
            subtitle: user.email,
            avatar: user.profile_picture_url,
            metadata: { points: user.points, level: user.level }
          });
        });
      }

      // Search messages
      const { data: messages } = await supabase
        .from('messages')
        .select(`
          id, content, created_at,
          profiles!messages_user_id_fkey (
            name, profile_picture_url
          )
        `)
        .ilike('content', `%${query}%`)
        .limit(5);

      if (messages) {
        messages.forEach(message => {
          searchResults.push({
            type: 'message',
            id: message.id,
            title: message.content.substring(0, 60) + (message.content.length > 60 ? '...' : ''),
            subtitle: `by ${message.profiles?.name || 'Anonymous User'}`,
            avatar: message.profiles?.profile_picture_url,
            metadata: { created_at: message.created_at }
          });
        });
      }

      // Search tasks
      const { data: tasks } = await supabase
        .from('tasks')
        .select('id, title, description, points, category')
        .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
        .eq('status', 'active')
        .limit(5);

      if (tasks) {
        tasks.forEach(task => {
          searchResults.push({
            type: 'task',
            id: task.id,
            title: task.title,
            subtitle: task.description?.substring(0, 80) + (task.description && task.description.length > 80 ? '...' : ''),
            metadata: { points: task.points, category: task.category }
          });
        });
      }

      setResults(searchResults);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'user': return <User className="h-4 w-4" />;
      case 'message': return <MessageSquare className="h-4 w-4" />;
      case 'task': return <CheckSquare className="h-4 w-4" />;
      default: return <Search className="h-4 w-4" />;
    }
  };

  const handleResultClick = (result: SearchResult) => {
    // Handle navigation based on result type
    switch (result.type) {
      case 'user':
        // Open user profile modal or navigate to profile
        break;
      case 'message':
        // Navigate to community chat and highlight message
        break;
      case 'task':
        // Navigate to tasks tab and show task
        break;
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-20">
      <Card className="w-full max-w-2xl mx-4">
        <CardContent className="p-0">
          <div className="flex items-center p-4 border-b">
            <Search className="h-5 w-5 text-muted-foreground mr-3" />
            <Input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search users, messages, tasks..."
              className="border-0 focus-visible:ring-0 text-lg"
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  onClose();
                }
              }}
            />
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {loading && (
            <div className="p-4 text-center text-muted-foreground">
              Searching...
            </div>
          )}

          {results.length > 0 && (
            <div className="max-h-96 overflow-y-auto">
              {results.map((result) => (
                <div
                  key={`${result.type}-${result.id}`}
                  className="flex items-center p-4 hover:bg-muted cursor-pointer border-b last:border-b-0"
                  onClick={() => handleResultClick(result)}
                >
                  <div className="mr-3 text-muted-foreground">
                    {getResultIcon(result.type)}
                  </div>
                  
                  {result.avatar && (
                    <Avatar className="h-8 w-8 mr-3">
                      <AvatarImage src={result.avatar} />
                      <AvatarFallback className="text-xs">
                        {result.title.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{result.title}</div>
                    {result.subtitle && (
                      <div className="text-sm text-muted-foreground truncate">
                        {result.subtitle}
                      </div>
                    )}
                  </div>
                  
                  <div className="ml-3 flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {result.type}
                    </Badge>
                    {result.metadata?.points && (
                      <Badge variant="secondary" className="text-xs">
                        {result.metadata.points} pts
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {query.length >= 2 && results.length === 0 && !loading && (
            <div className="p-8 text-center text-muted-foreground">
              No results found for "{query}"
            </div>
          )}

          {query.length < 2 && (
            <div className="p-8 text-center text-muted-foreground">
              Type at least 2 characters to search
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};