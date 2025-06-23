
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { MessageCircle } from 'lucide-react';

export const ChatUnauthenticated: React.FC = () => {
  return (
    <Card className="h-full flex items-center justify-center bg-gray-900 border-gray-700">
      <CardContent>
        <div className="text-center">
          <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50 text-white" />
          <p className="text-gray-300">Please log in to access community chat</p>
        </div>
      </CardContent>
    </Card>
  );
};

export const ChatLoading: React.FC = () => {
  return (
    <Card className="h-full flex items-center justify-center bg-gray-900 border-gray-700">
      <CardContent>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-300">Loading community chat...</p>
        </div>
      </CardContent>
    </Card>
  );
};
