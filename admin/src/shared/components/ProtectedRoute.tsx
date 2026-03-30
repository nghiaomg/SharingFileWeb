import React, { type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { Spin } from 'antd';
import { useAuthStore } from '@/features/auth';
import { useMeQuery } from '@/features/auth/hooks/useAuthQuery';

export const ProtectedRoute: React.FC<{ children: ReactNode }> = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const { isError, isLoading } = useMeQuery();

  // Token exists in localStorage but is invalid/expired → clear & redirect
  if (isAuthenticated && isError) {
    clearAuth();
    return <Navigate to="/login" replace />;
  }

  // No token → redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Still loading (re-fetching /auth/me) → show spinner
  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  return <>{children}</>;
};
