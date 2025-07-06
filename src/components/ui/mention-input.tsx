import React, { useState, useRef, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";

interface User {
  id: string;
  name: string;
  profile_picture_url?: string;
}

interface MentionInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export const MentionInput: React.FC<MentionInputProps> = ({
  value,
  onChange,
  placeholder,
  className,
  disabled
}) => {
  const [suggestions, setSuggestions] = useState<User[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentionPosition, setMentionPosition] = useState({ start: 0, end: 0 });
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Load users when mention is triggered
  useEffect(() => {
    if (mentionQuery.length > 0) {
      loadUsers(mentionQuery);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [mentionQuery]);

  const loadUsers = async (query: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, profile_picture_url')
        .ilike('name', `%${query}%`)
        .not('name', 'is', null)
        .limit(5);

      if (error) throw error;
      
      setSuggestions(data || []);
      setShowSuggestions(true);
      setSelectedIndex(0);
    } catch (error) {
      console.error('Error loading users:', error);
      setSuggestions([]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const cursorPosition = e.target.selectionStart;
    
    onChange(newValue);

    // Check for @ mentions
    const beforeCursor = newValue.substring(0, cursorPosition);
    const mentionMatch = beforeCursor.match(/@([^@\s]*)$/);
    
    if (mentionMatch) {
      const query = mentionMatch[1];
      const start = beforeCursor.lastIndexOf('@');
      
      setMentionQuery(query);
      setMentionPosition({ start, end: cursorPosition });
    } else {
      setMentionQuery("");
      setShowSuggestions(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
      case 'Tab':
        if (suggestions[selectedIndex]) {
          e.preventDefault();
          insertMention(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        break;
    }
  };

  const insertMention = (user: User) => {
    const beforeMention = value.substring(0, mentionPosition.start);
    const afterMention = value.substring(mentionPosition.end);
    const mention = `@${user.name}`;
    
    const newValue = beforeMention + mention + ' ' + afterMention;
    onChange(newValue);
    
    setShowSuggestions(false);
    setMentionQuery("");
    
    // Focus back to textarea and set cursor position
    setTimeout(() => {
      if (textareaRef.current) {
        const newCursorPosition = beforeMention.length + mention.length + 1;
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newCursorPosition, newCursorPosition);
      }
    }, 0);
  };

  // Format text with mentions highlighted
  const formatTextWithMentions = (text: string) => {
    const mentionRegex = /@([^\s@]+)/g;
    return text.replace(mentionRegex, '<span class="text-blue-500 font-medium">@$1</span>');
  };

  return (
    <div className="relative">
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={className}
        disabled={disabled}
      />
      
      {showSuggestions && suggestions.length > 0 && (
        <Card className="absolute bottom-full mb-2 w-full max-w-sm z-50 p-2">
          <div className="text-xs text-muted-foreground mb-2 px-2">
            Mention someone
          </div>
          <div ref={suggestionsRef} className="space-y-1">
            {suggestions.map((user, index) => (
              <div
                key={user.id}
                className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${
                  index === selectedIndex 
                    ? 'bg-primary text-primary-foreground' 
                    : 'hover:bg-muted'
                }`}
                onClick={() => insertMention(user)}
              >
                <Avatar className="h-6 w-6">
                  <AvatarImage src={user.profile_picture_url} />
                  <AvatarFallback className="text-xs">
                    {user.name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">{user.name}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};