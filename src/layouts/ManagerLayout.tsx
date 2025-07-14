// src/layouts/ManagerLayout.tsx
import React from 'react';
import ManagerSidebar from '../components/manager/ManagerSidebar';
import AdminHeader from '../components/admin/AdminHeader';

interface ManagerLayoutProps {
  children: React.ReactNode;
}

const ManagerLayout: React.FC<ManagerLayoutProps> = ({ children }) => {
  return (
    <div className="manager-layout min-h-screen bg-gray-50">
      <AdminHeader />
      <div className="flex">
        <ManagerSidebar />
        <main className="flex-1 ml-64 p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ManagerLayout;