
import React from 'react';
import { useNavigate } from 'react-router-dom';
import UserTypeSelection from '@/components/auth/UserTypeSelection';

const UserTypeSelectionPage = () => {
  const navigate = useNavigate();

  const handleSelectUser = () => {
    navigate('/auth?type=user');
  };

  const handleSelectBrand = () => {
    navigate('/auth?type=brand');
  };

  const handleSwitchToSignin = () => {
    navigate('/auth');
  };

  return (
    <UserTypeSelection
      onSelectUser={handleSelectUser}
      onSelectBrand={handleSelectBrand}
      onSwitchToSignin={handleSwitchToSignin}
    />
  );
};

export default UserTypeSelectionPage;
