// src/layouts/ManagerLayout.tsx
import React from "react";
import ManagerHeader from "@/components/manager/ManagerHeader";

interface ManagerLayoutProps {
  children: React.ReactNode;
}

const ManagerLayout: React.FC<ManagerLayoutProps> = ({ children }) => {
  return (
    <div className="staff-layout min-h-screen bg-background text-foreground">
      <ManagerHeader />
      <div className="flex">
        <main className="flex-1 p-4 md:p-6">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default ManagerLayout;
