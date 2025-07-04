import { Routes, Route, Navigate } from "react-router-dom";
import Home from "../pages/home/Home";
import Login from "../pages/login/Login";
import Register from "../pages/register/Register";
import CampaignHome from "../pages/campaignDonation/CampaignHome";
import CampaignDetail from "../pages/campaignVolunteer/CampaignDetail";
import AboutUs from "../pages/about-us/aboutus";
import DonatePage from "../pages/about-us/DonatePage";
import ForgotPW from "../pages/login/ForgotPW";
import ResetPW from "../pages/login/ResetPW";
import Profile from "../pages/profile/Profile";
import News from "../pages/news/News";
import ProtectedRoute from "../components/auth/ProtectedRoute";
import LayoutWrapper from "../layouts/LayoutWrapper";
import Unauthorized from "../components/common/Unauthorized";
import authService from "../services/Authentication.service";
import ManagerUser from "../pages/admin/ManagerUser";
import UserLayout from "../layouts/UserLayout";
import ManagerNews from "../pages/admin/ManagerNews";
import CreateNews from "../pages/admin/CreateNews";
import EditNews from "../pages/admin/EditNews";
import DetailNews from "../pages/news/DetailNews";
import StaffLayout from "../layouts/StaffLayout";
import StaffDashboard from "../pages/staff/StaffDashboard";
import ThankYou from "../pages/campaignVolunteer/Thanhyou";

import CampaignVolunteer from "../pages/campaignVolunteer/CampaignVolunteerDetail";

import ManagerDashboard from "../pages/manager/ManagerDashboard";
import ManagerCampaign from "../pages/manager/ManagerCampaign";
import CreatePhaseCampaign from "../pages/staff/CreatePhaseCampaign";
import DepartmentManager from "../pages/staff/DepartmentManager";
import NewCampaignPage from "../pages/campaign/NewCampaignPage";
import NewDonationPage from "../pages/donation/NewDonationPage";

