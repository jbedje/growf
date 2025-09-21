import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../ui/Button';
import { UserRole, type UserRoleType } from '../../types';

export const BackofficeHeader: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getRoleBadge = (role: UserRoleType) => {
    const roleColors = {
      [UserRole.ANALYST]: 'bg-blue-100 text-blue-800',
      [UserRole.ADMIN]: 'bg-purple-100 text-purple-800',
      [UserRole.SUPERADMIN]: 'bg-red-100 text-red-800',
    };

    const roleLabels = {
      [UserRole.ANALYST]: 'Analyste',
      [UserRole.ADMIN]: 'Admin',
      [UserRole.SUPERADMIN]: 'Super Admin',
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleColors[role as keyof typeof roleColors]}`}>
        {roleLabels[role as keyof typeof roleLabels]}
      </span>
    );
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <Link to="/backoffice" className="flex items-center">
              <span className="text-xl font-bold text-gray-900">GROWF</span>
              <span className="ml-2 text-sm text-gray-500">Backoffice</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {user && (
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {user.email}
                  </div>
                  <div className="text-xs text-gray-500">
                    {getRoleBadge(user.role)}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                >
                  Déconnexion
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};