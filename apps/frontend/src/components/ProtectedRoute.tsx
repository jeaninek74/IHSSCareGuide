import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../context/SubscriptionContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading } = useAuth();
  const { isSubscribed, isLoadingSubscription } = useSubscription();
  const location = useLocation();

  if (isLoading || isLoadingSubscription) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Redirect to subscribe page if user has no active subscription or trial
  if (!isSubscribed) {
    return <Navigate to="/subscribe" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
