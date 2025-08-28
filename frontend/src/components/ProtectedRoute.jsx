import React from 'react';
import AuthService from '../services/auth.service';
import LoginPrompt from './LoginPrompt'; 

const ProtectedRoute = ({ children }) => {
  const currentUser = AuthService.getCurrentUser();

  if (!currentUser) {
    return <LoginPrompt />;
  }

  return children;
};

export default ProtectedRoute;