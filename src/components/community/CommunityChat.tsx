
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { MessagesList } from './MessagesList';
import { MessageInputForm } from './MessageInputForm';
import { ChatHeader } from './ChatHeader';
import { ChatUnauthenticated, ChatLoading } from './ChatStates';
import { useCommunityChat } from './hooks/useCommunityChat';

export const CommunityChat = () => {
  const {
    user,
    messages,
    newMessage,
    setNewMessage,
    loading,
    sending,
    selectedFile,
    filePreview,
    uploading,
    messagesEndRef,
    handleFileSelect,
    removeFile,
    handleSendMessage,
    handleDeleteMessage
  } = useCommunityChat();

  if (!user) {
    return <ChatUnauthenticated />;
  }

  if (loading) {
    return <ChatLoading />;
  }

  const activeUsersCount = new Set(messages.map(m => m.user_id)).size;

  return (
    <Card className="h-full flex flex-col bg-gray-900 border-gray-700">
      <ChatHeader activeUsersCount={activeUsersCount} />

      <CardContent className="flex-1 p-0 flex flex-col min-h-0">
        <MessagesList
          messages={messages}
          currentUserId={user?.id}
          onDeleteMessage={handleDeleteMessage}
          messagesEndRef={messagesEndRef}
        />

        <MessageInputForm
          newMessage={newMessage}
          setNewMessage={setNewMessage}
          selectedFile={selectedFile}
          filePreview={filePreview}
          sending={sending}
          uploading={uploading}
          onSubmit={handleSendMessage}
          onFileSelect={handleFileSelect}
          onRemoveFile={removeFile}
        />
      </CardContent>
    </Card>
  );
};
