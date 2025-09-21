import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { UserRole } from '../../types';

export const BackofficeRedirect: React.FC = () => {
  const { user } = useAuthStore();

  console.log('BackofficeRedirect - user:', user);
  console.log('BackofficeRedirect - user role:', user?.role);
  console.log('BackofficeRedirect - UserRole.SUPERADMIN:', UserRole.SUPERADMIN);
  console.log('BackofficeRedirect - role comparison:', user?.role === UserRole.SUPERADMIN);

  // Handle string vs enum comparison by checking both
  const userRole = user?.role;

  // Check if user role is SUPERADMIN
  if (userRole === UserRole.SUPERADMIN) {
    console.log('Redirecting to /backoffice/superadmin');
    return <Navigate to="/backoffice/superadmin" replace />;
  }

  // Check if user role is ADMIN, ANALYST, or ORGANIZATION
  if (userRole === UserRole.ADMIN ||
      userRole === UserRole.ANALYST ||
      userRole === UserRole.ORGANIZATION) {
    console.log('Redirecting to /backoffice/admin');
    return <Navigate to="/backoffice/admin" replace />;
  }

  // Default redirect to dashboard for COMPANY or unknown roles
  console.log('Redirecting to /dashboard (default)');
  return <Navigate to="/dashboard" replace />;
};