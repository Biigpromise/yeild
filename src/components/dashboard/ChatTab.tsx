import React from 'react';
import { ChatInterface } from '@/components/chat';

export const ChatTab: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Community Chat</h1>
          <p className="text-muted-foreground">
            Connect with other users, share experiences, and participate in real-time conversations.
          </p>
        </div>
        
        <ChatInterface />
      </div>
    </div>
  );
};