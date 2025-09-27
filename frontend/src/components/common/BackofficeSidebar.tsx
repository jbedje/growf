import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { UserRole, type UserRoleType } from '../../types';

interface MenuItem {
  name: string;
  href: string;
  icon: string;
  roles: UserRoleType[];
}

const menuItems: MenuItem[] = [
  {
    name: 'Tableau de bord',
    href: '/backoffice/admin',
    icon: '🏠',
    roles: [UserRole.ANALYST, UserRole.ADMIN, UserRole.ORGANIZATION],
  },
  {
    name: 'Tableau de bord',
    href: '/backoffice/superadmin',
    icon: '🏠',
    roles: [UserRole.SUPERADMIN],
  },
  {
    name: 'Applications',
    href: '/backoffice/applications',
    icon: '📄',
    roles: [UserRole.ANALYST, UserRole.ADMIN, UserRole.ORGANIZATION, UserRole.SUPERADMIN],
  },
  {
    name: 'Programmes',
    href: '/backoffice/programs',
    icon: '📊',
    roles: [UserRole.ADMIN, UserRole.ORGANIZATION, UserRole.SUPERADMIN],
  },
  {
    name: 'Entreprises',
    href: '/backoffice/companies',
    icon: '🏢',
    roles: [UserRole.ANALYST, UserRole.ADMIN, UserRole.SUPERADMIN],
  },
  {
    name: 'Organisations',
    href: '/backoffice/organizations',
    icon: '🏛️',
    roles: [UserRole.ORGANIZATION, UserRole.ADMIN, UserRole.SUPERADMIN],
  },
  {
    name: 'Utilisateurs',
    href: '/backoffice/users',
    icon: '👥',
    roles: [UserRole.SUPERADMIN],
  },
  {
    name: 'Statistiques',
    href: '/backoffice/analytics',
    icon: '📈',
    roles: [UserRole.ADMIN, UserRole.SUPERADMIN],
  },
  {
    name: 'Configuration Système',
    href: '/backoffice/settings',
    icon: '⚙️',
    roles: [UserRole.SUPERADMIN],
  },
  {
    name: 'Configuration Superadmin',
    href: '/backoffice/config_superadmin',
    icon: '🏛️',
    roles: [UserRole.SUPERADMIN],
  },
];

export const BackofficeSidebar: React.FC = () => {
  const { user } = useAuthStore();
  const location = useLocation();

  if (!user) return null;

  const availableItems = menuItems.filter(item =>
    item.roles.includes(user.role)
  );

  return (
    <aside className="w-64 bg-white shadow-sm border-r border-gray-200 min-h-screen">
      <nav className="mt-6 px-3">
        <ul className="space-y-1">
          {availableItems.map((item) => {
            const isActive = location.pathname === item.href;

            return (
              <li key={item.name}>
                <Link
                  to={item.href}
                  className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-500'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <span className="mr-3 text-lg flex-shrink-0">
                    {item.icon}
                  </span>
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};