import React from 'react';
import { ModernChatInterface } from '../chat/ModernChatInterface';

interface CommunityChatTabProps {
  onToggleNavigation?: () => void;
}

export const CommunityChatTab: React.FC<CommunityChatTabProps> = ({
  onToggleNavigation
}) => {
  return (
    <div className="h-full">
      <ModernChatInterface />
    </div>
  );
};