import React from 'react';
import { BackofficeHeader } from './BackofficeHeader';
import { BackofficeSidebar } from './BackofficeSidebar';

interface BackofficeLayoutProps {
  children: React.ReactNode;
}

export const BackofficeLayout: React.FC<BackofficeLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-100">
      <BackofficeHeader />
      <div className="flex">
        <BackofficeSidebar />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};