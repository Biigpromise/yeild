
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
        <div className="flex items-center gap-3">
          {onToggleNavigation && (
            <button
              onClick={onToggleNavigation}
              className="p-1 hover:bg-gray-700 rounded transition-colors"
              aria-label="Toggle navigation"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}
          <div className="flex items-center gap-2">
            <Users className="h-6 w-6 text-yellow-500" />
            <div>
              <h1 className="text-lg font-bold text-white">Community Chat</h1>
              <div className="flex items-center gap-2 text-sm">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-400">{activeUsers} online</span>
                </div>
                <span className="bg-red-500 text-white px-2 py-0.5 rounded text-xs font-medium">Live</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
