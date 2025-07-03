import React from 'react';
import StaffSidebar from '../components/staff/StaffSidebar';
import AdminHeader from '../components/admin/AdminHeader';

interface StaffLayoutProps {
  children: React.ReactNode;
}

const StaffLayout: React.FC<StaffLayoutProps> = ({ children }) => {
  return (
    <div className="staff-layout min-h-screen bg-gray-50">
      <AdminHeader />
      <div className="flex">
        <StaffSidebar />
        <main className="flex-1 ml-64 p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default StaffLayout;