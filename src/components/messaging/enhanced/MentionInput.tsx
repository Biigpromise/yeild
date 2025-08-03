import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { AtSign, Send } from 'lucide-react';

interface MentionUser {
  id: string;
  name: string;
  profile_picture_url?: string;
}

interface MentionInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: (content: string, mentions: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  onTyping?: (isTyping: boolean) => void;
}

export const MentionInput: React.FC<MentionInputProps> = ({
  value,
  onChange,
  onSend,
  placeholder = "Type a message...",
  disabled = false,
  onTyping
}) => {
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionUsers, setMentionUsers] = useState<MentionUser[]>([]);
  const [selectedMentionIndex, setSelectedMentionIndex] = useState(0);
  const [mentionStartPos, setMentionStartPos] = useState(0);
  const [detectedMentions, setDetectedMentions] = useState<string[]>([]);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Search for users when typing @ mentions
  useEffect(() => {
    if (mentionQuery) {
      searchUsers(mentionQuery);
    } else {
      setMentionUsers([]);
    }
  }, [mentionQuery]);

  const searchUsers = async (query: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, profile_picture_url')
        .ilike('name', `%${query}%`)
        .limit(5);

      if (!error && data) {
        setMentionUsers(data.filter(user => user.name));
      }
    } catch (error) {
      console.error('Error searching users:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    const cursorPos = e.target.selectionStart || 0;
    
    onChange(newValue);
    onTyping?.(true);

    // Check for @ mention
    const beforeCursor = newValue.slice(0, cursorPos);
    const mentionMatch = beforeCursor.match(/@(\w*)$/);
    
    if (mentionMatch) {
      setShowMentions(true);
      setMentionQuery(mentionMatch[1]);
      setMentionStartPos(cursorPos - mentionMatch[1].length - 1);
      setSelectedMentionIndex(0);
    } else {
      setShowMentions(false);
      setMentionQuery('');
    }

    // Extract all mentions from the text
    const mentions = [...newValue.matchAll(/@\[([^\]]+)\]\(([^)]+)\)/g)];
    setDetectedMentions(mentions.map(match => match[2])); // Extract user IDs
  };

  const insertMention = (user: MentionUser) => {
    const beforeMention = value.slice(0, mentionStartPos);
    const afterMention = value.slice(inputRef.current?.selectionStart || 0);
    const mentionText = `@[${user.name}](${user.id})`;
    
    const newValue = beforeMention + mentionText + afterMention;
    onChange(newValue);
    setShowMentions(false);
    setMentionQuery('');

    // Focus back to input
    setTimeout(() => {
      inputRef.current?.focus();
      const newCursorPos = beforeMention.length + mentionText.length;
      inputRef.current?.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (showMentions && mentionUsers.length > 0) {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedMentionIndex(prev => 
            prev < mentionUsers.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedMentionIndex(prev => 
            prev > 0 ? prev - 1 : mentionUsers.length - 1
          );
          break;
        case 'Enter':
          e.preventDefault();
          insertMention(mentionUsers[selectedMentionIndex]);
          break;
        case 'Escape':
          e.preventDefault();
          setShowMentions(false);
          break;
      }
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if (value.trim()) {
      // Convert mention format for display
      const displayText = value.replace(/@\[([^\]]+)\]\([^)]+\)/g, '@$1');
      onSend(displayText, detectedMentions);
      onChange('');
      setDetectedMentions([]);
      onTyping?.(false);
    }
  };

  // Display text with properly formatted mentions
  const displayValue = value.replace(/@\[([^\]]+)\]\([^)]+\)/g, '@$1');

  return (
    <div className="relative">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            ref={inputRef}
            value={displayValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className="pr-10"
          />
          
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
            onClick={() => {
              const cursorPos = inputRef.current?.selectionStart || 0;
              const newValue = value.slice(0, cursorPos) + '@' + value.slice(cursorPos);
              onChange(newValue);
              inputRef.current?.focus();
              setTimeout(() => {
                inputRef.current?.setSelectionRange(cursorPos + 1, cursorPos + 1);
              }, 0);
            }}
          >
            <AtSign className="h-4 w-4" />
          </Button>

          {/* Mention dropdown */}
          {showMentions && mentionUsers.length > 0 && (
            <div
              ref={dropdownRef}
              className="absolute bottom-full left-0 right-0 mb-1 bg-background border border-border rounded-md shadow-lg max-h-48 overflow-y-auto z-50"
            >
              {mentionUsers.map((user, index) => (
                <div
                  key={user.id}
                  className={`flex items-center gap-2 p-2 cursor-pointer transition-colors ${
                    index === selectedMentionIndex
                      ? 'bg-muted'
                      : 'hover:bg-muted/50'
                  }`}
                  onClick={() => insertMention(user)}
                >
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={user.profile_picture_url} />
                    <AvatarFallback className="text-xs">
                      {user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">{user.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <Button
          onClick={handleSend}
          disabled={disabled || !value.trim()}
          size="sm"
          className="h-10 px-3"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};