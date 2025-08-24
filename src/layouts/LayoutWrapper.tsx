// LayoutWrapper.tsx
import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import authService from "../services/Authentication.service";
import AdminLayout from "./AdminLayout";
import UserLayout from "./UserLayout";
import DefaultLayout from "./DefaultLayout";
import ManagerLayout from "./ManagerLayout";
import StaffLayout from "./StaffLayout";

interface LayoutWrapperProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requiredRole?: string;
}

const LayoutWrapper: React.FC<LayoutWrapperProps> = ({
  children,
  requireAuth = false,
  requiredRole = null,
}) => {
  const [authState, setAuthState] = useState({
    isAuthenticated: authService.isAuthenticated(),
    userRole: authService.getUserRole(),
  });

  useEffect(() => {
    const handleAuthChange = () => {
      const isAuth = authService.isAuthenticated();
      const role = authService.getUserRole();

      setAuthState({
        isAuthenticated: isAuth,
        userRole: role,
      });
    };

    authService.addListener(handleAuthChange);
    handleAuthChange(); // Initial call

    return () => {
      authService.removeListener(handleAuthChange);
    };
  }, []);

  // If authentication is required but user is not authenticated
  if (requireAuth && !authState.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If specific role is required but user doesn't have it
  if (
    requiredRole &&
    authState.userRole?.toLowerCase() !== requiredRole.toLowerCase()
  ) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Select layout based on user role
  const getLayout = () => {
    if (!authState.isAuthenticated) {
      return <DefaultLayout>{children}</DefaultLayout>;
    }

    const role = authState.userRole?.toLowerCase();

    switch (role) {
      case "admin":
        return <AdminLayout>{children}</AdminLayout>;
      case "manager":
        return <ManagerLayout>{children}</ManagerLayout>;
      case "organization":
        return <StaffLayout>{children}</StaffLayout>;
      case "user":
        return <UserLayout>{children}</UserLayout>;
      default:
        return <DefaultLayout>{children}</DefaultLayout>;
    }
  };

  return getLayout();
};

export default LayoutWrapper;
