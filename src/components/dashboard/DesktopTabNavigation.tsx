
import React from 'react';
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Home,
  Gift,
  Award,
  Wallet,
  Trophy,
  User,
  Search,
  MessageCircle,
  LifeBuoy,
} from "lucide-react";

export const DesktopTabNavigation = () => {
  return (
    <TabsList className="grid w-full grid-cols-9">
      <TabsTrigger value="tasks">
        <Home className="h-4 w-4 mr-2" />
        Home
      </TabsTrigger>
      <TabsTrigger value="rewards">
        <Gift className="h-4 w-4 mr-2" />
        Rewards
      </TabsTrigger>
      <TabsTrigger value="achievements">
        <Award className="h-4 w-4 mr-2" />
        Achievements
      </TabsTrigger>
      <TabsTrigger value="wallet">
        <Wallet className="h-4 w-4 mr-2" />
        Wallet
      </TabsTrigger>
      <TabsTrigger value="leaderboard">
        <Trophy className="h-4 w-4 mr-2" />
        Leaderboard
      </TabsTrigger>
      <TabsTrigger value="profile">
         <User className="h-4 w-4 mr-2" />
         Profile
      </TabsTrigger>
      <TabsTrigger value="user-search">
         <Search className="h-4 w-4 mr-2" />
         Find Users
      </TabsTrigger>
      <TabsTrigger value="community-chat">
         <MessageCircle className="h-4 w-4 mr-2" />
         Community Chat
      </TabsTrigger>
      <TabsTrigger value="support">
         <LifeBuoy className="h-4 w-4 mr-2" />
         Support
      </TabsTrigger>
    </TabsList>
  );
};
