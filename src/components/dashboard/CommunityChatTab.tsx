
import React from 'react';
import { PostFeed } from "@/components/posts/PostFeed";
import { PostForm } from "@/components/community/PostForm";

export const CommunityChatTab = () => {
  return (
    <div className="h-[calc(100vh-120px)] bg-background">
      <div className="max-w-2xl mx-auto p-4">
        <PostForm />
        <PostFeed />
      </div>
    </div>
  );
};
