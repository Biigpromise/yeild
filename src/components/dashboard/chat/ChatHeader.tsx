
import React from 'react';
import { MessageCircle, Users, Menu } from 'lucide-react';

interface ChatHeaderProps {
  activeUsers: number;
  onToggleNavigation?: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ activeUsers, onToggleNavigation }) => {
  return (
    <div className="flex-shrink-0 bg-gray-800 border-b border-gray-700 p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {onToggleNavigation && (
            <button
              onClick={onToggleNavigation}
              className="p-1 hover:bg-gray-700 rounded transition-colors"
              aria-label="Toggle navigation"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}
          <MessageCircle className="h-5 w-5" />
          <h1 className="text-lg font-bold">Community Chat</h1>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Users className="h-4 w-4" />
          <span>{activeUsers} active</span>
        </div>
      </div>
    </div>
  );
};
