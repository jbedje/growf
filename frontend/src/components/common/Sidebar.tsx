import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  Search,
  FileText,
  Users,
  Plus,
  Settings,
  BarChart3
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { UserRole, type UserRoleType } from '../../types';
import { clsx } from 'clsx';

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: UserRoleType[];
}

const navigation: SidebarItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: Home,
  },
  {
    name: 'Explorer les programmes',
    href: '/programs',
    icon: Search,
    roles: [UserRole.COMPANY],
  },
  {
    name: 'Mes candidatures',
    href: '/my-applications',
    icon: FileText,
    roles: [UserRole.COMPANY],
  },
  {
    name: 'Créer un programme',
    href: '/create-program',
    icon: Plus,
    roles: [UserRole.ORGANIZATION, UserRole.ADMIN],
  },
  {
    name: 'Mes programmes',
    href: '/my-programs',
    icon: BarChart3,
    roles: [UserRole.ORGANIZATION, UserRole.ADMIN],
  },
  {
    name: 'Utilisateurs',
    href: '/users',
    icon: Users,
    roles: [UserRole.ADMIN],
  },
  {
    name: 'Paramètres',
    href: '/settings',
    icon: Settings,
  },
];

export const Sidebar: React.FC = () => {
  const { user } = useAuthStore();
  const location = useLocation();

  // Filtrer la navigation selon le rôle de l'utilisateur
  const filteredNavigation = navigation.filter(item =>
    !item.roles || (user && item.roles.includes(user.role))
  );

  return (
    <nav className="w-64 bg-white border-r border-secondary-200 min-h-[calc(100vh-4rem)]">
      <div className="p-4">
        <ul className="sidebar-nav">
          {filteredNavigation.map((item) => {
            const isActive = location.pathname === item.href;

            return (
              <li key={item.name}>
                <Link
                  to={item.href}
                  className={clsx(
                    'sidebar-nav-item',
                    isActive ? 'sidebar-nav-item-active' : 'sidebar-nav-item-inactive'
                  )}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
};