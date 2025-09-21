import React from 'react';
import { CompanyDashboard } from '../components/dashboard/CompanyDashboard';

export const DashboardPage: React.FC = () => {
  // DashboardPage is now only for external users (companies)
  // Internal users (SUPERADMIN, ADMIN, ANALYST, ORGANIZATION) use the backoffice
  return <CompanyDashboard />;
};