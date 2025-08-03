import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, Send } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface SmartReplyPanelProps {
  recentMessages: Array<{
    content: string;
    user_id: string;
    profiles: { name: string } | null;
  }>;
  onSelectReply: (reply: string) => void;
  currentUserId?: string;
}

export const SmartReplyPanel: React.FC<SmartReplyPanelProps> = ({
  recentMessages,
  onSelectReply,
  currentUserId
}) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    generateSmartReplies();
  }, [recentMessages]);

  const generateSmartReplies = async () => {
    if (recentMessages.length === 0) return;
    
    setIsLoading(true);
    try {
      // Get the last few messages for context
      const context = recentMessages
        .slice(-3)
        .map(msg => `${msg.profiles?.name || 'User'}: ${msg.content}`)
        .join('\n');

      const { data, error } = await supabase.functions.invoke('generate-smart-replies', {
        body: { context, currentUserId }
      });

      if (error) throw error;
      setSuggestions(data.replies || []);
    } catch (error) {
      console.error('Error generating smart replies:', error);
      // Fallback to predefined suggestions
      setSuggestions([
        "That's interesting! Tell me more.",
        "I agree with that perspective.",
        "Thanks for sharing!"
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (suggestions.length === 0 && !isLoading) return null;

  return (
    <Card className="border-border bg-card/50 backdrop-blur-sm">
      <CardContent className="p-3">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-foreground">Smart Replies</span>
        </div>
        
        <div className="space-y-2">
          {isLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="animate-pulse">Generating suggestions...</div>
            </div>
          ) : (
            suggestions.map((suggestion, index) => (
              <Button
                key={index}
                variant="ghost"
                size="sm"
                className="w-full justify-start h-auto p-2 text-left text-sm hover:bg-accent/50"
                onClick={() => onSelectReply(suggestion)}
              >
                <Send className="h-3 w-3 mr-2 text-muted-foreground" />
                <span className="truncate">{suggestion}</span>
              </Button>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};