
import React from 'react';
import { MessageCircle, Users } from 'lucide-react';

interface ChatHeaderProps {
  activeUsers: number;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ activeUsers }) => {
  return (
    <div className="flex-shrink-0 bg-gray-800 border-b border-gray-700 p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
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
