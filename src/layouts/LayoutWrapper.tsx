// LayoutWrapper.tsx
import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import authService from "../services/Authentication.service";
import AdminLayout from "./AdminLayout";
import UserLayout from "./UserLayout";
import DefaultLayout from "./DefaultLayout";
import ManagerLayout from "./ManagerLayout";

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

      console.log(
        "Auth change detected - isAuthenticated:",
        isAuth,
        "Role:",
        role
      );

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

  // Debug logging
  console.log(
    "LayoutWrapper - Auth:",
    authState.isAuthenticated,
    "Role:",
    authState.userRole,
    "Required Role:",
    requiredRole
  );

  // If authentication is required but user is not authenticated
  if (requireAuth && !authState.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If specific role is required but user doesn't have it
  if (requiredRole && !authService.hasRole(requiredRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Select layout based on user role
  const getLayout = () => {
    if (!authState.isAuthenticated) {
      return <DefaultLayout>{children}</DefaultLayout>;
    }

    const role = authState.userRole?.toLowerCase();
    console.log("Selecting layout for role:", role);

    switch (role) {
      case "admin":
        return <AdminLayout>{children}</AdminLayout>;
      case "manager":
        return <ManagerLayout>{children}</ManagerLayout>;
      case "organization":
        return <AdminLayout>{children}</AdminLayout>;
      case "user":
        return <UserLayout>{children}</UserLayout>;
      default:
        return <DefaultLayout>{children}</DefaultLayout>;
    }
  };

  return getLayout();
};

export default LayoutWrapper;
