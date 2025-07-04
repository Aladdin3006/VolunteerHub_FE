import React from 'react';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminHeader from '../components/admin/AdminHeader';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  return (
    <div className="admin-layout min-h-screen bg-gray-50">
      {/* Admin Header */}
      <AdminHeader />
      
      <div className="flex">
        {/* Admin Sidebar */}
        <AdminSidebar />
        
        {/* Main Content */}
        <main className="flex-1 ml-64 p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;