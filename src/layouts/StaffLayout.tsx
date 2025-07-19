import React from 'react';
import StaffHeader from '@/components/staff/StaffHeader';

interface StaffLayoutProps {
  children: React.ReactNode;
}

const StaffLayout: React.FC<StaffLayoutProps> = ({ children }) => {
  return (
    <div className="staff-layout min-h-screen bg-background text-foreground">
      <StaffHeader />
      <div className="flex">
        <main className="flex-1 p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default StaffLayout;