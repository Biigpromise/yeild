import { useState } from 'react';

export const useUserProfile = () => {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openUserProfile = (userId: string) => {
    setSelectedUserId(userId);
    setIsModalOpen(true);
  };

  const closeUserProfile = () => {
    setIsModalOpen(false);
    setSelectedUserId(null);
  };

  return {
    selectedUserId,
    isModalOpen,
    openUserProfile,
    closeUserProfile
  };
};