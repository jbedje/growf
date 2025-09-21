import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { type UserRoleType } from '../../types';
import { Spinner } from '../ui/Spinner';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRoles?: UserRoleType[];
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children, requiredRoles }) => {
  const { user, isAuthenticated, isLoading, refreshAuth } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    // Essayer de rafraîchir l'authentification si pas connecté
    if (!isAuthenticated && !isLoading) {
      refreshAuth().catch(() => {
        // Ignore errors, will redirect to login
      });
    }
  }, [isAuthenticated, isLoading, refreshAuth]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRoles && !requiredRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};