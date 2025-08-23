import { Routes, Route, Navigate } from "react-router-dom";
import Home from "../pages/home/Home";
import Login from "../pages/login/Login";
import Register from "../pages/register/Register";
import CampaignHome from "../pages/campaignVolunteer/CampaignHome";
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
import ManagerNews from "../pages/admin/ManagerNews";
import CreateNews from "../pages/admin/CreateNews";
import EditNews from "../pages/admin/EditNews";
import DetailNews from "../pages/news/DetailNews";
import CampaignVolunteer from "../pages/campaignVolunteer/CampaignVolunteerDetail";
import ManagerCampaign from "../pages/manager/ManagerCampaign";
import MyCampaignList from "@/pages/campaignVolunteer/MyCampaignList";
import ForumPage from "../pages/forum/ForumPage";
import ManagerCampaignStaff from "../pages/staff/ManagerCampaignStaff";
import UpdateDonationPage from "../pages/staff/UpdateDonationPage";
import TaskListPage from "../pages/campaignVolunteer/TaskListPage";
import OverViewCampaign from "@/components/staff/OverViewCampaign";
import { UpdateCampaignDialog } from "@/components/staff/UpdateCampaignDialog";
import ReliefPointManager from "@/pages/manager/reliefPointManager/ReliefPointManager";
import DonationHome from "@/pages/campaignDonation/DonationHome";
import DonationDetail from "../pages/campaignDonation/DonationDetail";
import { Manager } from "socket.io-client";
import ManagerDonationStaff from "@/pages/staff/ManagerDonationStaff";
import CampaignDonationView from "../components/staff/CampaignDonationView";
import CalendarTask from "@/pages/campaignVolunteer/CalendarTask";
import ManageCertificate from "@/pages/admin/ManageCertificate";
import Dashboard from "@/pages/admin/Dashboard";
import DefaultLayout from "@/layouts/DefaultLayout";
import UserLayout from "@/layouts/UserLayout";
import ManagerCampaignDonation from "@/pages/manager/ManagerCampaignDonation";
import ThankYou from "@/pages/campaignVolunteer/Thanhyou";
import VerifyCertificate from "@/pages/profile/VerifyCertificate";
import StormInfoModal from "@/components/storm/StormInfoModal";

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
            return <Navigate to="/staff/campaigns" replace />;
          if (user?.role === "manager")
            return <Navigate to="/manager/campaigns" replace />;
        }

        // Allow guest or normal user
        return (
          <LayoutWrapper>
            <Home />
            <StormInfoModal />
          </LayoutWrapper>
        );
      })()}
    />

    <Route
      path="/login"
      element={
        <DefaultLayout>
          <Login />
        </DefaultLayout>
      }
    />
    <Route
      path="/register"
      element={
        <DefaultLayout>
          <Register />
        </DefaultLayout>
      }
    />
    <Route
      path="/forgot-password"
      element={
        <DefaultLayout>
          <ForgotPW />
        </DefaultLayout>
      }
    />
    <Route
      path="/reset-password"
      element={
        <DefaultLayout>
          <ResetPW />
        </DefaultLayout>
      }
    />
    <Route
      path="/donations/:campaignId"
      element={
        <UserLayout>
          <DonationDetail />
        </UserLayout>
      }
    />
    <Route
      path="/donations"
      element={
        <UserLayout>
          <DonationHome />
        </UserLayout>
      }
    />
    <Route
      path="/campaigns"
      element={
        <UserLayout>
          <CampaignHome />
        </UserLayout>
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
      path="/campaigns/:campaignId"
      element={
        <UserLayout>
          <CampaignVolunteer />
        </UserLayout>
      }
    />
    <Route
      path="/myCampaign"
      element={
        <UserLayout>
          <MyCampaignList />
        </UserLayout>
      }
    />
    <Route
      path="/campaigns/:id/tasks"
      element={
        <UserLayout>
          <TaskListPage />
        </UserLayout>
      }
    />
    <Route
      path="/myTask"
      element={
        <UserLayout>
          <CalendarTask />
        </UserLayout>
      }
    />
    <Route
      path="/certificates/verify/:verifyCode"
      element={
        <DefaultLayout>
          <VerifyCertificate />
        </DefaultLayout>
      }
    />
    <Route
      path="/donate"
      element={
        <UserLayout>
          <DonatePage />
        </UserLayout>
      }
    />
    <Route
      path="/news"
      element={
        <UserLayout>
          <News />
        </UserLayout>
      }
    />
    <Route
      path="/news/:id"
      element={
        <UserLayout>
          <DetailNews />
        </UserLayout>
      }
    />

    {/* Protected Profile Route - Available to all authenticated users */}
    <Route
      path="/profile"
      element={
        <ProtectedRoute>
          <UserLayout>
            <Profile />
          </UserLayout>
        </ProtectedRoute>
      }
    />
    <Route
      path="/forum"
      element={
        <UserLayout>
          <ForumPage />
        </UserLayout>
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
              path="campaigns"
              element={
                <LayoutWrapper requireAuth={true} requiredRole="organization">
                  <ManagerCampaignStaff />
                </LayoutWrapper>
              }
            />
            <Route
              path="campaigns/:id"
              element={
                <LayoutWrapper requireAuth={true} requiredRole="organization">
                  <OverViewCampaign />
                </LayoutWrapper>
              }
            />
            <Route
              path="campaigns/:id/manage"
              element={
                <LayoutWrapper requireAuth={true} requiredRole="organization">
                  <ManagerCampaignStaff />
                </LayoutWrapper>
              }
            />
            <Route
              path="campaigns/:id/update"
              element={
                <LayoutWrapper requireAuth={true} requiredRole="organization">
                  <UpdateCampaignDialog />
                </LayoutWrapper>
              }
            />
            <Route
              path="donations"
              element={
                <LayoutWrapper requireAuth={true} requiredRole="organization">
                  <ManagerDonationStaff />
                </LayoutWrapper>
              }
            />
            <Route
              path="/donation/:campaignId"
              element={
                <LayoutWrapper requireAuth={true} requiredRole="organization">
                  <CampaignDonationView />
                </LayoutWrapper>
              }
            />
            <Route
              path="donations/:id/edit"
              element={
                <LayoutWrapper requireAuth={true} requiredRole="organization">
                  <UpdateDonationPage />
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
                  <Dashboard />
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
              path="certificates"
              element={
                <LayoutWrapper requireAuth={true} requiredRole="admin">
                  <ManageCertificate />
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
              path="campaigns"
              element={
                <LayoutWrapper requireAuth={true} requiredRole="manager">
                  <ManagerCampaign />
                </LayoutWrapper>
              }
            />
            <Route
              path="/donations"
              element={
                <LayoutWrapper requireAuth={true} requiredRole="manager">
                  <ManagerCampaignDonation />
                </LayoutWrapper>
              }
            />
            <Route
              path="storms"
              element={
                <LayoutWrapper requireAuth={true} requiredRole="manager">
                  <ReliefPointManager />
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
