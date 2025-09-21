import React from 'react';
import { Link } from 'react-router-dom';
import { Bell, User, LogOut } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { UserRole, type UserRoleType } from '../../types';
// import { NotificationBell } from '../ui/NotificationBell';

export const Header: React.FC = () => {
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
  };

  const getRoleDisplayName = (role: UserRoleType) => {
    switch (role) {
      case UserRole.COMPANY:
        return 'Entreprise';
      case UserRole.ORGANIZATION:
        return 'Organisation';
      case UserRole.ADMIN:
        return 'Administrateur';
      default:
        return role;
    }
  };

  return (
    <header className="bg-white border-b border-secondary-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo et navigation */}
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-primary-600">GROWF</h1>
              </div>
            </Link>
          </div>

          {/* Actions utilisateur */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <button className="p-2 text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100 rounded-md transition-colors">
              <Bell className="h-5 w-5" />
            </button>

            {/* Menu utilisateur */}
            <div className="relative group">
              <button className="flex items-center space-x-2 p-2 text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100 rounded-md transition-colors">
                <User className="h-5 w-5" />
                <span className="text-sm font-medium">{user?.email}</span>
              </button>

              {/* Dropdown menu */}
              <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-md shadow-lg border border-secondary-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="p-4 border-b border-secondary-200">
                  <p className="text-sm font-medium text-secondary-900">{user?.email}</p>
                  <p className="text-xs text-secondary-600">{user && getRoleDisplayName(user.role)}</p>
                </div>
                <div className="py-2">
                  <Link
                    to="/profile"
                    className="flex items-center px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50 hover:text-secondary-900"
                  >
                    <User className="h-4 w-4 mr-3" />
                    Mon profil
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50 hover:text-secondary-900"
                  >
                    <LogOut className="h-4 w-4 mr-3" />
                    Se déconnecter
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};