const AppRoutes = () => (
  <Routes>
    {/* Public Routes */}
    <Route
      path="/"
      element={(() => {
        const isAuthenticated = authService.isAuthenticated();
        const user = authService.getUser();

        // Redirect if admin/org/manager logs in
        if (isAuthenticated) {
          if (user?.role === "admin")
            return <Navigate to="/admin/dashboard" replace />;
          if (user?.role === "organization")
            return <Navigate to="/organization/dashboard" replace />;
          if (user?.role === "manager")
            return <Navigate to="/manager/dashboard" replace />;
        }

        // Allow guest or normal user
        return (
          <LayoutWrapper>
            <Home />
          </LayoutWrapper>
        );
      })()}
    />

    <Route
      path="/login"
      element={
        <LayoutWrapper>
          <Login />
        </LayoutWrapper>
      }
    />
    <Route
      path="/register"
      element={
        <LayoutWrapper>
          <Register />
        </LayoutWrapper>
      }
    />
    <Route
      path="/forgot-password"
      element={
        <LayoutWrapper>
          <ForgotPW />
        </LayoutWrapper>
      }
    />
    <Route
      path="/reset-password"
      element={
        <LayoutWrapper>
          <ResetPW />
        </LayoutWrapper>
      }
    />
    <Route
      path="/campaigns/:campaignId"
      element={
        <LayoutWrapper>
          <CampaignDetail />
        </LayoutWrapper>
      }
    />
    <Route
      path="/campaigns"
      element={
        <LayoutWrapper>
          <CampaignHome />
        </LayoutWrapper>
      }
    />
    <Route
      path="/thankyou"
      element={
        <LayoutWrapper>
          <ThankYou />
        </LayoutWrapper>
      }
    />
    <Route
      path="/volunteer/:campaignId"
      element={
        <LayoutWrapper>
          <CampaignVolunteer />
        </LayoutWrapper>
      }
    />
    <Route
      path="/about-us"
      element={
        <LayoutWrapper>
          <AboutUs />
        </LayoutWrapper>
      }
    />
    <Route
      path="/donate"
      element={
        <LayoutWrapper>
          <DonatePage />
        </LayoutWrapper>
      }
    />
    <Route
      path="/news"
      element={
        <LayoutWrapper>
          <News />
        </LayoutWrapper>
      }
    />
    <Route
      path="/news/:id"
      element={
        <LayoutWrapper>
          <DetailNews />
        </LayoutWrapper>
      }
    />

    {/* Protected Profile Route - Available to all authenticated users */}
    <Route
      path="/profile"
      element={
        <ProtectedRoute>
          <LayoutWrapper requireAuth={true}>
            <Profile />
          </LayoutWrapper>
        </ProtectedRoute>
      }
    />

    {/* User Dashboard Routes */}
    <Route
      path="/user/*"
      element={
        <ProtectedRoute requiredRole="user">
          <Routes>
            <Route
              path="profile"
              element={
                <LayoutWrapper requireAuth={true} requiredRole="user">
                  <Profile />
                </LayoutWrapper>
              }
            />
            <Route
              path="events"
              element={
                <LayoutWrapper requireAuth={true} requiredRole="user">
                  <div className="bg-white rounded-lg shadow p-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">
                      My Events
                    </h1>
                    <p className="text-gray-600">
                      View and manage your volunteer events here.
                    </p>
                  </div>
                </LayoutWrapper>
              }
            />
            <Route
              path="volunteer-history"
              element={
                <LayoutWrapper requireAuth={true} requiredRole="user">
                  <div className="bg-white rounded-lg shadow p-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">
                      Volunteer History
                    </h1>
                    <p className="text-gray-600">
                      Track your volunteer activities and achievements.
                    </p>
                  </div>
                </LayoutWrapper>
              }
            />
          </Routes>
        </ProtectedRoute>
      }
    />

    {/* Organization Routes */}
    <Route
      path="/staff/*"
      element={
        <ProtectedRoute requiredRole="organization">
          <Routes>
            <Route
              path="dashboard"
              element={
                <StaffLayout>
                  <StaffDashboard />
                </StaffLayout>
              }
            />
            <Route
              path="phase-campaigns"
              element={
                <LayoutWrapper requireAuth={true} requiredRole="organization">
                  <CreatePhaseCampaign />
                </LayoutWrapper>
              }
            />
             <Route
              path="departments"
              element={
                <LayoutWrapper requireAuth={true} requiredRole="organization">
                  <DepartmentManager />
                </LayoutWrapper>
              }
            />
            <Route
              path="campaigns/new"
              element={
                <LayoutWrapper requireAuth={true} requiredRole="organization">
                  <NewCampaignPage />
                </LayoutWrapper>
              }
            />
            <Route
              path="donations/new"
              element={
                <LayoutWrapper requireAuth={true} requiredRole="organization">
                  <NewDonationPage />
                </LayoutWrapper>
              }
            />
          </Routes>
        </ProtectedRoute>
      }
    />

    {/* Admin Routes */}
    <Route
      path="/admin/*"
      element={
        <ProtectedRoute requiredRole="admin">
          <Routes>
            <Route
              path="dashboard"
              element={
                <LayoutWrapper requireAuth={true} requiredRole="admin">
                  <div className="bg-white rounded-lg shadow p-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">
                      Admin Dashboard
                    </h1>
                    <p className="text-gray-600">
                      System administration and overview.
                    </p>
                  </div>
                </LayoutWrapper>
              }
            />
            <Route
              path="users"
              element={
                <LayoutWrapper requireAuth={true} requiredRole="admin">
                  <ManagerUser />
                </LayoutWrapper>
              }
            />
            <Route
              path="news"
              element={
                <LayoutWrapper requireAuth={true} requiredRole="admin">
                  <ManagerNews />
                </LayoutWrapper>
              }
            />
            <Route
              path="news/create"
              element={
                <LayoutWrapper requireAuth={true} requiredRole="admin">
                  <CreateNews />
                </LayoutWrapper>
              }
            />
            <Route
              path="news/edit/:id"
              element={
                <LayoutWrapper requireAuth={true} requiredRole="admin">
                  <EditNews />
                </LayoutWrapper>
              }
            />
            <Route
              path="organizations"
              element={
                <LayoutWrapper requireAuth={true} requiredRole="admin">
                  <div className="bg-white rounded-lg shadow p-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">
                      Manage Organizations
                    </h1>
                    <p className="text-gray-600">
                      View and manage registered organizations.
                    </p>
                  </div>
                </LayoutWrapper>
              }
            />
            <Route
              path="events"
              element={
                <LayoutWrapper requireAuth={true} requiredRole="admin">
                  <div className="bg-white rounded-lg shadow p-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">
                      All Events
                    </h1>
                    <p className="text-gray-600">
                      View and manage all volunteer events.
                    </p>
                  </div>
                </LayoutWrapper>
              }
            />
          </Routes>
        </ProtectedRoute>
      }
    />

    {/* Manager Routes */}
    <Route
      path="/manager/*"
      element={
        <ProtectedRoute requiredRole="manager">
          <Routes>
            <Route
              path="dashboard"
              element={
                <LayoutWrapper requireAuth={true} requiredRole="manager">
                  <ManagerDashboard /> {/* Updated to use ManagerDashboard */}
                </LayoutWrapper>
              }
            />
            <Route
              path="campaigns"
              element={
                <LayoutWrapper requireAuth={true} requiredRole="manager">
                  <ManagerCampaign />
                </LayoutWrapper>
              }
            />
            <Route
              path="reports"
              element={
                <LayoutWrapper requireAuth={true} requiredRole="manager">
                  <div className="bg-white rounded-lg shadow p-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">
                      Reports
                    </h1>
                    <p className="text-gray-600">
                      Generate and view system reports.
                    </p>
                  </div>
                </LayoutWrapper>
              }
            />
            <Route
              path="analytics"
              element={
                <LayoutWrapper requireAuth={true} requiredRole="manager">
                  <div className="bg-white rounded-lg shadow p-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">
                      Analytics
                    </h1>
                    <p className="text-gray-600">
                      View detailed analytics and insights.
                    </p>
                  </div>
                </LayoutWrapper>
              }
            />
          </Routes>
        </ProtectedRoute>
      }
    />

    {/* Error Routes */}
    <Route path="/unauthorized" element={<Unauthorized />} />
    <Route
      path="*"
      element={
        <LayoutWrapper>
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
              <p className="text-gray-600">Page not found</p>
            </div>
          </div>
        </LayoutWrapper>
      }
    />
  </Routes>
);

export default AppRoutes;
