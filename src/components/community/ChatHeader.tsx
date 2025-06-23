
import React from 'react';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle, Users } from 'lucide-react';

interface ChatHeaderProps {
  activeUsersCount: number;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ activeUsersCount }) => {
  return (
    <CardHeader className="border-b border-gray-700">
      <CardTitle className="flex items-center gap-2 text-white">
        <MessageCircle className="h-5 w-5" />
        Community Chat
        <div className="flex items-center gap-1 text-sm text-gray-400">
          <Users className="h-4 w-4" />
          <span>{activeUsersCount} active</span>
        </div>
      </CardTitle>
    </CardHeader>
  );
};
