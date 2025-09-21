import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { UserRole, type UserRoleType } from '../../types';
import { Spinner } from '../ui/Spinner';

interface BackofficeGuardProps {
  children: React.ReactNode;
  requiredRoles?: UserRoleType[];
}

const BACKOFFICE_ROLES = [UserRole.ANALYST, UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.ORGANIZATION];

export const BackofficeGuard: React.FC<BackofficeGuardProps> = ({
  children,
  requiredRoles = BACKOFFICE_ROLES
}) => {
  const { user, isAuthenticated, isLoading, refreshAuth } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      refreshAuth().catch(() => {
        // Ignore errors, will redirect to login
      });
    }
  }, [isAuthenticated, isLoading, refreshAuth]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-gray-600">Vérification des autorisations...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!requiredRoles.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-lg">
            <div className="text-red-500 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L4.316 15.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Accès non autorisé
            </h2>
            <p className="text-gray-600 mb-6">
              Vous n'avez pas les permissions nécessaires pour accéder au backoffice.
            </p>
            <Navigate to="/dashboard" replace />
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};